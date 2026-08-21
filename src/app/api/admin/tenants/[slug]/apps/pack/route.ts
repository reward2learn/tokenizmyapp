/**
 * Suite App Pack Append API — materialize a pack and merge into an existing suite.
 *
 * POST /api/admin/tenants/[slug]/apps/pack
 *
 * Uses the same AI / deterministic materializer as new-tenant suite creation
 * (`materializeAppPackForTenant` via `appendAppPackToExistingSuite`), then
 * appends only the apps that are not already present (by appId / templateId).
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import {
  appendAppPackToExistingSuite,
  buildSuitePrompt,
  type PackMode,
} from '@/domain/app-pack/app-pack-tenant-materializer';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';
/** AI decompose + per-app definition generation can take several minutes. */
export const maxDuration = 300;

function getConfig(tenant: Record<string, unknown>): Record<string, unknown> {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  return (meta.config ?? {}) as Record<string, unknown>;
}

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  return (getConfig(tenant).appPack as AppPackConfig) ?? null;
}

async function saveConfig(
  db: ReturnType<typeof createRawClient>,
  slug: string,
  config: Record<string, unknown>,
): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(config),
    slug,
  );
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
    const body = await request.json() as {
      templates?: string[];
      packMode?: PackMode;
      prompt?: string;
      displayName?: string;
    };

    const templates = Array.isArray(body.templates)
      ? body.templates.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      : [];
    const packMode: PackMode = body.packMode === 'predefined' ? 'predefined' : 'custom';
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

    if (templates.length === 0) {
      return jsonError('Missing required field: templates (non-empty array)', 400);
    }

    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const displayName =
      (typeof body.displayName === 'string' && body.displayName.trim())
      || String(tenant.display_name ?? slug);

    const existingConfig = getConfig(tenant);
    let existingPack = getAppPack(tenant);
    const existingApps: SuiteAppInstance[] = existingPack?.apps ?? [];

    if (!existingPack) {
      existingPack = {
        packId: `${slug}-suite`,
        name: `${displayName} Suite`,
        description: `Multi-app suite for ${displayName}`,
        apps: [],
        ceoOverview: { purpose: '', kpis: [] },
      };
    }

    const suitePrompt = prompt || buildSuitePrompt(displayName, templates);

    console.log(
      `[suite-apps/pack] Materializing pack for "${slug}" — mode=${packMode}, templates=${templates.length}`,
    );

    const result = await appendAppPackToExistingSuite({
      tenantSlug: slug,
      displayName,
      templates,
      prompt: suitePrompt,
      packMode,
      existingApps,
      existingPack,
      mock: !process.env.OPENAI_API_KEY,
    });

    if (!result.success || !result.appPack) {
      return jsonError(result.error ?? 'App pack materialization failed', 500);
    }

    const prevTemplates = Array.isArray(existingConfig.templates)
      ? (existingConfig.templates as string[])
      : [];
    const mergedTemplates = Array.from(new Set([...prevTemplates, ...templates]));

    const nextConfig: Record<string, unknown> = {
      ...existingConfig,
      templateMode: 'suite',
      templates: mergedTemplates,
      packMode,
      prompt: suitePrompt,
      appPack: result.appPack,
    };

    await saveConfig(db, slug, nextConfig);

    const added = result.addedApps ?? [];
    console.log(
      `[suite-apps/pack] Appended ${added.length} app(s) to "${slug}" via ${result.mode}` +
        (result.fellBack ? ' (AI fallback)' : ''),
    );

    return jsonOk({
      added: true,
      apps: added,
      totalApps: result.appPack.apps.length,
      mode: result.mode,
      fellBack: result.fellBack ?? false,
      packId: result.appPack.packId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[suite-apps/pack] Failed for "${slug}":`, message);
    return jsonError('Failed to materialize app pack: ' + message, 500);
  }
}
