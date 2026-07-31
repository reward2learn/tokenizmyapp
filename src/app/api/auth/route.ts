/**
 * Auth API — JWT session cookie (redruby.session).
 * Legacy reference: website/api/auth.js (read-only)
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleStoreKey } from '@/lib/auth/store-key';
import { handleStoreGoogleOAuth } from '@/lib/auth/store-google-oauth';
import {
  buildGoogleAuthUrl,
  getGoogleOAuthCredentials,
  getGoogleOAuthPublicConfig,
} from '@/lib/auth/google-oauth';
import { sessionIsPlatformAdmin, signSession } from '@/lib/auth/jwt';
import { resolveRoleForEmail } from '@/domain/seed/seed-runner';
import {
  clearSessionCookie,
  getOrigin,
  getSessionFromRequest,
  setSessionCookie,
} from '@/lib/auth/session';
import { requireGoogle } from '@/lib/auth/guards';
import { getSecretPlaintext } from '@/lib/secrets';
import { createClient, createBaseClient } from '@/lib/db';
import { PdfExportService } from '@/domain/pdf/pdf-export-service';
import { ensureJobQueueTable, ensureSecurityTables } from '@/lib/db-migrate';
import {
  resolveGroupCodesForSub,
  resolveCapabilitiesForSub,
  upsertUserAccount,
  listConfiguredPinUsers,
  type PinUser,
} from '@/domain/security/security-service';
import { legacyError, jsonError } from '@/lib/api/response';
import { getDefaultRoutePath } from '@/lib/navigation/default-route';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

let jobQueueEnsured: Promise<boolean> | null = null;
function ensureJobQueueOnce(): Promise<boolean> {
  if (!jobQueueEnsured) {
    jobQueueEnsured = ensureJobQueueTable(createClient()).catch((err) => {
      jobQueueEnsured = null;
      throw err;
    });
  }
  return jobQueueEnsured;
}

const verifyPinSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  pin: z.string().min(1),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? '';

  switch (action) {
    case 'google-config':
      return handleGoogleConfig();
    case 'google':
      return handleGoogleRedirect(request, url);
    case 'google-callback':
      return handleGoogleCallback(request, url);
    case 'me':
      return handleMe(request);
    case 'logout':
      return handleLogout(request);
    case 'list-pin-users':
      return handleListPinUsers();
    case 'pdf':
      return handlePdf(request, url);
    default:
      return jsonError('Unknown action — use google|google-callback|google-config|me|logout|pdf|verify-pin|store-key|store-google-oauth|list-pin-users', 400);
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? '';

  if (action === 'store-key') {
    const result = await handleStoreKey(request);
    const status = result.success ? 200 : result.error?.includes('Unauthorized') ? 401 : 400;
    return NextResponse.json(result, { status });
  }

  if (action === 'store-google-oauth') {
    const result = await handleStoreGoogleOAuth(request);
    const status = result.success ? 200 : result.error?.includes('Unauthorized') ? 401 : 400;
    return NextResponse.json(result, { status });
  }

  if (action === 'verify-pin') {
    return handleVerifyPin(request);
  }

  return jsonError('Unknown action', 400);
}

async function handleGoogleConfig(): Promise<NextResponse> {
  const config = await getGoogleOAuthPublicConfig();
  if (!config) {
    return jsonError('Google OAuth not configured', 503);
  }
  return NextResponse.json({
    success: true,
    data: {
      clientId: config.clientId,
      projectId: config.projectId,
      authUri: config.authUri,
    },
  });
}

async function handleGoogleRedirect(request: Request, url: URL): Promise<NextResponse> {
  const config = await getGoogleOAuthCredentials();
  if (!config) {
    console.error('[auth] Google OAuth not configured');
    return NextResponse.redirect(new URL('/ops-admin?auth=error', getOrigin(request)));
  }

  const redirectTo = url.searchParams.get('redirect') || '/';
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const state = `${redirectTo}::${nonce}`;
  const origin = getOrigin(request);
  const redirectUri = `${origin}/api/auth/callback/google`;

  const authUrl = buildGoogleAuthUrl(config, { redirectUri, state });
  return NextResponse.redirect(authUrl);
}

async function handleGoogleCallback(request: Request, url: URL): Promise<NextResponse> {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  const oauthError = url.searchParams.get('error');

  let redirectTo = '/';
  if (state.includes('::')) {
    redirectTo = state.split('::')[0] || '/';
  }

  const origin = getOrigin(request);

  if (oauthError || !code) {
    return NextResponse.redirect(new URL(`${redirectTo}?auth=error`, origin));
  }

  const config = await getGoogleOAuthCredentials();
  if (!config) {
    console.error('[auth/google-callback] OAuth not configured');
    return NextResponse.redirect(new URL(`${redirectTo}?auth=error`, origin));
  }

  try {
    const tokenResp = await fetch(config.tokenUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: `${origin}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResp.ok) {
      console.error('[auth/google-callback] Token exchange failed:', tokenResp.status);
      return NextResponse.redirect(new URL(`${redirectTo}?auth=error`, origin));
    }

    const tokens = await tokenResp.json() as { access_token?: string };
    const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResp.ok) {
      console.error('[auth/google-callback] Userinfo failed:', userResp.status);
      return NextResponse.redirect(new URL(`${redirectTo}?auth=error`, origin));
    }

    const user = await userResp.json() as {
      id: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    const db = createBaseClient();
    const matchedRole = await resolveRoleForEmail(user.email, db);
    const dbPlatformAdmin = matchedRole?.isPlatformAdmin ?? false;
    const dbRoleCode = matchedRole?.code;
    const { groups, permissions } = await resolveSessionGroups({
      sub: user.id,
      email: user.email,
      name: user.name,
      tier: 'google',
      roleCode: dbRoleCode,
    });
    const platformAdmin =
      (matchedRole?.isPlatformAdmin ?? false) ||
      dbPlatformAdmin ||
      groups.includes('platform-admin');
    const token = await signSession({
      sub: user.id,
      tier: 'google',
      email: user.email,
      name: user.name,
      picture: user.picture,
      roleCode: dbRoleCode,
      platformAdmin,
      groups,
      permissions,
    });

    const response = NextResponse.redirect(new URL(`${redirectTo}?auth=success`, origin));
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('[auth/google-callback] Error:', err instanceof Error ? err.message : err);
    return NextResponse.redirect(new URL(`${redirectTo}?auth=error`, origin));
  }
}

/**
 * Persist the signed-in identity as a UserAccount (idempotent) and resolve the
 * security-group codes to embed in the session token. Best-effort: failures here
 * must not block sign-in, so errors are swallowed and groups default to [].
 */
