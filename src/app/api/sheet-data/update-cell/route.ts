import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, write } from 'xlsx';
import { applyCellUpdate } from '@/lib/workbook-cell-update';
import { CUSTOM_COLUMNS_SNIPPET_KEY, parseCustomColumnsStore } from '@/lib/custom-columns';
import { findCachedWorkbook, invalidateParsedWorkbookCache } from '@/lib/workbook-cache';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const { sheet, rowIndex, column, value, _excelCell, _excelRow, formulaMode } = body;

    const sheetStr = String(sheet ?? '').trim();
    const colStr = String(column ?? '').trim();

    console.log('[sheet-data/update-cell] Received:', { sheet: sheetStr, rowIndex, column: colStr, value, _excelCell });

    if (!sheetStr || (!rowIndex && !_excelCell) || !colStr) {
      return NextResponse.json({ error: 'Missing required fields: sheet, rowIndex/_cell, column' }, { status: 400 });
    }

    const cached = await findCachedWorkbook(prisma);
    const cacheAppId = cached?.appId ?? '';
    if (!cached?.content) {
      return NextResponse.json({ error: 'No workbook cached. Upload via Config > Source first.' }, { status: 404 });
    }

    const buf = Buffer.from(cached.content, 'base64');
    // cellFormula: true is REQUIRED — otherwise write() below strips every formula from the workbook.
    const wb = read(buf, { type: 'buffer', cellFormula: true });

    const tabName = wb.SheetNames?.find((n) => typeof n === 'string' && n.toLowerCase() === sheetStr.toLowerCase());
    if (!tabName) {
      return NextResponse.json({ error: `Sheet "${sheetStr}" not found`, availableSheets: wb.SheetNames || [] }, { status: 404 });
    }
    const ws = wb.Sheets?.[tabName];
    if (!ws) {
      return NextResponse.json({ error: `Worksheet "${tabName}" not found` }, { status: 404 });
    }

    const customSnippet = await prisma.knowledgeSnippet.findUnique({
      where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: cacheAppId } },
    });
    const customStore = parseCustomColumnsStore(customSnippet?.content ?? null);

    const result = applyCellUpdate(wb, ws, tabName, customStore, {
      sheet: tabName,
      rowIndex,
      column: colStr,
      value,
      _excelCell,
      _excelRow,
      formulaMode,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Update failed' }, { status: 400 });
    }

    // Persist the custom-column overlay (if any custom cell was written).
    if (customSnippet || customStore.columns.length > 0) {
      await prisma.knowledgeSnippet.upsert({
        where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: cacheAppId } },
        create: { key: CUSTOM_COLUMNS_SNIPPET_KEY, category: 'cache', content: JSON.stringify(customStore), appId: cacheAppId },
        update: { content: JSON.stringify(customStore) },
      });
    }

    const updatedBuffer = write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64Updated = Buffer.from(updatedBuffer).toString('base64');
    await prisma.knowledgeSnippet.update({
      where: { key_appId: { key: 'workbook_data', appId: cacheAppId } },
      data: { content: base64Updated },
    });

    invalidateParsedWorkbookCache(cacheAppId);

    return NextResponse.json({
      success: true,
      message: `Updated ${tabName}!${result.cell}`,
      cell: result.cell,
      value: result.value ?? null,
      formula: result.formula,
      unevaluable: result.unevaluable,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheet-data/update-cell] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
