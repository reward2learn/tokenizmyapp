/**
 * Vercel Deploy Service — creates and configures Vercel projects for new tenants.
 *
 * Uses Vercel REST API with the token from process.env.VERCEL_TOKEN.
 * Set VERCEL_TOKEN in the Vercel project environment variables (dashboard → Settings → Environment Variables).
 */
const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';

interface DeployTenantInput {
  slug: string;
  displayName: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  /** Tenant metadata.config — contains OAuth, DB, PINs, envVars */
  metadata?: Record<string, unknown>;
}

interface DeployTenantResult {
  projectId: string;
  projectName: string;
  vercelDashboardUrl: string;
  appUrl: string;
  envCount: number;
}

function getToken(): string {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN env var is required for Vercel API calls');
  return token;
}

async function vercelApi(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${VERCEL_API}${path}?teamId=${TEAM_ID}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Extract environment variables from the tenant's metadata.config.
 * Returns a flat record of key → value for all config sections.
 */
function extractConfigEnvVars(metadata: Record<string, unknown> | undefined | null): Record<string, string> {
  const env: Record<string, string> = {};
  const config = (metadata?.config ?? {}) as Record<string, unknown>;

  // ── Google OAuth ─────────────────────────────────
  const googleAuth = (config.googleAuth ?? {}) as Record<string, string>;
  if (googleAuth.clientId) env['GOOGLE_CLIENT_ID'] = googleAuth.clientId;
  if (googleAuth.clientSecret) env['GOOGLE_CLIENT_SECRET'] = googleAuth.clientSecret;
  if (googleAuth.projectId) env['GOOGLE_PROJECT_ID'] = googleAuth.projectId;

  // ── Database ─────────────────────────────────────
  const database = (config.database ?? {}) as Record<string, string>;
  if (database.postgresUrl) env['POSTGRES_URL'] = database.postgresUrl;
  if (database.databaseUrl) env['DATABASE_URL'] = database.databaseUrl;
  if (database.pgUser) env['PGUSER'] = database.pgUser;
  if (database.pgPassword) env['PGPASSWORD'] = database.pgPassword;

  // ── PIN Codes ────────────────────────────────────
  const pins = (config.pins ?? []) as Array<{ role: string; pin: string }>;
  for (const p of pins) {
    if (p.role && p.pin) {
      env[p.role] = p.pin;
    }
  }

  // ── Custom Env Vars ──────────────────────────────
  const envVars = (config.envVars ?? []) as Array<{ key: string; value: string }>;
  for (const ev of envVars) {
    if (ev.key) {
      env[ev.key] = ev.value;
    }
  }

  return env;
}

/**
 * Ensure a Vercel project exists for the given tenant slug.
 * If it doesn't exist, creates it. If it does exist, updates its config.
 * Always syncs environment variables from the tenant config.
 */
export async function ensureVercelProject(input: { slug: string }): Promise<{ projectId: string; created: boolean }> {
  // Check if project already exists
  const checkRes = await vercelApi(`/v10/projects?search=${input.slug}`);
  if (checkRes.ok) {
    const data = await checkRes.json() as { projects: { id: string; name: string }[] };
    const existing = data.projects?.find((p) => p.name === input.slug);
    if (existing) {
      console.log(`[vercel-deploy] Project "${input.slug}" already exists: ${existing.id}`);
      return { projectId: existing.id, created: false };
    }
  }

  // Create new project
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

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Vercel project: ${createRes.status} ${err}`);
  }

  const project = await createRes.json() as { id: string; name: string };
  console.log(`[vercel-deploy] Project created: ${project.id}`);
  return { projectId: project.id, created: true };
}

/**
 * Sync all environment variables for a tenant's Vercel project.
 * Combines base tenant identity vars, shared infra vars, and config-derived vars.
 */
export async function syncEnvVars(
  projectId: string,
  input: DeployTenantInput,
): Promise<number> {
  const appUrl = `https://${input.slug}.vercel.app`;

  const envVars: Record<string, string> = {
    // Tenant identity
    NEXT_PUBLIC_TENANT_SLUG: input.slug,
    NEXT_PUBLIC_TENANT_DISPLAY_NAME: input.displayName,
    NEXT_PUBLIC_TENANT_DESCRIPTION: `${input.displayName} — Business Operations Dashboard`,
    NEXT_PUBLIC_TENANT_APP_TITLE: input.displayName,
    NEXT_PUBLIC_APP_URL: appUrl,
  };

  // Shared infrastructure env vars from tokenizmyapp's own env
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

  // Config-derived env vars (OAuth, DB, PINs, custom)
  const configVars = extractConfigEnvVars(input.metadata);
  for (const [key, value] of Object.entries(configVars)) {
    if (value) envVars[key] = value;
  }

  // Set each env var on the Vercel project (upsert)
  let envCount = 0;
  for (const [key, value] of Object.entries(envVars)) {
    try {
      // Check if env var already exists
      const existingRes = await vercelApi(`/v10/projects/${projectId}/env?decrypt=true`);
      const existingData = await existingRes.json() as { envs?: Array<{ key: string; id: string }> };
      const existing = existingData.envs?.find((e) => e.key === key);

      if (existing) {
        // Update existing env var
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
        // Create new env var
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

/**
 * Full deploy: ensure project exists, sync env vars, assign domain.
 * Called on tenant creation and can be re-invoked from the dashboard to sync latest config.
 */
export async function deployTenant(input: DeployTenantInput): Promise<DeployTenantResult> {
  const appUrl = `https://${input.slug}.vercel.app`;

  // ── 1. Create or find Vercel project ────────────────
  const { projectId } = await ensureVercelProject({ slug: input.slug });

  // ── 2. Sync environment variables from tenant config ─
  let envCount = 0;
  try {
    envCount = await syncEnvVars(projectId, input);
  } catch (err) {
    console.error(`[vercel-deploy] Env var sync failed:`, err);
  }

  // ── 3. Assign domain ────────────────────────────────
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

  // ── 4. Trigger deploy hook ──────────────────────────
  try {
    // Create a deployment to trigger the build
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
