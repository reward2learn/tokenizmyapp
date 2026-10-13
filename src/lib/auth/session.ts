import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  verifySession,
  type AuthTier,
  type SessionClaims,
} from '@/lib/auth/jwt';
import { getTenantAppUrl, isTenantDomain } from '@shared/lib/config/tenant';

function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

export function buildSessionCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isProduction() ? 'Secure' : '',
    `Max-Age=${SESSION_MAX_AGE}`,
  ].filter(Boolean).join('; ');
}

export function buildClearSessionCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isProduction() ? 'Secure' : '',
    'Max-Age=0',
  ].filter(Boolean).join('; ');
}

export function setSessionCookie(response: NextResponse, token: string): void {
  // Prefer the cookies API so Next attaches Set-Cookie on redirects reliably
  // (header append alone was dropped after Google callback in local proxy).
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    maxAge: 0,
  });
}

function parseCookieHeader(raw: string): Record<string, string> {
  return Object.fromEntries(
    raw.split(';').map((part) => {
      const [k, ...v] = part.trim().split('=');
      return [k, v.join('=')];
    }).filter(([k]) => k),
  );
}

export async function getSessionFromRequest(request: Request): Promise<SessionClaims | null> {
  // Fast path: headers injected by middleware (already validated)
  if (request.headers.get('X-Session-Verified') === '1') {
    return {
      sub: request.headers.get('X-Session-Sub')!,
      tier: request.headers.get('X-Session-Tier') as AuthTier,
      email: request.headers.get('X-Session-Email') ?? undefined,
      name: request.headers.get('X-Session-Name') ?? undefined,
      roleCode: request.headers.get('X-Session-RoleCode') ?? undefined,
      platformAdmin: request.headers.get('X-Session-PlatformAdmin') === '1',
      groups: JSON.parse(request.headers.get('X-Session-Groups') ?? '[]'),
      permissions: JSON.parse(request.headers.get('X-Session-Permissions') ?? '[]'),
      walletAddress: request.headers.get('X-Session-WalletAddress') ?? undefined,
      walletChainId: request.headers.get('X-Session-WalletChainId')
        ? Number.parseInt(request.headers.get('X-Session-WalletChainId')!, 10)
        : undefined,
    };
  }

  // Slow path: parse cookie and verify JWT (original behavior)
  const raw = request.headers.get('cookie') ?? '';
  const token = parseCookieHeader(raw)[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

/** Server component / route helper using next/headers cookies(). */
export async function getSession(): Promise<SessionClaims | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Detect whether we are running in a local development environment. */
function isLocalDev(): boolean {
  // Vercel sets VERCEL_ENV on both deployments and `vercel dev`.
  // When it's unset we're running a plain Next.js dev server (bun run dev, npm run dev).
  return !process.env.VERCEL_ENV;
}

function resolveCanonicalAppUrl(): string {
  // In local dev without Vercel, default to localhost:3000
  if (isLocalDev()) return 'http://localhost:3000';

  // Delegate to tenant config for production/staging URL resolution
  return getTenantAppUrl();
}

export function getOrigin(request: Request): string {
  // Determine the origin from the request's Host header.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const proto = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  if (host) {
    const hostname = host.split(',')[0].trim();
    const origin = `${proto}://${hostname}`;
    // On production Vercel domains, use the canonical tenant URL for consistency
    if (isTenantDomain(hostname)) {
      return resolveCanonicalAppUrl();
    }
    return origin;
  }
  // Fallback when no request host is available
  return resolveCanonicalAppUrl();
}
