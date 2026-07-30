/**
 * Tenant Registry API — CRUD for tenant applications
 *
 * GET    /api/admin/tenants         — list all tenants
 * POST   /api/admin/tenants         — create a new tenant
 * GET    /api/admin/tenants/[slug]  — get tenant by slug
 * PUT    /api/admin/tenants/[slug]  — update tenant
 * DELETE /api/admin/tenants/[slug]  — delete a tenant (soft)
 */
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { ensureTenantConfigColumns } from '@/domain/tenant/tenant-config-service';
import { deployTenant } from '@/domain/tenant/vercel-deploy-service';
import { seedTenantDefaults, seedTemplateSecurityGroups } from '@/domain/tenant/tenant-seed-service';
import { inngest } from '@/lib/inngest';
import { generateSchemaFromPrompt } from '@/domain/ai/schema-generator';
import { compileToZModel } from '@/domain/ai/zmodel-compiler';
import { provisionTenantDatabase } from '@/domain/tenant/neon-provision-service';
import { runMigrations } from '@/domain/tenant/migration-runner';
import { generateTenantCode, injectTenantConfig, cleanupTenantCode } from '@/domain/tenant/codegen-service';
import { deployViaCli } from '@/domain/tenant/vercel-cli-service';
export const dynamic = 'force-dynamic';
const createSchema = z.object({
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    displayName: z.string().min(1).max(100),
    template: z.string().max(50).optional().default('default'),
    prompt: z.string().max(2000).optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#eb3d28'),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#0af9fe'),
    metadata: z.record(z.unknown()).optional().default({}),
});
const updateSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    template: z.string().max(50).optional(),
    status: z.enum(['draft', 'deploying', 'live', 'error']).optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    appUrl: z.string().max(500).optional(),
    vercelProjectId: z.string().max(100).optional(),
    dbUrl: z.string().max(500).optional(),
    metadata: z.record(z.unknown()).optional(),
});
// ── Helper: snake_case DB rows → camelCase TenantEntry ──
function mapTenantRow(row) {
    return {
        id: row.id,
        slug: row.slug,
        displayName: row.display_name,
        template: row.template,
        status: row.status,
        vercelProjectId: row.vercel_project_id,
        appUrl: row.app_url,
        dbUrl: row.db_url,
        apiKey: row.api_key,
        primaryColor: row.primary_color,
        secondaryColor: row.secondary_color,
        faviconData: row.favicon_data || null,
        faviconMimeType: row.favicon_mime_type || null,
        metadata: row.metadata,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
// ── GET /api/admin/tenants ───────────────────────────
export async function GET(request) {
    const guard = await requireWriteAuth(request);
    if (!guard.ok)
        return guard.response;
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
        return jsonOk({ tenants: tenants.map(mapTenantRow) });
    }
    catch (err) {
        console.error('[tenants] GET error:', err);
        return jsonError('Failed to list tenants', 500);
    }
}
// ── POST /api/admin/tenants ──────────────────────────
export async function POST(request) {
    const guard = await requireWriteAuth(request);
    if (!guard.ok)
        return guard.response;
    let body;
    try {
        body = await request.json();
    }
    catch {
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
        const existingRows = await db.$queryRawUnsafe(`SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`, parsed.data.slug);
        if (existingRows.length > 0) {
            return jsonError(`Tenant slug "${parsed.data.slug}" already exists`, 409);
        }
        const tenantId = `tn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await db.$executeRawUnsafe(`INSERT INTO tenants (id, slug, display_name, template, status, primary_color, secondary_color, metadata, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`, tenantId, parsed.data.slug, parsed.data.displayName, parsed.data.template, 'deploying', parsed.data.primaryColor, parsed.data.secondaryColor, JSON.stringify(parsed.data.metadata), guard.session.sub ?? guard.session.email ?? null);
        const tenant = { id: tenantId, slug: parsed.data.slug, status: 'deploying' };
        // ── Phase 2: AI schema generation (if prompt provided) ──────────
        // Best-effort: log errors but continue to the next step.
        let generatedSchema = null;
        if (parsed.data.prompt) {
            try {
                console.log('[tenants] Phase 2: generating schema from prompt...');
                generatedSchema = await generateSchemaFromPrompt(parsed.data.prompt, parsed.data.template);
                console.log(`[tenants] Phase 2: schema generated — ${generatedSchema.models.length} models, ` +
                    `${generatedSchema.pages.length} pages`);
            }
            catch (err) {
                console.error('[tenants] Phase 2: schema generation failed:', err instanceof Error ? err.message : String(err));
            }
        }
        // ── Phase 4: Neon database provisioning (if API key available) ──
        // Best-effort: log errors but continue.
        let neonResult = null;
        if (process.env.NEON_API_KEY) {
            try {
                console.log('[tenants] Phase 4: provisioning Neon database...');
                neonResult = await provisionTenantDatabase(parsed.data.slug);
                console.log('[tenants] Phase 4: Neon database provisioned');
                // Persist the DB URL to the tenant record
                await db.$executeRawUnsafe(`UPDATE tenants SET db_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`, neonResult.pooledUrl, parsed.data.slug);
            }
            catch (err) {
                console.error('[tenants] Phase 4: Neon provisioning failed:', err instanceof Error ? err.message : String(err));
            }
        }
        // ── Phase 6: Code generation (if schema was generated) ──────────
        // Best-effort: log errors but continue.
        let codegenResult = null;
        if (generatedSchema) {
            try {
                console.log('[tenants] Phase 6: generating tenant code...');
                codegenResult = await generateTenantCode(parsed.data.slug, parsed.data.template, generatedSchema);
                // Inject tenant config (colors, displayName) into the generated vercel.json
                await injectTenantConfig(codegenResult.outputDir, {
                    slug: parsed.data.slug,
                    displayName: parsed.data.displayName,
                    templateId: parsed.data.template,
                    primaryColor: parsed.data.primaryColor,
                    secondaryColor: parsed.data.secondaryColor,
                });
                console.log(`[tenants] Phase 6: code generated — ${codegenResult.fileCount} files in ${codegenResult.outputDir}`);
            }
            catch (err) {
                console.error('[tenants] Phase 6: code generation failed:', err instanceof Error ? err.message : String(err));
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
            }
            catch (err) {
                console.error('[tenants] Phase 4: migration failed:', err instanceof Error ? err.message : String(err));
            }
        }
        // ── Step 6: Seed tenant defaults (existing) ─────────────────────
        const seedInput = {
            slug: parsed.data.slug,
            displayName: parsed.data.displayName,
            template: parsed.data.template,
            primaryColor: parsed.data.primaryColor,
            secondaryColor: parsed.data.secondaryColor,
        };
        // Seed immediately using the same DB connection
        try {
            const rawDb = db; // Same raw client
            await seedTenantDefaults({ ...seedInput, db: rawDb });
            await seedTemplateSecurityGroups(rawDb, parsed.data.template);
            // Update status to 'live' after successful seed
            await db.$executeRawUnsafe(`UPDATE tenants SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`, 'live', parsed.data.slug);
            tenant.status = 'live';
        }
        catch (seedErr) {
            console.error('[tenants] Seed failed:', seedErr instanceof Error ? seedErr.message : String(seedErr));
            // Tenant is created but seeding failed — status stays 'deploying'
            // Admin can retry seeding from the tenant dashboard
        }
        // ── Step 7: Deploy (Phase 6 CLI if codegen succeeded, else existing API) ──
        if (codegenResult) {
            // Build env vars for Vercel CLI injection
            const cliEnvVars = {
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
                if (val)
                    cliEnvVars[key] = val;
            }
            const outputDir = codegenResult.outputDir;
            // Deploy via Vercel CLI (non-blocking). Falls back to API deploy on failure.
            deployViaCli(outputDir, parsed.data.slug, cliEnvVars)
                .then((result) => {
                console.log('[tenants] Phase 6: Vercel CLI deployed:', result.appUrl);
                db.$executeRawUnsafe(`UPDATE tenants SET vercel_project_id = $1, app_url = $2, status = 'live', updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`, result.projectId, result.appUrl, parsed.data.slug).catch((e) => console.error('[tenants] Failed to save CLI deploy info:', e));
                // Clean up temp directory after successful deploy
                cleanupTenantCode(outputDir).catch(() => { });
            })
                .catch((cliErr) => {
                console.error('[tenants] Phase 6: Vercel CLI deploy failed, falling back to API deploy:', cliErr instanceof Error ? cliErr.message : String(cliErr));
                // Clean up temp dir
                cleanupTenantCode(outputDir).catch(() => { });
                // Fallback: existing Vercel API deploy
                deployTenant({
                    slug: parsed.data.slug,
                    displayName: parsed.data.displayName,
                    template: parsed.data.template,
                    primaryColor: parsed.data.primaryColor,
                    secondaryColor: parsed.data.secondaryColor,
                    metadata: parsed.data.metadata,
                })
                    .then((result) => {
                    console.log('[tenants] Fallback API deploy succeeded:', result.appUrl);
                    db.$executeRawUnsafe(`UPDATE tenants SET vercel_project_id = $1, app_url = $2, updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`, result.projectId, result.appUrl, parsed.data.slug).catch((e) => console.error('[tenants] Failed to save fallback deploy info:', e));
                })
                    .catch((apiErr) => {
                    console.error('[tenants] Fallback API deploy also failed:', apiErr instanceof Error ? apiErr.message : String(apiErr));
                });
            });
        }
        else {
            // No code generated — use existing Vercel API deploy directly
            deployTenant({
                slug: parsed.data.slug,
                displayName: parsed.data.displayName,
                template: parsed.data.template,
                primaryColor: parsed.data.primaryColor,
                secondaryColor: parsed.data.secondaryColor,
                metadata: parsed.data.metadata,
            }).then((result) => {
                console.log('[tenants] Vercel project created:', result.projectId, 'env vars:', result.envCount);
                // Update tenant record with Vercel project info
                db.$executeRawUnsafe(`UPDATE tenants SET vercel_project_id = $1, app_url = $2, updated_at = CURRENT_TIMESTAMP WHERE slug = $3;`, result.projectId, result.appUrl, parsed.data.slug).catch((e) => console.error('[tenants] Failed to save vercel_project_id:', e));
            }).catch((deployErr) => {
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
        return jsonOk({ tenant: mapTenantRow(tenant) });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? (err.stack ?? '').split('\n').slice(0, 3).join(' | ') : '';
        console.error('[tenants] POST error:', msg);
        if (stack)
            console.error('[tenants] POST stack:', stack);
        return jsonError('Failed to create tenant: ' + msg.slice(0, 100), 500);
    }
}
