/**
 * Per-App Vercel Env Push — "Vercel Save & Push"
 *
 * POST /api/admin/tenants/[slug]/apps/[appId]/vercel-env
 *
 * Pushes ALL required environment variables to this app's own Vercel project
 * from the tenant's saved configuration (metadata.config): Google OAuth
 * credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_PROJECT_ID),
 * database URL, PINs, PIN_SIGN_IN_ENABLED, custom env vars, plus the shared
 * NEXT_PUBLIC_* identity vars and platform secrets (ENCRYPTION_KEY, etc.).
 *
 * Requires the app to already be deployed (app.vercelProjectId set) — the
 * button is meant to run after the app is live on Vercel.
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { getTemplate } from '@/domain/tenant/template-catalog';
import type { AppPackConfig } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
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

    const tenant = rows[0];
    const appPack = getAppPack(tenant);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const app = appPack.apps.find((a) => a.appId === appId);
    if (!app) return jsonError(`App "${appId}" not found in suite`, 404);

    if (!app.vercelProjectId) {
      return jsonError(
        `App "${appId}" is not deployed yet — deploy the app first so a Vercel project exists, then run "Vercel Save & Push".`,
        400,
      );
    }

    const { buildEnvVarsForProject, syncEnvVars } = await import('@/domain/tenant/vercel-deploy-service');
    const tpl = getTemplate(app.templateId);
    const tenantDbUrl = tenant.db_url as string | null;

    const input = {
      slug: `${slug}-${appId}`,
      displayName: app.name,
      template: app.templateId,
      primaryColor: tpl.defaultColors.primary,
      secondaryColor: tpl.defaultColors.secondary,
      dbUrl: tenantDbUrl ? { pooled: tenantDbUrl } : null,
      // Full tenant metadata (incl. metadata.config.googleAuth etc.) so the
      // env map includes the tenant's Google OAuth creds, DB, PINs, custom env.
      metadata: { ...(tenant.metadata as Record<string, unknown>), appId },
    };

    const envVars = buildEnvVarsForProject(input);
    const envCount = await syncEnvVars(app.vercelProjectId, input);

    console.log(`[app-vercel-env] Pushed ${envCount}/${Object.keys(envVars).length} env vars to "${appId}" (${app.vercelProjectId})`);

    return jsonOk({
      projectId: app.vercelProjectId,
      envCount,
      keys: Object.keys(envVars),
    });
  } catch (err) {
    return jsonError('Failed to push env vars: ' + (err as Error).message, 500);
  }
}
