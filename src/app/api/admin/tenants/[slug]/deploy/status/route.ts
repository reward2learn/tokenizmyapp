/**
 * GET /api/admin/tenants/[slug]/deploy/status
 *
 * Checks the Vercel deployment status for a tenant's project.
 * Returns the latest production deployment state.
 *
 * Resolution order:
 *  1. vercel_project_id from the tenants table (stored by deploy flow)
 *  2. Lookup by slug name via Vercel projects API
 *
 * Token resolution:
 *  Tries all available bearer tokens (PAT → OAuth) with team scope first,
 *  then without team scope on 403/404.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { VERCEL_TEAM_ID } from '@/lib/vercel-team';
import { createRawClient } from '@/lib/db';
import { listVercelBearerTokens } from '@/domain/tenant/vercel-sdk-client';

const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = VERCEL_TEAM_ID;

export const dynamic = 'force-dynamic';

type DeployEntry = { uid: string; name: string; state: string; url?: string; createdAt?: number; readyAt?: number };

/**
 * Try fetching deployments with a given token, trying team scope then personal scope.
 */
async function fetchLatestWithToken(
  projectId: string,
  token: string,
): Promise<DeployEntry | null> {
  // Try with team scope first
  const teamUrl = new URL(`${VERCEL_API}/v7/deployments`);
  teamUrl.searchParams.set('projectId', projectId);
  teamUrl.searchParams.set('limit', '1');
  if (TEAM_ID) teamUrl.searchParams.set('teamId', TEAM_ID);

  const res = await fetch(teamUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json() as { deployments?: DeployEntry[] };
    return data.deployments?.[0] ?? null;
  }

  // 403/404 → retry without teamId
  if (res.status === 403 || res.status === 404) {
    const personalUrl = new URL(`${VERCEL_API}/v7/deployments`);
    personalUrl.searchParams.set('projectId', projectId);
    personalUrl.searchParams.set('limit', '1');

    const retryRes = await fetch(personalUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (retryRes.ok) {
      const retryData = await retryRes.json() as { deployments?: DeployEntry[] };
      return retryData.deployments?.[0] ?? null;
    }
  }

  return null;
}

/**
 * Try fetching latest deployment across all available bearer tokens.
 */
async function fetchLatestDeployment(projectId: string): Promise<DeployEntry | null> {
  const candidates = await listVercelBearerTokens();
  for (const { token, source } of candidates) {
    const result = await fetchLatestWithToken(projectId, token);
    if (result) {
      console.log(`[deploy:status] Got deployment via ${source} for project ${projectId}`);
      return result;
    }
    console.warn(`[deploy:status] ${source} token failed for project ${projectId}, trying next...`);
  }
  return null;
}

/**
 * Try fetching project by slug across all available bearer tokens.
 */
async function fetchProjectBySlug(slug: string): Promise<{ id: string; name: string } | null> {
  const candidates = await listVercelBearerTokens();
  for (const { token, source } of candidates) {
    // Try with team scope first
    const teamUrl = `${VERCEL_API}/v10/projects/${slug}?teamId=${TEAM_ID}`;
    let res = await fetch(teamUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      console.log(`[deploy:status] Found project via ${source} (team scope) for slug ${slug}`);
      return res.json() as Promise<{ id: string; name: string }>;
    }

    // Try without team scope
    if (res.status === 403 || res.status === 404) {
      const personalUrl = `${VERCEL_API}/v10/projects/${slug}`;
      res = await fetch(personalUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        console.log(`[deploy:status] Found project via ${source} (personal scope) for slug ${slug}`);
        return res.json() as Promise<{ id: string; name: string }>;
      }
    }
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

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
      const project = await fetchProjectBySlug(slug);
      if (!project) {
        return jsonOk({
          state: 'NOT_FOUND',
          slug,
          note: 'No Vercel project found for this tenant. Deploy first.',
        });
      }

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
    const latest = await fetchLatestDeployment(projectId);

    if (!latest) {
      return jsonOk({
        state: 'NO_DEPLOYMENTS',
        projectId,
        slug,
        note: 'Project exists but no production deployments yet. Check that VERCEL_TOKEN has access to the project\'s team scope.',
      });
    }

    // Fetch error details if deployment failed
    let errorInfo = undefined;
    if (latest.state === 'ERROR' || latest.state === 'CANCELED') {
      const candidates = await listVercelBearerTokens();
      for (const { token } of candidates) {
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
            break;
          }
        } catch {
          // non-critical: deployment event details are best-effort
        }
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
