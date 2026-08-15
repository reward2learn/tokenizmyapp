/**
 * POST /api/admin/tenants/[slug]/seed
 *
 * Runs seedTenantDefaults for the specified tenant.
 * Seeds: AppPages + PageSections, NavigationItems, AppSettings, SecurityGroups
 */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { seedTenantDefaults, seedTemplateSecurityGroups, seedTemplateBranding, cleanTenantSeed, resolveTenantAdminEmail } from '@/domain/tenant/tenant-seed-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 min timeout for seeding

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);

    // Fetch the tenant record
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0] as Record<string, unknown>;

    // A suite tenant's page/nav content is each app's own responsibility,
    // seeded via its own per-app Seed action (apps/[appId]/route.ts POST).
    // app_pages is keyed by a GLOBAL slug, not (tenant, app) — an unscoped
    // tenant-level seed would wipe and re-upsert every app's already-seeded
    // pages to app_id = NULL, clobbering the per-app scoping. So a
    // tenant-level seed against a suite tenant only seeds genuinely
    // tenant-wide data: branding, the default admin account, and security
    // groups — never page/nav content.
    const metadata = (tenant.metadata ?? {}) as Record<string, unknown>;
    const cfg = (metadata.config ?? {}) as Record<string, unknown>;
    const appPack = cfg.appPack as { apps?: unknown[] } | undefined;
    const isSuite = !!appPack && Array.isArray(appPack.apps) && appPack.apps.length > 0;

    // Tenants with their own dedicated database must be seeded there — the
    // tenant's own live app reads from that same URL via its own
    // POSTGRES_URL, not the root DB's tenant_slug-scoped rows. Re-seeding the
    // root DB instead (the old behavior) never reached the tenant's real DB.
    const dedicatedDbUrl = tenant.db_url as string | null;
    const dedicatedClient = dedicatedDbUrl
      ? new PrismaClient({ datasources: { db: { url: dedicatedDbUrl } } })
      : null;
    const seedDb: unknown = dedicatedClient ?? db;

    try {
      if (!isSuite) {
        // Single-template tenant — there's no separate per-app seed for it,
        // so the tenant-level run IS the whole app's seed. Fully clean before
        // rebuilding — every app in a suite independently inserts its own
        // copy of the template's default nav items, so a partial/scoped
        // clear leaves other apps' copies in place and repeated seeds
        // compound into duplicate nav entries. This wipes ALL pages,
        // sections, and nav items for the tenant first.
        await cleanTenantSeed(seedDb, tenant.slug as string);
      }

      const result = await seedTenantDefaults({
        slug: tenant.slug as string,
        displayName: tenant.display_name as string,
        template: tenant.template as string,
        primaryColor: (tenant.primary_color as string) || '#eb3d28',
        secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
        adminEmail: resolveTenantAdminEmail(tenant.metadata as Record<string, unknown>),
        db: seedDb,
        skipContent: isSuite,
      });

      const groupsCount = await seedTemplateSecurityGroups(seedDb, tenant.template as string);

      await seedTemplateBranding(slug, seedDb, {
        primaryColor: (tenant.primary_color as string) || '#eb3d28',
        secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
      });

      if (result.errors?.length > 0) {
        console.error(`[seed] Seed errors for "${slug}":`, result.errors);
      }

      const dbTarget: 'dedicated' | 'root' = dedicatedClient ? 'dedicated' : 'root';
      const scope: 'tenant-wide' | 'full' = isSuite ? 'tenant-wide' : 'full';

      // result.pages/navItems are just insert-loop counters — they prove a
      // statement didn't throw, not that a row now actually exists in this
      // tenant's real database. Re-query the target connection so the
      // response reflects what's actually persisted, not what was attempted.
      // Skipped for a suite tenant — this run never touches page/nav content,
      // so counting it here would misrepresent what this seed actually did.
      let verifiedPages: number | undefined;
      let verifiedNavItems: number | undefined;
      if (!isSuite) {
        const verifyDb = seedDb as { $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<{ count: bigint }[]> };
        const [verifiedPagesRows, verifiedNavRows] = await Promise.all([
          verifyDb.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM app_pages WHERE tenant_slug = $1;`, tenant.slug as string),
          verifyDb.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM navigation_items WHERE tenant_slug = $1;`, tenant.slug as string),
        ]);
        verifiedPages = Number(verifiedPagesRows[0]?.count ?? 0);
        verifiedNavItems = Number(verifiedNavRows[0]?.count ?? 0);
      }

      console.log(`[seed] Seed complete for "${slug}" (${dbTarget} DB, ${scope} scope): ${verifiedPages !== undefined ? `${result.pages} pages attempted / ${verifiedPages} verified, ${result.navItems} nav items attempted / ${verifiedNavItems} verified, ` : ''}${groupsCount} groups`);

      return jsonOk({
        seeded: true,
        scope,
        pages: result.pages,
        navItems: result.navItems,
        verifiedPages,
        verifiedNavItems,
        dbTarget,
        groups: groupsCount,
        settings: result.settings,
        adminSeeded: result.adminSeeded,
        errors: result.errors || [],
      });
    } finally {
      if (dedicatedClient) await dedicatedClient.$disconnect();
    }
  } catch (err) {
    console.error(`[seed] POST /${slug}/seed error:`, err);
    return jsonError('Failed to seed tenant: ' + (err as Error).message, 500);
  }
}
