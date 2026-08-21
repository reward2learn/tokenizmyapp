/**
 * Custom Columns API — overlay management.
 *
 * GET  /api/sheet-data/custom-columns?sheet=X  → list custom columns (meta)
 * POST /api/sheet-data/custom-columns          → create a custom column
 *
 * Custom columns are stored in knowledge_snippets.workbook_custom_columns and
 * are merged into the sheet-data GET response at their display position. The
 * workbook buffer (workbook_data) is NEVER modified, so Excel column indices —
 * and every formula reference to columns after an inserted custom column —
 * remain exactly as saved.
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@/generated/prisma';
import { read } from 'xlsx';
import { findCachedWorkbook } from '@/lib/workbook-cache';
import { findHeaderRow, buildColumnKeys } from '@/lib/workbook-mapping';
import {
  CUSTOM_COLUMNS_SNIPPET_KEY,
  emptyCustomColumnsStore,
  parseCustomColumnsStore,
  nextVirtualSlot,
  resolveSheetColumns,
  resolveCustomColumnByName,
  type CustomColumn,
  type CustomColumnsStore,
} from '@/lib/custom-columns';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const INVALID_NAME = /^_|_(cell|formula|unevaluable)$/i;

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Column name is required';
  if (trimmed.length > 60) return 'Column name must be 60 characters or fewer';
  if (INVALID_NAME.test(trimmed)) return 'Column name cannot start with "_" or end with _cell/_formula/_unevaluable';
  return null;
}

function toMeta(col: CustomColumn): {
  id: string;
  sheet: string;
  name: string;
  position: number;
  virtualCol: number;
  cellCount: number;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: col.id,
    sheet: col.sheet,
    name: col.name,
    position: col.position,
    virtualCol: col.virtualCol,
    cellCount: Object.keys(col.cells).length,
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('sheet');

  const prisma = getClient();
  try {
    if (!sheetName) {
      return NextResponse.json({ error: 'Query param "sheet" is required' }, { status: 400 });
    }
    // Resolve appId the same way sheet-data does (upload may have used tenant slug).
    // GET does not require a workbook — empty overlay is a valid response.
    const cached = await findCachedWorkbook(prisma);
    const cacheAppId = cached?.appId ?? '';
    const snippet = await prisma.knowledgeSnippet.findUnique({
      where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: cacheAppId } },
    });
    const store = parseCustomColumnsStore(snippet?.content ?? null);
    const columns = resolveSheetColumns(store, sheetName).map(toMeta);
    return NextResponse.json({ success: true, data: { columns } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const sheetName = String(body?.sheet ?? '').trim();
    const name = String(body?.name ?? '').trim();
    const rawPosition = body?.position;

    if (!sheetName) {
      return NextResponse.json({ error: 'Field "sheet" is required' }, { status: 400 });
    }
    const nameError = validateName(name);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    // Confirm the sheet exists in the cached workbook and get its visible columns.
    const cached = await findCachedWorkbook(prisma);
    const cacheAppId = cached?.appId ?? '';
    if (!cached?.content) {
      return NextResponse.json({ error: 'No workbook cached. Upload via Config > Source first.' }, { status: 404 });
    }
    const wb = read(Buffer.from(cached.content, 'base64'), { type: 'buffer', cellFormula: false });
    const tabName = wb.SheetNames?.find(
      (n) => typeof n === 'string' && n.toLowerCase() === sheetName.toLowerCase(),
    );
    if (!tabName) {
      return NextResponse.json({ error: `Sheet "${sheetName}" not found`, availableSheets: wb.SheetNames || [] }, { status: 404 });
    }

    const snippet = await prisma.knowledgeSnippet.findUnique({
      where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: cacheAppId } },
    });
    const store = parseCustomColumnsStore(snippet?.content ?? null);

    // Uniqueness: against workbook visible columns and existing custom columns.
    const { headers: rawHeaders } = findHeaderRow(wb.Sheets[tabName]!);
    const workbookKeys = buildColumnKeys(rawHeaders).filter((k) => !k.startsWith('__hidden_'));
    const lowerName = name.toLowerCase();
    if (workbookKeys.some((k) => k.toLowerCase() === lowerName)) {
      return NextResponse.json({ error: `Column "${name}" already exists in sheet "${tabName}"` }, { status: 409 });
    }
    if (resolveCustomColumnByName(store, tabName, name)) {
      return NextResponse.json({ error: `Custom column "${name}" already exists in sheet "${tabName}"` }, { status: 409 });
    }

    const position =
      rawPosition === undefined || rawPosition === null
        ? workbookKeys.length
        : Math.max(0, Math.min(Math.floor(Number(rawPosition)), workbookKeys.length));

    const column: CustomColumn = {
      id: randomUUID(),
      sheet: tabName,
      name,
      position,
      virtualCol: nextVirtualSlot(store),
      cells: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextStore: CustomColumnsStore = {
      ...emptyCustomColumnsStore(),
      columns: [...store.columns, column],
    };

    await prisma.knowledgeSnippet.upsert({
      where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: cacheAppId } },
      create: { key: CUSTOM_COLUMNS_SNIPPET_KEY, category: 'cache', content: JSON.stringify(nextStore), appId: cacheAppId },
      update: { content: JSON.stringify(nextStore) },
    });

    return NextResponse.json({ success: true, data: { column: toMeta(column) } }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
