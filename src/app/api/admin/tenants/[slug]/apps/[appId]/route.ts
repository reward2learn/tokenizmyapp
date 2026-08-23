/**
 * Per-App Operations API — suite mode child app management.
 *
 * GET    /api/admin/tenants/[slug]/apps/[appId]  — get app status
 * POST   /api/admin/tenants/[slug]/apps/[appId]  — seed this app
 * PUT    /api/admin/tenants/[slug]/apps/[appId]  — deploy this app
 * PATCH  /api/admin/tenants/[slug]/apps/[appId]  — migrate/sync DB schema
 *
 * All operations read the tenant's appPack from metadata, find the matching
 * app by appId, perform the operation, and update the app's status in the
 * appPack config.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { seedTenantDefaults, seedTemplateSecurityGroups, resolveTenantAdminEmail } from '@/domain/tenant/tenant-seed-service';
import { resolveTemplate } from '@/domain/tenant/custom-template-service';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// ── Helpers ────────────────────────────────────────────────

/** Extract appPack from tenant metadata. */
function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/** Save the updated appPack back to tenant metadata. */
async function saveAppPack(db: ReturnType<typeof createRawClient>, slug: string, appPack: AppPackConfig): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config,appPack}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(appPack),
    slug,
  );
}

/** Update a single app's status within the appPack. */
async function updateAppStatus(
  db: ReturnType<typeof createRawClient>,
  slug: string,
  appPack: AppPackConfig,
  appId: string,
  patch: Partial<SuiteAppInstance>,
): Promise<void> {
  const idx = appPack.apps.findIndex((a) => a.appId === appId);
  if (idx === -1) return;
  appPack.apps[idx] = { ...appPack.apps[idx], ...patch };
  await saveAppPack(db, slug, appPack);
}

// ── GET: App Status ────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const appPack = getAppPack(rows[0]);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const app = appPack.apps.find((a) => a.appId === appId);
    if (!app) return jsonError(`App "${appId}" not found in suite`, 404);

    return jsonOk({ app, packId: appPack.packId, packName: appPack.name });
  } catch (err) {
    return jsonError('Failed to get app status: ' + (err as Error).message, 500);
  }
}

