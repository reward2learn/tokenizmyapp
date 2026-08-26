/**
 * Single Tenant API — GET / PUT / DELETE /api/admin/tenants/[slug]
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { ensureTenantConfigColumns } from '@/domain/tenant/tenant-config-service';
import { DEFAULT_TENANT } from '@shared/lib/config/tenant';
import { materializeAppPackForTenant } from '@/domain/app-pack/app-pack-tenant-materializer';

// ── Helper: snake_case DB rows → camelCase TenantEntry ──

function mapTenantRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    displayName: row.display_name as string,
    template: row.template as string,
    status: row.status as string,
    vercelProjectId: row.vercel_project_id as string | null,
    appUrl: row.app_url as string | null,
    dbUrl: row.db_url as string | null,
    apiKey: row.api_key as string | null,
    primaryColor: row.primary_color as string,
    secondaryColor: row.secondary_color as string,
    faviconData: row.favicon_data as string | null,
    faviconMimeType: row.favicon_mime_type as string | null,
    loadingGraphicUrl: (row.loading_graphic_url as string | null) ?? null,
    metadata: row.metadata as Record<string, unknown>,
    templateMode: ((row.metadata as Record<string, unknown>)?.config as Record<string, unknown>)?.templateMode as 'single' | 'suite' ?? 'single',
    appPack: ((row.metadata as Record<string, unknown>)?.config as Record<string, unknown>)?.appPack as import('@/store/apis/tenant-api').AppPackConfig ?? null,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  template: z.string().max(50).optional(),
  status: z.enum(['draft', 'deploying', 'live', 'error']).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  appUrl: z.string().max(500).optional().nullable(),
  vercelProjectId: z.string().max(100).optional().nullable(),
  dbUrl: z.string().max(500).optional().nullable(),
  apiKey: z.string().max(200).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
  // Suite mode fields
  templateMode: z.enum(['single', 'suite']).optional(),
  templates: z.array(z.string().max(50)).max(10).optional(),
  packMode: z.enum(['predefined', 'custom']).optional().default('custom'),
  prompt: z.string().max(2000).optional(),
});

// ── GET /api/admin/tenants/[slug] ────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    await ensureTenantConfigColumns(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);
    return jsonOk({ tenant: mapTenantRow(rows[0]) });
  } catch (err) {
    console.error(`[tenants] GET /${slug} error:`, err);
    return jsonError('Failed to fetch tenant', 500);
  }
}

// ── PUT /api/admin/tenants/[slug] ────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(`Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
  }

  const db = createRawClient();
  try {
    await ensureTenantsTable(db);
    await ensureTenantConfigColumns(db);
    const existingRows = await db.$queryRawUnsafe(
      `SELECT id, metadata FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as { id: string; metadata: Record<string, unknown> | null }[];
    if (existingRows.length === 0) return jsonError('Tenant not found', 404);

    const existingMeta = (existingRows[0].metadata ?? {}) as Record<string, unknown>;
    const existingConfig = (existingMeta.config ?? {}) as Record<string, unknown>;
    const currentTemplateMode = existingConfig.templateMode as 'single' | 'suite' ?? 'single';

    // Build SET clause from parsed data
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (parsed.data.displayName !== undefined) { updates.push(`display_name = $${idx++}`); values.push(parsed.data.displayName); }
    if (parsed.data.template !== undefined) { updates.push(`template = $${idx++}`); values.push(parsed.data.template); }
    if (parsed.data.status !== undefined) { updates.push(`status = $${idx++}`); values.push(parsed.data.status); }
    if (parsed.data.primaryColor !== undefined) { updates.push(`primary_color = $${idx++}`); values.push(parsed.data.primaryColor); }
    if (parsed.data.secondaryColor !== undefined) { updates.push(`secondary_color = $${idx++}`); values.push(parsed.data.secondaryColor); }
    if (parsed.data.appUrl !== undefined) { updates.push(`app_url = $${idx++}`); values.push(parsed.data.appUrl); }
    if (parsed.data.vercelProjectId !== undefined) { updates.push(`vercel_project_id = $${idx++}`); values.push(parsed.data.vercelProjectId); }
    if (parsed.data.dbUrl !== undefined) { updates.push(`db_url = $${idx++}`); values.push(parsed.data.dbUrl); }
    if (parsed.data.apiKey !== undefined) { updates.push(`api_key = $${idx++}`); values.push(parsed.data.apiKey); }

    // Handle suite mode fields
    const newTemplateMode = parsed.data.templateMode ?? currentTemplateMode;
    const isSwitchingToSuite = newTemplateMode === 'suite' && currentTemplateMode === 'single';
    const isSwitchingToSingle = newTemplateMode === 'single' && currentTemplateMode === 'suite';
    const isSuiteMode = newTemplateMode === 'suite';

    // Prepare config updates
    const configUpdates: Record<string, unknown> = { ...existingConfig };

    if (parsed.data.templateMode !== undefined) {
      configUpdates.templateMode = parsed.data.templateMode;
    }

    // Handle suite mode: materialize app pack if switching to suite or updating templates
    if (isSuiteMode && (isSwitchingToSuite || parsed.data.templates !== undefined)) {
      const templates = parsed.data.templates ?? (existingConfig.templates as string[] ?? []);
      const packMode = parsed.data.packMode ?? (existingConfig.packMode as 'predefined' | 'custom' ?? 'custom');
      const prompt = parsed.data.prompt ?? (existingConfig.prompt as string ?? '');

      if (templates.length > 0) {
        try {
          console.log(`[tenants] Suite mode: materializing app pack for ${slug}...`);
          const packResult = await materializeAppPackForTenant({
            tenantSlug: slug,
            displayName: parsed.data.displayName ?? existingMeta.display_name as string ?? slug,
            templates,
            prompt,
            mock: !process.env.OPENAI_API_KEY,
            packMode,
          });
          if (packResult.success && packResult.appPack) {
            configUpdates.templates = templates;
            configUpdates.packMode = packMode;
            configUpdates.prompt = prompt;
            configUpdates.appPack = packResult.appPack;
            console.log(`[tenants] Suite mode: app pack materialized — ${packResult.appPack.apps.length} apps`);
          } else {
            console.error('[tenants] Suite mode: materialization failed:', packResult.error);
          }
        } catch (suiteErr) {
          console.error('[tenants] Suite mode: error:', suiteErr instanceof Error ? suiteErr.message : String(suiteErr));
        }
      }
    }

    // Handle switching from suite to single mode
    if (isSwitchingToSingle) {
      // Clear suite-specific config
      delete configUpdates.templateMode;
      delete configUpdates.templates;
      delete configUpdates.packMode;
      delete configUpdates.prompt;
      delete configUpdates.appPack;
      // Reset template to first template or default
      const firstTemplate = (existingConfig.templates as string[])?.[0] ?? 'default';
      updates.push(`template = $${idx++}`);
      values.push(firstTemplate);
    }

    // Merge metadata config
    if (Object.keys(configUpdates).length > 0 || parsed.data.metadata !== undefined) {
      const incomingMeta = parsed.data.metadata ?? {};
      const mergedMeta: Record<string, unknown> = {
        ...existingMeta,
        ...incomingMeta,
        config: {
          ...configUpdates,
          ...((incomingMeta.config ?? {}) as Record<string, unknown>),
        },
      };
      updates.push(`metadata = $${idx++}::jsonb`);
      values.push(JSON.stringify(mergedMeta));
    }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(slug);
      await db.$executeRawUnsafe(
        `UPDATE tenants SET ${updates.join(', ')} WHERE slug = $${idx};`,
        ...values,
      );
    }

    const updatedRows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    const tenant = updatedRows[0];

    return jsonOk({ tenant: mapTenantRow(tenant) });
  } catch (err) {
    console.error(`[tenants] PUT /${slug} error:`, err);
    return jsonError('Failed to update tenant', 500);
  }
}

// ── DELETE /api/admin/tenants/[slug] ─────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  if (slug === DEFAULT_TENANT.slug) {
    return jsonError(
      `Cannot delete "${DEFAULT_TENANT.slug}" — it is the platform administrator's own tenant app, not a managed tenant.`,
      403,
    );
  }

  const db = createRawClient();
  try {
    await ensureTenantsTable(db);
    const existingRows = await db.$queryRawUnsafe(
      `SELECT id, metadata FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as { id: string; metadata: Record<string, unknown> | null }[];
    if (existingRows.length === 0) return jsonError('Tenant not found', 404);

    // Hard delete — permanently remove the tenant row
    await db.$executeRawUnsafe(`DELETE FROM tenants WHERE slug = $1;`, slug);

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error(`[tenants] DELETE /${slug} error:`, err);
    return jsonError('Failed to delete tenant', 500);
  }
}
