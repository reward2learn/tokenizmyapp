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
import { getTemplate } from '@/domain/tenant/template-catalog';
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
    const tpl = getTemplate(app.templateId);
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

    console.log(`[app-seed] Seeded "${appId}" for tenant "${slug}": ${result.pages} pages, ${result.navItems} nav items`);

    return jsonOk({
      seeded: true,
      appId,
      pages: result.pages,
      navItems: result.navItems,
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
    const appSlug = `${slug}__${appId}`;
    const tpl = getTemplate(app.templateId);
    const tenantDbUrl = tenant.db_url as string | null;

    const result = await deployTenant({
      slug: appSlug,
      displayName: app.name,
      template: app.templateId,
      primaryColor: tpl.defaultColors.primary,
      secondaryColor: tpl.defaultColors.secondary,
      dbUrl: tenantDbUrl ? { pooled: tenantDbUrl } : null,
      metadata: { parentSlug: slug, appId, department: app.department },
    });

    // Update app with deployment info
    await updateAppStatus(db, slug, appPack, appId, {
      status: 'deploying',
      vercelProjectId: result.projectId,
      appUrl: result.appUrl,
    });

    console.log(`[app-deploy] Deployed "${appId}" for tenant "${slug}": ${result.appUrl}`);

    return jsonOk({
      deployed: true,
      appId,
      projectId: result.projectId,
      appUrl: result.appUrl,
      envCount: result.envCount,
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
    const { addTenantColumnsIfMissing } = await import('@/domain/tenant/tenant-seed-service');
    const tenantDbUrl = tenant.db_url as string | null;
    const migrateClient = tenantDbUrl
      ? new PrismaClient({ datasources: { db: { url: tenantDbUrl } } })
      : null;
    try {
      await addTenantColumnsIfMissing(migrateClient ?? db);
    } finally {
      if (migrateClient) await migrateClient.$disconnect();
    }

    console.log(`[app-migrate] Schema sync complete for "${appId}" in tenant "${slug}"`);

    return jsonOk({
      migrated: true,
      appId,
      templateId: app.templateId,
    });
  } catch (err) {
    return jsonError('Failed to migrate app: ' + (err as Error).message, 500);
  }
}
