/**
 * Vercel Deploy Service — creates and configures Vercel projects for new tenants.
 *
 * Token resolution order:
 *   1. VERCEL_OAUTH from secrets table (set via OAuth "Connect to Vercel" flow)
 *   2. VERCEL_TOKEN env var (legacy fallback)
 *
 * The OAuth token is auto-refreshed when expired using the stored refresh_token.
 */
import { getSecret, setSecret } from '@/lib/secrets';
import { decrypt, encrypt } from '@/lib/crypto';

const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';

// ── Vercel OAuth token helpers ─────────────────────────────────

interface VercelOAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  scope: string;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.VERCEL_APP_CLIENT_SECRET;
/**
 * Read the stored Vercel OAuth tokens from the secrets table.
 */
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

/**
 * Write Vercel OAuth tokens to the secrets table.
 */
async function writeTokens(tokens: VercelOAuthTokens): Promise<void> {
  const payload = JSON.stringify(tokens);
  const encrypted = encrypt(payload);
  await setSecret('VERCEL_OAUTH', payload);
}

/**
 * Refresh the OAuth access token using the refresh token.
 * Vercel's refresh_token flow returns a new access_token + refresh_token pair.
 */
async function refreshAccessToken(refreshToken: string): Promise<VercelOAuthTokens | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn('[vercel-deploy] Cannot refresh token: missing OAuth client config');
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
      console.error('[vercel-deploy] Token refresh failed:', res.status, await res.text());
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
      refreshToken: data.refresh_token || refreshToken, // use old refresh if not provided
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope || '',
    };

    // Persist updated tokens
    await writeTokens(tokens);
    return tokens;
  } catch (err) {
    console.error('[vercel-deploy] Token refresh error:', err);
    return null;
  }
}

/**
 * Get a valid Bearer token for Vercel API calls.
 * Tries: stored OAuth token (with auto-refresh) → env var VERCEL_TOKEN.
 */
async function resolveBearerToken(): Promise<string> {
  // 1. Try stored OAuth tokens
  const stored = await readStoredTokens();
  if (stored) {
    // Check if expired (with 5 min buffer)
    if (Date.now() > stored.expiresAt - 300_000) {
      // Token is expired or about to expire — try refresh
      if (stored.refreshToken) {
        console.log('[vercel-deploy] Access token expired, attempting refresh...');
        const refreshed = await refreshAccessToken(stored.refreshToken);
        if (refreshed) {
          return refreshed.accessToken;
        }
        console.warn('[vercel-deploy] Token refresh failed, falling back to env var');
      } else {
        console.warn('[vercel-deploy] Token expired and no refresh_token available');
      }
    } else {
      return stored.accessToken;
    }
  }

  // 2. Fallback to env var legacy token
  const envToken = process.env.VERCEL_TOKEN;
  if (envToken) {
    return envToken;
  }

  throw new Error(
    'No Vercel API token available. ' +
    'Connect your Vercel account via the admin dashboard (Connect to Vercel button), ' +
    'or set VERCEL_TOKEN environment variable.',
  );
}

// ── Vercel API client ────────────────────────────────────────

interface DeployTenantInput {
  slug: string;
  displayName: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  metadata?: Record<string, unknown>;
}

interface DeployTenantResult {
  projectId: string;
  projectName: string;
  vercelDashboardUrl: string;
  appUrl: string;
  envCount: number;
}

