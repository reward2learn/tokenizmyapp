/**
 * Vercel Deploy Service — creates and configures Vercel projects for new tenants.
 *
 * Uses @vercel/sdk for all Vercel API calls. Token resolution (OAuth + env var
 * fallback) is handled by vercel-sdk-client.ts.
 */
import { getVercelClient, withTeamId, withTeamId404Null, TEAM_ID, resolveBearerToken, VERCEL_API } from './vercel-sdk-client';
import type { UpdateProjectRequestBody } from '@vercel/sdk/models/updateprojectbranchmatcher.js';



interface DeployTenantInput {
  slug: string;
  displayName: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  metadata?: Record<string, unknown>;
  /** Optional project ID from tenant record — used as fallback lookup key. */
  projectId?: string;
  /**
   * All data for a tenant — including every suite app under it — lives in
   * ONE dedicated Neon database (the tenant's own db_url), never a separate
   * per-app database. When set, this overrides POSTGRES_URL/POSTGRES_URL_NON_POOLING
   * on the deployed Vercel project; when omitted, the deploy falls back to
   * copying the CURRENT PROCESS's own POSTGRES_URL, which is only correct for
   * the platform's own root deployment, never for an actual tenant.
   */
  dbUrl?: { pooled: string; direct?: string } | null;
}

interface DeployTenantResult {
  projectId: string;
  projectName: string;
  vercelDashboardUrl: string;
  appUrl: string;
  envCount: number;
}

/** Undocumented Vercel API field — the SDK omits gitRepository from UpdateProjectRequestBody. */
type UpdateProjectRequestBodyWithGit = UpdateProjectRequestBody & { gitRepository?: { type: 'github'; repo: string } };

/** Make a Vercel API call with a specific bearer token (no auto-resolution). */
/** Try a Vercel API call both with and without teamId. Returns the first successful response,
 *  or the best-effort response (preferring non-404/403) if both fail. */
function extractConfigEnvVars(metadata: Record<string, unknown> | undefined | null): Record<string, string> {
  const env: Record<string, string> = {};

  // Read from metadata.config (saved via handleSave) OR top-level metadata (from buildDeployPayload)
  const config = (metadata?.config ?? {}) as Record<string, unknown>;
  const topLevel = metadata ?? {};

  // Helper: try config first, then top-level
  const fromEither = (key: string): Record<string, unknown> =>
    (config[key] as Record<string, unknown>) || (topLevel[key] as Record<string, unknown>) || {};

  const googleAuth = fromEither('googleAuth');
  if (googleAuth.clientId) env['GOOGLE_CLIENT_ID'] = googleAuth.clientId as string;
  if (googleAuth.clientSecret) env['GOOGLE_CLIENT_SECRET'] = googleAuth.clientSecret as string;
  if (googleAuth.projectId) env['GOOGLE_PROJECT_ID'] = googleAuth.projectId as string;

  const database = fromEither('database');
  if (database.postgresUrl) env['POSTGRES_URL'] = database.postgresUrl as string;
  if (database.databaseUrl) env['DATABASE_URL'] = database.databaseUrl as string;
  if (database.pgUser) env['PGUSER'] = database.pgUser as string;
  if (database.pgPassword) env['PGPASSWORD'] = database.pgPassword as string;

  const pins = fromEither('pins') as unknown as Array<{ role: string; pin: string }>;
  if (Array.isArray(pins)) {
    for (const p of pins) {
      if (p.role && p.pin) {
        env[p.role] = p.pin;
      }
    }
  }

  const auth = fromEither('auth');
  env['PIN_SIGN_IN_ENABLED'] = auth.pinSignInEnabled !== false ? 'true' : 'false';

  const envVars = (config.envVars ?? []) as Array<{ key: string; value: string }>;
  for (const ev of envVars) {
    if (ev.key) {
      env[ev.key] = ev.value;
    }
  }

  return env;
}

