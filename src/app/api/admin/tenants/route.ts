/**
 * Tenant Registry API — CRUD for tenant applications
 *
 * GET    /api/admin/tenants         — list all tenants
 * POST   /api/admin/tenants         — create a new tenant
 * GET    /api/admin/tenants/[slug]  — get tenant by slug
 * PUT    /api/admin/tenants/[slug]  — update tenant
 * DELETE /api/admin/tenants/[slug]  — delete a tenant (soft)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { ensureTenantConfigColumns } from '@/domain/tenant/tenant-config-service';
import { deployTenant } from '@/domain/tenant/vercel-deploy-service';
import { seedTenantDefaults, seedTemplateSecurityGroups, resolveTenantAdminEmail } from '@/domain/tenant/tenant-seed-service';
import { inngest } from '@/lib/inngest';
import { generateSchemaFromPrompt } from '@/domain/ai/schema-generator';
import { compileToZModel } from '@/domain/ai/zmodel-compiler';
import type { SchemaGenerationResult } from '@/domain/ai/schema-generation-schema';
import { provisionTenantDatabase, type ProvisionedDatabase } from '@/domain/tenant/neon-provision-service';
import { runMigrations } from '@/domain/tenant/migration-runner';
import { generateTenantCode, injectTenantConfig, cleanupTenantCode } from '@/domain/tenant/codegen-service';
import { deployViaCli } from '@/domain/tenant/vercel-cli-service';
import { materializeAppPackForTenant, buildSuitePrompt } from '@/domain/app-pack/app-pack-tenant-materializer';
import { provisionSuiteApps } from '@/domain/workflow/suite-provisioning';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  displayName: z.string().min(1).max(100),
  template: z.string().max(50).optional().default('default'),
  templateMode: z.enum(['single', 'suite']).optional().default('single'),
  templates: z.array(z.string().max(50)).max(10).optional(),
  packMode: z.enum(['predefined', 'custom']).optional().default('custom'),
  prompt: z.string().max(2000).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#eb3d28'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#0af9fe'),
  metadata: z.record(z.unknown()).optional().default({}),
});

// ── Helper: snake_case DB rows → camelCase TenantEntry ──

function mapTenantRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    displayName: row.display_name as string,
    template: row.template as string,
    status: row.status as string,
    vercelProjectId: row.vercel_project_id as string | null,
    appUrl: row.app_url as string | null,
    dbUrl: row.db_url as string | null,
    apiKey: row.api_key as string | null,
    primaryColor: row.primary_color as string,
    secondaryColor: row.secondary_color as string,
    faviconData: row.favicon_data as string | null,
    faviconMimeType: row.favicon_mime_type as string | null,
    metadata: row.metadata as Record<string, unknown>,
    templateMode: ((row.metadata as Record<string, unknown>)?.config as Record<string, unknown>)?.templateMode as 'single' | 'suite' ?? 'single',
    appPack: ((row.metadata as Record<string, unknown>)?.config as Record<string, unknown>)?.appPack as import('@/store/apis/tenant-api').AppPackConfig ?? null,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── GET /api/admin/tenants ───────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const db = createRawClient();
  try {
    await ensureTenantsTable(db);
    await ensureTenantConfigColumns(db);

    // status filter applied in raw SQL below

    const query = status
      ? `SELECT * FROM tenants WHERE status = $1 ORDER BY created_at DESC`
      : `SELECT * FROM tenants ORDER BY created_at DESC`;
    const tenants = status
      ? await db.$queryRawUnsafe(query, status)
      : await db.$queryRawUnsafe(query);

    return jsonOk({ tenants: (tenants as Record<string, unknown>[]).map(mapTenantRow) });
  } catch (err) {
    console.error('[tenants] GET error:', err);
    return jsonError('Failed to list tenants', 500);
  }
}

// ── POST /api/admin/tenants ──────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(`Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  const db = createRawClient();
  try {
    await ensureTenantsTable(db);

    // Check for duplicate slug
    const existingRows = await db.$queryRawUnsafe(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`,
      parsed.data.slug,
    ) as { id: string }[];
    if (existingRows.length > 0) {
      return jsonError(`Tenant slug "${parsed.data.slug}" already exists`, 409);
    }

    const tenantId = `tn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.$executeRawUnsafe(
      `INSERT INTO tenants (id, slug, display_name, template, status, primary_color, secondary_color, metadata, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
      tenantId,
      parsed.data.slug,
      parsed.data.displayName,
      parsed.data.templateMode === 'suite' ? 'suite' : parsed.data.template,  // G2 fix: suite tenants use 'suite' template
      'deploying',
      parsed.data.primaryColor,
      parsed.data.secondaryColor,
      JSON.stringify(parsed.data.metadata),
      guard.session.sub ?? guard.session.email ?? null,
    );
    const tenant = { id: tenantId, slug: parsed.data.slug, status: 'deploying' } as const;

    // ── Phase 4: Neon database provisioning (if API key available) ──
    // Runs BEFORE suite provisioning below — provisionSuiteApps() reads
    // tenants.db_url to decide which database to seed each app's data into,
    // so the tenant's own dedicated DB must exist first. Provisioning suite
    // apps before this ran meant every app's first seed silently landed in
    // the shared root DB instead of the tenant's own database.
    // Best-effort: log errors but continue.
    let neonResult: ProvisionedDatabase | null = null;
    if (process.env.NEON_API_KEY) {
      try {
        console.log('[tenants] Phase 4: provisioning Neon database...');
        neonResult = await provisionTenantDatabase(parsed.data.slug);
        console.log('[tenants] Phase 4: Neon database provisioned');
        // Persist the DB URL to the tenant record
        await db.$executeRawUnsafe(
          `UPDATE tenants SET db_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
          neonResult.pooledUrl,
          parsed.data.slug,
        );
      } catch (err) {
        console.error(
          '[tenants] Phase 4: Neon provisioning failed:',
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    // ── Suite Mode: materialize app pack ─────────────────────────
    if (parsed.data.templateMode === 'suite' && parsed.data.templates && parsed.data.templates.length > 0) {
      try {
        console.log('[tenants] Suite mode: materializing app pack...');
        const suitePrompt = parsed.data.prompt || buildSuitePrompt(parsed.data.displayName, parsed.data.templates);
        const packResult = await materializeAppPackForTenant({
          tenantSlug: parsed.data.slug,
          displayName: parsed.data.displayName,
          templates: parsed.data.templates,
          prompt: suitePrompt,
          mock: !process.env.OPENAI_API_KEY,
          packMode: parsed.data.packMode,
        });
        if (packResult.success && packResult.appPack) {
          // Store the app pack config in tenant metadata
          const existingMeta = (parsed.data.metadata ?? {}) as Record<string, unknown>;
          await db.$executeRawUnsafe(
            `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
            JSON.stringify({
              ...((existingMeta.config as Record<string, unknown>) ?? {}),
              templateMode: 'suite',
              // Store the actual templates used so UI can reference them
              templates: parsed.data.templates,
              appPack: packResult.appPack,
            }),
            parsed.data.slug,
          );
          console.log(`[tenants] Suite mode: app pack materialized — ${packResult.appPack.apps.length} apps`);
        } else {
          console.error('[tenants] Suite mode: materialization failed:', packResult.error);
        }

        // ── Provision infrastructure for each app in the suite ───────
        try {
          const provisionResult = await provisionSuiteApps(parsed.data.slug, { skipLive: false });
          if (provisionResult.successful.length > 0) {
            console.log(
              `[tenants] Suite mode: provisioned ${provisionResult.successful.length}/${provisionResult.totalApps} apps`,
              `(${provisionResult.errors.length} errors)`
            );
          } else if (provisionResult.totalApps === packResult.appPack?.apps.length && provisionResult.totalApps > 0) {
            console.log('[tenants] Suite mode: no pending apps to provision');
          }
        } catch (provErr) {
          console.error('[tenists] Suite mode: provisioning failed:', provErr instanceof Error ? provErr.message : String(provErr));
          // Don't fail tenant creation if provisioning fails — status will be 'error' per-app
        }
      } catch (suiteErr) {
        console.error('[tenants] Suite mode: error:', suiteErr instanceof Error ? suiteErr.message : String(suiteErr));
      }
    }

    // ── Phase 2: AI schema generation (if prompt provided) ──────────
    // Best-effort: log errors but continue to the next step.
    let generatedSchema: SchemaGenerationResult | null = null;
    if (parsed.data.prompt) {
      try {
        console.log('[tenants] Phase 2: generating schema from prompt...');
        generatedSchema = await generateSchemaFromPrompt(
          parsed.data.prompt,
          parsed.data.template,
        );
        console.log(
          `[tenants] Phase 2: schema generated — ${generatedSchema.models.length} models, ` +
          `${generatedSchema.pages.length} pages`,
        );
      } catch (err) {
        console.error(
          '[tenants] Phase 2: schema generation failed:',
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    // ── Phase 6: Code generation (if schema was generated) ──────────
    // Best-effort: log errors but continue.
    let codegenResult: { outputDir: string; fileCount: number } | null = null;
    if (generatedSchema) {
      try {
        console.log('[tenants] Phase 6: generating tenant code...');
        codegenResult = await generateTenantCode(
          parsed.data.slug,
          parsed.data.template,
          generatedSchema,
        );
        // Inject tenant config (colors, displayName) into the generated vercel.json
        await injectTenantConfig(codegenResult.outputDir, {
          slug: parsed.data.slug,
          displayName: parsed.data.displayName,
          templateId: parsed.data.template,
          primaryColor: parsed.data.primaryColor,
          secondaryColor: parsed.data.secondaryColor,
        });
        console.log(
          `[tenants] Phase 6: code generated — ${codegenResult.fileCount} files in ${codegenResult.outputDir}`,
        );
      } catch (err) {
        console.error(
          '[tenants] Phase 6: code generation failed:',
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    // ── Phase 4: Run migrations on tenant DB (if Neon + schema ready) ──
    // Best-effort: log errors but continue.
    if (neonResult && generatedSchema) {
      try {
        console.log('[tenants] Phase 4: running migrations on tenant DB...');
        const zmodel = compileToZModel(generatedSchema);
        await runMigrations(neonResult.directUrl, zmodel);
        console.log('[tenants] Phase 4: migrations completed');
      } catch (err) {
        console.error(
          '[tenants] Phase 4: migration failed:',
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    // ── Step 6: Seed tenant defaults (existing) ─────────────────────
    const seedInput = {
      slug: parsed.data.slug,
      displayName: parsed.data.displayName,
      template: parsed.data.template,
      primaryColor: parsed.data.primaryColor,
      secondaryColor: parsed.data.secondaryColor,
      adminEmail: resolveTenantAdminEmail(parsed.data.metadata),
    };

    // Seed immediately. When a dedicated Neon DB was just provisioned, seed
    // THAT database — the tenant's own live app reads from it via its own
    // POSTGRES_URL, not the root DB's tenant_slug-scoped rows. Seeding the
    // root DB instead (the old behavior) left the dedicated DB with schema
    // but no baseline nav items (Home/Dashboard/Ops Admin/Config).
    const dedicatedSeedClient = neonResult?.directUrl
      ? new PrismaClient({ datasources: { db: { url: neonResult.directUrl } } })
      : null;
    const seedDb: unknown = dedicatedSeedClient ?? db;
    try {
      await seedTenantDefaults({ ...seedInput, db: seedDb });
      await seedTemplateSecurityGroups(seedDb, parsed.data.template);

      // Update status to 'live' after successful seed
      await db.$executeRawUnsafe(
        `UPDATE tenants SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
        'live', parsed.data.slug,
      );
      (tenant as { status: string }).status = 'live';

    } catch (seedErr) {
      console.error('[tenants] Seed failed:', seedErr instanceof Error ? seedErr.message : String(seedErr));
      // Tenant is created but seeding failed — status stays 'deploying'
      // Admin can retry seeding from the tenant dashboard
    } finally {
      if (dedicatedSeedClient) await dedicatedSeedClient.$disconnect();
    }

    // ── Step 7: Deploy (Phase 6 CLI if codegen succeeded, else existing API) ──
    if (codegenResult) {
      // Build env vars for Vercel CLI injection
      const cliEnvVars: Record<string, string> = {
        NEXT_PUBLIC_TENANT_SLUG: parsed.data.slug,
        NEXT_PUBLIC_TENANT_DISPLAY_NAME: parsed.data.displayName,
        NEXT_PUBLIC_TENANT_DESCRIPTION: `${parsed.data.displayName} — Business Operations Dashboard`,
        NEXT_PUBLIC_TENANT_APP_TITLE: parsed.data.displayName,
        NEXT_PUBLIC_APP_URL: `https://${parsed.data.slug}.vercel.app`,
        NEXT_PUBLIC_TENANT_PRIMARY_COLOR: parsed.data.primaryColor,
        NEXT_PUBLIC_TENANT_SECONDARY_COLOR: parsed.data.secondaryColor,
        NEXT_PUBLIC_TENANT_TEMPLATE_ID: parsed.data.template,
      };
      if (neonResult?.pooledUrl) {
        cliEnvVars.POSTGRES_URL = neonResult.pooledUrl;
        cliEnvVars.POSTGRES_URL_NON_POOLING = neonResult.directUrl;
      }
      const SHARED_ENV_KEYS = ['ENCRYPTION_KEY', 'OPENAI_API_KEY', 'SETUP_TOKEN'];
      for (const key of SHARED_ENV_KEYS) {
        const val = process.env[key];
        if (val) cliEnvVars[key] = val;
      }

      const outputDir = codegenResult.outputDir;

      // Deploy via Vercel CLI (non-blocking). Falls back to API deploy on failure.
      deployViaCli(outputDir, parsed.data.slug, cliEnvVars)
        .then((result: { appUrl: string; projectId: string }) => {
          console.log('[tenants] Phase 6: Vercel CLI deployed:', result.appUrl);
          db.$executeRawUnsafe(
            `UPDATE tenants SET vercel_project_id = $1, app_url = $2, status = 'live', updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`,
            result.projectId,
            result.appUrl,
            parsed.data.slug,
          ).catch((e: unknown) =>
            console.error('[tenants] Failed to save CLI deploy info:', e),
          );
          // Clean up temp directory after successful deploy
          cleanupTenantCode(outputDir).catch(() => {});
        })
        .catch((cliErr: unknown) => {
          console.error(
            '[tenants] Phase 6: Vercel CLI deploy failed, falling back to API deploy:',
            cliErr instanceof Error ? cliErr.message : String(cliErr),
          );
          // Clean up temp dir
          cleanupTenantCode(outputDir).catch(() => {});
          // Fallback: existing Vercel API deploy
          deployTenant({
            slug: parsed.data.slug,
            displayName: parsed.data.displayName,
            template: parsed.data.template,
            primaryColor: parsed.data.primaryColor,
            secondaryColor: parsed.data.secondaryColor,
            dbUrl: neonResult ? { pooled: neonResult.pooledUrl, direct: neonResult.directUrl } : null,
            metadata: parsed.data.metadata,
          })
            .then((result: { projectId: string; appUrl: string; envCount: number }) => {
              console.log('[tenants] Fallback API deploy succeeded:', result.appUrl);
              db.$executeRawUnsafe(
                `UPDATE tenants SET vercel_project_id = $1, app_url = $2, updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`,
                result.projectId,
                result.appUrl,
                parsed.data.slug,
              ).catch((e: unknown) =>
                console.error('[tenants] Failed to save fallback deploy info:', e),
              );
            })
            .catch((apiErr: unknown) => {
              console.error(
                '[tenants] Fallback API deploy also failed:',
                apiErr instanceof Error ? apiErr.message : String(apiErr),
              );
            });
        });

    } else {
      // No code generated — use existing Vercel API deploy directly
      deployTenant({
        slug: parsed.data.slug,
        displayName: parsed.data.displayName,
        template: parsed.data.template,
        primaryColor: parsed.data.primaryColor,
        secondaryColor: parsed.data.secondaryColor,
        dbUrl: neonResult ? { pooled: neonResult.pooledUrl, direct: neonResult.directUrl } : null,
        metadata: parsed.data.metadata,
      }).then((result: { projectId: string; appUrl: string; projectName: string; envCount: number }) => {
        console.log('[tenants] Vercel project created:', result.projectId, 'env vars:', result.envCount);
        // Update tenant record with Vercel project info
        db.$executeRawUnsafe(
          `UPDATE tenants SET vercel_project_id = $1, app_url = $2, updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`,
          result.projectId, result.appUrl, parsed.data.slug,
        ).catch((e: unknown) => console.error('[tenants] Failed to save vercel_project_id:', e));
      }).catch((deployErr: unknown) => {
        console.error('[tenants] Vercel deploy failed:', deployErr instanceof Error ? deployErr.message : String(deployErr));
      });
    }

    // Trigger the Inngest durable provisioning workflow (parallel/alternative path).
    // Non-blocking — the workflow runs Neon provisioning, schema generation,
    // migrations, seeding, and Vercel deploy as monitored, retryable steps.
    inngest.send({
      name: 'tenant.created',
      data: {
        slug: parsed.data.slug,
        displayName: parsed.data.displayName,
        templateId: parsed.data.template,
        prompt: parsed.data.prompt,
        primaryColor: parsed.data.primaryColor,
        secondaryColor: parsed.data.secondaryColor,
        metadata: parsed.data.metadata,
      },
    }).catch((err) => console.error('[tenants] Failed to trigger workflow:', err));

    return jsonOk({ tenant: mapTenantRow(tenant as Record<string, unknown>) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? (err.stack ?? '').split('\n').slice(0, 3).join(' | ') : '';
    console.error('[tenants] POST error:', msg);
    if (stack) console.error('[tenants] POST stack:', stack);
    return jsonError('Failed to create tenant: ' + msg.slice(0, 100), 500);
  }
}
