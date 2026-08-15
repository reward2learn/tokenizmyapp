/**
 * Google OAuth credentials — DB-backed with encrypted client_secret.
 * Falls back to GOOGLE_* env vars when no DB row exists.
 */
import { createClient } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/crypto';

export interface GoogleOAuthPublicConfig {
  clientId: string;
  projectId: string;
  authUri: string;
  tokenUri: string;
}

export interface GoogleOAuthCredentials extends GoogleOAuthPublicConfig {
  clientSecret: string;
}

export interface GoogleOAuthInput {
  clientId: string;
  projectId: string;
  authUri: string;
  tokenUri?: string;
  clientSecret: string;
}

const DEFAULT_AUTH_URI = 'https://accounts.google.com/o/oauth2/auth';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';
const CONFIG_ID = 'default';

export const GOOGLE_OAUTH_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS google_oauth_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  client_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  auth_uri TEXT NOT NULL,
  token_uri TEXT NOT NULL DEFAULT 'https://oauth2.googleapis.com/token',
  encrypted_secret TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;

export async function ensureGoogleOAuthTable(): Promise<void> {
  const db = createClient();
  await db.$executeRawUnsafe(GOOGLE_OAUTH_TABLE_DDL);
}

function credentialsFromEnv(): GoogleOAuthCredentials | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  return {
    clientId,
    clientSecret,
    projectId: process.env.GOOGLE_PROJECT_ID ?? '',
    authUri: process.env.GOOGLE_AUTH_URI ?? DEFAULT_AUTH_URI,
    tokenUri: process.env.GOOGLE_TOKEN_URI ?? DEFAULT_TOKEN_URI,
  };
}

export async function getGoogleOAuthPublicConfig(): Promise<GoogleOAuthPublicConfig | null> {
  const credentials = await getGoogleOAuthCredentials();
  if (!credentials) return null;

  return {
    clientId: credentials.clientId,
    projectId: credentials.projectId,
    authUri: credentials.authUri,
    tokenUri: credentials.tokenUri,
  };
}

export async function getGoogleOAuthCredentials(options?: { preferDb?: boolean }): Promise<GoogleOAuthCredentials | null> {
  // Default: prefer this app's own GOOGLE_* env credentials. The
  // google_oauth_config row is a singleton (id 'default') living in the
  // factory's SHARED database — preferring it first would leak the factory's
  // client id to every tenant app that shares the DB (my-finance-review,
  // redrubybali, ...). Tenant deployments carry their own credentials in env.
  // preferDb: true swaps the order (used by the factory's relay, which must
  // exchange codes issued against the SHARED client, not the factory's own).
  const fromEnv = credentialsFromEnv();
  if (!options?.preferDb && fromEnv) return fromEnv;

  try {
    const db = createClient();
    const row = await db.googleOAuthConfig.findUnique({ where: { id: CONFIG_ID } });
    if (row) {
      const clientSecret = decrypt(row.encryptedSecret, row.iv, row.authTag);
      return {
        clientId: row.clientId,
        projectId: row.projectId,
        authUri: row.authUri,
        tokenUri: row.tokenUri,
        clientSecret,
      };
    }
  } catch (err) {
    console.error('[google-oauth] DB load failed, trying env fallback:', err instanceof Error ? err.message : err);
  }

  return fromEnv;
}

/**
 * Resolve credentials that match a specific Google client id — used by the
 * relay so the code exchange always uses the exact client the tenant app
 * started the flow with. Env first (factory's own client), then the shared
 * DB singleton (client id of the provisioned tenant apps).
 */
export async function getGoogleOAuthCredentialsForClient(clientId: string): Promise<GoogleOAuthCredentials | null> {
  const fromEnv = credentialsFromEnv();
  if (fromEnv && fromEnv.clientId === clientId) return fromEnv;

  try {
    const db = createClient();
    const row = await db.googleOAuthConfig.findUnique({ where: { id: CONFIG_ID } });
    if (row && row.clientId === clientId) {
      const clientSecret = decrypt(row.encryptedSecret, row.iv, row.authTag);
      return {
        clientId: row.clientId,
        projectId: row.projectId,
        authUri: row.authUri,
        tokenUri: row.tokenUri,
        clientSecret,
      };
    }
  } catch (err) {
    console.error('[google-oauth] getGoogleOAuthCredentialsForClient DB load failed:', err instanceof Error ? err.message : err);
  }

  return null;
}

export async function setGoogleOAuthConfig(input: GoogleOAuthInput): Promise<void> {
  const { encrypted, iv, authTag } = encrypt(input.clientSecret);
  const db = createClient();
  await db.googleOAuthConfig.upsert({
    where: { id: CONFIG_ID },
    create: {
      id: CONFIG_ID,
      clientId: input.clientId,
      projectId: input.projectId,
      authUri: input.authUri,
      tokenUri: input.tokenUri ?? DEFAULT_TOKEN_URI,
      encryptedSecret: encrypted,
      iv,
      authTag,
    },
    update: {
      clientId: input.clientId,
      projectId: input.projectId,
      authUri: input.authUri,
      tokenUri: input.tokenUri ?? DEFAULT_TOKEN_URI,
      encryptedSecret: encrypted,
      iv,
      authTag,
    },
  });
}

/** Build OAuth authorization URL from stored config (uses authUri from DB). */
export function buildGoogleAuthUrl(
  config: GoogleOAuthPublicConfig,
  params: { redirectUri: string; state: string; scope?: string },
): string {
  const authEndpoint = config.authUri.replace(/\/v2\/?$/, '');
  const search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    scope: params.scope ?? 'openid email profile',
    state: params.state,
    access_type: 'offline',
    prompt: 'select_account',
  });
  return `${authEndpoint}?${search.toString()}`;
}
