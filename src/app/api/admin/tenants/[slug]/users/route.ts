/**
 * Tenant Users API — CRUD for users scoped to a tenant
 *
 * GET    /api/admin/tenants/[slug]/users           — list users for a tenant
 * POST   /api/admin/tenants/[slug]/users           — create or update a user
 * DELETE /api/admin/tenants/[slug]/users?id=xxx    — delete a user
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient, type DbClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { ensureTenantUserColumn, type TenantUserRow, type TenantUserView } from '@/domain/tenant/tenant-user-service';
import { resolveCapabilitiesForSub } from '@/domain/security/security-service';
import { setSecret } from '@/lib/secrets';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ── Helpers ────────────────────────────────────────────

async function resolveGroups(db: any, userId: string): Promise<string[]> {
  try {
    const rows = await db.$queryRawUnsafe(
      `SELECT sg.code FROM security_groups sg
       JOIN user_groups ug ON ug.group_id = sg.id
       WHERE ug.user_id = $1;`,
      userId,
    ) as { code: string }[];
    return (rows ?? []).map((r) => r.code);
  } catch {
    return [];
  }
}

async function resolveCaps(db: any, sub: string): Promise<string[]> {
  try {
    return await resolveCapabilitiesForSub(db, sub);
  } catch {
    return [];
  }
}

function toView(r: TenantUserRow, groups: string[], permissions: string[]): TenantUserView {
  return {
    id: r.id,
    sub: r.sub,
    email: r.email,
    name: r.name,
    tier: r.tier,
    roleCode: r.role_code,
    isActive: r.is_active,
    groups,
    permissions,
    lastSeenAt: r.last_seen_at ? r.last_seen_at.toISOString() : null,
    createdAt: r.created_at.toISOString(),
    tenantSlug: r.tenant_slug,
  };
}

// ── GET ─────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { slug } = await params;

  const db = createRawClient() as any;
  try {
    await ensureTenantsTable(db);
    await ensureTenantUserColumn(db);

    // Verify tenant exists
    const tenantRows = await db.$queryRawUnsafe(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as { id: string }[];
    if (tenantRows.length === 0) return jsonError('Tenant not found', 404);

    const rows = await db.$queryRawUnsafe(
      `SELECT id, sub, email, name, tier, role_code, is_active, last_seen_at, created_at, tenant_slug
       FROM user_accounts
       WHERE tenant_slug = $1
       ORDER BY created_at DESC
       LIMIT 200;`,
      slug,
    ) as TenantUserRow[];

    const users: TenantUserView[] = await Promise.all(
      rows.map(async (r) => {
        const [groups, permissions] = await Promise.all([
          resolveGroups(db, r.id),
          resolveCaps(db, r.sub),
        ]);
        return toView(r, groups, permissions);
      }),
    );

    return jsonOk({ users });
  } catch (err) {
    console.error(`[tenant-users] GET error:`, err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`Failed to load tenant users: ${message}`, 500);
  }
}

// ── POST (create / update) ─────────────────────────────

const upsertSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email().optional().nullable(),
  name: z.string().max(200).optional().nullable(),
  tier: z.enum(['public', 'pin', 'google']).optional(),
  roleCode: z.string().max(100).optional().nullable(),
  groupCodes: z.array(z.string()).optional(),
  pin: z.string().min(3).max(12).optional(),
  isActive: z.boolean().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { slug } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON', 400);
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);
  }

  const db = createRawClient() as any;
  try {
    await ensureTenantsTable(db);
    await ensureTenantUserColumn(db);

    // Verify tenant exists
    const tenantRows = await db.$queryRawUnsafe(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as { id: string }[];
    if (tenantRows.length === 0) return jsonError('Tenant not found', 404);

    const { sub, email, name, tier, roleCode, groupCodes, pin, isActive } = parsed.data;

    // Upsert user
    const existing = await db.$queryRawUnsafe(
      `SELECT id FROM user_accounts WHERE sub = $1 AND tenant_slug = $2 LIMIT 1;`,
      sub, slug,
    ) as { id: string }[];

    let userId: string;
    if (existing.length > 0) {
      userId = existing[0].id;
      await db.$executeRawUnsafe(
        `UPDATE user_accounts SET
           email = COALESCE($1, email),
           name = COALESCE($2, name),
           tier = COALESCE($3, tier),
           role_code = $4,
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $6;`,
        email ?? null,
        name ?? null,
        tier ?? null,
        roleCode === null ? null : (roleCode ?? null),
        isActive === null ? null : isActive,
        userId,
      );
    } else {
      userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await db.$executeRawUnsafe(
        `INSERT INTO user_accounts (id, sub, email, name, tier, role_code, is_active, tenant_slug, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
        userId,
        sub,
        email ?? null,
        name ?? null,
        tier ?? 'pin',
        roleCode ?? null,
        isActive ?? true,
        slug,
      );
    }

    // Handle group membership
    if (Array.isArray(groupCodes)) {
      await db.$executeRawUnsafe(`DELETE FROM user_groups WHERE user_id = $1;`, userId);
      for (const code of groupCodes) {
        await db.$executeRawUnsafe(
          `INSERT INTO user_groups (user_id, group_id)
           SELECT $1, sg.id FROM security_groups sg WHERE sg.code = $2
           ON CONFLICT (user_id, group_id) DO NOTHING;`,
          userId, code,
        );
      }
    }

    // Set PIN if provided
    if (pin && pin.trim().length >= 3) {
      await setSecret(`USER_PIN_${sub}`, pin.trim());
    }

    return jsonOk({ id: userId, created: existing.length === 0 });
  } catch (err) {
    console.error(`[tenant-users] POST error:`, err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`Failed to upsert tenant user: ${message}`, 500);
  }
}

// ── DELETE ─────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return jsonError('id query param is required', 400);

  const db = createRawClient() as any;
  try {
    await ensureTenantsTable(db);
    await ensureTenantUserColumn(db);

    // Only delete if the user belongs to this tenant
    const result = await db.$executeRawUnsafe(
      `DELETE FROM user_accounts WHERE id = $1 AND tenant_slug = $2;`,
      id, slug,
    );

    if (Number(result) === 0) {
      return jsonError('User not found for this tenant', 404);
    }

    return jsonOk({ id, deleted: true });
  } catch (err) {
    console.error(`[tenant-users] DELETE error:`, err);
    return jsonError('Failed to delete tenant user', 500);
  }
}
