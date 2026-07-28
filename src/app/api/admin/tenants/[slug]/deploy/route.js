import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { deployTenant, deployTenantWithGit, ensureVercelProject } from '@/domain/tenant/vercel-deploy-service';
const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';
/**
 * Poll Vercel deployment status in the background until it reaches 'READY'.
 * Updates the tenant record to 'live' once deployment succeeds.
 * Runs asynchronously after the HTTP response is sent.
 */
async function pollDeploymentUntilReady(projectId, slug, vercelToken) {
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
            if (TEAM_ID)
                url.searchParams.set('teamId', TEAM_ID);
            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${vercelToken}` },
            });
            if (!res.ok) {
                console.warn(`[deploy:poll] Attempt ${attempt + 1}: Vercel API returned ${res.status}`);
                continue;
            }
            const data = await res.json();
            const latest = data.deployments?.[0];
            if (!latest) {
                console.log(`[deploy:poll] Attempt ${attempt + 1}: No deployments found yet for ${slug}`);
                continue;
            }
            console.log(`[deploy:poll] ${slug} deployment state: ${latest.state}`);
            if (latest.state === 'READY') {
                console.log(`[deploy:poll] ${slug} deployment READY! Updating status to live.`);
                await db.$executeRawUnsafe(`UPDATE tenants SET status = 'live', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug);
                return;
            }
            if (latest.state === 'ERROR' || latest.state === 'CANCELED') {
                console.error(`[deploy:poll] ${slug} deployment failed with state: ${latest.state}`);
                await db.$executeRawUnsafe(`UPDATE tenants SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug);
                return;
            }
            // 'BUILDING', 'QUEUED', 'INITIALIZING' — keep polling
        }
        catch (pollErr) {
            console.warn(`[deploy:poll] Attempt ${attempt + 1} error for ${slug}:`, pollErr);
            // Continue polling despite transient errors
        }
    }
    // Timeout — set status to error
    console.error(`[deploy:poll] ${slug} deployment timed out after ${maxAttempts * 15}s`);
    try {
        await db.$executeRawUnsafe(`UPDATE tenants SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug);
    }
    catch { }
}
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
export async function POST(request, { params }) {
    const guard = await requireWriteAuth(request);
    if (!guard.ok)
        return guard.response;
    const { slug } = await params;
    let body;
    try {
        body = await request.json();
    }
    catch {
        body = {};
    }
    const db = createRawClient();
    try {
        // Fetch the tenant record from DB to get displayName
        const rows = await db.$queryRawUnsafe(`SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug);
        if (rows.length === 0) {
            return jsonError(`Tenant "${slug}" not found`, 404);
        }
        const tenant = rows[0];
        // Resolve Vercel API token
        const metadata = tenant.metadata || {};
        const vercelToken = metadata.vercelToken || process.env.VERCEL_TOKEN || '';
        if (!vercelToken) {
            return jsonError('Vercel token not configured. Set VERCEL_TOKEN env var.', 400);
        }
        // Step 1: Ensure Vercel project exists (creates if not found)
        const { projectId, created } = await ensureVercelProject({ slug });
        // Update tenant record with project ID if it was just created
        if (created) {
            await db.$executeRawUnsafe(`UPDATE tenants SET vercel_project_id = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`, projectId, slug);
        }
        // Step 2: Deploy — sync env vars, assign domain
        // Use Git-based deployment if requested, otherwise standard deployment
        const useGit = body.gitSource === true;
        const result = useGit
            ? await deployTenantWithGit({
                slug,
                displayName: tenant.display_name || slug,
                template: body.template || tenant.template || 'default',
                primaryColor: tenant.primary_color || '#eb3d28',
                secondaryColor: tenant.secondary_color || '#0af9fe',
                metadata: body.metadata || (tenant.metadata || {}),
            })
            : await deployTenant({
                slug,
                displayName: tenant.display_name || slug,
                template: body.template || tenant.template || 'default',
                primaryColor: tenant.primary_color || '#eb3d28',
                secondaryColor: tenant.secondary_color || '#0af9fe',
                metadata: body.metadata || (tenant.metadata || {}),
            });
        // Step 3: Update tenant status to deploying immediately
        await db.$executeRawUnsafe(`UPDATE tenants SET status = 'deploying', app_url = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`, result.appUrl, slug);
        // Step 4: In the background, poll Vercel deployment status until 'READY'
        //          then update tenant status to 'live'. This runs after the response
        //          is sent so the user can close the modal immediately.
        pollDeploymentUntilReady(projectId, slug, vercelToken).catch((pollErr) => {
            console.error(`[deploy] Background polling failed for ${slug}:`, pollErr);
        });
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
            note: useGit
                ? 'Git-based deployment triggered from main branch. Tenant status will update to live when ready.'
                : 'Deployment is building in the background. Tenant status will update to live when ready.',
        });
    }
    catch (err) {
        // Update status to error if deploy setup fails
        try {
            await db.$executeRawUnsafe(`UPDATE tenants SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug);
        }
        catch { }
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[deploy] POST /${slug} error:`, message);
        return jsonError(`Deploy failed: ${message}`, 500);
    }
}