export async function ensureVercelProject(input: { slug: string; projectId?: string }): Promise<{ projectId: string; created: boolean }> {
  const client = await getVercelClient();
  const slug = input.slug;

  // 0. If we have a stored project ID from a previous deployment, try it first.
  if (input.projectId) {
    const byId = await withTeamId404Null((teamId) =>
      client.projects.getProject({ idOrName: input.projectId!, teamId })
    );
    if (byId) {
      console.log(`[vercel-deploy] Found project "${slug}" by stored projectId: ${byId.id}`);
      return { projectId: byId.id, created: false };
    }
  }

  // 1. Try to find existing project by name
  const existing = await withTeamId404Null((teamId) =>
    client.projects.getProject({ idOrName: slug, teamId })
  );
  if (existing) {
    // Link to Git repo if not already linked — required for git-source
    // deployments to build from the shared repo.
    const link = (existing as { link?: unknown; gitRepository?: unknown }).link ?? (existing as { gitRepository?: unknown }).gitRepository;
    if (!link) {
      console.log(`[vercel-deploy] Linking existing project "${slug}" to Git repo...`);
      try {
        await withTeamId((teamId) =>
          client.projects.updateProject({
            idOrName: existing.id,
            teamId,
            // SDK's UpdateProjectRequestBody omits gitRepository — cast to narrow type.
            requestBody: {
              gitRepository: { type: 'github' as const, repo: GIT_REPO },
            } as UpdateProjectRequestBodyWithGit,
          })
        );
        console.log(`[vercel-deploy] Project "${slug}" linked to ${GIT_REPO}`);
      } catch (err) {
        console.warn(`[vercel-deploy] Git link warning for "${slug}":`, err instanceof Error ? err.message : err);
      }
    }
    return { projectId: existing.id, created: false };
  }

  // 2. Create new project — git-linked so deployments build from the repo
  try {
    const created = await withTeamId((teamId) =>
      client.projects.createProject({
        teamId,
        requestBody: {
          name: slug,
          framework: 'nextjs',
          gitRepository: { type: 'github' as const, repo: GIT_REPO },
          buildCommand: 'zenstack generate --schema zenstack/schema.zmodel && npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss && next build',
          installCommand: 'bun install',
          outputDirectory: '.next',
        },
      })
    );
    console.log(`[vercel-deploy] Project created: ${created.id}`);
    return { projectId: created.id, created: true };
  } catch (err) {
    // If creation fails with 409, the project exists but we couldn't find it
    if (err instanceof Error && err.message.includes('409')) {
      console.warn(`[vercel-deploy] Project "${slug}" exists (409). Retrying lookup...`);
      // 3a. Retry by stored projectId (if available)
      if (input.projectId) {
        const byId = await withTeamId404Null((teamId) =>
          client.projects.getProject({ idOrName: input.projectId!, teamId })
        );
        if (byId) {
          console.log(`[vercel-deploy] Found project "${slug}" by projectId after 409: ${byId.id}`);
          return { projectId: byId.id, created: false };
        }
      }
      // 3b. Retry by name
      const retry = await withTeamId404Null((teamId) =>
        client.projects.getProject({ idOrName: slug, teamId })
      );
      if (retry) {
        return { projectId: retry.id, created: false };
      }
      // 3c. Final fallback: list all projects and find by name
      // The SDK's getProject by name can return 404 even when the project exists
      // (recently created, team-scoped token, API propagation delay). Listing all
      // projects and matching by name is more reliable.
      try {
        const bearer = await resolveBearerToken();
        const listRes = await fetch(
          `${VERCEL_API}/v10/projects?teamId=${TEAM_ID}&limit=100`,
          { headers: { Authorization: `Bearer ${bearer}` } },
        );
        if (listRes.ok) {
          const listData = await listRes.json() as { projects?: Array<{ id: string; name: string }> };
          const found = listData.projects?.find((p) => p.name === slug);
          if (found) {
            console.log(`[vercel-deploy] Found project "${slug}" via project list: ${found.id}`);
            return { projectId: found.id, created: false };
          }
        }
      } catch (listErr) {
        console.warn(`[vercel-deploy] Project list fallback failed:`, listErr instanceof Error ? listErr.message : listErr);
      }
      throw new Error(
        `Project "${slug}" already exists on Vercel (409) but could not be found by ` +
        `name or projectId. This usually happens when the project was created under ` +
        `a different Vercel account or team. Fix: Pass the correct projectId (found in ` +
        `the Vercel Deploy Hook URL) to ensureVercelProject, or set vercel_project_id ` +
        `on the tenant record. Check Vercel dashboard for the project.`
      );
    }
    throw err;
  }
}

