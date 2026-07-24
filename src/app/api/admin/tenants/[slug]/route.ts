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
});

// ── GET /api/admin/tenants/[slug] ────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient() as any;

  try {
    await ensureTenantsTable(db);
    await ensureTenantConfigColumns(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);
    return jsonOk({ tenant: rows[0] });
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

  const db = createRawClient() as any;
  try {
    await ensureTenantsTable(db);
    await ensureTenantConfigColumns(db);
    const existingRows = await db.$queryRawUnsafe(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as { id: string }[];
    if (existingRows.length === 0) return jsonError('Tenant not found', 404);

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
    if (parsed.data.metadata !== undefined) { updates.push(`metadata = $${idx++}::jsonb`); values.push(JSON.stringify(parsed.data.metadata)); }

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

    return jsonOk({ tenant });
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

  const db = createRawClient() as any;
  try {
    await ensureTenantsTable(db);
    const existingRows = await db.$queryRawUnsafe(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as { id: string }[];
    if (existingRows.length === 0) return jsonError('Tenant not found', 404);

    // Soft-delete: set status to 'error' instead of hard delete
    await db.$executeRawUnsafe(
      `UPDATE tenants SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE slug = $1;`, slug,
    );

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error(`[tenants] DELETE /${slug} error:`, err);
    return jsonError('Failed to delete tenant', 500);
  }
}
