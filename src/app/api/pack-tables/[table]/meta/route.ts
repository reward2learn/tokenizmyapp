/**
 * Pack Table CRUD — column metadata
 *
 * GET /api/pack-tables/[table]/meta  (requireSession)
 *
 * Returns the table's column metadata from information_schema.columns plus the
 * list of writable (non-base) column names. See spec §3.2.
 */

import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireSession } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { fetchPackTableColumns, resolvePackTable, type RawDb } from '@/lib/pack-table';

export const dynamic = 'force-dynamic';

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
    if (!resolved.ok) {
      return resolved.reason === 'invalid-identifier'
        ? jsonError('Invalid table name', 400)
        : jsonError('Not a pack table', 404);
    }

    const columns = await fetchPackTableColumns(db, table);
    return jsonOk({
      table,
      columns,
      writableColumns: columns.filter((c) => c.editable).map((c) => c.name),
    });
  } catch (err) {
    console.error(`[pack-tables] GET /${table}/meta error:`, err);
    return jsonError('Failed to fetch table metadata', 500);
  }
}