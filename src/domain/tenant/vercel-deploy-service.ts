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
}

interface DeployTenantResult {
  projectId: string;
  projectName: string;
  vercelDashboardUrl: string;
  appUrl: string;
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

export async function deployTenant(input: DeployTenantInput): Promise<DeployTenantResult> {
  const appUrl = `https://${input.slug}.vercel.app`;

  // ── 1. Create Vercel project ──────────────────────────
  console.log(`[vercel-deploy] Creating Vercel project: ${input.slug}`);
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

  // ── 2. Set environment variables ──────────────────────
  const envVars: Record<string, string> = {
    NEXT_PUBLIC_TENANT_SLUG: input.slug,
    NEXT_PUBLIC_TENANT_DISPLAY_NAME: input.displayName,
    NEXT_PUBLIC_TENANT_DESCRIPTION: `${input.displayName} — Business Operations Dashboard`,
    NEXT_PUBLIC_TENANT_APP_TITLE: input.displayName,
    NEXT_PUBLIC_APP_URL: appUrl,
  };

  // Copy shared infrastructure env vars from tokenizmyapp
  const SHARED_ENV_KEYS = [
    'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING',
    'POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
    'ENCRYPTION_KEY', 'OPENAI_API_KEY', 'SETUP_TOKEN',
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_PROJECT_ID',
    'GOOGLE_AUTH_URI', 'GOOGLE_TOKEN_URI',
  ];

  for (const key of SHARED_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      envVars[key] = value;
    }
  }

  let envCount = 0;
  for (const [key, value] of Object.entries(envVars)) {
    try {
      const res = await vercelApi(`/v10/projects/${project.id}/env`, {
        method: 'POST',
        body: JSON.stringify({
          key,
          value,
          type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
          target: ['production', 'preview', 'development'],
        }),
      });
      if (res.ok) envCount++;
    } catch (err) {
      console.error(`[vercel-deploy] Failed to set env ${key}:`, err);
    }
  }
  console.log(`[vercel-deploy] Set ${envCount}/${Object.keys(envVars).length} env vars`);

  // ── 3. Assign domain ──────────────────────────────────
  try {
    await vercelApi(`/v10/projects/${project.id}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: `${input.slug}.vercel.app` }),
    });
    console.log(`[vercel-deploy] Domain ${input.slug}.vercel.app assigned`);
  } catch (err) {
    console.error(`[vercel-deploy] Domain assignment failed (may already exist):`, err);
  }

  // ── 4. Return result ──────────────────────────────────
  return {
    projectId: project.id,
    projectName: project.name,
    vercelDashboardUrl: `https://vercel.com/ilishaps-projects/${project.name}`,
    appUrl,
  };
}
