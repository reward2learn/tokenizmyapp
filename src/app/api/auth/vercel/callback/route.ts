/**
 * GET /api/auth/vercel/callback
 *
 * Handles the OAuth callback from Vercel after user authorizes.
 * Validates state, exchanges authorization code for tokens,
 * and stores the tokens encrypted in the secrets table.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setSecret } from '@/lib/secrets';

const CLIENT_ID = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.VERCEL_APP_CLIENT_SECRET;
const REDIRECT_URI = process.env.VERCEL_OAUTH_REDIRECT_URI ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'tokenizmyapp.vercel.app'}/api/auth/vercel/callback`;

const ADMIN_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/admin`
  : '/admin';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
  token_type: string;
  scope?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(new URL('/admin?vercel=error&reason=missing_code', request.url));
    }

    // Validate state from cookie
    const cookieStore = await cookies();
    const storedState = cookieStore.get('vercel_oauth_state')?.value;
    const storedNonce = cookieStore.get('vercel_oauth_nonce')?.value;
    const codeVerifier = cookieStore.get('vercel_oauth_code_verifier')?.value;

    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL('/admin?vercel=error&reason=state_mismatch', request.url));
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/admin?vercel=error&reason=missing_oauth_config', request.url),
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://api.vercel.com/login/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        code_verifier: codeVerifier || '',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[vercel-oauth] Token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(
        new URL(`/admin?vercel=error&reason=token_exchange_failed`, request.url),
      );
    }

    const tokens: TokenResponse = await tokenResponse.json();

    // Store tokens encrypted in secrets table
    const tokenPayload = JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      scope: tokens.scope || '',
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
    const url = new URL(request.url);
    return NextResponse.redirect(new URL('/admin?vercel=error&reason=internal', url));
  }
}
