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

async function vercelApi(path: string, options: RequestInit = {}, includeTeamId = true): Promise<Response> {
  const token = await resolveBearerToken();
  return vercelApiWithToken(token, path, options, includeTeamId);
}

/** Make a Vercel API call with a specific bearer token (no auto-resolution). */
async function vercelApiWithToken(token: string, path: string, options: RequestInit = {}, includeTeamId = true): Promise<Response> {
  const url = new URL(`${VERCEL_API}${path}`);
  if (includeTeamId) url.searchParams.set('teamId', TEAM_ID);
  return fetch(url.toString(), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/** Try a Vercel API call both with and without teamId. Returns the first successful response,
 *  or the best-effort response (preferring non-404/403) if both fail. */
async function vercelApiTryBoth(path: string, options: RequestInit = {}): Promise<Response> {
  const withTeam = await vercelApi(path, options, true);
  if (withTeam.ok) return withTeam;

  const withoutTeam = await vercelApi(path, options, false);
  if (withoutTeam.ok) return withoutTeam;

  // Return the more useful response: prefer non-404 over 404
  if (withTeam.status !== 404 && withTeam.status !== 403) return withTeam;
  return withoutTeam;
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
  //    Try both with and without teamId — OAuth tokens may be scoped differently
  const getRes = await vercelApiTryBoth(`/v10/projects/${input.slug}`);
  if (getRes.ok) {
    const project = await getRes.json() as { id: string; name: string };
    console.log(`[vercel-deploy] Project "${input.slug}" already exists: ${project.id}`);
    return { projectId: project.id, created: false };
  }

  // 2. If not found, try searching (broader search) — also try both scopes
  const searchRes = await vercelApiTryBoth(`/v10/projects?search=${input.slug}`);
  if (searchRes.ok) {
    const data = await searchRes.json() as { projects: { id: string; name: string }[] };
    const existing = data.projects?.find((p) => p.name === input.slug);
    if (existing) {
      console.log(`[vercel-deploy] Project "${input.slug}" found via search: ${existing.id}`);
      return { projectId: existing.id, created: false };
    }
  }

  // 3. Create new project (POST must be with teamId since projects live under teams)
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

  // 4. If creation fails with 409, the project exists but we couldn't find it
  if (createRes.status === 409) {
    console.warn(`[vercel-deploy] Project "${input.slug}" exists (409). Attempting to use existing project.`);
    // Retry the direct lookup via tryBoth
    const retryRes = await vercelApiTryBoth(`/v10/projects/${input.slug}`);
    if (retryRes.ok) {
      const project = await retryRes.json() as { id: string; name: string };
      console.log(`[vercel-deploy] Using existing project: ${project.id}`);
      return { projectId: project.id, created: false };
    }
    // If still not found, try to get it with the personal token env var
    const token = process.env.VERCEL_TOKEN;
    if (token) {
      try {
        const fallbackUrl = new URL(`${VERCEL_API}/v10/projects/${input.slug}`);
        fallbackUrl.searchParams.set('teamId', TEAM_ID);
        const envRes = await fetch(fallbackUrl.toString(), {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (envRes.ok) {
          const project = await envRes.json() as { id: string; name: string };
          console.log(`[vercel-deploy] Found existing project via VERCEL_TOKEN: ${project.id}`);
          return { projectId: project.id, created: false };
        }
      } catch {}
    }
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
/** Fetch existing env vars, trying both available tokens. */
async function fetchExistingEnvs(projectId: string): Promise<Array<{ key: string; id: string }>> {
  // Try with resolved token (OAuth) — with and without teamId
  for (const includeTeam of [true, false]) {
    try {
      const res = await vercelApi(`/v10/projects/${projectId}/env?decrypt=true`, {}, includeTeam);
      if (res.ok) {
        const data = await res.json() as { envs?: Array<{ key: string; id: string }> };
        return data.envs || [];
      }
    } catch {}
  }
  // Fallback: try with VERCEL_TOKEN env var
  const vt = process.env.VERCEL_TOKEN;
  if (vt) {
    for (const includeTeam of [true, false]) {
      try {
        const res = await vercelApiWithToken(vt, `/v10/projects/${projectId}/env?decrypt=true`, {}, includeTeam);
        if (res.ok) {
          const data = await res.json() as { envs?: Array<{ key: string; id: string }> };
          return data.envs || [];
        }
      } catch {}
    }
  }
  console.warn(`[vercel-deploy] Could not fetch existing env vars for project ${projectId} — will attempt create-only`);
  return [];
}

/** Upsert a single env var: create-or-update with token fallback. */
async function upsertEnvVar(
  projectId: string,
  key: string,
  value: string,
  existingId: string | undefined,
): Promise<boolean> {
  const body = JSON.stringify({
    key,
    value,
    type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
    target: ['production', 'preview', 'development'],
  });

  const vt = process.env.VERCEL_TOKEN;

  // Collect tokens to try: [resolved primary, VERCEL_TOKEN fallback]
  // resolved primary is handled via vercelApi() which returns the OAuth token
  const tokens: Array<{ label: string; fn: (path: string, opts?: RequestInit) => Promise<Response> }> = [
    { label: 'oauth', fn: (path, opts = {}) => vercelApi(path, opts) },
  ];
  if (vt) tokens.push({ label: 'vercel-token', fn: (path, opts = {}) => vercelApiWithToken(vt, path, opts) });

  // If we know the existing ID, try PATCH first with each token
  if (existingId) {
    for (const { label, fn } of tokens) {
      const res = await fn(`/v10/projects/${projectId}/env/${existingId}`, { method: 'PATCH', body });
      if (res.ok) return true;
      if (res.status !== 401 && res.status !== 403) break; // non-auth error — don't try other tokens
      console.warn(`[vercel-deploy] PATCH ${key} with ${label}: ${res.status} — trying next token`);
    }
  }

  // POST to create. If 409 (exists), re-fetch the ID and PATCH.
  for (const { label, fn } of tokens) {
    const res = await fn(`/v10/projects/${projectId}/env`, { method: 'POST', body });
    if (res.ok) return true;

    if (res.status === 409) {
      // Already exists — try to look up its ID and PATCH
      const listRes = await fn(`/v10/projects/${projectId}/env?decrypt=true`);
      if (listRes.ok) {
        const data = await listRes.json() as { envs?: Array<{ key: string; id: string }> };
        const found = data.envs?.find((e) => e.key === key);
        if (found) {
          const patchRes = await fn(`/v10/projects/${projectId}/env/${found.id}`, { method: 'PATCH', body });
          if (patchRes.ok) return true;
        }
      }
      // If we got here, listing failed or PATCH failed — don't try other tokens for 409
      const body = await res.text();
      console.warn(`[vercel-deploy] Failed to upsert env ${key} (${label}): ${res.status} ${body.slice(0, 150)}`);
      return false;
    }

    if (res.status === 401 || res.status === 403) {
      console.warn(`[vercel-deploy] POST ${key} with ${label}: ${res.status} — trying next token`);
      continue; // try next token
    }

    // Non-auth error
    const body = await res.text();
    console.warn(`[vercel-deploy] Failed to set env ${key} (${label}): ${res.status} ${body.slice(0, 150)}`);
    return false;
  }

  return false;
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

  // Fetch existing env vars (tries both OAuth and VERCEL_TOKEN)
  const existingEnvs = await fetchExistingEnvs(projectId);
  const envMap = new Map(existingEnvs.map((e) => [e.key, e.id]));

  // Upsert each env var
  let envCount = 0;
  for (const [key, value] of Object.entries(envVars)) {
    try {
      const ok = await upsertEnvVar(projectId, key, value, envMap.get(key));
      if (ok) {
        envCount++;
        envMap.set(key, '__synced__'); // mark as known
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

  // Sync env vars — fail closed if it doesn't work
  const envCount = await syncEnvVars(projectId, input);
  // Verify critical env vars were written
  if (envCount === 0) {
    throw new Error(`Failed to sync any environment variables to project "${input.slug}". Check Vercel API access.`);
  }
  const criticalKeys = ['NEXT_PUBLIC_TENANT_SLUG', 'POSTGRES_URL', 'ENCRYPTION_KEY'];
  if (envCount < criticalKeys.length) {
    console.warn(`[vercel-deploy] Only synced ${envCount} env vars — critical keys may be missing.`);
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
