/**
 * User profile — custom avatar, display name and other user-managed settings.
 *
 * GET  /api/user/profile
 *   Returns the current user profile, keyed on their email.
 *
 * PATCH /api/user/profile
 *   Body: { avatarUrl?, displayName? }
 *   Updates the user profile. Omitted fields are left unchanged.
 *
 * Auth: requireSession (any tier).
 */
import { randomUUID } from 'crypto';
import { createRawClient } from '@/lib/db';
import { requireSession } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface ProfileRow {
  avatar_url: string | null;
  display_name: string | null;
}

async function readProfile(db: ReturnType<typeof createRawClient>, userEmail: string) {
  const rows = (await db.$queryRawUnsafe(
    `SELECT avatar_url, display_name FROM user_profiles WHERE user_email = $1;`,
    userEmail,
  )) as ProfileRow[];

  return rows[0] ?? null;
}

async function writeProfile(
  db: ReturnType<typeof createRawClient>,
  userEmail: string,
  avatarUrl: string | null,
  displayName: string | null,
) {
  const result = await db.$executeRawUnsafe(
    `UPDATE user_profiles
     SET avatar_url = $1, display_name = $2, updated_at = CURRENT_TIMESTAMP
     WHERE user_email = $3;`,
    avatarUrl,
    displayName,
    userEmail,
  );

  if (result === 0) {
    await db.$executeRawUnsafe(
      `INSERT INTO user_profiles (id, user_email, avatar_url, display_name, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_email) DO UPDATE
       SET avatar_url = EXCLUDED.avatar_url,
           display_name = EXCLUDED.display_name,
           updated_at = CURRENT_TIMESTAMP;`,
      randomUUID(),
      userEmail,
      avatarUrl,
      displayName,
    );
  }
}

export async function GET(request: Request) {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const db = createRawClient();
  const userEmail = guard.session.email;

  if (!userEmail) return jsonError('No email in session', 401);

  try {
    const row = await readProfile(db, userEmail);
    return jsonOk({
      avatarUrl: row?.avatar_url ?? null,
      displayName: row?.display_name ?? null,
    });
  } catch (err) {
    return jsonError('Failed to read profile: ' + (err as Error).message, 500);
  }
}

export async function PATCH(request: Request) {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const db = createRawClient();
  const userEmail = guard.session.email;

  if (!userEmail) return jsonError('No email in session', 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const hasAvatar = Object.prototype.hasOwnProperty.call(body, 'avatarUrl');
  const hasDisplayName = Object.prototype.hasOwnProperty.call(body, 'displayName');
  if (!hasAvatar && !hasDisplayName) {
    return jsonError('No fields to update', 400);
  }

  if (hasAvatar && typeof body.avatarUrl !== 'string') {
    return jsonError('avatarUrl must be a string', 400);
  }

  if (hasDisplayName && typeof body.displayName !== 'string') {
    return jsonError('displayName must be a string', 400);
  }

  const avatarUrl = hasAvatar ? (body.avatarUrl as string) : undefined;
  const displayName = hasDisplayName ? (body.displayName as string).trim() : undefined;

  if (avatarUrl !== undefined && avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
    return jsonError('avatarUrl must be a URL or data URI', 400);
  }

  if (displayName !== undefined && displayName === '') {
    return jsonError('displayName cannot be empty', 400);
  }

  if (displayName !== undefined && displayName.length > 100) {
    return jsonError('displayName must be 100 characters or fewer', 400);
  }

  try {
    const existing = await readProfile(db, userEmail);
    const nextAvatarUrl =
      avatarUrl !== undefined ? avatarUrl || null : (existing?.avatar_url ?? null);
    const nextDisplayName =
      displayName !== undefined ? displayName : (existing?.display_name ?? null);

    await writeProfile(db, userEmail, nextAvatarUrl, nextDisplayName);

    return jsonOk({
      message: 'Profile updated',
      avatarUrl: nextAvatarUrl,
      displayName: nextDisplayName,
    });
  } catch (err) {
    return jsonError('Failed to update profile: ' + (err as Error).message, 500);
  }
}
