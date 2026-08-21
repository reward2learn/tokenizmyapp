/**
 * Per-App Deploy Hook provisioning + Vercel project knowledge.
 *
 * POST /api/admin/tenants/[slug]/apps/[appId]/deploy-hook
 *   Creates/reuses a Deploy Hook on the app's vercelProjectId (from
 *   metadata.config.appPack — same as GET /api/admin/tenants).
 *   Requires VERCEL_TOKEN (team PAT). Sign-in-with-Vercel OAuth alone → 401.
 *
 * GET  /api/admin/tenants/[slug]/apps/[appId]/deploy-hook
 *   Returns project knowledge: git link, existing hooks, and guidance for
 *   git.deploymentEnabled / github.enabled vs Deploy Hooks.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import {
  ensureDeployHook,
  getVercelProjectKnowledge,
} from '@/domain/tenant/vercel-deploy-service';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

async function saveAppPack(
  db: ReturnType<typeof createRawClient>,
  slug: string,
  appPack: AppPackConfig,
): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config,appPack}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(appPack),
    slug,
  );
}

async function resolveAppProject(
  slug: string,
  appId: string,
): Promise<
  | { ok: true; appPack: AppPackConfig; idx: number; app: SuiteAppInstance; projectId: string; db: ReturnType<typeof createRawClient> }
  | { ok: false; response: NextResponse }
> {
  const db = createRawClient();
  await ensureTenantsTable(db);
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
    slug,
  ) as Record<string, unknown>[];
  if (rows.length === 0) return { ok: false, response: jsonError('Tenant not found', 404) };

  const appPack = getAppPack(rows[0]);
  if (!appPack) return { ok: false, response: jsonError('Tenant is not in suite mode', 400) };

  const idx = appPack.apps.findIndex((a) => a.appId === appId);
  if (idx === -1) return { ok: false, response: jsonError(`App "${appId}" not found in suite`, 404) };

  const app = appPack.apps[idx];
  const projectId = (app.vercelProjectId || '').trim();
  if (!projectId) {
    return {
      ok: false,
      response: jsonError(
        `App "${appId}" has no vercelProjectId yet — deploy it first, then Generate.`,
        400,
      ),
    };
  }

  return { ok: true, appPack, idx, app, projectId, db };
}

/** GET — project knowledge (git link, hooks, git.deploymentEnabled guidance). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  try {
    const resolved = await resolveAppProject(slug, appId);
    if (!resolved.ok) return resolved.response;

    const knowledge = await getVercelProjectKnowledge(resolved.projectId);
    if (!knowledge.ok) return jsonError(knowledge.error, 502);

    return jsonOk({
      appId,
      vercelProjectId: resolved.projectId,
      deployHookUrl: resolved.app.deployHookUrl ?? null,
      knowledge: knowledge.data,
    });
  } catch (err) {
    return jsonError('Failed to load project knowledge: ' + (err as Error).message, 500);
  }
}

/** POST — create/reuse deploy hook and persist URL on the suite app. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;

  try {
    const resolved = await resolveAppProject(slug, appId);
    if (!resolved.ok) return resolved.response;

    const { appPack, idx, app, projectId, db } = resolved;

    const hook = await ensureDeployHook(projectId, {
      name: 'DeployHook',
      ref: 'main',
    });

    const knowledge = await getVercelProjectKnowledge(projectId);

    if (!hook.ok) {
      console.warn(
        `[app-deploy-hook] Failed for "${appId}" (${slug}) project=${projectId}: ${hook.error}`,
      );
      const status =
        hook.status && hook.status >= 400 && hook.status < 600 ? hook.status : 502;
      return NextResponse.json(
        {
          success: false,
          error: hook.error,
          data: {
            vercelProjectId: projectId,
            knowledge: knowledge.ok ? knowledge.data : null,
            hint:
              'Set VERCEL_TOKEN to a team-scoped PAT (Vercel → Account → Tokens). '
              + 'Connect Vercel OAuth alone cannot create deploy hooks.',
          },
        },
        { status },
      );
    }

    appPack.apps[idx] = {
      ...app,
      deployHookUrl: hook.url,
      vercelProjectId: projectId,
    };
    await saveAppPack(db, slug, appPack);

    console.log(
      `[app-deploy-hook] ${hook.created ? 'Created' : 'Reused'} deploy hook for "${appId}" (${slug}) `
        + `project=${hook.projectId} name=${hook.projectName ?? '(unknown)'}`,
    );

    return jsonOk({
      appId,
      deployHookUrl: hook.url,
      created: hook.created,
      vercelProjectId: hook.projectId,
      vercelProjectName: hook.projectName,
      knowledge: knowledge.ok ? knowledge.data : null,
    });
  } catch (err) {
    return jsonError('Failed to provision deploy hook: ' + (err as Error).message, 500);
  }
}