async function resolveSessionGroups(input: {
  sub: string;
  email?: string | null;
  name?: string | null;
  tier: string;
  roleCode?: string | null;
}): Promise<{ groups: string[]; permissions: string[] }> {
  const db = createBaseClient();
  // Ensure tables exist — but don't let a failure here block account creation.
  try {
    await ensureSecurityTables(db);
  } catch (err) {
    console.error('[auth/resolveSessionGroups] ensureSecurityTables failed:', err instanceof Error ? err.stack : err);
  }
  // Always attempt to upsert the user account.
  try {
    const account = await upsertUserAccount(db, input);
    console.log('[auth/resolveSessionGroups] upsertUserAccount succeeded:', JSON.stringify({ id: account.id, sub: input.sub, name: input.name, tier: input.tier }));
  } catch (err) {
    console.error('[auth/resolveSessionGroups] upsertUserAccount failed:', err instanceof Error ? err.stack : err);
  }
  // Resolve groups/permissions (best-effort).
  let groups: string[] = [];
  let permissions: string[] = [];
  try {
    groups = await resolveGroupCodesForSub(db, input.sub);
    permissions = await resolveCapabilitiesForSub(db, input.sub);
  } catch (err) {
    console.error('[auth/resolveSessionGroups] group/permission resolution failed:', err instanceof Error ? err.stack : err);
  }
  return { groups, permissions };
}

