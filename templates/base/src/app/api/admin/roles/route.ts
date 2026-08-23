import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getSecretPlaintext, setSecret } from '@/lib/secrets';

export const maxDuration = 30;

/** PIN secret key for a role — keyed by role code (USER_PIN_<code>). */
function pinKeyForRole(role: { code: string; isPlatformAdmin: boolean }): string {
  if (role.isPlatformAdmin) return 'ADMIN_PIN';
  const normalized = role.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `USER_PIN_${normalized}`;
}

export interface RoleConfigView {
  code: string;
  name: string;
  isPlatformAdmin: boolean;
  email: string | null;
  pinConfigured: boolean;
}

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  // Platform-admin only for role management.
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  } catch {
    return jsonError('Database unavailable', 503);
  }

  const roles = await db.role.findMany({ orderBy: { code: 'asc' } });
  const views: RoleConfigView[] = [];
  for (const role of roles) {
    const pinKey = pinKeyForRole(role);
    const pinConfigured = (await getSecretPlaintext(pinKey)) != null;
    views.push({
      code: role.code,
      name: role.name,
      isPlatformAdmin: role.isPlatformAdmin,
      email: role.email,
      pinConfigured,
    });
  }
  return jsonOk({ roles: views });
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  } catch {
    return jsonError('Database unavailable', 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { code, pin } = (body ?? {}) as { code?: string; pin?: string };
  if (!code || typeof code !== 'string') {
    return jsonError('code is required', 400);
  }
  if (!pin || typeof pin !== 'string' || pin.trim().length < 3) {
    return jsonError('pin must be at least 3 characters', 400);
  }

  // Resolve the role record to derive the correct PIN secret key (platform
  // admins share ADMIN_PIN; others use USER_PIN_<roleCode>).
  let role;
  try {
    role = await db.role.findUnique({ where: { code } });
  } catch {
    role = null;
  }
  if (!role) {
    return jsonError(`Unknown role code: ${code}`, 400);
  }
  const key = pinKeyForRole(role);

  try {
    await setSecret(key, pin.trim());
    return jsonOk({ code, configured: true });
  } catch {
    return jsonError('Failed to store PIN', 500);
  }
}
