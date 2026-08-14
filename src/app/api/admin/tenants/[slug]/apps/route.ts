/**
 * Suite Apps Management API — add/remove apps from an existing suite.
 *
 * POST   /api/admin/tenants/[slug]/apps  — Add a new app to the suite
 * DELETE /api/admin/tenants/[slug]/apps  — Remove an app from the suite
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { getTemplate } from '@/domain/tenant/template-catalog';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ── Helpers ────────────────────────────────────────────────

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

// ── POST: Add App to Suite ─────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    const body = await request.json() as {
      appId: string;
      name: string;
      department: string;
      templateId: string;
    };

    const { appId, name, department, templateId } = body;

    // Validate required fields
    if (!appId || !name || !templateId) {
      return jsonError('Missing required fields: appId, name, templateId', 400);
    }

    // Validate template exists
    try {
      getTemplate(templateId);
    } catch {
      return jsonError(`Unknown template: ${templateId}`, 400);
    }

    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    let appPack = getAppPack(rows[0]);
    if (!appPack) {
      // Single-app tenant → auto-convert to suite mode when the first app is
      // added. The tenant itself becomes the suite container; its existing
      // single-app experience is replaced by the suite app list.
      appPack = {
        packId: `${slug}-suite`,
        name: `${String(rows[0].display_name ?? slug)} Suite`,
        description: `Multi-app suite created for ${slug}`,
        apps: [],
        ceoOverview: { purpose: '', kpis: [] },
      };
    }

    // Check if appId already exists
    if (appPack.apps.some((a) => a.appId === appId)) {
      return jsonError(`App "${appId}" already exists in suite`, 409);
    }

    // Create new app instance
    const newApp: SuiteAppInstance = {
      appId,
      name,
      department: department || 'General',
      templateId,
      status: 'pending',
      vercelProjectId: null,
      appUrl: null,
      dbUrl: null,
    };

    // Add to appPack
    appPack.apps.push(newApp);
    await saveAppPack(db, slug, appPack);

    console.log(`[suite-apps] Added app "${appId}" to suite "${slug}"`);

    return jsonOk({
      added: true,
      app: newApp,
      totalApps: appPack.apps.length,
    });
  } catch (err) {
    return jsonError('Failed to add app: ' + (err as Error).message, 500);
  }
}

// ── DELETE: Remove App from Suite ──────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (!appId) {
      return jsonError('Missing required parameter: appId', 400);
    }

    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const appPack = getAppPack(rows[0]);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    // Find and remove the app
    const appIndex = appPack.apps.findIndex((a) => a.appId === appId);
    if (appIndex === -1) {
      return jsonError(`App "${appId}" not found in suite`, 404);
    }

    // Prevent removing the last app
    if (appPack.apps.length <= 1) {
      return jsonError('Cannot remove the last app from a suite. Delete the tenant instead.', 400);
    }

    const removedApp = appPack.apps.splice(appIndex, 1)[0];
    await saveAppPack(db, slug, appPack);

    console.log(`[suite-apps] Removed app "${appId}" from suite "${slug}"`);

    return jsonOk({
      removed: true,
      app: removedApp,
      totalApps: appPack.apps.length,
    });
  } catch (err) {
    return jsonError('Failed to remove app: ' + (err as Error).message, 500);
  }
}
