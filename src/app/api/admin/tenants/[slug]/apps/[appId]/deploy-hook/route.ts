/**
 * Per-App Deploy Hook provisioning.
 *
 * POST /api/admin/tenants/[slug]/apps/[appId]/deploy-hook
 *
 * Creates (or reuses) a Vercel Deploy Hook on this app's own Vercel project
 * and stores the resulting URL on the app's SuiteAppInstance, so "Trigger
 * Deploy Hook" in the app's three-dot menu works without anyone hand-copying
 * a URL out of the Vercel dashboard.
 *
 * The deploy flow (PUT on ../route.ts) already does this automatically after
 * a successful deploy — this route exists for apps that were deployed before
 * that was added, or whose hook was revoked and needs re-issuing.
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
    if (!app.vercelProjectId) {
      return jsonError(
        `App "${appId}" has no Vercel project yet — deploy it first, then generate a deploy hook.`,
        400,
      );
    }

    const hook = await ensureDeployHook(app.vercelProjectId, { name: `${appId}-auto`, ref: 'main' });
    if (!hook) {
      return jsonError(
        'Could not create a deploy hook on Vercel. Check that the project is linked to a Git repository and that the Vercel token has access.',
        502,
      );
    }

    appPack.apps[idx] = { ...app, deployHookUrl: hook.url };
    await saveAppPack(db, slug, appPack);

    console.log(`[app-deploy-hook] ${hook.created ? 'Created' : 'Reused'} deploy hook for "${appId}" (${slug})`);

    return jsonOk({
      appId,
      deployHookUrl: hook.url,
      created: hook.created,
    });
  } catch (err) {
    return jsonError('Failed to provision deploy hook: ' + (err as Error).message, 500);
  }
}