/** Upsert a single env var — tries all available tokens/teamId combos until one works. */
async function upsertEnvVar(
  projectId: string,
  key: string,
  value: string,
): Promise<boolean> {
  const client = await getVercelClient();
  const requestBody = {
    key,
    value,
    type: (key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted') as 'plain' | 'encrypted',
    target: ['production' as const, 'preview' as const, 'development' as const],
  };

  // Try with teamId first, then without
  for (const teamId of [TEAM_ID, undefined]) {
    try {
      await client.projects.createProjectEnv({
        idOrName: projectId,
        teamId,
        upsert: 'true',
        requestBody,
      });
      console.log(`[vercel-deploy] Set env ${key} via SDK`);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('403') && teamId === TEAM_ID) {
        // Permission error with teamId, try without
        continue;
      }
      if (msg.includes('400') && teamId === TEAM_ID) {
        // Bad request with teamId, try without
        continue;
      }
      console.warn(`[vercel-deploy] Failed to set env ${key} (teamId=${teamId || 'none'}): ${msg}`);
    }
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

  // Suite apps deploy with metadata.appId (see suite-provisioning.ts) — stamp
  // it so this deployment knows its own app identity at runtime (business-data
  // tables like FinancialProjection/Task/DailyZReport are scoped by app_id
  // within the tenant's shared database; see shared/lib/config/tenant.ts:getCurrentAppId).
  const suiteAppId = input.metadata?.appId;
  if (typeof suiteAppId === 'string' && suiteAppId) {
    envVars.NEXT_PUBLIC_APP_ID = suiteAppId;
  }

  // Postgres connection vars: when a tenant-specific dbUrl is supplied, that
  // tenant's own database wins — never fall back to this (the platform root's
  // own) process's POSTGRES_URL for an actual tenant deployment. The
  // HOST/DATABASE/USER/PASSWORD parts are root-project-specific and are
  // skipped entirely in that case (the app only ever reads the full URL).
  if (input.dbUrl) {
    envVars.POSTGRES_URL = input.dbUrl.pooled;
    envVars.POSTGRES_PRISMA_URL = input.dbUrl.pooled;
    envVars.POSTGRES_URL_NON_POOLING = input.dbUrl.direct ?? input.dbUrl.pooled;
  } else {
    const ROOT_POSTGRES_KEYS = [
      'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING',
      'POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
    ];
    for (const key of ROOT_POSTGRES_KEYS) {
      const value = process.env[key];
      if (value) envVars[key] = value;
    }
  }

  const SHARED_ENV_KEYS = ['ENCRYPTION_KEY', 'OPENAI_API_KEY', 'SETUP_TOKEN'];
  for (const key of SHARED_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      envVars[key] = value;
    }
  }

  // Dedicated platform-admin email for tenant Google sign-in mapping.
  envVars.PLATFORM_ADMIN_EMAIL =
    (input.metadata?.adminEmail as string) ||
    process.env.PLATFORM_ADMIN_EMAIL ||
    'reward2learn@gmail.com';

  const configVars = extractConfigEnvVars(input.metadata);
  for (const [key, value] of Object.entries(configVars)) {
    if (value) envVars[key] = value;
  }

  // Upsert each env var — the function handles token/teamId fallback internally
  let envCount = 0;
  for (const [key, value] of Object.entries(envVars)) {
    try {
      const ok = await upsertEnvVar(projectId, key, value);
      if (ok) envCount++;
    } catch (err) {
      console.error(`[vercel-deploy] Failed to set env ${key}:`, err);
    }
  }

  console.log(`[vercel-deploy] Synced ${envCount}/${Object.keys(envVars).length} env vars`);
  return envCount;
}

