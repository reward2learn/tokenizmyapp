/**
 * Pack Table CRUD — single row update + delete
 *
 * PATCH  /api/pack-tables/[table]/[id]  { data: { ...fields to update... } }  (requireWriteAuth)
 * DELETE /api/pack-tables/[table]/[id]                                        (requireWriteAuth)
 *
 * Both operations are tenant-scoped (WHERE tenant_slug = $envSlug) and return
 * 404 when the row does not exist for this tenant. See spec §3.4 / §3.5.
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  buildDeleteQuery,
  buildUpdateQuery,
  coerceRowFromDb,
  coerceValueForWrite,
  fetchPackTableColumns,
  findUnknownColumns,
  getTenantSlug,
  packTableWriteBodySchema,
  PATCH_FORBIDDEN_COLUMNS,
  PackTableValidationError,
  resolvePackTable,
  type RawDb,
} from '@/lib/pack-table';

export const dynamic = 'force-dynamic';

function tableError(resolution: { ok: false; reason: 'invalid-identifier' | 'not-pack-table' }): NextResponse {
  return resolution.reason === 'invalid-identifier'
    ? jsonError('Invalid table name', 400)
    : jsonError('Not a pack table', 404);
}

// ── PATCH /api/pack-tables/[table]/[id] — partial update ──

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { table, id } = await params;
  if (id.length === 0 || id.length > 64) return jsonError('Row not found', 404);

  const db = createRawClient() as unknown as RawDb;

  try {
    const resolved = await resolvePackTable(db, table);
    if (!resolved.ok) return tableError(resolved);

    const tenantSlug = getTenantSlug();
    if (!tenantSlug) return jsonError('Tenant slug is not configured', 500);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }
    const parsed = packTableWriteBodySchema.safeParse(body);
    if (!parsed.success) return jsonError('Invalid body: expected { data: { ...fields to update... } }', 422);

    const data = parsed.data.data;
    const columns = await fetchPackTableColumns(db, table);
    const jsonbColumns = new Set(columns.filter((c) => c.dataType === 'JSONB').map((c) => c.name));

    const unknown = findUnknownColumns(data, columns);
    if (unknown.length > 0) return jsonError(`Unknown columns: ${unknown.join(', ')}`, 422);

    const forbidden = Object.keys(data).filter((k) => (PATCH_FORBIDDEN_COLUMNS as readonly string[]).includes(k));
    if (forbidden.length > 0) return jsonError(`Columns cannot be updated: ${forbidden.join(', ')}`, 422);

    const updateColumns: string[] = [];
    const updateValues: unknown[] = [];
    for (const col of columns) {
      if (data[col.name] === undefined) continue;
      let coerced: unknown;
      try {
        coerced = coerceValueForWrite(data[col.name], col.dataType);
      } catch (e) {
        if (e instanceof PackTableValidationError) {
          return jsonError(`Invalid value for "${col.name}": ${e.message}`, 422);
        }
        throw e;
      }
      updateColumns.push(col.name);
      updateValues.push(coerced);
    }
    if (updateColumns.length === 0) return jsonError('No fields to update', 422);

    const update = buildUpdateQuery({ table, id, tenantSlug, columns: updateColumns, values: updateValues, jsonbColumns });
    const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(update.sql, ...update.values);
    const updated = rows[0];
    if (!updated) return jsonError('Row not found', 404);

    return jsonOk(coerceRowFromDb(updated, columns));
  } catch (err) {
    console.error(`[pack-tables] PATCH /${table}/${id} error:`, err);
    return jsonError('Failed to update row', 500);
  }
}

// ── DELETE /api/pack-tables/[table]/[id] ───────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { table, id } = await params;
  if (id.length === 0 || id.length > 64) return jsonError('Row not found', 404);

  const db = createRawClient() as unknown as RawDb;

  try {
    const resolved = await resolvePackTable(db, table);
    if (!resolved.ok) return tableError(resolved);

    const tenantSlug = getTenantSlug();
    if (!tenantSlug) return jsonError('Tenant slug is not configured', 500);

    const del = buildDeleteQuery({ table, id, tenantSlug });
    const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(del.sql, ...del.values);
    if (rows.length === 0) return jsonError('Row not found', 404);

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error(`[pack-tables] DELETE /${table}/${id} error:`, err);
    return jsonError('Failed to delete row', 500);
  }
}