async function handleMe(request: Request): Promise<NextResponse> {
  try {
    const session = await getSessionFromRequest(request);
    return NextResponse.json({
      success: true,
      data: {
        user: session
          ? {
              id: session.sub,
              email: session.email,
              name: session.name,
              picture: session.picture,
              authMethod: session.tier,
            }
          : null,
        tier: session?.tier ?? 'public',
        roleCode: session?.roleCode ?? null,
        platformAdmin: sessionIsPlatformAdmin(session),
        groups: session?.groups ?? [],
        permissions: session?.permissions ?? [],
      },
    });
  } catch {
    return NextResponse.json({ success: true, data: { user: null, tier: 'public' } });
  }
}

async function handleLogout(request: Request): Promise<NextResponse> {
  // Use the request host directly so logout always stays on the current domain.
  // Do NOT use getOrigin() — its canonical URL resolution (getTenantAppUrl) can
  // resolve to a different app when NEXT_PUBLIC_APP_URL is unset or wrong.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const proto = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const origin = host ? `${proto}://${host.split(',')[0].trim()}` : 'http://localhost:3000';
  // Land on the app's configured default route (e.g. Home '/') after sign-out
  // instead of a hardcoded /dashboard.
  const defaultPath = await getDefaultRoutePath();
  const response = NextResponse.redirect(new URL(defaultPath, origin));
  clearSessionCookie(response);
  return response;
}

