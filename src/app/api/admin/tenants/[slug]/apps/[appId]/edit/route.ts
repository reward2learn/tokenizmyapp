/**
 * Per-App Edit API — update a suite app's own name/department/template/
 * colors/deploy hook without touching seeding, deployment, or DB schema.
 *
 * PATCH /api/admin/tenants/[slug]/apps/[appId]/edit
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

async function saveAppPack(db: ReturnType<typeof createRawClient>, slug: string, appPack: AppPackConfig): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config,appPack}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(appPack),
    slug,
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; appId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug, appId } = await params;
  const db = createRawClient();

  try {
    const body = await request.json() as {
      name?: string;
      department?: string;
      templateId?: string;
      primaryColor?: string;
      secondaryColor?: string;
      deployHookUrl?: string | null;
    };

    if (body.templateId) {
      try {
        getTemplate(body.templateId);
      } catch {
        return jsonError(`Unknown template: ${body.templateId}`, 400);
      }
    }

    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const appPack = getAppPack(rows[0]);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const idx = appPack.apps.findIndex((a) => a.appId === appId);
    if (idx === -1) return jsonError(`App "${appId}" not found in suite`, 404);

    const current = appPack.apps[idx];
    appPack.apps[idx] = {
      ...current,
      name: body.name?.trim() || current.name,
      department: body.department?.trim() || current.department,
      templateId: body.templateId || current.templateId,
      primaryColor: body.primaryColor !== undefined ? body.primaryColor : current.primaryColor,
      secondaryColor: body.secondaryColor !== undefined ? body.secondaryColor : current.secondaryColor,
      deployHookUrl: body.deployHookUrl !== undefined ? body.deployHookUrl : current.deployHookUrl,
    };

    await saveAppPack(db, slug, appPack);

    console.log(`[app-edit] Updated "${appId}" for tenant "${slug}"`);

    return jsonOk({ app: appPack.apps[idx] });
  } catch (err) {
    return jsonError('Failed to edit app: ' + (err as Error).message, 500);
  }
}