async function vercelApi(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await resolveBearerToken();
  return fetch(`${VERCEL_API}${path}?teamId=${TEAM_ID}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

function extractConfigEnvVars(metadata: Record<string, unknown> | undefined | null): Record<string, string> {
  const env: Record<string, string> = {};
  const config = (metadata?.config ?? {}) as Record<string, unknown>;

  const googleAuth = (config.googleAuth ?? {}) as Record<string, string>;
  if (googleAuth.clientId) env['GOOGLE_CLIENT_ID'] = googleAuth.clientId;
  if (googleAuth.clientSecret) env['GOOGLE_CLIENT_SECRET'] = googleAuth.clientSecret;
  if (googleAuth.projectId) env['GOOGLE_PROJECT_ID'] = googleAuth.projectId;

  const database = (config.database ?? {}) as Record<string, string>;
  if (database.postgresUrl) env['POSTGRES_URL'] = database.postgresUrl;
  if (database.databaseUrl) env['DATABASE_URL'] = database.databaseUrl;
  if (database.pgUser) env['PGUSER'] = database.pgUser;
  if (database.pgPassword) env['PGPASSWORD'] = database.pgPassword;

  const pins = (config.pins ?? []) as Array<{ role: string; pin: string }>;
  for (const p of pins) {
    if (p.role && p.pin) {
      env[p.role] = p.pin;
    }
  }

  const envVars = (config.envVars ?? []) as Array<{ key: string; value: string }>;
  for (const ev of envVars) {
    if (ev.key) {
      env[ev.key] = ev.value;
    }
  }

  return env;
}

export async function ensureVercelProject(input: { slug: string }): Promise<{ projectId: string; created: boolean }> {
  // 1. Try to get the project directly by name (Vercel API accepts slug/name as ID)
  const getRes = await vercelApi(`/v10/projects/${input.slug}`);
  if (getRes.ok) {
    const project = await getRes.json() as { id: string; name: string };
    console.log(`[vercel-deploy] Project "${input.slug}" already exists: ${project.id}`);
    return { projectId: project.id, created: false };
  }

  // 2. If not found, try searching (broader search)
  if (getRes.status === 404) {
    const searchRes = await vercelApi(`/v10/projects?search=${input.slug}`);
    if (searchRes.ok) {
      const data = await searchRes.json() as { projects: { id: string; name: string }[] };
      const existing = data.projects?.find((p) => p.name === input.slug);
      if (existing) {
        console.log(`[vercel-deploy] Project "${input.slug}" found via search: ${existing.id}`);
        return { projectId: existing.id, created: false };
      }
    }
  }

  // 3. Create new project
  const createRes = await vercelApi('/v10/projects', {
    method: 'POST',
    body: JSON.stringify({
      name: input.slug,
      framework: 'nextjs',
      buildCommand: 'zenstack generate --schema zenstack/schema.zmodel && npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss && next build',
      installCommand: 'bun install',
      outputDirectory: '.next',
    }),
  });

  // 4. If creation fails with 409, parse the existing project ID from the error
  if (createRes.status === 409) {
    try {
      console.warn(`[vercel-deploy] Project "${input.slug}" exists (409). Attempting to use existing project.`);
      // Try the direct lookup again
      const retryRes = await vercelApi(`/v10/projects/${input.slug}`);
      if (retryRes.ok) {
        const project = await retryRes.json() as { id: string; name: string };
        console.log(`[vercel-deploy] Using existing project: ${project.id}`);
        return { projectId: project.id, created: false };
      }
    } catch {}
    throw new Error(`Project "${input.slug}" already exists on Vercel but could not be found.`);
  }

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Vercel project: ${createRes.status} ${err}`);
  }

  const project = await createRes.json() as { id: string; name: string };
  console.log(`[vercel-deploy] Project created: ${project.id}`);
  return { projectId: project.id, created: true };
}
export async function syncEnvVars(
  projectId: string,
  input: DeployTenantInput,
): Promise<number> {
  const appUrl = `https://${input.slug}.vercel.app`;

  const envVars: Record<string, string> = {
    NEXT_PUBLIC_TENANT_SLUG: input.slug,
    NEXT_PUBLIC_TENANT_DISPLAY_NAME: input.displayName,
    NEXT_PUBLIC_TENANT_DESCRIPTION: `${input.displayName} — Business Operations Dashboard`,
    NEXT_PUBLIC_TENANT_APP_TITLE: input.displayName,
    NEXT_PUBLIC_APP_URL: appUrl,
  };

  const SHARED_ENV_KEYS = [
    'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING',
    'POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
    'ENCRYPTION_KEY', 'OPENAI_API_KEY', 'SETUP_TOKEN',
  ];

  for (const key of SHARED_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      envVars[key] = value;
    }
  }

  const configVars = extractConfigEnvVars(input.metadata);
  for (const [key, value] of Object.entries(configVars)) {
    if (value) envVars[key] = value;
  }

  let envCount = 0;
  for (const [key, value] of Object.entries(envVars)) {
    try {
      const existingRes = await vercelApi(`/v10/projects/${projectId}/env?decrypt=true`);
      const existingData = await existingRes.json() as { envs?: Array<{ key: string; id: string }> };
      const existing = existingData.envs?.find((e) => e.key === key);

      if (existing) {
        const updateRes = await vercelApi(`/v10/projects/${projectId}/env/${existing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            value,
            type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
            target: ['production', 'preview', 'development'],
          }),
        });
        if (updateRes.ok) envCount++;
      } else {
        const res = await vercelApi(`/v10/projects/${projectId}/env`, {
          method: 'POST',
          body: JSON.stringify({
            key,
            value,
            type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
            target: ['production', 'preview', 'development'],
          }),
        });
        if (res.ok) envCount++;
      }
    } catch (err) {
      console.error(`[vercel-deploy] Failed to set env ${key}:`, err);
    }
  }
  console.log(`[vercel-deploy] Synced ${envCount}/${Object.keys(envVars).length} env vars`);
  return envCount;
}

export async function deployTenant(input: DeployTenantInput): Promise<DeployTenantResult> {
  const appUrl = `https://${input.slug}.vercel.app`;

  const { projectId } = await ensureVercelProject({ slug: input.slug });

  let envCount = 0;
  try {
    envCount = await syncEnvVars(projectId, input);
  } catch (err) {
    console.error(`[vercel-deploy] Env var sync failed:`, err);
  }

  try {
    const domainRes = await vercelApi(`/v10/projects/${projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: `${input.slug}.vercel.app` }),
    });
    if (domainRes.ok) {
      console.log(`[vercel-deploy] Domain ${input.slug}.vercel.app assigned`);
    } else {
      const domainErr = await domainRes.text();
      console.warn(`[vercel-deploy] Domain assignment response: ${domainErr.slice(0, 100)}`);
    }
  } catch (err) {
    console.warn(`[vercel-deploy] Domain assignment failed (may already exist):`, err);
  }

  try {
    await vercelApi(`/v1/deployments`, {
      method: 'POST',
      body: JSON.stringify({
        name: input.slug,
        projectId,
        target: 'production',
        gitSource: { type: 'github', repoId: process.env.VERCEL_GIT_REPO_ID || '' },
      }),
    });
    console.log(`[vercel-deploy] Deployment triggered for ${input.slug}`);
  } catch (err) {
    console.warn(`[vercel-deploy] Deployment trigger warning:`, err);
  }

  return {
    projectId,
    projectName: input.slug,
    vercelDashboardUrl: `https://vercel.com/ilishaps-projects/${input.slug}`,
    appUrl,
    envCount,
  };
}