async function handleVerifyPin(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = verifyPinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'name (or role) and pin are required' }, { status: 400 });
  }

  const { name, role, pin } = parsed.data;

  try {
    const db = createBaseClient();
    // Ensure security tables (user_accounts, roles, secrets) exist — best-effort.
    try {
      await ensureSecurityTables(db);
    } catch (ensureErr) {
      console.error('[auth/verify-pin] ensureSecurityTables failed (continuing):', ensureErr);
    }

    // Resolve user by name (or role/sub) from user_accounts joined with roles.
    // Full replacement for PERSONS.find() / resolvePerson().
    let sub: string;
    let displayName: string;
    let roleCode: string | null = null;
    let isPlatformAdmin = false;

    if (name) {
      const rows = await db.$queryRawUnsafe<{
        sub: string;
        name: string;
        role_code?: string | null;
        is_platform_admin?: boolean | null;
      }[]>(
        `SELECT 
          ua.sub,
          ua.name,
          ua.role_code,
          r.is_platform_admin
         FROM user_accounts ua
         LEFT JOIN roles r ON r.code = ua.role_code
         WHERE LOWER(TRIM(ua.name)) = LOWER(TRIM($1))
         LIMIT 1;`,
        name,
      );

      if (!rows?.[0]) {
        return NextResponse.json({ ok: false, error: 'Unknown user' }, { status: 400 });
      }
      const user = rows[0];
      sub = user.sub;
      displayName = user.name;
      roleCode = user.role_code ?? null;
      isPlatformAdmin = user.is_platform_admin === true || sub.toLowerCase() === 'admin';
    } else if (role) {
      sub = role.toLowerCase();
      displayName = sub;
      const rows = await db.$queryRawUnsafe<{
        name?: string | null;
        role_code?: string | null;
        is_platform_admin?: boolean | null;
      }[]>(
        `SELECT 
          ua.name,
          ua.role_code,
          r.is_platform_admin
         FROM user_accounts ua
         LEFT JOIN roles r ON r.code = ua.role_code
         WHERE ua.sub = $1
         LIMIT 1;`,
        sub,
      );
      if (rows?.[0]) {
        const user = rows[0];
        displayName = user.name ?? sub;
        roleCode = user.role_code ?? null;
        isPlatformAdmin = user.is_platform_admin === true || sub === 'admin';
      } else {
        isPlatformAdmin = sub === 'admin';
      }
    } else {
      return NextResponse.json({ ok: false, error: 'name or role is required' }, { status: 400 });
    }

    // PIN key: USER_PIN_<sub> for individuals, ADMIN_PIN for platform admin.
    // Backward compatibility for existing secrets table entries preserved.
    const secretKey = isPlatformAdmin ? 'ADMIN_PIN' : `USER_PIN_${sub}`;
    // Try DB first, fall back to env var (which works without POSTGRES_URL)
    let stored: string | null = null;
    try {
      stored = await getSecretPlaintext(secretKey);
    } catch {
      // DB unavailable — will try env fallback below
    }
    if (!stored) {
      const envKey = isPlatformAdmin ? 'DEFAULT_ADMIN_PIN' : `DEFAULT_PIN_${sub}`;
      stored = process.env[envKey] ?? null;
    }
    if (!stored) {
      return NextResponse.json({ ok: false, error: 'PIN not configured for this user' });
    }
    if (pin.trim() !== stored.trim()) {
      return NextResponse.json({ ok: false, error: 'Incorrect PIN' });
    }

    // Resolve groups/permissions (best-effort — works without DB when env PIN is used)
    let groups: string[] = [];
    let permissions: string[] = [];
    try {
      const resolved = await resolveSessionGroups({
        sub,
        name: displayName,
        tier: 'pin',
        roleCode,
      });
      groups = resolved.groups;
      permissions = resolved.permissions;
    } catch {
      // DB unavailable — use minimal claims; user can still sign in
    }
    const platformAdmin = isPlatformAdmin || groups.includes('platform-admin');
    const token = await signSession({
      sub,
      name: displayName,
      tier: 'pin',
      roleCode,
      platformAdmin,
      groups,
      permissions,
    });
    const response = NextResponse.json({ ok: true, success: true });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('[auth/verify-pin]', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

/**
 * Public endpoint that returns the list of users who have a PIN configured,
 * sourced from user_accounts + roles (replaces static PERSONS).
 * Also surfaces the most recently signed-in PIN user via last_seen_at
 * so the client can pre-select without localStorage.
 */
async function handleListPinUsers(): Promise<NextResponse> {
  let users: PinUser[] = [];
  try {
    if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
      const db = createBaseClient();
      await ensureSecurityTables(db);
      users = await listConfiguredPinUsers(db);
    }
  } catch (err) {
    console.error(
      '[auth/list-pin-users] failed:',
      err instanceof Error ? err.message : err,
    );
  }

  // Prefer the PIN user with the most recent last_seen_at.
  let lastUsedSub: string | null = null;
  let latest = 0;
  for (const u of users) {
    if (!u.lastSeenAt) continue;
    const ts = Date.parse(u.lastSeenAt);
    if (ts > latest) {
      latest = ts;
      lastUsedSub = u.sub;
    }
  }

  const lastUsedName: string | null = lastUsedSub
    ? (users.find((u) => u.sub === lastUsedSub)?.name ?? null)
    : null;

  return NextResponse.json({
    success: true,
    data: {
      users,
      lastUsedSub,
      lastUsedName,
    },
  });
}

async function handlePdf(request: Request, url: URL): Promise<NextResponse> {
  const guard = await requireGoogle(request);
  if (!guard.ok) return guard.response;

  try {
    const origin = getOrigin(request);
    const sessionCookie = request.headers.get('cookie') ?? '';
    const pagePath = url.searchParams.get('page') || '/';

    const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    const pdfService = new PdfExportService(db);
    try {
      await ensureJobQueueOnce();
    } catch {
      // Table ensure is best-effort; queueJob surfaces the real error if the table is missing.
    }
    const jobId = await pdfService.queueJob(guard.session.sub, {
      origin,
      sessionCookie,
      pagePath,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'PDF generation job submitted successfully.',
          jobId,
          statusCheckUrl: `${origin}/api/vjobs/status/${jobId}`,
        },
      },
      { status: 202, headers: { 'Retry-After': '60' } },
    );
  } catch (err) {
    console.error('[auth/pdf]', err);
    return legacyError('Internal Server Error while queuing the PDF job.', 500);
  }
}
