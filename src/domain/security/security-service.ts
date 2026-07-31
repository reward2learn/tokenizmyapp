import type { DbClient } from '@/lib/db';
import { expandCapabilities } from '@/domain/security/capabilities';
import { getSecretPlaintext } from '@/lib/secrets';

/**
 * Resolve the security-group codes a user belongs to, keyed by auth subject (sub).
 * Returns an empty array when the user has no group memberships or tables are missing.
 */
export async function resolveGroupCodesForSub(db: DbClient, sub: string): Promise<string[]> {
  if (!sub) return [];
  try {
    const rows = await db.$queryRawUnsafe<{ code: string }[]>(
      `SELECT sg.code
       FROM security_groups sg
       JOIN user_groups ug ON ug.group_id = sg.id
       JOIN user_accounts ua ON ua.id = ug.user_id
       WHERE ua.sub = $1;`,
      sub,
    );
    return (rows ?? []).map((r) => r.code);
  } catch {
    return [];
  }
}

/** Upsert a user account row from session identity; returns the persisted account id. */
export async function upsertUserAccount(
  db: DbClient,
  input: { sub: string; email?: string | null; name?: string | null; tier: string; roleCode?: string | null },
): Promise<{ id: string; isActive: boolean }> {
  // Step 1: Try INSERT with ON CONFLICT (sub) — handles existing user by sub
  let result: { id: string; is_active: boolean }[] | null = null;
  try {
    result = await db.$queryRawUnsafe<{ id: string; is_active: boolean }[]>(
      `INSERT INTO user_accounts (id, sub, email, name, tier, role_code, last_seen_at, updated_at)
       VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (sub) DO UPDATE
         SET email = COALESCE($2, user_accounts.email),
             name = COALESCE($3, user_accounts.name),
             tier = $4,
             role_code = COALESCE($5, user_accounts.role_code),
             last_seen_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
       RETURNING id, is_active;`,
      input.sub,
      input.email ?? null,
      input.name ?? null,
      input.tier,
      input.roleCode ?? null,
    );
  } catch (err) {
    // Step 2: If unique constraint on email (PG 23505), find existing by email and update
    const pgErr = err as { code?: string; message?: string };
    if (pgErr.code === '23505' && pgErr.message?.includes('email')) {
      // Find existing user by email
      const existing = await db.$queryRawUnsafe<{ id: string; is_active: boolean }[]>(
        `SELECT id, is_active FROM user_accounts WHERE email = $1 LIMIT 1;`,
        input.email ?? null,
      );
      if (existing && existing[0]) {
        // Update existing user's sub to match the new identity
        result = await db.$queryRawUnsafe<{ id: string; is_active: boolean }[]>(
          `UPDATE user_accounts
           SET sub = $1, name = COALESCE($2, name), tier = $3,
               role_code = COALESCE($4, role_code),
               last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = $5
           RETURNING id, is_active;`,
          input.sub, input.name ?? null, input.tier, input.roleCode ?? null, existing[0].id,
        );
      }
    }
    if (!result || !result[0]) throw err;
  }
  const row = result[0];
  if (!row) throw new Error('Failed to upsert user account');
  return { id: row.id, isActive: row.is_active };
}

/**
 * Resolve the effective capability set for a user, keyed by auth subject (sub).
 * Capabilities are the union of all the user's groups' permission codes, with
 * the `*` wildcard expanded to every known capability. Returns an empty array
 * when the user has no group memberships or tables are missing.
 */
export async function resolveCapabilitiesForSub(db: DbClient, sub: string): Promise<string[]> {
  if (!sub) return [];
  try {
    const rows = await db.$queryRawUnsafe<{ permissions: string[] | null }[]>(
      `SELECT sg.permissions
       FROM security_groups sg
       JOIN user_groups ug ON ug.group_id = sg.id
       JOIN user_accounts ua ON ua.id = ug.user_id
       WHERE ua.sub = $1;`,
      sub,
    );
    const merged = (rows ?? []).flatMap((r) => r.permissions ?? []);
    return Array.from(expandCapabilities(merged));
  } catch {
    return [];
  }
}

/**
 * One-time backfill: create user_account rows for the operational identities the
 * system already knows (PIN roles + platform admins) so the User Accounts list is
 * populated with prior users even before they re-sign-in. Idempotent on `sub`.
 */
export async function backfillKnownAccounts(
  db: DbClient,
  known: { sub: string; name: string; tier: string; roleCode?: string | null }[],
): Promise<void> {
  for (const k of known) {
    await db.$queryRawUnsafe(
      `INSERT INTO user_accounts (sub, name, tier, role_code, last_seen_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (sub) DO UPDATE
         SET name = COALESCE($2, user_accounts.name),
             tier = $3,
             role_code = COALESCE($4, user_accounts.role_code),
             updated_at = CURRENT_TIMESTAMP;`,
      k.sub,
      k.name,
      k.tier,
      k.roleCode ?? null,
    );
  }
}

/**
 * Replaces PERSONS-based PIN user listing for the auth flow.
 * - Queries user_accounts joined with roles for role_code, name, is_platform_admin, last_seen_at
 * - For each, checks if a PIN secret is configured (ADMIN_PIN or USER_PIN_${sub}) via getSecretPlaintext
 * - Returns enriched list compatible with listPinUsers API (includes lastSeenAt for pre-select)
 * - Error handling and backward compat for existing secrets/env PINs maintained.
 * - Called from handleListPinUsers in /api/auth/route.ts
 */
export type PinUser = {
  sub: string;
  name: string;
  role: string;
  pinConfigured: boolean;
  lastSeenAt: string | null;
};

export async function listConfiguredPinUsers(db: DbClient): Promise<PinUser[]> {
  try {
    const rows = await db.$queryRawUnsafe<{
      sub: string;
      name?: string | null;
      role_code?: string | null;
      last_seen_at?: Date | null;
      is_platform_admin?: boolean | null;
    }[]>(`
      SELECT 
        ua.sub,
        ua.name,
        ua.role_code,
        ua.last_seen_at,
        COALESCE(r.is_platform_admin, false) as is_platform_admin
      FROM user_accounts ua
      LEFT JOIN roles r ON r.code = ua.role_code
      WHERE ua.is_active = true
      ORDER BY COALESCE(ua.name, ua.sub) ASC;
    `);

    const results = await Promise.all(
      (rows ?? []).map(async (row): Promise<PinUser> => {
        const subLower = row.sub.toLowerCase();
        const isPlatformAdmin = row.is_platform_admin === true || subLower === 'admin';
        const key = isPlatformAdmin ? 'ADMIN_PIN' : `USER_PIN_${subLower}`;
        const hasPin = (await getSecretPlaintext(key)) != null;
        return {
          sub: row.sub,
          name: row.name ?? row.sub,
          role: row.role_code ?? row.sub,
          pinConfigured: hasPin,
          lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at).toISOString() : null,
        };
      }),
    );

    return results;
  } catch (err) {
    console.error(
      '[security/listConfiguredPinUsers] failed:',
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
