/**
 * POST /api/admin/tenants/[slug]/seed
 *
 * Runs seedTenantDefaults for the specified tenant.
 * Seeds: AppPages + PageSections, NavigationItems, AppSettings, SecurityGroups
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { seedTenantDefaults, seedTemplateSecurityGroups, seedTemplateBranding } from '@/domain/tenant/tenant-seed-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 min timeout for seeding

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient() as any;

  try {
    await ensureTenantsTable(db);

    // Fetch the tenant record
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0] as Record<string, unknown>;

    const result = await seedTenantDefaults({
      slug: tenant.slug as string,
      displayName: tenant.display_name as string,
      template: tenant.template as string,
      primaryColor: (tenant.primary_color as string) || '#eb3d28',
      secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
      db,
    });

    const groupsCount = await seedTemplateSecurityGroups(db, tenant.template as string);

    await seedTemplateBranding(db, {
      primaryColor: (tenant.primary_color as string) || '#eb3d28',
      secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
    });

    if ((result as any).errors?.length > 0) {
      console.error(`[seed] Seed errors for "${slug}":`, (result as any).errors);
    }
    console.log(`[seed] Seed complete for "${slug}": ${result.pages} pages, ${result.navItems} nav items, ${groupsCount} groups`);

    return jsonOk({
      seeded: true,
      pages: result.pages,
      navItems: result.navItems,
      groups: groupsCount,
      settings: result.settings,
      errors: (result as any).errors || [],
    });
  } catch (err) {
    console.error(`[seed] POST /${slug}/seed error:`, err);
    return jsonError('Failed to seed tenant: ' + (err as Error).message, 500);
  }
}
