/**
 * Google OAuth redirect URI — GET /api/auth/callback/google
 *
 * Registered in Google Cloud Console. Implemented as a real App Router route
 * (not a middleware rewrite) so the session Set-Cookie on the post-consent
 * redirect is not dropped.
 */
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/api/auth';
  url.searchParams.set('action', 'google-callback');
  const { GET: authGet } = await import('../../route');
  return authGet(
    new Request(url.toString(), {
      method: 'GET',
      headers: request.headers,
    }),
  );
}
