/**
 * POST /api/admin/vercel/hot-deploy
 *
 * Redeploy only apps registered in the tenants DB (vercel_project_id /
 * suite vercelProjectId). Unregistered Vercel team projects are returned
 * for ops visibility and are never redeployed by this endpoint.
 */

import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { hotDeployRegisteredApps } from '@/domain/tenant/vercel-hot-deploy-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  try {
    const result = await hotDeployRegisteredApps();
    return jsonOk(result);
  } catch (err) {
    return jsonError(
      `Hot deploy failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  try {
    const { listRegisteredDeployTargets, listVercelTeamProjects } = await import(
      '@/domain/tenant/vercel-hot-deploy-service'
    );
    const [registered, teamProjects] = await Promise.all([
      listRegisteredDeployTargets(),
      listVercelTeamProjects(),
    ]);
    const registeredIds = new Set(registered.map((r) => r.projectId));
    return jsonOk({
      registered,
      unregisteredOnVercel: teamProjects.filter((p) => !registeredIds.has(p.id)),
      teamProjectCount: teamProjects.length,
    });
  } catch (err) {
    return jsonError(
      `Inventory failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
