/**
 * POST /api/admin/tenants/[slug]/migrate
 *
 * Runs tenant table/column migrations for the specified tenant.
 * Creates missing tables and tenant-isolation columns.
 */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { addTenantColumnsIfMissing, seedTemplateSecurityGroups } from '@/domain/tenant/tenant-seed-service';
import { ensureTenantConfigColumns } from '@/domain/tenant/tenant-config-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  const results: Record<string, string> = {};

  try {
    // 1. Ensure the tenants table exists
    await ensureTenantsTable(db);
    results.tenantsTable = 'ok';

    // 2. Check tenant exists
    const rows = await db.$queryRawUnsafe(
      `SELECT id, db_url, template FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as { id: string; db_url: string | null; template: string }[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);
    results.tenantExists = 'ok';

    // 3. Run tenant-isolation column migration — against the tenant's own
    // dedicated database when it has one, never the platform root DB. Every
    // app in a suite shares this one database (see suite-provisioning.ts).
    const tenantDbUrl = rows[0].db_url;
    const migrateClient = tenantDbUrl
      ? new PrismaClient({ datasources: { db: { url: tenantDbUrl } } })
      : null;
    let groupsSynced = 0;
    try {
      await addTenantColumnsIfMissing(migrateClient ?? db);
      results.tenantColumns = 'ok';

      // Push the current global security-group catalog (platform-admin,
      // ops-admin, finance, viewer) into this tenant's own database — an
      // idempotent upsert, so it also fixes tenants whose dedicated DB
      // predates security_groups/user_groups (see addTenantColumnsIfMissing
      // above) or whose catalog is stale relative to the latest definitions.
      // Never touches tenant-specific custom groups.
      groupsSynced = await seedTemplateSecurityGroups(migrateClient ?? db, rows[0].template);
      results.securityGroups = `${groupsSynced} synced`;
    } finally {
      if (migrateClient) await migrateClient.$disconnect();
    }

    // 4. Ensure tenant config columns (api_key, etc.) — these live on the
    // `tenants` registry row itself, which always lives in the root DB.
    await ensureTenantConfigColumns(db);
    results.configColumns = 'ok';

    console.log(`[migrate] Migration complete for "${slug}":`, results);

    return jsonOk({
      migrated: true,
      results,
    });
  } catch (err) {
    console.error(`[migrate] POST /${slug}/migrate error:`, err);
    return jsonError('Failed to migrate tenant: ' + (err as Error).message, 500);
  }
}