/**
 * Resolve the GitHub repo ID used for git-source deployments.
 *
 * Chain: VERCEL_GIT_REPO_ID env var → the platform project's linked repo →
 * known fallback for reward2learn/tokenizmyapp.
 *
 * NOTE: Vercel only injects VERCEL_GIT_* variables at BUILD time, so they are
 * undefined inside serverless functions at runtime. Relying on the env var
 * alone silently produced empty projects (createDeployment with repoId: ''
 * fails with 400 and the error was swallowed). The platform project lookup
 * covers the common case; the constant is the last resort.
 */
async function resolveGitRepoId(client: Awaited<ReturnType<typeof getVercelClient>>): Promise<string> {
  if (process.env.VERCEL_GIT_REPO_ID) return process.env.VERCEL_GIT_REPO_ID;
  try {
    const platform = await withTeamId404Null((teamId) =>
      client.projects.getProject({ idOrName: 'tokenizmyapp', teamId })
    );
    const p = platform as { link?: { repoId?: number | string }; gitRepository?: { repoId?: number | string } } | null;
    const repoId = p?.link?.repoId ?? p?.gitRepository?.repoId;
    if (repoId) return String(repoId);
  } catch { /* fall through to fallback */ }
  return '1310805947'; // reward2learn/tokenizmyapp
}

export async function deployTenant(input: DeployTenantInput): Promise<DeployTenantResult> {
  const appUrl = `https://${input.slug}.vercel.app`;
  const client = await getVercelClient();

  const { projectId } = await ensureVercelProject({ slug: input.slug, projectId: input.projectId });

  // Sync env vars
  const envCount = await syncEnvVars(projectId, input);
  if (envCount === 0) {
    throw new Error(`Failed to sync any environment variables to project "${input.slug}". Check Vercel API access.`);
  }
  const criticalKeys = ['NEXT_PUBLIC_TENANT_SLUG', 'POSTGRES_URL', 'ENCRYPTION_KEY'];
  if (envCount < criticalKeys.length) {
    console.warn(`[vercel-deploy] Only synced ${envCount} env vars — critical keys may be missing.`);
  }

  // Assign domain
  try {
    await withTeamId((teamId) =>
      client.projects.addProjectDomain({
        idOrName: projectId,
        teamId,
        requestBody: { name: `${input.slug}.vercel.app` },
      })
    );
    console.log(`[vercel-deploy] Domain ${input.slug}.vercel.app assigned`);
  } catch (err) {
    console.warn(`[vercel-deploy] Domain assignment warning:`, err instanceof Error ? err.message : err);
  }

  // Trigger deployment — git-source from the shared repo's main branch.
  // repoId must be a real GitHub repo ID (VERCEL_GIT_REPO_ID is build-time
  // only, so resolve it dynamically instead of trusting the env var).
  try {
    const repoId = await resolveGitRepoId(client);
    await withTeamId((teamId) =>
      client.deployments.createDeployment({
        teamId,
        requestBody: {
          name: input.slug,
          project: projectId,
          target: 'production',
          // Narrow to a valid GitSource variant — SDK union type doesn't infer from literal.
          gitSource: { type: 'github' as const, repoId, ref: 'main' } as { type: 'github'; repoId: string; ref: string },
        },
      })
    );
    console.log(`[vercel-deploy] Deployment triggered for ${input.slug}`);
  } catch (err) {
    console.warn(`[vercel-deploy] Deployment trigger warning:`, err instanceof Error ? err.message : err);
  }

  return {
    projectId,
    projectName: input.slug,
    vercelDashboardUrl: `https://vercel.com/ilishaps-projects/${input.slug}`,
    appUrl,
    envCount,
  };
}

