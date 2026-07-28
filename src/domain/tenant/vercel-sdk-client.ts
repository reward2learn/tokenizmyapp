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
import { decrypt, encrypt } from '@/lib/crypto';

const VERCEL_API = 'https://api.vercel.com';
export const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';

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

async function resolveBearerToken(): Promise<string> {
  const stored = await readStoredTokens();
  if (stored) {
    if (Date.now() > stored.expiresAt - 300_000) {
      if (stored.refreshToken) {
        console.log('[vercel-sdk] Access token expired, attempting refresh...');
        const refreshed = await refreshAccessToken(stored.refreshToken);
        if (refreshed) return refreshed.accessToken;
        console.warn('[vercel-sdk] Token refresh failed, falling back to env var');
      } else {
        console.warn('[vercel-sdk] Token expired and no refresh_token available');
      }
    } else {
      return stored.accessToken;
    }
  }
  const envToken = process.env.VERCEL_TOKEN;
  if (envToken) return envToken;
  throw new Error(
    'No Vercel API token available. ' +
    'Connect your Vercel account via the admin dashboard (Connect to Vercel button), ' +
    'or set VERCEL_TOKEN environment variable.',
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
