/**
 * Per-App Deploy Hook provisioning.
 *
 * POST /api/admin/tenants/[slug]/apps/[appId]/deploy-hook
 *
 * Resolves the suite app's `vercelProjectId` from metadata.config.appPack
 * (same source as GET /api/admin/tenants → data.tenants[].appPack.apps[]),
 * ensures that Vercel project is git-linked to reward2learn/tokenizmyapp,
 * creates (or reuses) a Deploy Hook on branch `main`, and stores the URL
 * on the SuiteAppInstance so "Trigger Deploy Hook" works without pasting
 * a URL from the dashboard.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { ensureDeployHook } from '@/domain/tenant/vercel-deploy-service';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

async function saveAppPack(db: ReturnType<typeof createRawClient>, slug: string, appPack: AppPackConfig): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config,appPack}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(appPack),
    slug,
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const appPack = getAppPack(rows[0]);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const idx = appPack.apps.findIndex((a) => a.appId === appId);
    if (idx === -1) return jsonError(`App "${appId}" not found in suite`, 404);

    const app: SuiteAppInstance = appPack.apps[idx];
    const projectId = (app.vercelProjectId || '').trim();
    if (!projectId) {
      return jsonError(
        `App "${appId}" has no vercelProjectId yet — deploy it first (or set the Vercel project id), then Generate.`,
        400,
      );
    }

    // Prefer a stable dashboard-style name; reuse any existing hook on main.
    const hook = await ensureDeployHook(projectId, {
      name: 'DeployHook',
      ref: 'main',
    });

    if (!hook.ok) {
      console.warn(`[app-deploy-hook] Failed for "${appId}" (${slug}) project=${projectId}: ${hook.error}`);
      return jsonError(hook.error, hook.status && hook.status >= 400 && hook.status < 600 ? hook.status : 502);
    }

    appPack.apps[idx] = { ...app, deployHookUrl: hook.url, vercelProjectId: projectId };
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
    });
  } catch (err) {
    return jsonError('Failed to provision deploy hook: ' + (err as Error).message, 500);
  }
}
