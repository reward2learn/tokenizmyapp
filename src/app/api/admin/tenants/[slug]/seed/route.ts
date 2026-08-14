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
import { seedTenantDefaults, seedTemplateSecurityGroups, seedTemplateBranding, cleanTenantSeed } from '@/domain/tenant/tenant-seed-service';

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
      // Fully clean before rebuilding — every app in a suite independently
      // inserts its own copy of the template's default nav items, so a
      // partial/scoped clear leaves other apps' copies in place and repeated
      // seeds compound into duplicate nav entries. This wipes ALL pages,
      // sections, and nav items for the tenant first.
      await cleanTenantSeed(seedDb, tenant.slug as string);

      const result = await seedTenantDefaults({
        slug: tenant.slug as string,
        displayName: tenant.display_name as string,
        template: tenant.template as string,
        primaryColor: (tenant.primary_color as string) || '#eb3d28',
        secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
        db: seedDb,
      });

      const groupsCount = await seedTemplateSecurityGroups(seedDb, tenant.template as string);

      await seedTemplateBranding(slug, seedDb, {
        primaryColor: (tenant.primary_color as string) || '#eb3d28',
        secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
      });

      if (result.errors?.length > 0) {
        console.error(`[seed] Seed errors for "${slug}":`, result.errors);
      }
      console.log(`[seed] Seed complete for "${slug}" (${dedicatedClient ? 'dedicated DB' : 'root DB'}): ${result.pages} pages, ${result.navItems} nav items, ${groupsCount} groups`);

      return jsonOk({
        seeded: true,
        pages: result.pages,
        navItems: result.navItems,
        groups: groupsCount,
        settings: result.settings,
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
