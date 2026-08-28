/**
 * Vercel SDK Client — resolves tokens and returns a cached @vercel/sdk instance.
 *
 * Token resolution order:
 *   1. VERCEL_OAUTH from secrets table (set via OAuth "Connect to Vercel" flow)
 *   2. VERCEL_TOKEN env var (legacy fallback)
 *
 * The OAuth token is auto-refreshed when expired using the stored refresh_token.
 */
import { Vercel } from '@vercel/sdk';
import { VercelError } from '@vercel/sdk/models/vercelerror.js';
import { getSecret, setSecret } from '@/lib/secrets';
import { decrypt } from '@/lib/crypto';

export const VERCEL_API = 'https://api.vercel.com';
/** Tokenizin Pro team — owns factory `tokenizmyapp` (prj_ia654…). Override via VERCEL_TEAM_ID. */
export const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_7m5fwG2qKtVsGtgV35AB3nHi';

// ── OAuth token helpers ─────────────────────────────────────────

interface VercelOAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  scope: string;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.VERCEL_APP_CLIENT_SECRET;

async function readStoredTokens(): Promise<VercelOAuthTokens | null> {
  const secret = await getSecret('VERCEL_OAUTH');
  if (!secret) return null;
  try {
    const decrypted = decrypt(secret.encrypted, secret.iv, secret.authTag);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

async function writeTokens(tokens: VercelOAuthTokens): Promise<void> {
  const payload = JSON.stringify(tokens);
  await setSecret('VERCEL_OAUTH', payload);
}

async function refreshAccessToken(refreshToken: string): Promise<VercelOAuthTokens | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn('[vercel-sdk] Cannot refresh token: missing OAuth client config');
    return null;
  }
  try {
    const res = await fetch('https://api.vercel.com/login/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) {
      console.error('[vercel-sdk] Token refresh failed:', res.status, await res.text());
      return null;
    }
    const data = await res.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope?: string;
    };
    const tokens: VercelOAuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope || '',
    };
    await writeTokens(tokens);
    return tokens;
  } catch (err) {
    console.error('[vercel-sdk] Token refresh error:', err);
    return null;
  }
}

export type VercelTokenSource = 'vercel_token' | 'oauth';

export interface VercelBearerCandidate {
  token: string;
  source: VercelTokenSource;
}

/**
 * List bearer tokens to try for Vercel REST calls, in preference order.
 *
 * Prefer `VERCEL_TOKEN` (personal/team PAT) first: Sign-in-with-Vercel OAuth
 * only requests `openid email profile offline_access` and cannot create
 * deploy hooks (API returns 401 "You are not allowed to access this endpoint").
 * OAuth remains a fallback for read/list calls when a PAT is absent.
 */
export async function listVercelBearerTokens(): Promise<VercelBearerCandidate[]> {
  const out: VercelBearerCandidate[] = [];
  const envToken = process.env.VERCEL_TOKEN?.trim();
  if (envToken) out.push({ token: envToken, source: 'vercel_token' });

  const stored = await readStoredTokens();
  if (stored) {
    let access = stored.accessToken;
    if (Date.now() > stored.expiresAt - 300_000) {
      if (stored.refreshToken) {
        console.log('[vercel-sdk] Access token expired, attempting refresh...');
        const refreshed = await refreshAccessToken(stored.refreshToken);
        if (refreshed) access = refreshed.accessToken;
        else {
          console.warn('[vercel-sdk] Token refresh failed; skipping OAuth bearer');
          access = '';
        }
      } else {
        console.warn('[vercel-sdk] Token expired and no refresh_token available');
        access = '';
      }
    }
    if (access) out.push({ token: access, source: 'oauth' });
  }

  return out;
}

export async function resolveBearerToken(): Promise<string> {
  const candidates = await listVercelBearerTokens();
  if (candidates.length > 0) return candidates[0].token;
  throw new Error(
    'No Vercel API token available. ' +
    'Set VERCEL_TOKEN (team/personal token from Vercel → Settings → Tokens) ' +
    'or connect via the admin dashboard (Connect to Vercel). ' +
    'Deploy-hook creation requires VERCEL_TOKEN — OAuth Sign-in scopes are not enough.',
  );
}

/** Prefer a PAT for project mutations (deploy hooks, git link). */
export async function resolveProjectApiToken(): Promise<VercelBearerCandidate> {
  const candidates = await listVercelBearerTokens();
  const pat = candidates.find((c) => c.source === 'vercel_token');
  if (pat) return pat;
  if (candidates[0]) return candidates[0];
  throw new Error(
    'No Vercel API token available for project mutations. ' +
    'Create a team token at https://vercel.com/account/tokens and set VERCEL_TOKEN.',
  );
}

// ── SDK Client singleton ────────────────────────────────────────

let client: Vercel | null = null;

/**
 * Get a cached Vercel SDK client. The SDK calls `resolveBearerToken()` on
 * each request, so it automatically picks up refreshed OAuth tokens.
 */
export async function getVercelClient(): Promise<Vercel> {
  if (!client) {
    client = new Vercel({
      bearerToken: resolveBearerToken,
      serverURL: VERCEL_API,
    });
  }
  return client;
}

/**
 * Wrap an SDK call with teamId, falling back to no teamId on 403/401.
 *
 * Some tokens are scoped to a team and require `teamId`, while personal
 * tokens may need to omit it.  This helper tries with `teamId` first and
 * retries without it if the server returns a permission error.
 */
export async function withTeamId<T>(
  fn: (teamId?: string) => Promise<T>,
): Promise<T> {
  try {
    return await fn(TEAM_ID);
  } catch (err) {
    if (err instanceof VercelError && (err.statusCode === 403 || err.statusCode === 401)) {
      console.warn('[vercel-sdk] Team-scoped call failed, retrying without teamId:', err.message);
      return await fn(undefined);
    }
    throw err;
  }
}

/**
 * Wrap an SDK call with teamId, handling 404 by returning null.
 */
export async function withTeamId404Null<T>(
  fn: (teamId?: string) => Promise<T>,
): Promise<T | null> {
  try {
    return await fn(TEAM_ID);
  } catch (err) {
    if (err instanceof VercelError && err.statusCode === 404) {
      return null;
    }
    if (err instanceof VercelError && (err.statusCode === 403 || err.statusCode === 401)) {
      console.warn('[vercel-sdk] Team-scoped call failed, retrying without teamId:', err.message);
      try {
        return await fn(undefined);
      } catch (err2) {
        if (err2 instanceof VercelError && err2.statusCode === 404) {
          return null;
        }
        throw err2;
      }
    }
    throw err;
  }
}
