import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient, type DbClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveCapabilitiesForSub } from '@/domain/security/security-service';
import { setSecret, deleteSecret } from '@/lib/secrets';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/functional-roles';

export const maxDuration = 30;

type UserAccountRow = {
  id: string;
  sub: string;
  email: string | null;
  name: string | null;
  tier: string;
  role_code: string | null;
  is_active: boolean;
  last_seen_at: Date | null;
  created_at: Date;
  tenant_slug: string | null;
  app_id: string | null;
};

type GroupCodeRow = { code: string };
type SubRow = { sub: string };

export interface AdminUserView {
  id: string;
  sub: string;
  email: string | null;
  name: string | null;
  tier: string;
  roleCode: string | null;
  isActive: boolean;
  groups: string[];
  permissions: string[];
  /** Task ids assigned directly to this user account (task_user_assignments). */
  taskIds: string[];
  lastSeenAt: string | null;
  createdAt: string;
  tenantSlug: string | null;
  appId: string | null;
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

  // A tenant with its own dedicated database (tenants.db_url) must be read
  // there — its live app reads/writes that DB via its own POSTGRES_URL, not
  // the platform root DB. Without this, seeded data (including the default
  // admin account) is invisible here even though it exists in the tenant's
  // own database. See tenant-db-resolver.ts.
  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug, appId);
  let db: DbClient;
  try {
    db = (dbUrl ? new PrismaClient({ datasources: { db: { url: dbUrl } } }) : createRawClient()) as unknown as DbClient;
    // Quick connectivity test
    await db.$queryRawUnsafe('SELECT 1 as ok');
  } catch (err) {
    console.error('[admin/users] GET createRawClient error:', err instanceof Error ? err.message : String(err));
    return jsonError('Database unavailable', 503);
  }

  try {
    const where: string[] = [];
    const params: unknown[] = [];
    if (tenantSlug) { params.push(tenantSlug); where.push(`tenant_slug = $${params.length}`); }
    // The default admin account (and any other tenant-wide row) is seeded
    // with app_id = NULL on purpose, so it should show up in every app's
    // user list for this tenant, not just an exact appId match.
    if (appId) { params.push(appId); where.push(`(app_id = $${params.length} OR app_id IS NULL)`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await db.$queryRawUnsafe(
      `SELECT id, sub, email, name, tier, role_code, is_active, last_seen_at, created_at, tenant_slug, app_id
       FROM user_accounts
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 200;`,
      ...params,
    ) as UserAccountRow[];

    const users: AdminUserView[] = await Promise.all(
      rows.map(async (r) => ({
        id: r.id,
        sub: r.sub,
        email: r.email,
        name: r.name,
        tier: r.tier,
        roleCode: r.role_code,
        isActive: r.is_active,
        groups: await resolveGroups(db, r.id),
        permissions: await resolveCapabilities(db, r.sub),
        taskIds: await resolveAssignedTaskIds(db, r.id),
        lastSeenAt: r.last_seen_at ? r.last_seen_at.toISOString() : null,
        createdAt: r.created_at.toISOString(),
        tenantSlug: r.tenant_slug,
        appId: r.app_id,
      })),
    );

    console.log('[admin/users] GET returning', users.length, 'users');
    return jsonOk({ users });
  } catch (err) {
    console.error('[admin/users] GET error:', err);
    return jsonError('Failed to load users', 500);
  } finally {
    if (dbUrl) await (db as unknown as PrismaClient).$disconnect();
  }
}

async function resolveGroups(db: DbClient, userId: string): Promise<string[]> {
  try {
    const rows = await db.$queryRawUnsafe(
      `SELECT sg.code FROM security_groups sg
       JOIN user_groups ug ON ug.group_id = sg.id
       WHERE ug.user_id = $1;`,
      userId,
    ) as GroupCodeRow[];
    return (rows ?? []).map((r) => r.code);
  } catch {
    return [];
  }
}

async function resolveCapabilities(db: DbClient, sub: string): Promise<string[]> {
  try {
    return await resolveCapabilitiesForSub(db, sub);
  } catch {
    return [];
  }
}


async function resolveAssignedTaskIds(db: DbClient, userId: string): Promise<string[]> {
  try {
    const rows = await db.taskUserAssignment.findMany({
      where: { userId, assigned: true },
      select: { taskId: true },
      orderBy: { taskId: 'asc' },
    });
    return (rows ?? []).map((r: { taskId: string }) => r.taskId);
  } catch {
    return [];
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

  const { id, email, isActive, roleCode, groupCodes, pin, tenantSlug, appId } = (body ?? {}) as {
    id?: string;
    email?: string;
    isActive?: boolean;
    roleCode?: string | null;
    groupCodes?: string[];
    pin?: string;
    tenantSlug?: string;
    appId?: string;
  };

  if (!id || typeof id !== 'string') return jsonError('id is required', 400);

  // The user row being edited may live in a tenant's own dedicated database
  // (not the root DB) — without this, the UPDATE below silently affects 0
  // rows because the id doesn't exist in the root DB's user_accounts table.
  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug, appId);
  let db: DbClient;
  try {
    db = (dbUrl ? new PrismaClient({ datasources: { db: { url: dbUrl } } }) : createRawClient()) as unknown as DbClient;
  } catch (err) {
    console.error('[admin/users] POST createRawClient error:', err instanceof Error ? err.message : String(err));
    return jsonError('Database unavailable', 503);
  }

  try {
    if (typeof isActive === 'boolean' || roleCode !== undefined || email !== undefined) {
      await db.$executeRawUnsafe(
        `UPDATE user_accounts
         SET is_active = COALESCE($1, is_active),
             role_code = COALESCE($2, role_code),
             email = COALESCE($3, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4;`,
        typeof isActive === 'boolean' ? isActive : null,
        roleCode === null ? null : (roleCode ?? null),
        email === undefined ? null : email,
        id,
      );
    }

    if (Array.isArray(groupCodes)) {
      await db.$executeRawUnsafe(`DELETE FROM user_groups WHERE user_id = $1;`, id);
      for (const code of groupCodes) {
        await db.$executeRawUnsafe(
          `INSERT INTO user_groups (id, user_id, group_id)
           SELECT gen_random_uuid()::TEXT, $1, sg.id FROM security_groups sg WHERE sg.code = $2
           ON CONFLICT (user_id, group_id) DO NOTHING;`,
          id,
          code,
        );
      }
    }

    // Set PIN for this user (stored as USER_PIN_<sub> in secrets table).
    if (pin && pin.trim().length >= 3) {
      const user = await db.$queryRawUnsafe(
        `SELECT sub FROM user_accounts WHERE id = $1;`,
        id,
      ) as SubRow[];
      const sub = user[0]?.sub;
      if (sub) {
        await setSecret(`USER_PIN_${sub}`, pin.trim());
      }
    }

    return jsonOk({ id, updated: true });
  } catch (err) {
    console.error('[admin/users] POST error:', err instanceof Error ? (err.message + ' ' + err.stack?.slice(0, 200)) : String(err));
    return jsonError('Failed to update user', 500);
  } finally {
    if (dbUrl) await (db as unknown as PrismaClient).$disconnect();
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return jsonError('id query param is required', 400);
  const tenantSlug = searchParams.get('tenantSlug');
  const appId = searchParams.get('appId');

  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug, appId);
  let db: DbClient;
  try {
    db = (dbUrl ? new PrismaClient({ datasources: { db: { url: dbUrl } } }) : createRawClient()) as unknown as DbClient;
  } catch {
    return jsonError('Database unavailable', 503);
  }

  try {
    // Fetch the sub + identity fields before deleting — both to remove the
    // PIN secret and to block deleting the platform's own default admin
    // account, which would lock everyone out of this console.
    const user = await db.$queryRawUnsafe(
      `SELECT sub, email, role_code, tenant_slug FROM user_accounts WHERE id = $1;`,
      id,
    ) as (SubRow & { email: string | null; role_code: string | null; tenant_slug: string | null })[];

    const target = user[0];
    if (
      target &&
      target.role_code === 'platform-admin' &&
      target.tenant_slug === null &&
      (target.email ?? '').toLowerCase() === DEFAULT_PLATFORM_ADMIN_EMAIL.toLowerCase()
    ) {
      return jsonError(
        'Cannot delete the platform administrator\'s own default account — this would lock everyone out of this console.',
        403,
      );
    }

    // Cascade deletes user_groups rows automatically.
    await db.$executeRawUnsafe(`DELETE FROM user_accounts WHERE id = $1;`, id);
    // Also delete the PIN secret so the user cannot re-authenticate via PIN.
    if (user[0]?.sub) {
      await deleteSecret(`USER_PIN_${user[0].sub}`).catch(() => {});
    }
    return jsonOk({ id, deleted: true });
  } catch (err) {
    console.error('[admin/users] DELETE error:', err);
    return jsonError('Failed to delete user', 500);
  } finally {
    if (dbUrl) await (db as unknown as PrismaClient).$disconnect();
  }
}
