/**
 * Vercel Team PAT Push — factory / tenant project self-API access
 *
 * POST /api/admin/tenants/[slug]/vercel-token-env
 *
 * Upserts VERCEL_TOKEN (+ VERCEL_TEAM_ID) on the tenant Vercel project.
 * The PAT is never persisted to tenant metadata — only written to Vercel env.
 *
 * Body (optional): { "token": "vca_..." } — when omitted, uses process.env.VERCEL_TOKEN.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { VERCEL_TEAM_ID, isValidVercelPat } from '@/lib/vercel-team';
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
  let bodyToken = '';
  try {
    const body = (await request.json()) as { token?: string };
    bodyToken = String(body?.token ?? '').trim();
  } catch {
    /* empty body ok — fall back to env */
  }

  const pat = bodyToken || process.env.VERCEL_TOKEN?.trim() || '';
  if (!pat) {
    return jsonError(
      'Paste a Tokenizin team PAT (vcp_… or vca_…) or set VERCEL_TOKEN on this deployment first.',
      400,
    );
  }
  if (!isValidVercelPat(pat)) {
    return jsonError(
      'Vercel PAT must start with vcp_, vca_, vci_, or at_ (from vercel.com/account/tokens).',
      400,
    );
  }

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
      return jsonError('Tenant has no Vercel project yet — set Project ID and deploy first.', 400);
    }

    const { upsertProjectEnvVar } = await import('@/domain/tenant/vercel-deploy-service');
    let envCount = 0;
    const pushed: string[] = [];
    for (const project of projects) {
      const tokenOk = await upsertProjectEnvVar(project.id, 'VERCEL_TOKEN', pat);
      const teamOk = await upsertProjectEnvVar(project.id, 'VERCEL_TEAM_ID', VERCEL_TEAM_ID);
      const count = (tokenOk ? 1 : 0) + (teamOk ? 1 : 0);
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
            `[vercel-token-env] Deploy hook failed for ${project.name}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    }

    return jsonOk({
      projects: projects.length,
      envCount,
      pushed,
      redeployTriggered,
      note:
        envCount > 0
          ? 'PAT written to Vercel env only (not saved in tenant config). Redeploy so running functions pick up VERCEL_TOKEN.'
          : 'Could not write VERCEL_TOKEN — check Connect to Vercel or paste a valid team PAT.',
    });
  } catch (err) {
    return jsonError(
      'Failed to push Vercel PAT: ' + (err instanceof Error ? err.message : String(err)),
      500,
    );
  }
}
