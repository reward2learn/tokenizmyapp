/**
 * GET /api/auth/vercel/callback
 *
 * Handles the OAuth callback from Vercel after user authorizes.
 * Validates state + nonce, exchanges authorization code for tokens,
 * and stores the tokens encrypted in the secrets table.
 *
 * Based on Vercel's official OAuth example:
 * https://vercel.com/docs/sign-in-with-vercel/getting-started#create-a-callback-api-route
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setSecret } from '@/lib/secrets';

const CLIENT_ID = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
interface TokenData {
  access_token: string;
  token_type: string;
  id_token: string;
  expires_in: number;
  scope: string;
  refresh_token: string;
}

function validate(value: string | null, storedValue: string | undefined): boolean {
  if (!value || !storedValue) return false;
  return value === storedValue;
}

function decodeNonce(idToken: string): string {
  try {
    const payload = idToken.split('.')[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    const nonceMatch = decodedPayload.match(/"nonce":"([^"]+)"/);
    return nonceMatch ? nonceMatch[1] : '';
  } catch {
    return '';
  }
}

async function exchangeCodeForToken(
  code: string,
  codeVerifier: string | undefined,
  requestOrigin: string,
): Promise<TokenData> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID as string,
    code,
    code_verifier: codeVerifier || '',
    redirect_uri: `${requestOrigin}/api/auth/vercel/callback`,
  });

  const response = await fetch('https://api.vercel.com/login/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to exchange code for token: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(new URL('/admin?vercel=error&reason=missing_code', request.url));
    }

    // Validate state from cookie
    const storedState = request.cookies.get('vercel_oauth_state')?.value;
    const storedNonce = request.cookies.get('vercel_oauth_nonce')?.value;
    const codeVerifier = request.cookies.get('vercel_oauth_code_verifier')?.value;

    if (!validate(state, storedState)) {
      return NextResponse.redirect(new URL('/admin?vercel=error&reason=state_mismatch', request.url));
    }

    if (!CLIENT_ID) {
      return NextResponse.redirect(new URL('/admin?vercel=error&reason=missing_client_id', request.url));
    }

    // Exchange code for tokens (uses request.nextUrl.origin for dynamic redirect_uri)
    const origin = request.nextUrl.origin;
    const tokenData = await exchangeCodeForToken(code, codeVerifier, origin);

    // Validate nonce from id_token
    const decodedNonce = decodeNonce(tokenData.id_token);
    if (!validate(decodedNonce, storedNonce)) {
      return NextResponse.redirect(new URL('/admin?vercel=error&reason=nonce_mismatch', request.url));
    }

    // Store tokens encrypted in secrets table
    const tokenPayload = JSON.stringify({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      scope: tokenData.scope || '',
    });
    await setSecret('VERCEL_OAUTH', tokenPayload);

    // Clear OAuth cookies
    const response = NextResponse.redirect(new URL('/admin?vercel=connected', request.url));
    response.cookies.set('vercel_oauth_state', '', { maxAge: 0, path: '/' });
    response.cookies.set('vercel_oauth_nonce', '', { maxAge: 0, path: '/' });
    response.cookies.set('vercel_oauth_code_verifier', '', { maxAge: 0, path: '/' });

    return response;
  } catch (err) {
    console.error('[vercel-oauth] Callback error:', err);
    const msg = err instanceof Error ? err.message.slice(0, 200) : 'unknown';
    return NextResponse.redirect(
      new URL(`/admin?vercel=error&reason=${encodeURIComponent(msg)}`, request.url),
    );
  }
}
