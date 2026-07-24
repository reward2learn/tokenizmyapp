/**
 * GET /api/auth/vercel/authorize
 *
 * Redirects the user to Vercel's OAuth authorization endpoint.
 * Stores PKCE challenge + state in cookies for callback validation.
 *
 * Based on Vercel's official OAuth example:
 * https://vercel.com/docs/sign-in-with-vercel/getting-started#create-an-authorize-api-route
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'node:crypto';

const CLIENT_ID = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;

function generateSecureString(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}

export async function GET(request: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: 'Vercel OAuth is not configured — missing NEXT_PUBLIC_VERCEL_APP_CLIENT_ID' },
      { status: 500 },
    );
  }

  // Generate PKCE values (code_verifier must be 43-128 chars)
  const state = generateSecureString(32);    // 64 chars
  const nonce = generateSecureString(32);     // 64 chars
  const codeVerifier = generateSecureString(43); // 86 chars (matches Vercel's example)
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Use the request origin for dynamic redirect_uri (same as callback)
  const redirectUri = `${request.nextUrl.origin}/api/auth/vercel/callback`;

  const response = NextResponse.redirect(
    `https://vercel.com/oauth/authorize?${new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      response_type: 'code',
      scope: 'openid email profile offline_access',
    })}`,
  );

  // Store state, nonce, code_verifier in cookies for callback validation
  response.cookies.set('vercel_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
  response.cookies.set('vercel_oauth_nonce', nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });
  response.cookies.set('vercel_oauth_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  return response;
}
