import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient, type DbClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { setSecret } from '@/lib/secrets';
import { FUNCTIONAL_ROLES } from '@/domain/security/functional-roles';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { recalculateOrgRateCard } from '@/domain/billing/org-rate-card-service';

export const maxDuration = 30;

export interface BatchUserInput {
  name?: string | null;
  email: string;
  roleCode?: string | null;
  pin?: string;
  isActive?: boolean;
}

export interface BatchUserResult {
  row: number;
  email: string;
  status: 'created' | 'updated' | 'skipped';
  error?: string | null;
}

export interface BatchUsersResponse {
  results: BatchUserResult[];
  created: number;
  updated: number;
  skipped: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLE_CODES = new Set(FUNCTIONAL_ROLES.map((r) => r.code));
const MAX_BATCH = 200;

/**
 * POST /api/admin/users/batch — platform-admin only.
 * Onboards users one-at-a-time or from a CSV upload:
 *  - sub is derived from the lowercased email (PIN-first identity until Google sign-in).
 *  - Existing rows (matched by sub) are updated; new rows are created with tier 'pin'.
 *  - An optional PIN is stored as USER_PIN_<sub> so the user can sign in immediately.
 * Returns a per-row result list so the UI can show created/updated/skipped.
 */
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

  const rawUsers = Array.isArray((body as { users?: unknown })?.users) ? (body as { users: unknown[] }).users : null;
  if (!rawUsers || rawUsers.length === 0) return jsonError('users array is required', 400);
  if (rawUsers.length > MAX_BATCH) return jsonError(`Maximum ${MAX_BATCH} users per batch`, 400);

  // Scope applied to every row in this batch — set when onboarding from the
  // platform-admin panel with a tenant/app selected; omitted for tenant-local onboarding.
  const scopeTenantSlug = typeof (body as { tenantSlug?: unknown }).tenantSlug === 'string'
    ? (body as { tenantSlug: string }).tenantSlug : null;
  const scopeAppId = typeof (body as { appId?: unknown }).appId === 'string'
    ? (body as { appId: string }).appId : null;

  // The target tenant may have its own dedicated database — onboard users
  // there, not into the platform root DB. See tenant-db-resolver.ts.
  const dbUrl = await resolveDedicatedTenantDbUrl(scopeTenantSlug, scopeAppId);
  let db: DbClient;
  try {
    db = (dbUrl ? new PrismaClient({ datasources: { db: { url: dbUrl } } }) : createRawClient()) as unknown as DbClient;
    await db.$queryRawUnsafe('SELECT 1 as ok');
    // Self-healing — a tenant's dedicated DB may predate the tenant_slug/app_id
    // columns on user_accounts (only added by a Seed/Sync action).
    await addTenantColumnsIfMissing(db);
  } catch (err) {
    console.error('[admin/users/batch] createRawClient error:', err instanceof Error ? err.message : String(err));
    return jsonError('Database unavailable', 503);
  }

  const results: BatchUserResult[] = [];

  for (let i = 0; i < rawUsers.length; i++) {
    const raw = (rawUsers[i] ?? {}) as Record<string, unknown>;
    const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
    const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : null;
    const roleCode = typeof raw.roleCode === 'string' && raw.roleCode.trim() ? raw.roleCode.trim() : null;
    const pin = typeof raw.pin === 'string' && raw.pin.trim() ? raw.pin.trim() : null;
    const isActive = typeof raw.isActive === 'boolean' ? raw.isActive : true;

    if (!email || !EMAIL_RE.test(email)) {
      results.push({ row: i + 1, email: email || '(missing)', status: 'skipped', error: 'Invalid or missing email' });
      continue;
    }
    if (roleCode && !VALID_ROLE_CODES.has(roleCode)) {
      results.push({ row: i + 1, email, status: 'skipped', error: `Unknown role code: ${roleCode}` });
      continue;
    }
    if (pin && pin.length < 3) {
      results.push({ row: i + 1, email, status: 'skipped', error: 'PIN must be at least 3 characters' });
      continue;
    }

    const sub = email;

    try {
      const existing = await db.$queryRawUnsafe(
        `SELECT id FROM user_accounts WHERE sub = $1;`,
        sub,
      ) as { id: string }[];

      if (existing[0]?.id) {
        await db.$executeRawUnsafe(
          `UPDATE user_accounts
           SET email = COALESCE($1, email),
               name = COALESCE($2, name),
               role_code = COALESCE($3, role_code),
               is_active = $4,
               tenant_slug = COALESCE($5, tenant_slug),
               app_id = COALESCE($6, app_id),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $7;`,
          email,
          name,
          roleCode,
          isActive,
          scopeTenantSlug,
          scopeAppId,
          existing[0].id,
        );
        if (pin) await setSecret(`USER_PIN_${sub}`, pin);
        results.push({ row: i + 1, email, status: 'updated' });
      } else {
        await db.$executeRawUnsafe(
          `INSERT INTO user_accounts (id, sub, email, name, tier, role_code, is_active, tenant_slug, app_id, created_at, updated_at)
           VALUES (gen_random_uuid()::TEXT, $1, $2, $3, 'pin', $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
          sub,
          email,
          name,
          roleCode,
          isActive,
          scopeTenantSlug,
          scopeAppId,
        );
        if (pin) await setSecret(`USER_PIN_${sub}`, pin);
        results.push({ row: i + 1, email, status: 'created' });
      }
    } catch (err) {
      console.error('[admin/users/batch] row', i + 1, 'error:', err instanceof Error ? err.message : String(err));
      results.push({
        row: i + 1,
        email,
        status: 'skipped',
        error: err instanceof Error ? err.message.slice(0, 200) : 'Database error',
      });
    }
  }

  if (dbUrl) await (db as unknown as PrismaClient).$disconnect();

  const created = results.filter((r) => r.status === 'created').length;
  const updated = results.filter((r) => r.status === 'updated').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  if (scopeTenantSlug && (created > 0 || updated > 0)) {
    try {
      const platformDb = createRawClient();
      const orgRows = (await platformDb.$queryRawUnsafe(
        `SELECT organization_id FROM tenants WHERE slug = $1 LIMIT 1;`,
        scopeTenantSlug,
      )) as { organization_id: string | null }[];
      const orgId = orgRows[0]?.organization_id;
      if (orgId) await recalculateOrgRateCard(orgId, platformDb);
    } catch (rateErr) {
      console.warn(
        '[admin/users/batch] Rate card recalc failed:',
        rateErr instanceof Error ? rateErr.message : String(rateErr),
      );
    }
  }

  return jsonOk<BatchUsersResponse>({ results, created, updated, skipped });
}