// ── Git-based deployment ─────────────────────────────────────

const GIT_REPO = process.env.VERCEL_GIT_REPO || 'reward2learn/tokenizmyapp';

/**
 * Ensure a Vercel project exists and is linked to the GitHub repo.
 * Creates the project if not found, and links it to the Git repository
 * linked to the GitHub repo.
 */
export async function ensureVercelProjectWithGit(input: { slug: string; projectId?: string }): Promise<{ projectId: string; created: boolean }> {
  const client = await getVercelClient();
  const slug = input.slug;
  const REPO = process.env.VERCEL_GIT_REPO || 'reward2learn/tokenizmyapp';

  // 0. If we have a stored project ID from a previous deployment, try it first.
  //    This is more reliable than look-up-by-name because the API token may have
  //    different scope than the token that originally created the project.
  if (input.projectId) {
    const byId = await withTeamId404Null((teamId) =>
      client.projects.getProject({ idOrName: input.projectId!, teamId })
    );
    if (byId) {
      console.log(`[vercel-deploy] Found project "${slug}" by stored projectId: ${byId.id}`);
      return { projectId: byId.id, created: false };
    }
  }

  // 1. Try to find existing project by name
  const existing = await withTeamId404Null((teamId) =>
    client.projects.getProject({ idOrName: slug, teamId })
  );
  if (existing) {
    // Link to Git repo if not already linked
    if (!(existing as { gitRepository?: unknown }).gitRepository) {
      console.log(`[vercel-deploy] Linking existing project "${slug}" to Git repo...`);
      await withTeamId((teamId) =>
        client.projects.updateProject({
          idOrName: existing.id,
          teamId,
          requestBody: {
            gitRepository: { type: 'github' as const, repo: REPO },
          } as UpdateProjectRequestBodyWithGit,
        })
      );
      console.log(`[vercel-deploy] Project "${slug}" linked to ${REPO}`);
    }
    return { projectId: existing.id, created: false };
  }

  // 2. Create new project with Git integration
  try {
    const created = await withTeamId((teamId) =>
      client.projects.createProject({
        teamId,
        requestBody: {
          name: slug,
          framework: 'nextjs',
          gitRepository: { type: 'github' as const, repo: REPO },
          buildCommand: 'zenstack generate --schema zenstack/schema.zmodel && npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss && next build',
          installCommand: 'bun install',
          outputDirectory: '.next',
        },
      })
    );
    console.log(`[vercel-deploy] Project created with Git: ${created.id}`);
    return { projectId: created.id, created: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes('409')) {
      console.warn(`[vercel-deploy] Project "${slug}" exists (409). Retrying lookup...`);
      // 3a. Retry by stored projectId (if available)
      if (input.projectId) {
        const byId = await withTeamId404Null((teamId) =>
          client.projects.getProject({ idOrName: input.projectId!, teamId })
        );
        if (byId) {
          console.log(`[vercel-deploy] Found project "${slug}" by projectId after 409: ${byId.id}`);
          return { projectId: byId.id, created: false };
        }
      }
      // 3b. Retry by name
      const found = await withTeamId404Null((teamId) =>
        client.projects.getProject({ idOrName: slug, teamId })
      );
      if (found) {
        return { projectId: found.id, created: false };
      }
      // 3c. Final fallback: list all projects and find by name
      // The SDK's getProject by name can return 404 even when the project exists
      // (recently created, team-scoped token, API propagation delay). Listing all
      // projects and matching by name is more reliable.
      try {
        const bearer = await resolveBearerToken();
        const listRes = await fetch(
          `${VERCEL_API}/v10/projects?teamId=${TEAM_ID}&limit=100`,
          { headers: { Authorization: `Bearer ${bearer}` } },
        );
        if (listRes.ok) {
          const listData = await listRes.json() as { projects?: Array<{ id: string; name: string }> };
          const found = listData.projects?.find((p) => p.name === slug);
          if (found) {
            console.log(`[vercel-deploy] Found project "${slug}" via project list: ${found.id}`);
            return { projectId: found.id, created: false };
          }
        }
      } catch (listErr) {
        console.warn(`[vercel-deploy] Project list fallback failed:`, listErr instanceof Error ? listErr.message : listErr);
      }
      throw new Error(
        `Project "${slug}" already exists on Vercel (409) but could not be found by ` +
        `name or projectId. This usually happens when the project was created under ` +
        `a different Vercel account or team. Fix: Pass the correct projectId (found in ` +
        `the Vercel Deploy Hook URL) to ensureVercelProjectWithGit, or set vercel_project_id ` +
        `on the tenant record. Check Vercel dashboard for the project.`
      );
    }
    throw err;
  }
}

