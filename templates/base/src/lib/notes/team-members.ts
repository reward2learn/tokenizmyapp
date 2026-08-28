import type { DbClient } from '@/lib/db';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import type { NoteTeamMember } from '@/lib/notes/types';

type UserRow = {
  sub: string;
  name: string | null;
  email: string | null;
};

/**
 * Active user accounts in this tenant/app scope — used for note sharing pickers.
 * Excludes the current viewer.
 */
export async function listNoteTeamMembers(
  db: DbClient,
  viewerSub: string,
): Promise<NoteTeamMember[]> {
  const tenantSlug = getTenantConfig().slug;
  const appId = getCurrentAppId();

  try {
    const rows = await db.$queryRawUnsafe<UserRow[]>(
      `SELECT sub, name, email
       FROM user_accounts
       WHERE is_active = TRUE
         AND sub <> $1
         AND tenant_slug = $2
         AND ($3 = '' OR app_id = $3 OR app_id IS NULL)
       ORDER BY COALESCE(name, email, sub) ASC
       LIMIT 200;`,
      viewerSub,
      tenantSlug,
      appId,
    );
    return (rows ?? []).map((row) => ({
      sub: row.sub,
      name: row.name,
      email: row.email,
    }));
  } catch {
    // Legacy DBs may lack tenant columns — fall back to all active accounts.
    try {
      const rows = await db.$queryRawUnsafe<UserRow[]>(
        `SELECT sub, name, email
         FROM user_accounts
         WHERE is_active = TRUE AND sub <> $1
         ORDER BY COALESCE(name, email, sub) ASC
         LIMIT 200;`,
        viewerSub,
      );
      return (rows ?? []).map((row) => ({
        sub: row.sub,
        name: row.name,
        email: row.email,
      }));
    } catch {
      return [];
    }
  }
}

export function teamMemberLabel(member: NoteTeamMember): string {
  return member.name?.trim() || member.email?.trim() || member.sub;
}
