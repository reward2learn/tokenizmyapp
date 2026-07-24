/**
 * Vercel Deploy Service — creates and deploys tenant projects via Vercel REST API.
 *
 * Uses the Vercel CLI auth token stored at ~/Library/Application Support/com.vercel.cli/auth.json.
 * Requires VERCEL_TOKEN env var OR falls back to the CLI token file.
 */

const VERCEL_API = 'https://api.vercel.com';

interface VercelProject {
  id: string;
  name: string;
}

interface VercelDeployment {
  id: string;
  url: string;
  readyState: string;
}

interface DeployTenantInput {
  slug: string;
  displayName: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
}

interface DeployTenantResult {
  projectId: string;
  deploymentUrl: string;
  appUrl: string;
}

let _cachedToken: string | null = null;

async function getVercelToken(): Promise<string> {
  if (_cachedToken) return _cachedToken;

  // 1) Env var override
  const envToken = process.env.VERCEL_TOKEN;
  if (envToken) {
    _cachedToken = envToken;
    return envToken;
  }

  // 2) Try to read from Vercel CLI auth file (server-side only)
  try {
    // Only attempt filesystem read on server (Node.js runtime)
    if (typeof process !== 'undefined' && process.versions?.node) {
      const fs = await import('fs/promises');
      const os = await import('os');
      const path = await import('path');
      const authPath = path.join(os.homedir(), 'Library', 'Application Support', 'com.vercel.cli', 'auth.json');
      const raw = await fs.readFile(authPath, 'utf-8');
      const auth = JSON.parse(raw) as { token: string };
      if (auth.token) {
        _cachedToken = auth.token;
        return auth.token;
      }
    }
  } catch {
    // File not found or not in Node.js runtime
  }

  throw new Error('VERCEL_TOKEN not set and no CLI auth file found');
}

const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';
// The skeleton project to clone — redrubybali is the reference tenant app
const SKELETON_PROJECT_ID = process.env.VERCEL_SKELETON_PROJECT_ID || 'prj_kHPW3f3yGArIihBH3J1zJk4wSmhp';

/**
 * Get environment variables from the skeleton project to copy to new tenants.
 */
async function getSkeletonEnv(token: string): Promise<Record<string, string>> {
  const res = await fetch(
    `${VERCEL_API}/v9/projects/${SKELETON_PROJECT_ID}/env?teamId=${TEAM_ID}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    console.error('[vercel-deploy] Failed to fetch skeleton env vars:', res.status);
    return {};
  }

  const data = await res.json() as { envs?: Array<{ key: string; value: string; type: string }> };
  const envs: Record<string, string> = {};

  // Only copy non-sensitive vars (sensitive ones have encrypted values we can't read)
  // We'll set sensitive vars separately
  const SKIP_KEYS = new Set(['POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING',
    'POSTGRES_PASSWORD', 'POSTGRES_URL_NO_SSL', 'POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER',
    'ENCRYPTION_KEY', 'SETUP_TOKEN', 'GOOGLE_CLIENT_SECRET', 'OPENAI_API_KEY',
    'VERCEL_OIDC_TOKEN', 'NX_DAEMON', 'TURBO_CACHE', 'TURBO_DOWNLOAD_LOCAL_ENABLED',
    'TURBO_REMOTE_ONLY', 'TURBO_RUN_SUMMARY']);

  for (const env of data.envs ?? []) {
    if (!SKIP_KEYS.has(env.key) && env.value) {
      envs[env.key] = env.value;
    }
  }

  return envs;
}

export async function deployTenant(input: DeployTenantInput): Promise<DeployTenantResult> {
  const token = await getVercelToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // ── 1. Create Vercel project ──────────────────────────
  console.log(`[vercel-deploy] Creating Vercel project for ${input.slug}...`);
  const createRes = await fetch(
    `${VERCEL_API}/v10/projects?teamId=${TEAM_ID}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: input.slug,
        framework: 'nextjs',
        gitRepository: null, // No git integration — we deploy via API
        rootDirectory: null,
        buildCommand: null, // Use default from package.json
      }),
    },
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Vercel project: ${createRes.status} ${err}`);
  }

  const project = await createRes.json() as VercelProject;
  console.log(`[vercel-deploy] Project created: ${project.id} (${project.name})`);

  // ── 2. Set environment variables ──────────────────────
  console.log(`[vercel-deploy] Setting environment variables...`);
  const skeletonEnvs = await getSkeletonEnv(token);

  // Tenant-specific overrides
  const tenantEnvs: Record<string, string> = {
    NEXT_PUBLIC_TENANT_SLUG: input.slug,
    NEXT_PUBLIC_TENANT_DISPLAY_NAME: input.displayName,
    NEXT_PUBLIC_TENANT_DESCRIPTION: `${input.displayName} — Business Operations Dashboard`,
    NEXT_PUBLIC_TENANT_APP_TITLE: input.displayName,
    NEXT_PUBLIC_APP_URL: `https://${input.slug}.vercel.app`,
    ...skeletonEnvs,
  };

  // Set each env var
  for (const [key, value] of Object.entries(tenantEnvs)) {
    try {
      await fetch(
        `${VERCEL_API}/v10/projects/${project.id}/env?teamId=${TEAM_ID}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            key,
            value,
            type: 'encrypted',
            target: ['production', 'preview', 'development'],
          }),
        },
      );
    } catch (err) {
      console.error(`[vercel-deploy] Failed to set env ${key}:`, err);
    }
  }

  // ── 3. Promote domain ─────────────────────────────────
  const appUrl = `https://${input.slug}.vercel.app`;
  try {
    await fetch(
      `${VERCEL_API}/v10/projects/${project.id}/domains?teamId=${TEAM_ID}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: `${input.slug}.vercel.app` }),
      },
    );
    console.log(`[vercel-deploy] Domain ${input.slug}.vercel.app assigned`);
  } catch (err) {
    console.error(`[vercel-deploy] Domain assignment failed:`, err);
    // Non-fatal — deployment still has {project}-{hash}.vercel.app URL
  }

  // ── 4. Return result ──────────────────────────────────
  // The actual first deployment happens via Vercel Git integration
  // or a separate deploy step. For MVP, we return the project ID
  // and the tenant app URL.
  return {
    projectId: project.id,
    deploymentUrl: `https://${project.name}-${project.id.slice(-8)}-ilishaps-projects.vercel.app`,
    appUrl,
  };
}

/**
 * Check the deployment status of a tenant project.
 */
export async function getDeploymentStatus(projectId: string): Promise<{
  ready: boolean;
  url: string;
  state: string;
} | null> {
  const token = await getVercelToken();
  const res = await fetch(
    `${VERCEL_API}/v6/deployments?projectId=${projectId}&teamId=${TEAM_ID}&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return null;

  const data = await res.json() as { deployments?: VercelDeployment[] };
  const dep = data.deployments?.[0];
  if (!dep) return null;

  return {
    ready: dep.readyState === 'READY',
    url: `https://${dep.url}`,
    state: dep.readyState,
  };
}
