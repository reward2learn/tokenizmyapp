/**
 * GET /api/admin/tenants/[slug]/deploy/status
 *
 * Checks the Vercel deployment status for a tenant's project.
 * Returns the latest production deployment state.
 *
 * Resolution order:
 *  1. vercel_project_id from the tenants table (stored by deploy flow)
 *  2. Lookup by slug name via Vercel projects API
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { VERCEL_TEAM_ID } from '@/lib/vercel-team';
import { createRawClient } from '@/lib/db';

const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = VERCEL_TEAM_ID;

export const dynamic = 'force-dynamic';

/** Fetch latest deployment by project ID. */
async function fetchLatestDeployment(
  projectId: string,
  token: string,
): Promise<{ uid: string; name: string; state: string; url?: string; createdAt?: number; readyAt?: number } | null> {
  const url = new URL(`${VERCEL_API}/v7/deployments`);
  url.searchParams.set('projectId', projectId);
  url.searchParams.set('limit', '1');
  if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.warn(`[deploy:status] Vercel API ${res.status} for project ${projectId}: ${errBody.slice(0, 300)}`);

    // Retry without teamId — token may already be team-scoped
    if (TEAM_ID) {
      const retryUrl = new URL(`${VERCEL_API}/v7/deployments`);
      retryUrl.searchParams.set('projectId', projectId);
      retryUrl.searchParams.set('limit', '1');
      const retryRes = await fetch(retryUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (retryRes.ok) {
        const retryData = await retryRes.json() as {
          deployments?: Array<{ uid: string; name: string; state: string; url?: string; createdAt?: number; readyAt?: number }>;
        };
        return retryData.deployments?.[0] ?? null;
      }
      console.warn(`[deploy:status] Retry without teamId also failed: ${retryRes.status}`);
    }
    return null;
  }

  const data = await res.json() as {
    deployments?: Array<{ uid: string; name: string; state: string; url?: string; createdAt?: number; readyAt?: number }>;
  };
  return data.deployments?.[0] ?? null;
}

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
    // ── Step 1: Check if the tenant has a stored vercel_project_id ──
    const db = createRawClient();
    let projectId: string | null = null;
    try {
      const rows = await db.$queryRawUnsafe(
        `SELECT vercel_project_id FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
      ) as { vercel_project_id: string | null }[];
      projectId = rows[0]?.vercel_project_id ?? null;
    } catch {
      // non-critical — fall through to name-based lookup
    }

    // ── Step 2: If no stored project ID, try lookup by slug name ──
    if (!projectId) {
      // Try with team scope first, then fall back to personal scope
      const teamUrl = `${VERCEL_API}/v10/projects/${slug}?teamId=${TEAM_ID}`;
      let projectRes = await fetch(teamUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fallback: try without teamId (personal token scope)
      if (!projectRes.ok) {
        const personalUrl = `${VERCEL_API}/v10/projects/${slug}`;
        projectRes = await fetch(personalUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!projectRes.ok) {
        return jsonOk({
          state: 'NOT_FOUND',
          slug,
          note: 'No Vercel project found for this tenant. Deploy first.',
        });
      }

      const project = await projectRes.json() as { id: string; name: string };
      projectId = project.id;

      // Persist for future calls
      try {
        await db.$executeRawUnsafe(
          `UPDATE tenants SET vercel_project_id = $1, updated_at = CURRENT_TIMESTAMP WHERE slug = $2 AND vercel_project_id IS NULL;`,
          projectId, slug,
        );
      } catch {
        // non-critical — best-effort persist
      }
    }

    // ── Step 3: Fetch latest production deployment by project ID ──
    const latest = await fetchLatestDeployment(projectId, token);

    if (!latest) {
      return jsonOk({
        state: 'NO_DEPLOYMENTS',
        projectId,
        slug,
        note: 'Project exists but no production deployments yet.',
      });
    }

    // Fetch error details if deployment failed
    let errorInfo = undefined;
    if (latest.state === 'ERROR' || latest.state === 'CANCELED') {
      try {
        const url = new URL(`${VERCEL_API}/v1/deployments/${latest.uid}/events`);
        url.searchParams.set('limit', '5');
        if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID);

        const evRes = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      projectId,
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
