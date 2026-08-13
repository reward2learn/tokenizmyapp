/**
 * Pack Table CRUD — list + create
 *
 * GET  /api/pack-tables/[table]?page=&perPage=&sortBy=&q=  (requireSession)
 * POST /api/pack-tables/[table]  { data: { ... } }          (requireWriteAuth)
 *
 * See docs/workflows/pack-table-crud-spec.md §3.1 / §3.3.
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireSession, requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  buildCountQuery,
  buildInsertQuery,
  buildListQuery,
  clampPagination,
  coerceRowFromDb,
  coerceValueForWrite,
  fetchPackTableColumns,
  findMissingRequiredColumns,
  findUnknownColumns,
  getTenantSlug,
  packTableListQuerySchema,
  packTableWriteBodySchema,
  PackTableValidationError,
  parseSortBy,
  resolvePackTable,
  SERVER_MANAGED_COLUMNS,
  validateClientId,
  validateSortPairs,
  type RawDb,
} from '@/lib/pack-table';

export const dynamic = 'force-dynamic';

function tableError(resolution: { ok: false; reason: 'invalid-identifier' | 'not-pack-table' }): NextResponse {
  return resolution.reason === 'invalid-identifier'
    ? jsonError('Invalid table name', 400)
    : jsonError('Not a pack table', 404);
}

// ── GET /api/pack-tables/[table] — list rows ───────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
): Promise<NextResponse> {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const { table } = await params;
  const db = createRawClient() as unknown as RawDb;

  try {
    const resolved = await resolvePackTable(db, table);
    if (!resolved.ok) return tableError(resolved);

    const tenantSlug = getTenantSlug();
    if (!tenantSlug) return jsonError('Tenant slug is not configured', 500);

    const { searchParams } = new URL(request.url);
    const parsed = packTableListQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      perPage: searchParams.get('perPage') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError(`Invalid query params: ${parsed.error.issues.map((i) => i.message).join(', ')}`, 400);
    }

    const columns = await fetchPackTableColumns(db, table);
    const { page, perPage } = clampPagination(parsed.data.page, parsed.data.perPage);
    const q = parsed.data.q?.trim() || undefined;
    const sortBy = validateSortPairs(parseSortBy(parsed.data.sortBy), columns);

    const list = buildListQuery({ table, tenantSlug, page, perPage, q, sortBy, columns });
    const count = buildCountQuery({ table, tenantSlug, q, columns });

    const [rows, countRows] = await Promise.all([
      db.$queryRawUnsafe<Record<string, unknown>[]>(list.sql, ...list.values),
      db.$queryRawUnsafe<Array<{ count: number }>>(count.sql, ...count.values),
    ]);

    const totalRows = countRows[0]?.count ?? 0;
    const totalPages = Math.ceil(totalRows / perPage);

    return jsonOk({
      table,
      rows: rows.map((r) => coerceRowFromDb(r, columns)),
      totalRows,
      page,
      perPage,
      totalPages,
    });
  } catch (err) {
    console.error(`[pack-tables] GET /${table} error:`, err);
    return jsonError('Failed to list pack table rows', 500);
  }
}

// ── POST /api/pack-tables/[table] — create row ─────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { table } = await params;
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
    if (!parsed.success) return jsonError('Invalid body: expected { data: { ...field values... } }', 422);

    const data = parsed.data.data;
    const columns = await fetchPackTableColumns(db, table);
    const jsonbColumns = new Set(columns.filter((c) => c.dataType === 'JSONB').map((c) => c.name));

    const unknown = findUnknownColumns(data, columns);
    if (unknown.length > 0) return jsonError(`Unknown columns: ${unknown.join(', ')}`, 422);

    const managed = Object.keys(data).filter((k) => (SERVER_MANAGED_COLUMNS as readonly string[]).includes(k));
    if (managed.length > 0) return jsonError(`Server-managed columns are not accepted: ${managed.join(', ')}`, 422);

    const missing = findMissingRequiredColumns(data, columns);
    if (missing.length > 0) return jsonError(`Missing required columns: ${missing.join(', ')}`, 422);

    const id = data.id !== undefined ? validateClientId(data.id) : globalThis.crypto.randomUUID();
    if (id === null) return jsonError('Invalid id: must be a non-empty string of at most 64 characters', 422);

    const insertColumns: string[] = ['id', 'tenant_slug'];
    const insertValues: unknown[] = [id, tenantSlug];
    for (const col of columns) {
      if (col.isBase) continue; // id handled above; tenant_slug/created_at/updated_at server-managed
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
      insertColumns.push(col.name);
      insertValues.push(coerced);
    }

    const insert = buildInsertQuery({ table, columns: insertColumns, values: insertValues, jsonbColumns });
    const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(insert.sql, ...insert.values);
    const created = rows[0];
    if (!created) return jsonError('Failed to create row', 500);

    return jsonOk(coerceRowFromDb(created, columns));
  } catch (err) {
    console.error(`[pack-tables] POST /${table} error:`, err);
    return jsonError('Failed to create row', 500);
  }
}