/**
 * Deploy a tenant using Git-based deployment.
 * Creates/finds the Vercel project linked to GitHub, syncs env vars,
 * and triggers a production deployment from the main branch.
 */
export async function deployTenantWithGit(input: DeployTenantInput): Promise<DeployTenantResult> {
  const appUrl = `https://${input.slug}.vercel.app`;
  const client = await getVercelClient();

  const { projectId } = await ensureVercelProjectWithGit({ slug: input.slug, projectId: input.projectId });

  // Sync env vars
  const envCount = await syncEnvVars(projectId, input);
  if (envCount === 0) {
    throw new Error(`Failed to sync environment variables for "${input.slug}".`);
  }

  // Assign domain
  try {
    await withTeamId((teamId) =>
      client.projects.addProjectDomain({
        idOrName: projectId,
        teamId,
        requestBody: { name: `${input.slug}.vercel.app` },
      })
    );
  } catch (err) {
    console.warn(`[vercel-deploy] Domain assignment warning:`, err instanceof Error ? err.message : err);
  }

  // Trigger Git-based deployment
  try {
    const repoId = await resolveGitRepoId(client);
    await withTeamId((teamId) =>
      client.deployments.createDeployment({
        teamId,
        requestBody: {
          name: input.slug,
          project: projectId,
          target: 'production',
          // Narrow to a valid GitSource variant — SDK union type doesn't infer from literal.
          gitSource: { type: 'github' as const, repoId, ref: 'main' } as { type: 'github'; repoId: string; ref: string },
        },
      })
    );
    console.log(`[vercel-deploy] Git deployment triggered for ${input.slug}`);
  } catch (err) {
    console.warn(`[vercel-deploy] Git deployment trigger warning:`, err instanceof Error ? err.message : err);
  }

  return {
    projectId,
    projectName: input.slug,
    vercelDashboardUrl: `https://vercel.com/ilishaps-projects/${input.slug}`,
    appUrl,
    envCount,
  };
}

// ── Vercel Domain Management ──────────────────────────────────

/**
 * Fetch all domains for a Vercel project.
 * Uses /v9/projects/{projectId}/domains — the v9 endpoint returns
 * a simpler shape than v10 for domain listing.
 */