// ── POST: Seed This App ────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const appPack = getAppPack(tenant);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const app = appPack.apps.find((a) => a.appId === appId);
    if (!app) return jsonError(`App "${appId}" not found in suite`, 404);

    // Update status to provisioning
    await updateAppStatus(db, slug, appPack, appId, { status: 'provisioning' });

    // Seed into the TENANT's own dedicated database — all apps in a suite
    // share the one tenant database, never a separate database per app; the
    // live deployed app reads from that same URL via its own POSTGRES_URL,
    // never the root DB. `slug`/`appId` are passed as separate columns (not
    // a combined key) so admin queries scoped by {tenantSlug, appId} can
    // find these rows within the shared database.
    const tenantDbUrl = tenant.db_url as string | null;
    const tpl = await resolveTemplate(app.templateId);
    const dedicatedSeedClient = tenantDbUrl
      ? new PrismaClient({ datasources: { db: { url: tenantDbUrl } } })
      : null;
    const seedDb: unknown = dedicatedSeedClient ?? db;
    let result: { pages: number; navItems: number; settings: boolean; adminSeeded: boolean; errors: string[] };
    try {
      result = await seedTenantDefaults({
        slug,
        appId,
        displayName: app.name,
        template: app.templateId,
        primaryColor: tpl.defaultColors.primary,
        secondaryColor: tpl.defaultColors.secondary,
        adminEmail: resolveTenantAdminEmail(tenant.metadata as Record<string, unknown>),
        db: seedDb,
      });

      await seedTemplateSecurityGroups(seedDb, app.templateId);
    } finally {
      if (dedicatedSeedClient) await dedicatedSeedClient.$disconnect();
    }

    // Update status to live
    await updateAppStatus(db, slug, appPack, appId, { status: 'live' });

    // result.pages/navItems are insert-loop counters — they prove a statement
    // didn't throw, not that a row now actually exists for this app in its
    // real database. Re-query the same connection the seed just wrote to.
    const dbTarget: 'dedicated' | 'root' = dedicatedSeedClient ? 'dedicated' : 'root';
    const verifyDb = seedDb as { $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<{ count: bigint }[]> };
    const [verifiedPagesRows, verifiedNavRows] = await Promise.all([
      verifyDb.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM app_pages WHERE tenant_slug = $1 AND app_id = $2;`, slug, appId),
      verifyDb.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM navigation_items WHERE tenant_slug = $1 AND app_id = $2;`, slug, appId),
    ]);
    const verifiedPages = Number(verifiedPagesRows[0]?.count ?? 0);
    const verifiedNavItems = Number(verifiedNavRows[0]?.count ?? 0);

    console.log(`[app-seed] Seeded "${appId}" for tenant "${slug}" (${dbTarget} DB): ${result.pages} pages attempted / ${verifiedPages} verified, ${result.navItems} nav items attempted / ${verifiedNavItems} verified`);


    // Stamp the tenant's billing organization onto this app's Vercel project so
    // Settings → Billing / top-up resolve the Pro org (control-plane), not a
    // local Free default.
    try {
      const { readTenantOrganizationId, pushBillingIdentityToProject } = await import(
        '@/domain/billing/propagate-billing-identity'
      );
      const orgId = await readTenantOrganizationId(slug, db);
      const projectId = String(app.vercelProjectId ?? '').trim();
      if (orgId && projectId) {
        const push = await pushBillingIdentityToProject(projectId, orgId);
        console.log(
          `[app-seed] Billing identity for "${appId}": org=${orgId}, pushed ${push.pushed}/${push.keys.length} env vars`,
        );
      } else if (orgId && !projectId) {
        console.warn(`[app-seed] App "${appId}" has no vercelProjectId — skip billing identity push`);
      }
    } catch (err) {
      console.warn('[app-seed] Billing identity push failed:', (err as Error).message);
    }

    return jsonOk({
      seeded: true,
      appId,
      pages: result.pages,
      navItems: result.navItems,
      verifiedPages,
      verifiedNavItems,
      dbTarget,
      errors: result.errors || [],
    });
  } catch (err) {
    // Update status to error
    try {
      const rows = await db.$queryRawUnsafe(
        `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
      ) as Record<string, unknown>[];
      if (rows.length > 0) {
        const appPack = getAppPack(rows[0]);
        if (appPack) await updateAppStatus(db, slug, appPack, appId, { status: 'error' });
      }
    } catch { /* best-effort */ }

    return jsonError('Failed to seed app: ' + (err as Error).message, 500);
  }
}

// ── PUT: Deploy This App ───────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const appPack = getAppPack(tenant);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const app = appPack.apps.find((a) => a.appId === appId);
    if (!app) return jsonError(`App "${appId}" not found in suite`, 404);

    // Update status to deploying
    await updateAppStatus(db, slug, appPack, appId, { status: 'deploying' });

    // Deploy using the vercel-deploy-service — pointed at the TENANT's own
    // database (not a new one of its own; see suite-provisioning.ts).
    const { deployTenant } = await import('@/domain/tenant/vercel-deploy-service');
    const appSlug = `${slug}-${appId}`;
    const tpl = await resolveTemplate(app.templateId);
    const tenantDbUrl = tenant.db_url as string | null;

    // Merge the app-scoped config over the tenant config so the deploy
    // pushes THIS app's effective env vars (Google OAuth creds, custom env,
    // DB, PINs) — not just the shared identity metadata.
    const tenantMeta = (tenant.metadata ?? {}) as Record<string, unknown>;
    const tenantCfg = (tenantMeta.config ?? {}) as Record<string, unknown>;
    const appCfg = (app.config ?? {}) as Record<string, unknown>;

        const orgRows = await db.$queryRawUnsafe(
      `SELECT organization_id FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    const organizationId = String(orgRows[0]?.organization_id ?? '').trim() || null;

const result = await deployTenant({
      slug: appSlug,
      displayName: app.name,
      template: app.templateId,
      primaryColor: tpl.defaultColors.primary,
      secondaryColor: tpl.defaultColors.secondary,
      dbUrl: tenantDbUrl ? { pooled: tenantDbUrl } : null,
      metadata: {
        ...(organizationId ? { organizationId } : {}),
        parentSlug: slug,
        appId,
        department: app.department,
        config: { ...tenantCfg, ...appCfg },
      },
      projectId: app.vercelProjectId ?? undefined,
    });

    // Auto-provision this app's own Deploy Hook now that its Vercel project
    // exists — saves the operator from creating one by hand in Vercel's
    // dashboard and pasting it into the Edit App modal. Best-effort: a
    // failure here must never fail an otherwise-successful deploy.
    const { ensureDeployHook } = await import('@/domain/tenant/vercel-deploy-service');
    const hook = await ensureDeployHook(result.projectId, { name: 'DeployHook', ref: 'main' });
    const hookOk = hook.ok ? hook : null;

    // Update app with deployment info
    await updateAppStatus(db, slug, appPack, appId, {
      status: 'deploying',
      vercelProjectId: result.projectId,
      appUrl: result.appUrl,
      // Only overwrite when we actually got one — never clobber a manually
      // pasted hook URL with null.
      ...(hookOk?.url ? { deployHookUrl: hookOk.url } : {}),
    });

    console.log(`[app-deploy] Deployed "${appId}" for tenant "${slug}": ${result.appUrl}${hookOk ? ` (deploy hook ${hookOk.created ? 'created' : 'reused'})` : ' (no deploy hook)'}`);

    return jsonOk({
      deployed: true,
      appId,
      projectId: result.projectId,
      appUrl: result.appUrl,
      envCount: result.envCount,
      deployHookUrl: hookOk?.url ?? null,
      deployHookCreated: hookOk?.created ?? false,
    });
  } catch (err) {
    try {
      const rows = await db.$queryRawUnsafe(
        `SELECT metadata FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
      ) as Record<string, unknown>[];
      if (rows.length > 0) {
        const appPack = getAppPack(rows[0]);
        if (appPack) await updateAppStatus(db, slug, appPack, appId, { status: 'error' });
      }
    } catch { /* best-effort */ }

    return jsonError('Failed to deploy app: ' + (err as Error).message, 500);
  }
}

// ── PATCH: Migrate/Sync DB Schema ──────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const appPack = getAppPack(tenant);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const app = appPack.apps.find((a) => a.appId === appId);
    if (!app) return jsonError(`App "${appId}" not found in suite`, 404);

    // Run column migrations against the TENANT's own dedicated database —
    // all apps in a suite share it, never a separate DB per app (see
    // suite-provisioning.ts). Running this against the root `db` client
    // above would silently migrate the platform's own DB and never touch
    // where this app's actual data lives.
    const { addTenantColumnsIfMissing, seedTemplateSecurityGroups } = await import('@/domain/tenant/tenant-seed-service');
    const tenantDbUrl = tenant.db_url as string | null;
    const migrateClient = tenantDbUrl
      ? new PrismaClient({ datasources: { db: { url: tenantDbUrl } } })
      : null;
    let groupsSynced = 0;
    try {
      await addTenantColumnsIfMissing(migrateClient ?? db);

      // Push the current global security-group catalog into the shared
      // tenant database this app lives in — idempotent, and never touches
      // tenant-specific custom groups (created via the Security Groups tab).
      groupsSynced = await seedTemplateSecurityGroups(migrateClient ?? db, app.templateId);
    } finally {
      if (migrateClient) await migrateClient.$disconnect();
    }

    console.log(`[app-migrate] Schema sync complete for "${appId}" in tenant "${slug}" — ${groupsSynced} security groups synced`);

    return jsonOk({
      migrated: true,
      appId,
      templateId: app.templateId,
      groupsSynced,
    });
  } catch (err) {
    return jsonError('Failed to migrate app: ' + (err as Error).message, 500);
  }
}
