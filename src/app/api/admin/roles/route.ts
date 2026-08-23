import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getSecretPlaintext, setSecret } from '@/lib/secrets';

export const maxDuration = 30;

/**
 * PIN secret key for a role — keyed by role code (USER_PIN_<code>).
 * Platform admins share ADMIN_PIN.
 */
function pinKeyForRole(role: { code: string; isPlatformAdmin: boolean }): string {
  if (role.isPlatformAdmin) return 'ADMIN_PIN';
  const normalized = role.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `USER_PIN_${normalized}`;
}

export interface RoleConfigView {
  code: string;
  name: string;
  isPlatformAdmin: boolean;
  pinConfigured: boolean;
  tenantSlug: string | null;
  appId: string | null;
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

  // Cross-tenant browsing is a platform-admin-only capability (already gated
  // above); tenantSlug/appId are ignored for any other caller.
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenantSlug');
  const appId = searchParams.get('appId');
  const where: { tenantSlug?: string; appId?: string } = {};
  if (tenantSlug) where.tenantSlug = tenantSlug;
  if (appId) where.appId = appId;

  const roles = await db.role.findMany({ where, orderBy: { code: 'asc' } });
  const views: RoleConfigView[] = [];
  for (const role of roles) {
    const pinKey = pinKeyForRole(role);
    const pinConfigured = (await getSecretPlaintext(pinKey)) != null;
    views.push({
      code: role.code,
      name: role.name,
      isPlatformAdmin: role.isPlatformAdmin,
      pinConfigured,
      tenantSlug: role.tenantSlug ?? null,
      appId: role.appId ?? null,
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
  // admins share ADMIN_PIN; others use ROLE_PIN_<CODE>). This avoids the
  // "Unknown role code" 400 for platform-admin roles like "Graham".
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


// ── PUT: Create or update a functional role ──────────────

export async function PUT(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError("Platform admin only", 403);
  }

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  } catch {
    return jsonError("Database unavailable", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { code, name, isPlatformAdmin, tenantSlug, appId } = (body ?? {}) as {
    code?: string;
    name?: string;
    isPlatformAdmin?: boolean;
    tenantSlug?: string;
    appId?: string;
  };

  if (!code || typeof code !== "string" || code.trim().length < 2) {
    return jsonError("code is required (min 2 characters)", 400);
  }
  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return jsonError("name is required", 400);
  }

  const normalizedCode = code.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  try {
    const existing = await db.role.findUnique({ where: { code: normalizedCode } });

    // Roles are just display names + isPlatformAdmin flag (no email/person data).
    // Person/sub mapping lives in user_accounts (see security-service.ts).
    const roleData: { name: string; isPlatformAdmin: boolean; tenantSlug?: string; appId?: string } = {
      name: name.trim(),
      isPlatformAdmin: isPlatformAdmin ?? false,
      ...(tenantSlug !== undefined ? { tenantSlug } : {}),
      ...(appId !== undefined ? { appId } : {}),
    };

    if (existing) {
      await db.role.update({ where: { code: normalizedCode }, data: roleData });
      return jsonOk({ code: normalizedCode, created: false, updated: true });
    } else {
      await db.role.create({
        data: {
          code: normalizedCode,
          ...roleData,
        },
      });
      return jsonOk({ code: normalizedCode, created: true });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save role";
    console.error("[roles:PUT]", msg);
    return jsonError(msg, 500);
  }
}

// ── DELETE: Remove a functional role ─────────────────────

export async function DELETE(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError("Platform admin only", 403);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || typeof code !== "string") {
    return jsonError("code query parameter is required", 400);
  }

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  } catch {
    return jsonError("Database unavailable", 503);
  }

  try {
    const existing = await db.role.findUnique({ where: { code } });
    if (!existing) {
      return jsonError("Role not found", 404);
    }

    // Check if any user accounts reference this role
    const usersWithRole = await db.userAccount.findMany({
      where: { roleCode: code },
      select: { id: true, email: true },
    });

    await db.role.delete({ where: { code } });

    return jsonOk({
      deleted: true,
      code,
      unlinkedUsers: usersWithRole.length,
      note: usersWithRole.length > 0
        ? "Role removed. " + usersWithRole.length + " user account(s) had this role assigned and will need re-assignment."
        : "Role removed successfully.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete role";
    console.error("[roles:DELETE]", msg);
    return jsonError(msg, 500);
  }
}
