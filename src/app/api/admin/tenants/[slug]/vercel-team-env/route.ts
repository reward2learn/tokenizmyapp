/**
 * Vercel Team Env Push — Save Changes from Deploy Hooks / Vercel settings step
 *
 * POST /api/admin/tenants/[slug]/vercel-team-env
 *
 * Reads metadata.config.vercelTeamSlug and pushes:
 *   VERCEL_TEAM_SLUG
 *   NEXT_PUBLIC_VERCEL_TEAM_SLUG
 *
 * to the tenant Vercel project (+ suite apps). Triggers deploy hooks so
 * NEXT_PUBLIC_* reaches the client bundle.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { normalizeVercelTeamSlug, readTenantVercelTeamSlug } from '@/lib/vercel-team';
import type { AppPackConfig } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = (await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    )) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    let teamSlug: string;
    try {
      teamSlug = normalizeVercelTeamSlug(readTenantVercelTeamSlug(cfg));
    } catch (err) {
      return jsonError(err instanceof Error ? err.message : 'Invalid Vercel team slug', 400);
    }

    const tenantProjectId = String(tenant.vercel_project_id ?? '');
    const projects: { id: string; name: string; deployHookUrl?: string }[] = [];
    if (tenantProjectId) {
      projects.push({
        id: tenantProjectId,
        name: slug,
        deployHookUrl:
          String((cfg.hooks as Record<string, unknown> | undefined)?.deployHookUrl ?? '') ||
          undefined,
      });
    }
    const appPack = getAppPack(tenant);
    for (const app of appPack?.apps ?? []) {
      if (app.vercelProjectId) {
        projects.push({
          id: app.vercelProjectId,
          name: `${slug}/${app.appId}`,
          deployHookUrl: app.deployHookUrl || undefined,
        });
      }
    }

    if (projects.length === 0) {
      return jsonError(
        'Tenant has no Vercel project yet — deploy the app first, then save Vercel team settings.',
        400,
      );
    }

    const { syncVercelTeamEnvVars } = await import('@/domain/tenant/vercel-deploy-service');
    let envCount = 0;
    const pushed: string[] = [];
    for (const project of projects) {
      const count = await syncVercelTeamEnvVars(project.id, teamSlug);
      envCount += count;
      if (count > 0) pushed.push(project.name);
    }

    const redeployTriggered: string[] = [];
    if (envCount > 0) {
      for (const project of projects) {
        if (!project.deployHookUrl) continue;
        try {
          await fetch(project.deployHookUrl, { method: 'POST' });
          redeployTriggered.push(project.name);
        } catch (err) {
          console.warn(
            `[vercel-team-env] Deploy hook failed for ${project.name}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    }

    return jsonOk({
      projects: projects.length,
      envCount,
      pushed,
      teamSlug,
      redeployTriggered,
      note:
        envCount > 0 && redeployTriggered.length === 0
          ? 'Team slug pushed — trigger a redeploy so NEXT_PUBLIC_VERCEL_TEAM_SLUG reaches the client bundle.'
          : undefined,
    });
  } catch (err) {
    return jsonError(
      'Failed to push Vercel team env: ' + (err instanceof Error ? err.message : String(err)),
      500,
    );
  }
}
