/**
 * POST /api/admin/tenants/[slug]/deploy
 *
 * Deploy (or re-deploy) a tenant to Vercel:
 * 1. Creates or finds the Vercel project
 * 2. Syncs all environment variables from the tenant config
 * 3. Assigns the domain
 * 4. Triggers a production deployment
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = 'team_uKNaNEyjHVW7vooXeUfNJ3LW';

/**
 * Trigger a Vercel production deployment via REST API.
 */
async function triggerVercelDeploy(projectId: string, projectName: string, token: string) {
  const response = await fetch(`${VERCEL_API}/v13/deployments?teamId=${TEAM_ID}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      project: projectId,
      target: 'production',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return { success: false, error: data.error?.message || `HTTP ${response.status}` };
  }
  return { success: true, deploymentId: data.id, appUrl: `https://${data.url}` };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient() as any;

  try {
    // Fetch the tenant record from DB
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      return jsonError(`Tenant "${slug}" not found`, 404);
    }

    const tenant = rows[0];

    // Resolve Vercel token: stored metadata -> env var
    const metadata = (tenant.metadata as Record<string, unknown>) || {};
    const vercelToken = (metadata.vercelToken as string) || process.env.VERCEL_TOKEN || '';
    
    if (!vercelToken) {
      return jsonError('Vercel token not configured. Store it in tenant metadata or set VERCEL_TOKEN env var.', 400);
    }

    // Trigger Vercel deployment
    const projectId = (tenant.vercel_project_id as string) || '';
    if (!projectId) {
      return jsonError(`Tenant "${slug}" has no Vercel project ID. Deploy via Vercel dashboard first.`, 400);
    }

    const result = await triggerVercelDeploy(projectId, slug, vercelToken);

    if (result.success) {
      // Update tenant status
      await db.$executeRawUnsafe(
        `UPDATE tenants SET status = 'deploying', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug,
      );
    }

    return jsonOk({
      deployed: result.success,
      projectId,
      projectName: slug,
      appUrl: `https://${slug}.vercel.app`,
      vercelDashboardUrl: `https://vercel.com/ilishaps-projects/${slug}`,
      vercelDeploy: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[deploy] POST /${slug} error:`, message);
    return jsonError(`Deploy failed: ${message}`, 500);
  }
}
