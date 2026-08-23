/**
 * POST /api/admin/tenants/[slug]/deploy
 *
 * Deploy (or re-deploy) a tenant to Vercel:
 * 1. Creates or finds the Vercel project (via ensureVercelProject)
 * 2. Syncs all environment variables from the tenant config
 * 3. Assigns the domain
 * 4. Triggers a production deployment
 *
 * Uses the vercel-deploy-service which handles OAuth token resolution,
 * project creation, env var syncing, and deployment triggering.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { deployTenant, deployTenantWithGit, ensureVercelProject } from '@/domain/tenant/vercel-deploy-service';
import { seedTenantAdminDefaults } from '@/domain/tenant/tenant-service';
import { redeploySuiteApps } from '@/domain/workflow/suite-provisioning';
import { DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/persons';

const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';

/**
 * Poll Vercel deployment status in the background until it reaches 'READY'.
 * Updates the tenant record to 'live' once deployment succeeds.
 * Runs asynchronously after the HTTP response is sent.
 */
async function pollDeploymentUntilReady(
  projectId: string,
  slug: string,
  vercelToken: string,
): Promise<void> {
  const maxAttempts = 120; // 120 * 15s = 30 minutes max
  const db = (await import('@/lib/db')).createRawClient();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, 15000)); // poll every 15 seconds

    try {
      // List recent deployments to find the latest production one
      const url = new URL(`${VERCEL_API}/v6/deployments`);
      url.searchParams.set('projectId', projectId);
      url.searchParams.set('limit', '1');
      url.searchParams.set('target', 'production');
      if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${vercelToken}` },
      });

      if (!res.ok) {
        console.warn(`[deploy:poll] Attempt ${attempt + 1}: Vercel API returned ${res.status}`);
        continue;
      }

      const data = await res.json() as { deployments?: Array<{ id: string; name: string; state: string; url?: string }> };
      const latest = data.deployments?.[0];

      if (!latest) {
        console.log(`[deploy:poll] Attempt ${attempt + 1}: No deployments found yet for ${slug}`);
        continue;
      }

      console.log(`[deploy:poll] ${slug} deployment state: ${latest.state}`);

      if (latest.state === 'READY') {
        console.log(`[deploy:poll] ${slug} deployment READY! Updating status to live.`);
        await db.$executeRawUnsafe(
          `UPDATE tenants SET status = 'live', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug,
        );
        return;
      }

      if (latest.state === 'ERROR' || latest.state === 'CANCELED') {
        console.error(`[deploy:poll] ${slug} deployment failed with state: ${latest.state}`);
        await db.$executeRawUnsafe(
          `UPDATE tenants SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug,
        );
        return;
      }

      // 'BUILDING', 'QUEUED', 'INITIALIZING' — keep polling
    } catch (pollErr) {
      console.warn(`[deploy:poll] Attempt ${attempt + 1} error for ${slug}:`, pollErr);
      // Continue polling despite transient errors
    }
  }

  // Timeout — set status to error
  console.error(`[deploy:poll] ${slug} deployment timed out after ${maxAttempts * 15}s`);
  try {
    await db.$executeRawUnsafe(
      `UPDATE tenants SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug,
    );
  } catch {
    // non-critical: timeout state already logged above; nothing more to do
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: { template?: string; metadata?: Record<string, unknown>; gitSource?: boolean; vercelProjectId?: string };
  try { body = await request.json(); } catch {
    body = {};
  }

  const db = createRawClient();

  try {
    // Fetch the tenant record from DB to get displayName
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      return jsonError(`Tenant "${slug}" not found`, 404);
    }

    const tenant = rows[0] as Record<string, unknown>;

    // Resolve Vercel API token
    const metadata = (tenant.metadata as Record<string, unknown>) || {};
    const vercelToken = (metadata.vercelToken as string) || process.env.VERCEL_TOKEN || '';
    if (!vercelToken) {
      return jsonError('Vercel token not configured. Set VERCEL_TOKEN env var.', 400);
    }

    // Resolve Vercel project ID: body vercelProjectId > stored on tenant > deploy hook URL
    const storedProjectId = (tenant.vercel_project_id as string) || undefined;

    // Priority 1: vercelProjectId from request body (user set it in the wizard)
    const bodyProjectId = (body.vercelProjectId as string) || undefined;

    // Priority 2: Try to extract project ID from deploy hook URL — check request body first, then stored metadata
    const bodyMetadata = (body.metadata as Record<string, unknown>) || {};
    const bodyHooks = (bodyMetadata.hooks as Record<string, unknown>) || {};
    const bodyHookUrl = (bodyHooks.deployHookUrl as string) || '';
    const storedHooks = (metadata.hooks as Record<string, unknown>) || {};
    const storedHookUrl = (storedHooks.deployHookUrl as string) || '';
    const deployHookUrl = bodyHookUrl || storedHookUrl;
    // Extract project ID from deploy hook URL: https://api.vercel.com/v1/integrations/deploy/{projectId}/{hookId}
    const hookProjectId = deployHookUrl
      ? (deployHookUrl.match(/\/deploy\/(prj_[^/]+)/)?.[1] ?? undefined)
      : undefined;

    // Resolution order: body vercelProjectId > stored on tenant > extracted from deploy hook URL
    const resolvedProjectId = bodyProjectId || storedProjectId || hookProjectId || undefined;

    // Step 1: Ensure Vercel project exists (creates if not found)
    const { projectId, created } = await ensureVercelProject({ slug, projectId: resolvedProjectId });

    // Always ensure vercel_project_id is set on the tenant record,
    // even if the project already existed (the tenant may have been
    // created without a vercel_project_id in a previous run).
    await db.$executeRawUnsafe(
      `UPDATE tenants SET vercel_project_id = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
      projectId, slug,
    );

    // Step 2: Deploy — sync env vars, assign domain
    // Use Git-based deployment if requested, otherwise standard deployment
    const useGit = body.gitSource === true;
    const vercelProjectId = storedProjectId || projectId;
    // This tenant's own dedicated database — every deploy of it (and of its
    // suite apps, elsewhere) must point POSTGRES_URL here, never silently
    // fall back to the platform root's own connection string.
    const tenantDbUrl =
      (tenant.db_url as string | undefined) ||
      ((metadata.config as Record<string, unknown> | undefined)?.database as { databaseUrl?: string } | undefined)?.databaseUrl;
    const result = useGit
      ? await deployTenantWithGit({
          slug,
          displayName: (tenant.display_name as string) || slug,
          template: body.template || (tenant.template as string) || 'default',
          primaryColor: (tenant.primary_color as string) || '#eb3d28',
          secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
          dbUrl: tenantDbUrl ? { pooled: tenantDbUrl } : null,
          metadata: body.metadata || ((tenant.metadata as Record<string, unknown>) || {}),
          projectId: vercelProjectId,
        })
      : await deployTenant({
          slug,
          displayName: (tenant.display_name as string) || slug,
          template: body.template || (tenant.template as string) || 'default',
          primaryColor: (tenant.primary_color as string) || '#eb3d28',
          secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
          dbUrl: tenantDbUrl ? { pooled: tenantDbUrl } : null,
          metadata: body.metadata || ((tenant.metadata as Record<string, unknown>) || {}),
          projectId: vercelProjectId,
        });

    // Step 2b: Seed dedicated platform-admin email into tenant Neon DB
    const adminSeed = await seedTenantAdminDefaults(
      tenantDbUrl,
      slug,
      (metadata.adminEmail as string) ||
        (guard.session.email as string) ||
        DEFAULT_PLATFORM_ADMIN_EMAIL,
      body.template || (tenant.template as string) || 'default',
    );

    // Step 3: Update tenant status to deploying immediately
    await db.$executeRawUnsafe(
      `UPDATE tenants SET status = 'deploying', app_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
      result.appUrl, slug,
    );

    // Step 4: In the background, poll Vercel deployment status until 'READY'
    //          then update tenant status to 'live'. This runs after the response
    //          is sent so the user can close the modal immediately.
    pollDeploymentUntilReady(projectId, slug, vercelToken).catch((pollErr) => {
      console.error(`[deploy] Background polling failed for ${slug}:`, pollErr);
    });

    // Step 5: Suite mode — re-deploy every suite app server-side (non-blocking).
    //         The tenant-level project above is the suite container; each app
    //         has its OWN Vercel project that must be re-deployed too.
    //         redeploySuiteApps skips Neon (apps already have DBs) and
    //         re-deploys each app's own project, updating per-app status
    //         (deploying → live/error) on metadata.config.appPack.
    const suiteCfg = (metadata.config as Record<string, unknown> | undefined) ?? undefined;
    const suiteAppPack = suiteCfg?.appPack as { apps?: unknown[] } | undefined;
    const isSuiteTenant = !!suiteAppPack && Array.isArray(suiteAppPack.apps) && suiteAppPack.apps.length > 0;
    const suiteRedeploy: { triggered: boolean; totalApps?: number } = { triggered: false };
    if (isSuiteTenant) {
      suiteRedeploy.triggered = true;
      suiteRedeploy.totalApps = suiteAppPack!.apps!.length;
      redeploySuiteApps(slug)
        .then((res) => {
          console.log(
            `[deploy] Suite re-deploy complete for "${slug}": ${res.successful.length}/${res.totalApps} apps succeeded` +
            (res.errors.length ? `, ${res.errors.length} failed` : ''),
          );
        })
        .catch((suiteErr) => {
          console.error(
            `[deploy] Suite re-deploy failed for "${slug}":`,
            suiteErr instanceof Error ? suiteErr.message : String(suiteErr),
          );
        });
    }

    return jsonOk({
      deployed: true,
      projectId: result.projectId,
      projectCreated: created,
      projectName: result.projectName,
      appUrl: result.appUrl,
      envCount: result.envCount,
      vercelDashboardUrl: result.vercelDashboardUrl,
      status: 'deploying',
      deployMode: useGit ? 'git' : 'standard',
      gitRepo: useGit ? (process.env.VERCEL_GIT_REPO || 'reward2learn/Rosalita') : undefined,
      adminSeed,
      suiteRedeploy,
      note: useGit
        ? 'Git-based deployment triggered from main branch. Tenant status will update to live when ready.'
        : 'Deployment is building in the background. Tenant status will update to live when ready.',
    });
  } catch (err) {
    // Update status to error if deploy setup fails
    try {
      await db.$executeRawUnsafe(
        `UPDATE tenants SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug,
      );
    } catch {
      // non-critical: status update is best-effort; original error is reported below
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[deploy] POST /${slug} error:`, message);
    return jsonError(`Deploy failed: ${message}`, 500);
  }
}