export async function getVercelDomains(projectId: string): Promise<{ name: string; verified: boolean; createdAt: string }[]> {
  const client = await getVercelClient();
  try {
    const result = await withTeamId((teamId) =>
      client.projects.getProjectDomains({ idOrName: projectId, teamId })
    );
    const domains = 'domains' in result ? result.domains : [];
    return domains.map((d) => ({
      name: d.name,
      verified: d.verified,
      createdAt: typeof d.createdAt === 'number' ? new Date(d.createdAt).toISOString() : String(d.createdAt ?? new Date().toISOString()),
    }));
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) {
      console.warn(`[vercel-deploy] Project ${projectId} not found when fetching domains (may have been deleted)`);
      return [];
    }
    console.warn(`[vercel-deploy] Failed to fetch domains for ${projectId}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

export interface SetCustomDomainResult {
  verified: boolean;
}

// ── Vercel Project Management ──────────────────────────────────

/**
 * Fetch Vercel project details by project ID. Returns null if project doesn't exist.
 * GET /v10/projects/{projectId}
 */
export async function getVercelProject(projectId: string): Promise<{ name: string; id: string; updatedAt: string } | null> {
  const client = await getVercelClient();
  const result = await withTeamId404Null((teamId) =>
    client.projects.getProject({ idOrName: projectId, teamId })
  );
  if (!result) return null;
  return {
    name: result.name,
    id: result.id,
    updatedAt: String(result.updatedAt ?? new Date().toISOString()),
  };
}

/**
 * Rename a Vercel project by ID.
 * PATCH /v10/projects/{projectId} with body { name: newName }
 *
 * Renaming a Vercel project changes its auto-generated .vercel.app subdomain.
 * For example, renaming project "my-new" to "my-new-flax" means
 * the app is then reachable at https://my-new-flax.vercel.app.
 *
 * This is the only way to change the .vercel.app URL — these subdomains
 * CANNOT be added or removed via the /v9/projects/{id}/domains endpoint.
 */
export async function renameVercelProject(projectId: string, newName: string): Promise<{ name: string; id: string }> {
  const client = await getVercelClient();
  try {
    const result = await withTeamId((teamId) =>
      client.projects.updateProject({
        idOrName: projectId,
        teamId,
        requestBody: { name: newName },
      })
    );
    console.log(`[vercel-deploy] Project ${projectId} renamed to "${newName}"`);
    return { name: result.name, id: result.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[vercel-deploy] Failed to rename project ${projectId} to "${newName}": ${msg}`);
    if (msg.includes('403')) {
      throw new Error(`Not authorized to rename project "${projectId}". Check team permissions.`);
    }
    if (msg.includes('409')) {
      throw new Error(`Project name "${newName}" is already taken on Vercel. Choose a different name.`);
    }
    if (msg.includes('404')) {
      throw new Error(`Project ${projectId} not found on Vercel. Deploy the tenant first to create the project.`);
    }
    throw new Error(`Failed to rename project: ${msg}`);
  }
}

/**
 * Add a custom domain to a Vercel project.
 * POST /v9/projects/{projectId}/domains
 */
export async function setCustomDomain(projectId: string, domain: string): Promise<SetCustomDomainResult> {
  const client = await getVercelClient();
  try {
    const result = await withTeamId((teamId) =>
      client.projects.addProjectDomain({
        idOrName: projectId,
        teamId,
        requestBody: { name: domain },
      })
    );
    console.log(`[vercel-deploy] Domain ${domain} added to ${projectId}, verified: ${result.verified}`);
    return { verified: result.verified };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[vercel-deploy] Failed to set domain ${domain} for ${projectId}: ${msg}`);
    if (msg.includes('409')) {
      throw new Error(`Domain "${domain}" is already associated with another Vercel project.`);
    }
    if (msg.includes('403')) {
      throw new Error(`Not authorized to add domains to project ${projectId}. Check team permissions.`);
    }
    throw new Error(`Failed to add domain "${domain}": ${msg}`);
  }
}

/**
 * Delete a Vercel project by ID.
 * Handles cases where the project may already be deleted or inaccessible.
 */
export async function deleteVercelProject(projectId: string): Promise<void> {
  const client = await getVercelClient();
  try {
    await withTeamId((teamId) =>
      client.projects.deleteProject({ idOrName: projectId, teamId })
    );
    console.log(`[vercel-deploy] Successfully deleted Vercel project ${projectId}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('404')) {
      console.log(`[vercel-deploy] Vercel project ${projectId} already deleted or not found`);
      return;
    }
    if (msg.includes('403')) {
      console.log(`[vercel-deploy] Not authorized to delete ${projectId}, may have been removed from scope`);
      return;
    }
    throw err;
  }
}
