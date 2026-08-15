/**
 * Per-App Refresh Status API — reconciles the LIVE Vercel deployment state
 * for one suite app's own project (distinct from the lightweight GET on
 * apps/[appId]/route.ts, which just echoes the last-known stored status)
 * and persists the result back onto the SuiteAppInstance.
 *
 * GET /api/admin/tenants/[slug]/apps/[appId]/status
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

const VERCEL_API = 'https://api.vercel.com';
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_uKNaNEyjHVW7vooXeUfNJ3LW';
/** Team-scoped .vercel.app URLs (deployments, preview aliases) are transient — never stored as appUrl. */
const TEAM_URL_MARKER = '-ilishaps-projects.vercel.app';

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

function mapVercelState(state: string): SuiteAppInstance['status'] {
  if (state === 'READY') return 'live';
  if (state === 'ERROR' || state === 'CANCELED') return 'error';
  if (state === 'BUILDING' || state === 'QUEUED' || state === 'INITIALIZING') return 'deploying';
  return 'pending';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const token = process.env.VERCEL_TOKEN;
  if (!token) return jsonError('VERCEL_TOKEN not configured', 503);

  const db = createRawClient();

  try {
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const appPack = getAppPack(rows[0]);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const idx = appPack.apps.findIndex((a) => a.appId === appId);
    if (idx === -1) return jsonError(`App "${appId}" not found in suite`, 404);

    const app = appPack.apps[idx];
    if (!app.vercelProjectId) {
      return jsonOk({
        appId,
        status: app.status,
        appUrl: app.appUrl,
        vercelState: 'NOT_FOUND',
        note: 'This app has not been deployed yet — no Vercel project.',
      });
    }

    const deployRes = await fetch(
      `${VERCEL_API}/v6/deployments?projectId=${app.vercelProjectId}&target=production&limit=1&teamId=${TEAM_ID}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!deployRes.ok) {
      return jsonOk({
        appId,
        status: app.status,
        appUrl: app.appUrl,
        vercelState: 'NO_DEPLOYMENTS',
        note: 'Project exists but no production deployments yet.',
      });
    }

    const deployData = await deployRes.json() as {
      deployments?: Array<{ uid: string; state: string; url?: string }>;
    };
    const latest = deployData.deployments?.[0];

    if (!latest) {
      return jsonOk({ appId, status: app.status, appUrl: app.appUrl, vercelState: 'NO_DEPLOYMENTS' });
    }

    const mappedStatus = mapVercelState(latest.state);
    // Deployment URLs change on every push — never store them as the
    // canonical appUrl. Keep the stable project alias / custom domain.
    const deploymentUrl = latest.url ? `https://${latest.url}` : undefined;
    const aliasUrl = `https://${slug}-${appId}.vercel.app`;
    const resolvedAppUrl = app.appUrl && !app.appUrl.includes(TEAM_URL_MARKER) ? app.appUrl : aliasUrl;

    appPack.apps[idx] = { ...app, status: mappedStatus, appUrl: resolvedAppUrl };
    await saveAppPack(db, slug, appPack);

    return jsonOk({
      appId,
      status: mappedStatus,
      appUrl: resolvedAppUrl,
      deploymentUrl,
      vercelState: latest.state,
      note: latest.state === 'ERROR' ? 'Deployment build failed — check the Vercel dashboard for details.' : undefined,
    });
  } catch (err) {
    return jsonError('Failed to refresh app status: ' + (err as Error).message, 500);
  }
}
