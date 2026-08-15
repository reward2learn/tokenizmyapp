/**
 * Google OAuth Relay Callback — GET /api/auth/google-relay-callback
 *
 * The single registered redirect URI for ALL tenant apps (the shared Google
 * client can only be edited in the console, so this is the one URI that is
 * registered once and used forever).
 *
 * Flow:
 *   1. Tenant app redirects the user to Google with redirect_uri = this route
 *      and a relay-signed state: { appUrl, redirectTo, nonce, clientId, exp }.
 *   2. Google redirects here with ?code & ?state.
 *   3. This route verifies the state signature + expiry, validates the return
 *      host against the tenant registry (defense-in-depth), exchanges the code
 *      with the client the app started the flow with, fetches the Google
 *      profile, and issues a short-lived HMAC ticket.
 *   4. Browser is redirected to <appUrl>/api/auth?action=google-relay-finish&ticket=...
 *      where the tenant app mints its own session cookie (its own ENCRYPTION_KEY).
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import {
  RELAY_CALLBACK_PATH,
  verifyRelayState,
  signRelayTicket,
  getRelaySecret,
} from '@/lib/auth/google-relay';
import { getGoogleOAuthCredentialsForClient } from '@/lib/auth/google-oauth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface TenantRow {
  app_url: string | null;
  metadata: unknown;
}

/** Hosts allowed as relay return targets — the factory's own host plus every
 *  known tenant / suite-app URL from the control-plane DB. */
async function resolveAllowedHosts(): Promise<{ hosts: Set<string>; error?: string }> {
  const hosts = new Set<string>();
  try {
    const db = createClient();
    const rows = await db.$queryRawUnsafe<TenantRow[]>(
      'SELECT app_url, metadata FROM tenants',
    );
    for (const row of rows) {
      if (row.app_url) hosts.add(new URL(row.app_url).host);
      // Suite apps live in metadata.config.appPack.apps[].appUrl (JSON column
      // arrives as object; tolerate string form).
      const meta = row.metadata as Record<string, unknown> | string | null | undefined;
      let parsedMeta = meta;
      if (typeof meta === 'string') {
        try { parsedMeta = JSON.parse(meta); } catch { parsedMeta = null; }
      }
      const cfg = ((parsedMeta as Record<string, unknown>)?.config ?? {}) as Record<string, unknown>;
      const appPack = cfg.appPack as { apps?: Array<{ appUrl?: string | null }> } | null | undefined;
      for (const app of appPack?.apps ?? []) {
        if (app.appUrl) hosts.add(new URL(app.appUrl).host);
      }
    }
    return { hosts };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[relay] tenant registry lookup failed:', msg);
    return { hosts, error: msg };
  }
}

function errorPage(title: string, detail: string, homeUrl?: string): NextResponse {
  const home = homeUrl
    ? `<p><a href="${homeUrl}">Return to app</a></p>`
    : '';
  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:560px">
      <h2>${title}</h2><p>${detail}</p>${home}</body></html>`,
    { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  const oauthError = url.searchParams.get('error');

  const secret = getRelaySecret();
  if (!secret) {
    return errorPage('Relay not configured', 'GOOGLE_RELAY_SECRET is not set on the factory deployment.');
  }

  const payload = verifyRelayState(state, secret);
  if (!payload) {
    return errorPage('Invalid relay state', 'The sign-in state is missing, expired, or tampered with. Please start the sign-in again.');
  }

  const appUrl = payload.appUrl;
  // User denied consent / Google returned an error → send the user back.
  if (oauthError || !code) {
    return NextResponse.redirect(new URL(`${appUrl.replace(/\/$/, '')}/?auth=error`));
  }

  // Defense-in-depth: the state is HMAC-signed (only provisioned apps hold the
  // secret), but additionally refuse to relay to hosts outside the registry.
  const requestHost =
    (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').split(',')[0].trim();
  const { hosts, error: registryError } = await resolveAllowedHosts();
  let targetHost: string;
  try {
    targetHost = new URL(appUrl).host;
  } catch {
    return errorPage('Invalid relay target', 'The state carries an unparseable app URL.');
  }
  const allowed = targetHost === requestHost || hosts.has(targetHost);
  if (!allowed) {
    console.error(`[relay] blocked redirect to non-registered host ${targetHost}`);
    return errorPage(
      'Relay target not allowed',
      'The requested app host is not in the tenant registry.' + (registryError ? ` Registry check: ${registryError}` : ''),
    );
  }

  const config = await getGoogleOAuthCredentialsForClient(payload.clientId);
  if (!config) {
    console.error(`[relay] no credentials for client ${payload.clientId}`);
    return errorPage('Unknown OAuth client', 'The relay does not hold credentials for the client that started this flow.');
  }

  // The redirect_uri in the token exchange MUST exactly match the registered
  // console URI — derive it from the request itself.
  const proto = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const redirectUri = `${proto}://${requestHost}${RELAY_CALLBACK_PATH}`;

  try {
    const tokenResp = await fetch(config.tokenUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResp.ok) {
      const body = await tokenResp.text();
      console.error('[relay] token exchange failed:', tokenResp.status, body.slice(0, 300));
      return NextResponse.redirect(new URL(`${appUrl.replace(/\/$/, '')}/?auth=error`));
    }
    const tokens = (await tokenResp.json()) as { access_token?: string };
    const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userResp.ok) {
      console.error('[relay] userinfo failed:', userResp.status);
      return NextResponse.redirect(new URL(`${appUrl.replace(/\/$/, '')}/?auth=error`));
    }
    const user = (await userResp.json()) as {
      id: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    const ticket = signRelayTicket(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        redirectTo: payload.redirectTo || '/',
      },
      secret,
    );

    const finish = new URL(`/api/auth?action=google-relay-finish`, appUrl.replace(/\/$/, ''));
    finish.searchParams.set('ticket', ticket);
    return NextResponse.redirect(finish.toString());
  } catch (err) {
    console.error('[relay] callback error:', err instanceof Error ? err.message : err);
    return NextResponse.redirect(new URL(`${appUrl.replace(/\/$/, '')}/?auth=error`));
  }
}
