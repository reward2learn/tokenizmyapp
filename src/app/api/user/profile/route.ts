/**
 * User profile — custom avatar and other user-managed settings.
 *
 * GET  /api/user/profile
 *   Returns the current user profile, keyed on their email.
 *
 * PATCH /api/user/profile
 *   Body: { avatarUrl? }
 *   Updates the user profile.
 *
 * Auth: requireSession (any tier).
 */
import { randomUUID } from 'crypto';
import { createRawClient } from '@/lib/db';
import { requireSession } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const db = createRawClient();
  const userEmail = guard.session.email;

  if (!userEmail) return jsonError('No email in session', 401);

  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT avatar_url FROM user_profiles WHERE user_email = $1;`,
      userEmail,
    )) as Record<string, unknown>[];

    const avatarUrl = (rows[0]?.avatar_url as string) ?? null;
    return jsonOk({ avatarUrl });
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

  try {
    const body = await request.json();
    const { avatarUrl } = body;

    if (typeof avatarUrl !== 'string') {
      return jsonError('avatarUrl must be a string', 400);
    }

    // Validate URL or base64 format
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
      return jsonError('avatarUrl must be a URL or data URI', 400);
    }

    // Upsert: try update, then insert if not found
    const result = await db.$executeRawUnsafe(
      `UPDATE user_profiles SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_email = $2;`,
      avatarUrl || null,
      userEmail,
    );

    if (result === 0) {
      // Row did not exist, insert it
      await db.$executeRawUnsafe(
        `INSERT INTO user_profiles (id, user_email, avatar_url, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (user_email) DO UPDATE SET avatar_url = $3, updated_at = CURRENT_TIMESTAMP;`,
        randomUUID(),
        userEmail,
        avatarUrl || null,
      );
    }

    return jsonOk({ message: 'Profile updated' });
  } catch (err) {
    return jsonError('Failed to update profile: ' + (err as Error).message, 500);
  }
}
