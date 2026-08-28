/**
 * GET /api/admin/tenants/[slug]/deploy/status
 *
 * Checks the Vercel deployment status for a tenant's project.
 * Returns the latest production deployment state.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { VERCEL_TEAM_ID } from '@/lib/vercel-team';

const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = VERCEL_TEAM_ID;

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const token = process.env.VERCEL_TOKEN;

  if (!token) {
    return jsonError('VERCEL_TOKEN not configured', 503);
  }

  try {
    // Try to find the project by slug name
    const projectRes = await fetch(
      `${VERCEL_API}/v10/projects/${slug}?teamId=${TEAM_ID}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!projectRes.ok) {
      return jsonOk({
        state: 'NOT_FOUND',
        slug,
        note: 'No Vercel project found for this tenant. Deploy first.',
      });
    }

    const project = await projectRes.json() as { id: string; name: string };

    // Get latest production deployment
    const deployRes = await fetch(
      `${VERCEL_API}/v6/deployments?projectId=${project.id}&target=production&limit=1&teamId=${TEAM_ID}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!deployRes.ok) {
      return jsonOk({
        state: 'NO_DEPLOYMENTS',
        projectId: project.id,
        slug,
        note: 'Project exists but no production deployments yet.',
      });
    }

    const deployData = await deployRes.json() as {
      deployments?: Array<{
        uid: string;
        name: string;
        state: string;
        url?: string;
        createdAt?: number;
        readyAt?: number;
      }>;
    };

    const latest = deployData.deployments?.[0];

    if (!latest) {
      return jsonOk({
        state: 'NO_DEPLOYMENTS',
        projectId: project.id,
        slug,
        note: 'No deployments found.',
      });
    }

    // Fetch error details if deployment failed
    let errorInfo = undefined;
    if (latest.state === 'ERROR' || latest.state === 'CANCELED') {
      try {
        const evRes = await fetch(
          `${VERCEL_API}/v1/deployments/${latest.uid}/events?teamId=${TEAM_ID}&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (evRes.ok) {
          const evData = await evRes.json() as Array<{ text: string; created: number }> | { events: Array<{ text: string; created: number }> };
          const events = Array.isArray(evData) ? evData : (evData as { events: Array<{ text: string; created: number }> }).events || [];
          errorInfo = events.slice(-5).map((e) => e.text).filter(Boolean).join(' | ');
        }
      } catch {
        // non-critical: deployment event details are best-effort
      }
    }

    return jsonOk({
      state: latest.state,
      projectId: project.id,
      deploymentId: latest.uid,
      appUrl: `https://${slug}.vercel.app`,
      createdAt: latest.createdAt,
      readyAt: latest.readyAt,
      slug,
      errorInfo: errorInfo || undefined,
      note: latest.state === 'ERROR'
        ? 'Deployment build failed. Check the last build errors above. Common issues: missing workspace, wrong rootDirectory, or missing env vars.'
        : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[deploy:status] Error for ${slug}:`, message);
    return jsonError(`Status check failed: ${message}`, 500);
  }
}
