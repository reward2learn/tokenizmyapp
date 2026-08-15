import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient, type DbClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { DEFAULT_SECURITY_GROUPS } from '@/lib/db-migrate';
import { CAPABILITY_AREAS, capability, ALL_CAPABILITIES } from '@/domain/security/capabilities';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';

export const maxDuration = 30;

export interface AdminGroupView {
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  memberCount: number;
  tenantSlug: string | null;
  appId: string | null;
}

/** All valid capability codes (used to validate PATCH payloads). */
export const VALID_CAPABILITIES: string[] = [
  ALL_CAPABILITIES,
  ...CAPABILITY_AREAS.flatMap((a) => a.accesses.map((acc) => capability(a.area, acc))),
];

/** Raw row shape returned by the security_groups SELECT below. */
type GroupRow = {
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[] | null;
  member_count: number;
  tenant_slug: string | null;
  app_id: string | null;
};

/** Resolve the DB connection for a group request — a tenant's own dedicated
 *  database when tenantSlug/appId resolve to one (its live app only ever
 *  reads its own database, so a tenant-scoped group has no effect unless it
 *  lives there), otherwise the platform's root DB for global-catalog
 *  browsing. Self-heals security_groups/user_groups so a tenant DB that
 *  predates this table gets it created on first use. */
async function resolveGroupsDb(
  tenantSlug: string | null | undefined,
  appId: string | null | undefined,
): Promise<{ db: DbClient; dedicated: PrismaClient | null } | { error: NextResponse }> {
  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug, appId);
  let db: DbClient;
  let dedicated: PrismaClient | null = null;
  try {
    if (dbUrl) {
      dedicated = new PrismaClient({ datasources: { db: { url: dbUrl } } });
      db = dedicated as unknown as DbClient;
    } else {
      db = createRawClient() as unknown as DbClient;
    }
  } catch {
    return { error: jsonError('Database unavailable', 503) };
  }
  try {
    await addTenantColumnsIfMissing(db);
  } catch {
    // Best-effort — individual queries below still guard themselves.
  }
  return { db, dedicated };
}

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  // Cross-tenant browsing is a platform-admin-only capability (already gated
  // above); tenantSlug/appId are ignored for any other caller.
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenantSlug');
  const appId = searchParams.get('appId');

  const resolved = await resolveGroupsDb(tenantSlug, appId);
  if ('error' in resolved) return resolved.error;
  const { db, dedicated } = resolved;

  try {
    const where: string[] = [];
    const params: unknown[] = [];
    if (tenantSlug) { params.push(tenantSlug); where.push(`sg.tenant_slug = $${params.length}`); }
    if (appId) { params.push(appId); where.push(`sg.app_id = $${params.length}`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await db.$queryRawUnsafe(
      `SELECT sg.code, sg.name, sg.description, sg.is_system, sg.permissions, sg.tenant_slug, sg.app_id,
                COUNT(ug.id)::int AS member_count
          FROM security_groups sg
          LEFT JOIN user_groups ug ON ug.group_id = sg.id
          ${whereClause}
          GROUP BY sg.code, sg.name, sg.description, sg.is_system, sg.permissions, sg.tenant_slug, sg.app_id
          ORDER BY sg.is_system DESC, sg.name ASC;`,
      ...params,
    );

    const groups: AdminGroupView[] = (rows as GroupRow[]).map((r) => ({
      code: r.code,
      name: r.name,
      description: r.description,
      isSystem: r.is_system,
      permissions: r.permissions ?? [],
      memberCount: r.member_count,
      tenantSlug: r.tenant_slug,
      appId: r.app_id,
    }));

    return jsonOk({ groups, defaults: DEFAULT_SECURITY_GROUPS.map((g) => g.code) });
  } catch (err) {
    console.error('[admin/groups] GET error:', err);
    return jsonError('Failed to load groups', 500);
  } finally {
    if (dedicated) await dedicated.$disconnect();
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const { code, name, description, permissions, tenantSlug, appId } = (body ?? {}) as {
    code?: string;
    name?: string;
    description?: string;
    permissions?: string[];
    tenantSlug?: string;
    appId?: string;
  };

  if (!code || !name) return jsonError('code and name are required', 400);
  if (!/^[a-z0-9-]+$/.test(code)) {
    return jsonError('code must be lowercase letters, numbers, or hyphens', 400);
  }

  const perms = normalizePermissions(permissions);

  const resolved = await resolveGroupsDb(tenantSlug, appId);
  if ('error' in resolved) return resolved.error;
  const { db, dedicated } = resolved;

  try {
    await db.$executeRawUnsafe(
      `INSERT INTO security_groups (code, name, description, is_system, permissions, tenant_slug, app_id)
       VALUES ($1, $2, $3, false, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE SET name = $2, description = $3, permissions = $4, tenant_slug = $5, app_id = $6;`,
      code,
      name,
      description ?? null,
      perms,
      tenantSlug ?? null,
      appId ?? null,
    );
    return jsonOk({
      code, name, description: description ?? null, isSystem: false, permissions: perms, memberCount: 0,
      tenantSlug: tenantSlug ?? null, appId: appId ?? null,
    });
  } catch (err) {
    console.error('[admin/groups] POST error:', err);
    return jsonError('Failed to create group', 500);
  } finally {
    if (dedicated) await dedicated.$disconnect();
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const { code, name, description, permissions, tenantSlug, appId } = (body ?? {}) as {
    code?: string;
    name?: string;
    description?: string;
    permissions?: string[];
    tenantSlug?: string;
    appId?: string;
  };

  if (!code) return jsonError('code is required', 400);

  const perms = normalizePermissions(permissions);

  const resolved = await resolveGroupsDb(tenantSlug, appId);
  if ('error' in resolved) return resolved.error;
  const { db, dedicated } = resolved;

  try {
    const affected = await db.$executeRawUnsafe(
      `UPDATE security_groups
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           permissions = $4
       WHERE code = $1;`,
      code,
      name ?? null,
      description ?? null,
      perms,
    );
    if (affected === 0) return jsonError('Group not found', 404);
    return jsonOk({ code, name: name ?? null, description: description ?? null, permissions: perms, updated: true });
  } catch (err) {
    console.error('[admin/groups] PATCH error:', err);
    return jsonError('Failed to update group', 500);
  } finally {
    if (dedicated) await dedicated.$disconnect();
  }
}

/** Validate + de-duplicate a permission list against the known capability catalog. */
function normalizePermissions(permissions: string[] | undefined): string[] {
  if (!Array.isArray(permissions)) return [];
  const set = new Set<string>();
  for (const p of permissions) {
    if (typeof p === 'string' && VALID_CAPABILITIES.includes(p)) set.add(p);
  }
  return Array.from(set);
}
