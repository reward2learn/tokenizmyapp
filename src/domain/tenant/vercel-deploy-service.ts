/**
 * Vercel Deploy Service — creates and configures Vercel projects for new tenants.
 *
 * Uses @vercel/sdk for all Vercel API calls. Token resolution (OAuth + env var
 * fallback) is handled by vercel-sdk-client.ts.
 */
import { getVercelClient, withTeamId, withTeamId404Null, TEAM_ID, resolveBearerToken, listVercelBearerTokens, VERCEL_API } from './vercel-sdk-client';
import {
  purgeMarketplaceWebhookSecrets,
  replaceStripeWebhookSecretOnProject,
  TOKENIZ_SNAPSHOT_WHSEC_KEY,
} from './vercel-stripe-marketplace-service';
import { DEFAULT_RELAY_REDIRECT_URI } from '@/lib/auth/google-relay';
import { buildWeb3EnvVars } from '@/lib/web3/reown';
import { billingIdentityEnvVars } from '@/lib/billing/organization-env';
import { resolveTemplate } from '@/domain/tenant/custom-template-service';
import { resolveAssistantProfile, resolveChatStarterPrompt } from '@/domain/tenant/template-assistant-profiles';
import { TEMPLATE_PROFILE_ENV_KEY, CHAT_STARTER_PROMPT_ENV_KEY } from '@shared/lib/config/template-profile';
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

  // Custom env vars — the tenant modal saves config.env (object); legacy
  // flows used config.envVars (array). Support both so "Vercel Save & Push"
  // always pushes the tenant's custom vars.
  const envObj = (config.env ?? {}) as Record<string, string>;
  for (const [k, v] of Object.entries(envObj)) {
    if (k && v) env[k] = v;
  }
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
          buildCommand: TENANT_BUILD_COMMAND,
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
export async function upsertProjectEnvVar(

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

/**
 * Build the full env-var map for a tenant/app Vercel project from the deploy
 * input (tenant identity, DB URL, shared platform secrets, and the tenant's
 * saved metadata.config — Google OAuth creds, database, PINs, custom env).
 * Exported so the per-app "Vercel Save & Push" flow pushes the exact same set
 * without duplicating the mapping logic.
 *
 * Async because the app's template decides whether it gets a wallet, and a
 * custom template lives in the database rather than the compiled catalog.
 * Resolving here rather than at each of the eight deployTenant call sites means
 * every deploy path — new tenant, redeploy, suite app, app-pack materializer,
 * "Vercel Save & Push" — picks the wallet up without being told to.
 */
export async function buildEnvVarsForProject(input: DeployTenantInput): Promise<Record<string, string>> {
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

  const ollamaTunnelHostRaw =
    (typeof input.metadata?.ollamaTunnelHost === 'string' ? input.metadata.ollamaTunnelHost : null)
    || process.env.OLLAMA_TUNNEL_HOST?.trim()
    || null;
  if (ollamaTunnelHostRaw) {
    try {
      const { normalizeOllamaTunnelHost, OLLAMA_TUNNEL_HOST_ENV_KEY } = await import(
        '@/lib/ollama-tunnel-host'
      );
      envVars[OLLAMA_TUNNEL_HOST_ENV_KEY] = normalizeOllamaTunnelHost(ollamaTunnelHostRaw);
    } catch (err) {
      console.warn(
        '[vercel-deploy] Skipping invalid OLLAMA_TUNNEL_HOST:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Google OAuth relay: when the factory has the shared relay secret configured,
  // every deployed app gets the relay URI + HMAC secret so Google sign-in works
  // WITHOUT registering per-app redirect URIs (Google removed that API). New
  // apps are fully dynamic; existing apps pick this up on their next re-deploy.
  if (process.env.GOOGLE_RELAY_SECRET) {
    envVars.GOOGLE_RELAY_SECRET = process.env.GOOGLE_RELAY_SECRET;
    envVars.GOOGLE_RELAY_REDIRECT_URI =
      process.env.GOOGLE_RELAY_REDIRECT_URI || DEFAULT_RELAY_REDIRECT_URI;
  }

  // Dedicated platform-admin email for tenant Google sign-in mapping.
  envVars.PLATFORM_ADMIN_EMAIL =
    (input.metadata?.adminEmail as string) ||
    process.env.PLATFORM_ADMIN_EMAIL ||
    'reward2learn@gmail.com';

  // Reown wallet: driven by the template's capabilities, not by tenant config.
  // A failure to resolve the template must not sink an otherwise valid deploy —
  // fall back to the wallet being off, which is what every built-in template
  // asks for anyway.
  try {
    const template = await resolveTemplate(input.template);
    Object.assign(envVars, buildWeb3EnvVars(template.capabilities?.web3Wallet));

    // Stamp the template identity onto the deployment.
    //
    // Without this a provisioned app has no idea what it is: the template
    // decides its pages, nav and colours at provisioning time and is then
    // discarded. That is why every app's AI assistant used to introduce itself
    // as the same nightclub — the persona had nothing else to go on. The
    // template is already resolved here for the wallet, so carrying the rest
    // of it through costs nothing.
    envVars.NEXT_PUBLIC_TEMPLATE_ID = template.id;
    envVars.NEXT_PUBLIC_TEMPLATE_LABEL = template.label;
    // Server-only: this is prompt material, not UI copy, and large enough that
    // putting it in the client bundle would be waste.
    const assistantProfile = resolveAssistantProfile(template);
    envVars[TEMPLATE_PROFILE_ENV_KEY] = JSON.stringify(assistantProfile);
    envVars[CHAT_STARTER_PROMPT_ENV_KEY] = resolveChatStarterPrompt(
      assistantProfile,
      input.displayName,
    );
  } catch (err) {
    console.warn(
      `[vercel-deploy] Could not resolve template "${input.template}" for wallet config; deploying without a wallet:`,
      err instanceof Error ? err.message : err,
    );
    envVars.NEXT_PUBLIC_WEB3_WALLET_ENABLED = 'false';
  }

  // Applied last so a tenant's explicit custom env vars (config.env) can
  // override anything derived above, wallet keys included.
  const configVars = extractConfigEnvVars(input.metadata);
  for (const [key, value] of Object.entries(configVars)) {
    if (value) envVars[key] = value;
  }


  // Billing identity: suite apps cannot resolve the payer by deployment slug.
  // Stamp ORGANIZATION_ID (+ PLATFORM_POSTGRES_URL) when the factory knows it.
  const orgIdMeta = input.metadata?.organizationId;
  const orgId = typeof orgIdMeta === 'string' ? orgIdMeta.trim() : '';
  if (orgId) {
    Object.assign(envVars, billingIdentityEnvVars(orgId));
  }

  return envVars;
}

/**
 * Push the Stripe payment keys to a Vercel project. Only non-empty values are
 * written, so clearing a field keeps the previously pushed value. The
 * NEXT_PUBLIC_ key is inlined at build time — a redeploy is required before
 * the client bundle picks it up (callers trigger the deploy hook).
 */
export async function syncStripeEnvVars(
  projectId: string,
  stripe: {
    secretKey?: string;
    webhookSecret?: string;
    publishableKey?: string;
    selfServeBillingEnabled?: boolean;
    /** Short keys (`PRO_MONTHLY`) → Stripe price id — pushed as STRIPE_PRICE_* env vars. */
    prices?: Record<string, string>;
  },
): Promise<number> {
  const webhook = stripe.webhookSecret?.trim();
  if (webhook) {
    if (webhook.startsWith('eyJ')) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET looks like a Vercel Stripe Marketplace token (eyJ…), not a Stripe whsec_ signing secret. ' +
          'Paste the Signing secret from Stripe Dashboard → Webhooks → your snapshot destination.',
      );
    }
    if (!webhook.startsWith('whsec_')) {
      throw new Error('STRIPE_WEBHOOK_SECRET must start with whsec_ (Stripe webhook signing secret).');
    }
  }

  const entries: [string, string][] = [];
  if (stripe.secretKey?.trim()) entries.push(['STRIPE_SECRET_KEY', stripe.secretKey.trim()]);
  if (stripe.publishableKey?.trim()) entries.push(['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', stripe.publishableKey.trim()]);
  if (stripe.prices) {
    for (const [shortKey, priceId] of Object.entries(stripe.prices)) {
      const trimmed = priceId?.trim();
      if (!trimmed) continue;
      entries.push([`STRIPE_PRICE_${shortKey}`, trimmed]);
    }
  }

  let envCount = 0;

  if (webhook) {
    const replaced = await replaceStripeWebhookSecretOnProject(projectId, webhook);
    if (replaced.verifyPrefix !== 'whsec') {
      throw new Error(
        `STRIPE webhook secret push failed — Vercel still reports ${replaced.verifyPrefix} after ` +
          `deleting ${replaced.deleted} row(s). Check TOKENIZ_SNAPSHOT_WHSEC on the project.`,
      );
    }
    envCount += 1;
    console.log(
      `[vercel-deploy] Pushed ${TOKENIZ_SNAPSHOT_WHSEC_KEY} on ${projectId} (deleted ${replaced.deleted} legacy row(s)).`,
    );
  } else {
    try {
      const purged = await purgeMarketplaceWebhookSecrets(projectId);
      if (purged > 0) {
        console.log(`[vercel-deploy] Removed ${purged} Marketplace STRIPE_WEBHOOK_SECRET row(s) from ${projectId}`);
      }
    } catch (err) {
      console.warn('[vercel-deploy] Could not purge Marketplace webhook secrets:', err);
    }
  }

  for (const [key, value] of entries) {
    try {
      const ok = await upsertProjectEnvVar(projectId, key, value);
      if (ok) envCount++;
    } catch (err) {
      console.error(`[vercel-deploy] Failed to set env ${key}:`, err);
    }
  }

  const selfServeValue = stripe.selfServeBillingEnabled ? 'true' : 'false';
  for (const key of ['SELF_SERVE_BILLING_ENABLED', 'NEXT_PUBLIC_SELF_SERVE_BILLING'] as const) {
    try {
      const ok = await upsertProjectEnvVar(projectId, key, selfServeValue);
      if (ok) envCount++;
    } catch (err) {
      console.error(`[vercel-deploy] Failed to set env ${key}:`, err);
    }
  }

  return envCount;
}

export async function syncEnvVars(
  projectId: string,
  input: DeployTenantInput,
): Promise<number> {
  const envVars = await buildEnvVarsForProject(input);

  // Upsert each env var — the function handles token/teamId fallback internally
  let envCount = 0;
  for (const [key, value] of Object.entries(envVars)) {
    try {
      const ok = await upsertProjectEnvVar(projectId, key, value);
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

// ── Deploy hooks ─────────────────────────────────────────────

interface VercelDeployHook {
  id: string;
  name: string;
  ref: string;
  url: string;
  createdAt?: number;
}

type VercelProjectGitSnapshot = {
  id: string;
  name?: string;
  link?: {
    type?: string;
    repo?: string;
    org?: string;
    deployHooks?: VercelDeployHook[];
  } | null;
};

export type EnsureDeployHookResult =
  | { ok: true; url: string; id: string; created: boolean; projectId: string; projectName: string | null }
  | { ok: false; error: string; projectId: string; projectName?: string | null; status?: number };

const DEFAULT_GIT_REPO = process.env.VERCEL_GIT_REPO || 'reward2learn/tokenizmyapp';

async function fetchVercelProject(projectId: string): Promise<{
  project: VercelProjectGitSnapshot | null;
  status: number;
  body: string;
}> {
  const bearer = await resolveBearerToken();
  // Try with team first, then without — mirrors upsertEnvVar fallbacks.
  for (const teamId of [TEAM_ID, undefined]) {
    const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
    const res = await fetch(
      `${VERCEL_API}/v9/projects/${encodeURIComponent(projectId)}${qs}`,
      { headers: { Authorization: `Bearer ${bearer}` } },
    );
    const body = await res.text().catch(() => '');
    if (res.ok) {
      try {
        return { project: JSON.parse(body) as VercelProjectGitSnapshot, status: res.status, body };
      } catch {
        return { project: null, status: res.status, body };
      }
    }
    if (res.status !== 403 && res.status !== 400) {
      // Keep last non-ok for error reporting; continue only on team-scope mismatches.
      if (teamId === TEAM_ID) continue;
      return { project: null, status: res.status, body };
    }
  }
  return { project: null, status: 404, body: 'Project not found for token/team' };
}

/**
 * Ensure the Vercel project is linked to reward2learn/tokenizmyapp (or VERCEL_GIT_REPO).
 * Deploy hooks require a Git connection.
 */
export async function ensureProjectGitLinked(
  projectId: string,
  repo = DEFAULT_GIT_REPO,
): Promise<{ linked: boolean; alreadyLinked: boolean; error?: string; projectName?: string | null }> {
  const { project, status, body } = await fetchVercelProject(projectId);
  if (!project) {
    return {
      linked: false,
      alreadyLinked: false,
      error: `Could not load Vercel project ${projectId} (${status}): ${body.slice(0, 200)}`,
    };
  }

  const link = project.link;
  const linkedRepo =
    link?.repo && link?.org
      ? `${link.org}/${link.repo}`
      : link?.repo
        ? String(link.repo)
        : null;

  if (linkedRepo) {
    return {
      linked: true,
      alreadyLinked: true,
      projectName: project.name ?? null,
    };
  }

  // No Git link — attach the shared monorepo so deploy hooks can be created.
  try {
    const client = await getVercelClient();
    await withTeamId((teamId) =>
      client.projects.updateProject({
        idOrName: projectId,
        teamId,
        requestBody: {
          gitRepository: { type: 'github' as const, repo },
        } as UpdateProjectRequestBodyWithGit,
      }),
    );
    console.log(`[vercel-deploy] Linked project ${projectId} to GitHub ${repo}`);
    return { linked: true, alreadyLinked: false, projectName: project.name ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      linked: false,
      alreadyLinked: false,
      projectName: project.name ?? null,
      error:
        `Project ${projectId} has no Git repository and auto-link to ${repo} failed: ${msg}. `
        + `Connect Git (reward2learn/tokenizmyapp) in the Vercel project settings, then retry.`,
    };
  }
}

/**
 * Create (or reuse) a Vercel Deploy Hook for a project and return its URL.
 *
 * Uses the same REST endpoints as the Vercel CLI / Terraform provider:
 *   POST /v2/projects/{projectId}/deploy-hooks  body { name, ref }
 *
 * Requires a git-linked project. Reuses any existing hook on the same branch
 * (prefers an exact name match) so Generate is idempotent.
 */
export async function ensureDeployHook(
  projectId: string,
  opts: { name?: string; ref?: string } = {},
): Promise<EnsureDeployHookResult> {
  const name = opts.name || 'DeployHook';
  const ref = opts.ref || 'main';
  const id = projectId.trim();
  if (!id) {
    return { ok: false, error: 'Missing Vercel project id', projectId: id };
  }

  const git = await ensureProjectGitLinked(id);
  if (!git.linked) {
    return {
      ok: false,
      error: git.error || 'Project is not linked to a Git repository',
      projectId: id,
      projectName: git.projectName ?? null,
    };
  }

  try {
    const tokens = await listVercelBearerTokens();
    if (tokens.length === 0) {
      return {
        ok: false,
        error:
          'No Vercel API token available. Set VERCEL_TOKEN (team/personal PAT from '
          + 'https://vercel.com/account/tokens) — Sign-in-with-Vercel OAuth cannot create deploy hooks.',
        projectId: id,
        projectName: git.projectName ?? null,
        status: 401,
      };
    }

    // Re-read project so we see current deployHooks after optional git link.
    const { project, status: getStatus, body: getBody } = await fetchVercelProject(id);
    if (!project) {
      return {
        ok: false,
        error: `Could not re-load Vercel project after git check (${getStatus}): ${getBody.slice(0, 200)}`,
        projectId: id,
        projectName: git.projectName ?? null,
        status: getStatus,
      };
    }

    const listHooks = (p: VercelProjectGitSnapshot | null | undefined): VercelDeployHook[] => {
      const fromLink = p?.link?.deployHooks;
      if (Array.isArray(fromLink) && fromLink.length > 0) return fromLink;
      return Array.isArray(fromLink) ? fromLink : [];
    };

    const pickHook = (hooks: VercelDeployHook[]): VercelDeployHook | undefined =>
      hooks.find((h) => h.ref === ref && h.name === name && h.url)
      ?? hooks.find((h) => h.ref === ref && h.url)
      ?? hooks.find((h) => h.url);

    const existingHooks = listHooks(project);
    const reuse = pickHook(existingHooks);
    if (reuse?.url) {
      console.log(`[vercel-deploy] Reusing deploy hook ${reuse.id} on ${id} (${reuse.name}@${reuse.ref})`);
      return {
        ok: true,
        url: reuse.url,
        id: reuse.id,
        created: false,
        projectId: id,
        projectName: project.name ?? git.projectName ?? null,
      };
    }

    // Try every bearer × teamId combo. OAuth Sign-in tokens commonly 401 on
    // POST /deploy-hooks; a team PAT (VERCEL_TOKEN) usually succeeds.
    let lastStatus = 0;
    let lastBody = '';
    let triedSources: string[] = [];
    for (const { token: bearer, source } of tokens) {
      triedSources.push(source);
      for (const teamId of [TEAM_ID, undefined]) {
        const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
        const res = await fetch(
          `${VERCEL_API}/v2/projects/${encodeURIComponent(id)}/deploy-hooks${qs}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${bearer}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, ref }),
          },
        );
        lastStatus = res.status;
        lastBody = await res.text().catch(() => '');
        if (!res.ok) {
          console.warn(
            `[vercel-deploy] deploy-hook create ${res.status} via ${source}`
            + `${teamId ? '+team' : ''} for ${id}: ${lastBody.slice(0, 160)}`,
          );
          // Try next teamId / next token on auth / scope failures.
          if (res.status === 401 || res.status === 403) continue;
          if (res.status === 400 && teamId === TEAM_ID) continue;
          // Non-auth errors (e.g. not git-linked) — stop this token.
          break;
        }

        let updated: VercelProjectGitSnapshot | null = null;
        try {
          updated = JSON.parse(lastBody) as VercelProjectGitSnapshot;
        } catch {
          updated = null;
        }

        let created = pickHook(listHooks(updated));
        if (!created?.url) {
          const refetch = await fetchVercelProject(id);
          created = pickHook(listHooks(refetch.project));
        }

        if (!created?.url) {
          return {
            ok: false,
            error: 'Deploy hook was created but Vercel did not return a URL in link.deployHooks',
            projectId: id,
            projectName: project.name ?? updated?.name ?? null,
            status: res.status,
          };
        }

        console.log(`[vercel-deploy] Deploy hook created for ${id}: ${created.id} (via ${source})`);
        return {
          ok: true,
          url: created.url,
          id: created.id,
          created: true,
          projectId: id,
          projectName: project.name ?? updated?.name ?? git.projectName ?? null,
        };
      }
    }

    const sources = triedSources.join('+') || 'none';
    const authHint =
      lastStatus === 401 || lastStatus === 403
        ? (
            ' Sign-in-with-Vercel OAuth cannot create deploy hooks. '
            + 'Create a team token at https://vercel.com/account/tokens '
            + '(scope: the team that owns this project) and set VERCEL_TOKEN on the factory deployment, then retry Generate.'
          )
        : '';

    return {
      ok: false,
      error:
        `Vercel refused deploy-hook create (${lastStatus}) with token(s) [${sources}]: `
        + `${lastBody.slice(0, 240) || 'no body'}. `
        + `Confirm project ${id} is linked to ${DEFAULT_GIT_REPO}.${authHint}`,
      projectId: id,
      projectName: project.name ?? git.projectName ?? null,
      status: lastStatus,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      projectId: id,
      projectName: git.projectName ?? null,
    };
  }
}

/**
 * Snapshot of a Vercel project's git + deploy-hook state for the ops UI /
 * Generate flow. Captures the "knowledge base" operators need: project id/name,
 * linked repo, existing hooks, and how `git.deploymentEnabled` / `github.enabled`
 * interact with Deploy Hooks.
 *
 * Important (from Vercel docs):
 * - `git.deploymentEnabled` in vercel.json controls auto-deploy on git push.
 * - `github.enabled: false` (legacy) ALSO blocks Deploy Hooks from firing.
 * - Suite apps on a shared monorepo should usually keep Git linked, use Deploy
 *   Hooks for intentional deploys, and prefer Ignored Build Step (or selective
 *   `git.deploymentEnabled` branch rules) — never `github.enabled: false`.
 */
export type VercelProjectKnowledge = {
  projectId: string;
  projectName: string | null;
  git: {
    linked: boolean;
    repo: string | null;
    type: string | null;
    productionBranch: string | null;
  };
  deployHooks: Array<{ id: string; name: string; ref: string; url: string }>;
  recommendations: {
    sharedRepo: string;
    /** Keep false — github.enabled:false disables deploy hooks. */
    avoidGithubEnabledFalse: true;
    /**
     * Suggested vercel.json snippet for suite apps that should NOT auto-deploy
     * every push on non-production branches (repo-level; shared by all projects
     * using the same vercel.json unless they have a different root).
     */
    suggestedGitDeploymentEnabled: {
      git: { deploymentEnabled: { main: true; 'dev': false; 'internal-*': false } };
    };
    notes: string[];
  };
};

export async function getVercelProjectKnowledge(
  projectId: string,
): Promise<{ ok: true; data: VercelProjectKnowledge } | { ok: false; error: string }> {
  const id = projectId.trim();
  if (!id) return { ok: false, error: 'Missing project id' };

  const { project, status, body } = await fetchVercelProject(id);
  if (!project) {
    return { ok: false, error: `Could not load project ${id} (${status}): ${body.slice(0, 200)}` };
  }

  const link = project.link;
  const repo =
    link?.repo && link?.org
      ? `${link.org}/${link.repo}`
      : link?.repo
        ? String(link.repo)
        : null;

  const hooks = (link?.deployHooks ?? []).map((h) => ({
    id: h.id,
    name: h.name,
    ref: h.ref,
    url: h.url,
  }));

  // productionBranch is often on link; tolerate absence.
  const productionBranch =
    (link as { productionBranch?: string } | null | undefined)?.productionBranch
    ?? null;

  return {
    ok: true,
    data: {
      projectId: project.id,
      projectName: project.name ?? null,
      git: {
        linked: Boolean(repo),
        repo,
        type: link?.type ?? null,
        productionBranch,
      },
      deployHooks: hooks,
      recommendations: {
        sharedRepo: DEFAULT_GIT_REPO,
        avoidGithubEnabledFalse: true,
        suggestedGitDeploymentEnabled: {
          git: {
            deploymentEnabled: {
              main: true,
              dev: false,
              'internal-*': false,
            },
          },
        },
        notes: [
          `Link this project to ${DEFAULT_GIT_REPO} (GitHub) so Deploy Hooks can be created.`,
          'Do not set github.enabled=false in vercel.json — that blocks Deploy Hooks.',
          'git.deploymentEnabled controls push auto-deploys only; Deploy Hooks remain the intentional trigger for suite apps.',
          'Create hooks via Generate (needs VERCEL_TOKEN team PAT) or paste a hook URL from Vercel → Project → Settings → Git → Deploy Hooks.',
        ],
      },
    },
  };
}


// ── Git-based deployment ─────────────────────────────────────

const GIT_REPO = process.env.VERCEL_GIT_REPO || 'reward2learn/tokenizmyapp';

/** Tenant Vercel build — survives Neon cold starts via wait-for-postgres.mjs. */
const TENANT_BUILD_COMMAND =
  'npx zenstack generate --schema zenstack/schema.zmodel'
  + ' && (node scripts/wait-for-postgres.mjs zenstack/prisma/schema.prisma'
  + ' && npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss || true)'
  + ' && npx next build';

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
          buildCommand: TENANT_BUILD_COMMAND,
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

/**
 * Detach a custom domain from a Vercel project.
 *
 * Removes the domain from the project only — it does not release or transfer
 * the domain itself, so the customer keeps ownership and can re-point it after
 * paying. Used by billing when a plan lapses (see the dunning path in
 * stripe-webhook-service.ts).
 *
 * Idempotent: a domain that is already absent counts as success, so retrying a
 * partially-completed downgrade is safe.
 */
export async function removeVercelDomain(
  projectId: string,
  domain: string,
): Promise<{ removed: boolean; reason?: string }> {
  const client = await getVercelClient();
  try {
    await withTeamId((teamId) =>
      client.projects.removeProjectDomain({ idOrName: projectId, domain, teamId }),
    );
    console.log(`[vercel-deploy] Removed domain ${domain} from ${projectId}`);
    return { removed: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('404')) {
      // Already gone, or the project no longer exists. Either way there is
      // nothing left to detach.
      return { removed: true, reason: 'not_found' };
    }
    console.warn(`[vercel-deploy] Failed to remove domain ${domain} from ${projectId}: ${message}`);
    return { removed: false, reason: message };
  }
}

/**
 * Detach every non-`.vercel.app` domain from a project.
 *
 * The auto-assigned `*.vercel.app` subdomain is deliberately kept: it is what
 * the app is actually served on, and removing it would take a downgraded
 * customer's site offline entirely rather than just removing the paid custom
 * domain feature.
 */
export async function removeCustomDomains(
  projectId: string,
): Promise<{ removed: string[]; failed: string[] }> {
  const domains = await getVercelDomains(projectId);
  const removed: string[] = [];
  const failed: string[] = [];

  for (const { name } of domains) {
    if (name.endsWith('.vercel.app')) continue;
    const result = await removeVercelDomain(projectId, name);
    if (result.removed) removed.push(name);
    else failed.push(name);
  }

  return { removed, failed };
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
