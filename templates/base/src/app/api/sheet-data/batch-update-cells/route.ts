import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, write } from 'xlsx';
import { applyCellUpdate, type CellUpdateParams, type CellUpdateResult } from '@/lib/workbook-cell-update';
import { CUSTOM_COLUMNS_SNIPPET_KEY, parseCustomColumnsStore } from '@/lib/custom-columns';

export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

/**
 * Batch cell writes for range edits (fill handle, paste). Behavior matches
 * N sequential update-cell calls (custom-column overlay + workbook writes),
 * but the workbook buffer is read/written ONCE and the overlay store is
 * upserted ONCE — single round trip, single buffer rewrite.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const { sheet, cells } = body as { sheet?: string; cells?: CellUpdateParams[] };

    const sheetStr = String(sheet ?? '').trim();
    if (!sheetStr || !Array.isArray(cells) || cells.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: sheet, cells[]' }, { status: 400 });
    }
    if (cells.length > 5000) {
      return NextResponse.json({ error: `Too many cells in one batch (${cells.length} > 5000)` }, { status: 400 });
    }

    const cached = await prisma.knowledgeSnippet.findUnique({ where: { key: 'workbook_data' } });
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
      where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
    });
    const customStore = parseCustomColumnsStore(customSnippet?.content ?? null);

    const results: Array<CellUpdateResult & { params: CellUpdateParams }> = [];
    let updated = 0;
    let failed = 0;

    for (const raw of cells) {
      const colStr = String(raw.column ?? '').trim();
      const params: CellUpdateParams = { ...raw, column: colStr, sheet: tabName };
      if (!colStr || (!raw.rowIndex && !raw._excelCell)) {
        failed += 1;
        results.push({ ...failedResult('Missing column or row'), params });
        continue;
      }
      const result = applyCellUpdate(wb, ws, tabName, customStore, params);
      results.push({ ...result, params });
      if (result.success) updated += 1;
      else failed += 1;
    }

    // Persist the custom-column overlay if any custom cell was written.
    if (customSnippet || customStore.columns.length > 0) {
      await prisma.knowledgeSnippet.upsert({
        where: { key: CUSTOM_COLUMNS_SNIPPET_KEY },
        create: { key: CUSTOM_COLUMNS_SNIPPET_KEY, category: 'cache', content: JSON.stringify(customStore) },
        update: { content: JSON.stringify(customStore) },
      });
    }

    const updatedBuffer = write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64Updated = Buffer.from(updatedBuffer).toString('base64');
    await prisma.knowledgeSnippet.update({
      where: { key: 'workbook_data' },
      data: { content: base64Updated },
    });

    return NextResponse.json({
      success: true,
      updated,
      failed,
      results: results.map((r) => ({
        cell: r.cell,
        column: r.params.column,
        value: r.value ?? null,
        formula: r.formula,
        unevaluable: r.unevaluable,
        isCustom: r.isCustom,
        error: r.error,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheet-data/batch-update-cells] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function failedResult(error: string): CellUpdateResult {
  return { success: false, cell: '', value: null, unevaluable: false, isCustom: false, error };
}
