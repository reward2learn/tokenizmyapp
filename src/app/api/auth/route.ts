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
import { PERSONS, resolvePerson } from '@/domain/security/persons';
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
import { resolveGroupCodesForSub, resolveCapabilitiesForSub, upsertUserAccount } from '@/domain/security/security-service';
import { legacyError, jsonError } from '@/lib/api/response';

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
  const redirectUri = `${origin}/api/auth?action=google-callback`;

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
        redirect_uri: `${origin}/api/auth?action=google-callback`,
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

    const matchedRole = resolveRoleForEmail(user.email);
    // DB fallback: roles.email seeded for platform-admin (reward2learn@gmail.com).
    let dbPlatformAdmin = false;
    let dbRoleCode = matchedRole?.code;
    if (user.email) {
      try {
        const db = createBaseClient();
        const rows = await db.$queryRawUnsafe(
          `SELECT code, is_platform_admin FROM roles
           WHERE lower(email) = lower($1)
           LIMIT 1;`,
          user.email,
        ) as Array<{ code: string; is_platform_admin: boolean }>;
        if (rows[0]) {
          dbRoleCode = dbRoleCode || rows[0].code;
          dbPlatformAdmin = Boolean(rows[0].is_platform_admin);
        }
      } catch (roleLookupErr) {
        console.warn('[auth/google-callback] roles email lookup failed:', roleLookupErr);
      }
    }
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

function handleLogout(request: Request): NextResponse {
  const origin = getOrigin(request);
  const response = NextResponse.redirect(new URL('/dashboard', origin));
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
    // Resolve the person identity by name (e.g. "Ama") or fall back to role (sub).
    let sub: string;
    let person: ReturnType<typeof resolvePerson>;
    if (name) {
      person = PERSONS.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (!person) {
        return NextResponse.json({ ok: false, error: 'Unknown user' }, { status: 400 });
      }
      sub = person.sub;
    } else if (role) {
      sub = role.toLowerCase();
      person = resolvePerson(sub);
    } else {
      return NextResponse.json({ ok: false, error: 'name or role is required' }, { status: 400 });
    }

    const isPlatformAdmin = person?.isPlatformAdmin ?? sub === 'admin';

    // PIN key: USER_PIN_<sub> for individuals, ADMIN_PIN for platform admin.
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

    const roleCode = person?.roleCode ?? null;
    // Resolve groups/permissions (best-effort — works without DB when env PIN is used)
    let groups: string[] = [];
    let permissions: string[] = [];
    try {
      const resolved = await resolveSessionGroups({
        sub,
        name: person?.name ?? sub,
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
      name: person?.name ?? sub,
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
 * Public endpoint that returns the list of persons who have a PIN configured,
 * so the sign-in dropdown only shows users who can actually authenticate.
 * Also surfaces the most recently signed-in PIN user (from Neon last_seen_at)
 * so the client can pre-select without localStorage.
 */
async function handleListPinUsers(): Promise<NextResponse> {
  // Best-effort: read last_seen_at from Neon for PIN preference.
  let lastSeenBySub = new Map<string, Date>();
  try {
    if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
      const db = createBaseClient();
      await ensureSecurityTables(db);
      const rows = await db.$queryRawUnsafe<{ sub: string; last_seen_at: Date | null }[]>(
        `SELECT sub, last_seen_at FROM user_accounts WHERE last_seen_at IS NOT NULL;`,
      );
      for (const row of rows ?? []) {
        if (row.last_seen_at) lastSeenBySub.set(row.sub, new Date(row.last_seen_at));
      }
    }
  } catch (err) {
    console.error('[auth/list-pin-users] last_seen lookup failed:', err instanceof Error ? err.message : err);
  }

  const results = await Promise.all(
    PERSONS.map(async (p) => {
      const key = p.isPlatformAdmin ? 'ADMIN_PIN' : `USER_PIN_${p.sub}`;
      const hasPin = (await getSecretPlaintext(key)) != null;
      return {
        name: p.name,
        sub: p.sub,
        role: p.roleCode ?? p.sub,
        pinConfigured: hasPin,
        hasPin,
        lastSeenAt: lastSeenBySub.get(p.sub)?.toISOString() ?? null,
      };
    }),
  );

  // Prefer the PIN user with the most recent Neon last_seen_at.
  let lastUsedSub: string | null = null;
  let latest = 0;
  for (const u of results) {
    if (!u.lastSeenAt) continue;
    const ts = Date.parse(u.lastSeenAt);
    if (ts > latest) {
      latest = ts;
      lastUsedSub = u.sub;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      users: results,
      lastUsedSub,
      lastUsedName: lastUsedSub
        ? (results.find((u) => u.sub === lastUsedSub)?.name ?? null)
        : null,
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
