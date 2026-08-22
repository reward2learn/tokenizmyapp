/**
 * Sheet Data API
 *
 * GET /api/sheet-data?sheet=PL&page=1&perPage=200
 * POST /api/sheet-data/update-cell
 *
 * Reads the cached workbook, detects the header row automatically, and returns
 * paginated sheet data as a JSON array of objects keyed by column header.
 *
 * Formula evaluation (when ?formulas=1) runs ONLY on the current page after
 * sort + slice — never on the full sheet — to avoid 504s on large tabs (TB).
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, utils, write } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';
import { findHeaderRow, buildColumnKeys } from '@/lib/workbook-mapping';
import type { WorkbookFormulaMap } from '@/lib/workbook-formulas';
import { sortSheetRows, type SheetSortBy } from '@/lib/sheet-data-sort';
import {
  findCachedWorkbook,
  getParsedWorkbook,
  invalidateParsedWorkbookCache,
  withWorksheetOverlay,
} from '@/lib/workbook-cache';
import {
  CUSTOM_COLUMNS_SNIPPET_KEY,
  parseCustomColumnsStore,
  resolveSheetColumns,
  mergeColumnOrder,
  applyCustomColumnOverlay,
  evaluateCustomColumnCell,
  virtualAddress,
  type CustomColumn,
  type CustomColumnsStore,
} from '@/lib/custom-columns';

export const dynamic = 'force-dynamic';
/** Raised from 30s — large sheets still need headroom for parse + page formula eval. */
export const maxDuration = 120;

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

type FormulaCellLookup = Map<string, { value?: unknown; unevaluable?: boolean }>;

function buildFormulaCellLookup(
  formulaMap: WorkbookFormulaMap | null,
  tabName: string,
): FormulaCellLookup {
  const list = formulaMap?.[tabName]?.formulas;
  if (!list?.length) return new Map();
  const map: FormulaCellLookup = new Map();
  for (const f of list) {
    map.set(f.cell, f);
  }
  return map;
}

/** Attach Excel cell addresses + lightweight custom values (no formula eval). */
function buildRowSkeleton(
  row: Record<string, unknown>,
  idx: number,
  headerRow: number,
  columnKeys: string[],
  customs: CustomColumn[],
): Record<string, unknown> {
  const excelRow = headerRow + 1 + idx;
  const rowWithRefs: Record<string, unknown> = {
    ...row,
    _excelRow: excelRow,
  };

  columnKeys.forEach((colKey, colIdx) => {
    if (colKey.startsWith('__hidden_')) return;
    rowWithRefs[`${colKey}_cell`] = utils.encode_cell({ r: excelRow, c: colIdx });
  });

  // Stored custom values only — formula evaluation happens after pagination.
  customs.forEach((ccol) => {
    rowWithRefs[`${ccol.name}_cell`] = virtualAddress(ccol, excelRow);
    const stored = ccol.cells[String(excelRow)];
    rowWithRefs[ccol.name] = stored?.value ?? '';
  });

  return rowWithRefs;
}

/** Live-evaluate formulas for one visible page row (mutates `row` in place). */
function evaluateFormulasOnPageRow(
  row: Record<string, unknown>,
  wb: WorkBook,
  ws: WorkSheet,
  columnKeys: string[],
  customs: CustomColumn[],
  formulaByCell: FormulaCellLookup,
): void {
  const excelRow = Number(row._excelRow);
  if (!Number.isFinite(excelRow)) return;

  columnKeys.forEach((colKey, colIdx) => {
    if (colKey.startsWith('__hidden_')) return;
    const cellAddress = utils.encode_cell({ r: excelRow, c: colIdx });
    const cell = ws[cellAddress];
    if (!(cell && typeof cell.f === 'string' && cell.f.trim().length > 0)) return;

    const formula = cell.f.startsWith('=') ? cell.f : '=' + cell.f;
    row[`${colKey}_formula`] = formula;
    const result = evaluateFormula(wb, ws, formula, 0, cellAddress);
    row[`${colKey}_unevaluable`] = result.unevaluable;
    if (!result.unevaluable) {
      row[colKey] = result.value ?? '';
      return;
    }
    const current = row[colKey];
    if (current === '' || current === undefined || current === null) {
      const mapped = formulaByCell.get(cellAddress);
      if (mapped && !mapped.unevaluable && mapped.value !== undefined) {
        row[colKey] = mapped.value;
      }
    }
  });

  customs.forEach((ccol) => {
    const stored = ccol.cells[String(excelRow)];
    if (stored?.formula && stored.formula.trim().length > 0) {
      row[`${ccol.name}_formula`] = stored.formula.startsWith('=')
        ? stored.formula
        : '=' + stored.formula;
    }
    const customResult = evaluateCustomColumnCell(wb, ws, ccol, excelRow, true);
    row[ccol.name] = customResult.value ?? '';
    row[`${ccol.name}_unevaluable`] = customResult.unevaluable;
  });
}

// ── GET handler ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('sheet');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(1000, Math.max(1, parseInt(searchParams.get('perPage') ?? '200', 10)));

  const formulasEnabled = searchParams.get('formulas') === '1';

  let sortBy: SheetSortBy = [];
  try {
    const raw = searchParams.get('sortBy');
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        sortBy = parsed
          .filter(
            (e): e is [string, 'asc' | 'desc'] =>
              Array.isArray(e) &&
              e.length === 2 &&
              typeof e[0] === 'string' &&
              (e[1] === 'asc' || e[1] === 'desc'),
          )
          .slice(0, 3);
      }
    }
  } catch {
    sortBy = [];
  }

  if (!sheetName) {
    return NextResponse.json({ error: 'Query param "sheet" is required (e.g. ?sheet=PL)' }, { status: 400 });
  }

  const prisma = getClient();
  try {
    const cached = await findCachedWorkbook(prisma);
    if (!cached?.content) {
      return NextResponse.json(
        { error: 'No workbook cached. Upload the workbook via Config > Source first.' },
        { status: 404 },
      );
    }
    const cacheAppId = cached.appId;

    // Process-local parse cache — avoids re-decoding/parsing on warm instances.
    const wb = getParsedWorkbook(cached.content, {
      cellFormula: formulasEnabled,
      appId: cacheAppId,
    });

    let formulaMap: WorkbookFormulaMap | null = null;
    if (formulasEnabled) {
      try {
        const mapSnippet = await prisma.knowledgeSnippet.findUnique({
          where: { key_appId: { key: 'workbook_formulas', appId: cacheAppId } },
        });
        if (mapSnippet?.content) formulaMap = JSON.parse(mapSnippet.content) as WorkbookFormulaMap;
      } catch {
        formulaMap = null;
      }
    }

    const tabName = wb.SheetNames?.find(
      (n) => typeof n === 'string' && n.toLowerCase() === sheetName.toLowerCase(),
    );
    if (!tabName) {
      return NextResponse.json(
        {
          error: `Sheet "${sheetName}" not found`,
          availableSheets: wb.SheetNames,
        },
        { status: 404 },
      );
    }

    let customStore: CustomColumnsStore = parseCustomColumnsStore(null);
    try {
      const customSnippet = await prisma.knowledgeSnippet.findUnique({
        where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: cacheAppId } },
      });
      customStore = parseCustomColumnsStore(customSnippet?.content ?? null);
    } catch {
      customStore = parseCustomColumnsStore(null);
    }
    const customs = resolveSheetColumns(customStore, tabName);

    const buildPayload = (ws: WorkSheet) => {
      const { headerRow, headers } = findHeaderRow(ws);
      const columnKeys = buildColumnKeys(headers);
      const columns = columnKeys.filter((k) => !k.startsWith('__hidden_'));

      const allRows = utils.sheet_to_json<Record<string, unknown>>(ws, {
        header: columnKeys,
        defval: '',
        range: headerRow + 1,
      });

      const dataRows = allRows.filter((row) => {
        const filled = Object.entries(row).filter(([, v]) => v !== '' && v !== undefined && v !== null);
        const naOnly = filled.every(([, v]) => String(v) === '#N/A');
        if (filled.length === 0 || naOnly) return false;

        const isHeader =
          filled.length === columns.length && columns.every((c) => String(row[c] ?? '') === c);
        return !isHeader;
      });

      // Skeleton for ALL rows (addresses + cached values) — no formula eval yet.
      // Sort uses Excel-cached values so global order stays correct without
      // re-evaluating every formula on the sheet.
      const rowsWithCellRefs = dataRows.map((row, idx) =>
        buildRowSkeleton(row, idx, headerRow, columnKeys, customs),
      );

      const totalRows = rowsWithCellRefs.length;
      const totalPages = Math.ceil(totalRows / perPage);

      const sortedRows = sortSheetRows(rowsWithCellRefs as Array<Record<string, unknown>>, sortBy);
      const startIdx = (page - 1) * perPage;
      const pageRows = sortedRows.slice(startIdx, startIdx + perPage);

      if (formulasEnabled) {
        // Materialize custom cells for formula refs; skip full-sheet pass-2 eval.
        applyCustomColumnOverlay(wb, customStore, tabName, { evaluateFormulas: false });
        const formulaByCell = buildFormulaCellLookup(formulaMap, tabName);
        for (const row of pageRows) {
          evaluateFormulasOnPageRow(row, wb, ws, columnKeys, customs, formulaByCell);
        }
      } else {
        // Still attach stored custom values (already in skeleton).
      }

      const rows = pageRows.map((r, i) => ({
        ...r,
        _rowIndex: startIdx + i + 1,
      }));

      return {
        sheet: tabName,
        headerRow,
        columns: mergeColumnOrder(columns, customs),
        rows,
        totalRows,
        returnedRows: rows.length,
        page,
        perPage,
        totalPages,
      };
    };

    // Isolate overlay mutations from the process-local parse cache.
    const data = withWorksheetOverlay(wb, tabName, buildPayload);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ── POST handler for cell updates ─────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getClient();
  try {
    const body = await request.json();
    const { sheet, rowIndex, column, value, _excelCell } = body;

    console.log('[sheet-data/update-cell] Received payload:', {
      sheet,
      rowIndex,
      column,
      value,
      _excelCell,
    });

    if (!sheet || (!rowIndex && !_excelCell) || !column) {
      return NextResponse.json(
        {
          error: 'Missing required fields: sheet, rowIndex/_cell, column',
        },
        { status: 400 },
      );
    }

    const cached = await findCachedWorkbook(prisma);
    if (!cached?.content) {
      return NextResponse.json(
        {
          error: 'No workbook cached. Upload via Config > Source first.',
        },
        { status: 404 },
      );
    }
    const cacheAppId = cached.appId;

    // Writes must not mutate the shared GET parse cache — parse a private copy.
    const buf = Buffer.from(cached.content, 'base64');
    const wb = read(buf, { type: 'buffer', cellFormula: true });

    const tabName = wb.SheetNames?.find(
      (n) => typeof n === 'string' && n.toLowerCase() === sheet.toLowerCase(),
    );
    if (!tabName) {
      return NextResponse.json(
        {
          error: `Sheet "${sheet}" not found`,
          availableSheets: wb.SheetNames || [],
        },
        { status: 404 },
      );
    }

    const ws = wb.Sheets?.[tabName];
    if (!ws) {
      return NextResponse.json({ error: `Worksheet "${tabName}" not found` }, { status: 404 });
    }

    let cellAddress: string;

    if (_excelCell) {
      cellAddress = _excelCell;
      console.log(`[sheet-data/update-cell] Using original Excel cell: ${cellAddress}`);
    } else {
      const { headers: rawHeaders } = findHeaderRow(ws);
      const columnKeys = buildColumnKeys(rawHeaders);

      const colIndex = columnKeys.findIndex((key, idx) => {
        const rawHeader = String(rawHeaders[idx] ?? '').trim();
        const searchColumn = String(column ?? '').trim();
        return (
          rawHeader === searchColumn ||
          key.toLowerCase() === searchColumn.toLowerCase() ||
          rawHeader.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '') ||
          key.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '')
        );
      });

      if (colIndex === -1) {
        return NextResponse.json(
          {
            error: `Column "${column}" not found in sheet "${sheet}". Available: ${columnKeys.filter((k) => !k.startsWith('__hidden_')).join(', ')}`,
          },
          { status: 400 },
        );
      }

      const excelRow = Number(rowIndex) + 1;
      cellAddress = utils.encode_cell({ r: excelRow, c: colIndex });
    }

    const isFormula = typeof value === 'string' && value.trim().startsWith('=');
    let responseValue: unknown = value;
    let formula: string | undefined;
    let unevaluable = false;

    if (isFormula) {
      formula = value.trim();
      const storedFormula = formula.replace(/^=/, '');
      const result = evaluateFormula(wb, ws, formula, 0, cellAddress);
      unevaluable = result.unevaluable;
      if (wb.Workbook) {
        (wb.Workbook as unknown as { CalcPr: { fullCalcOnLoad: boolean } }).CalcPr = {
          fullCalcOnLoad: true,
        };
      }
      if (!unevaluable) {
        responseValue = result.value;
        if (typeof responseValue === 'number') {
          ws[cellAddress] = { f: storedFormula, v: responseValue, t: 'n', w: String(responseValue) };
        } else {
          const strVal = String(responseValue ?? '');
          ws[cellAddress] = { f: storedFormula, v: strVal, t: 's', w: strVal };
        }
      } else {
        const prev = ws[cellAddress]?.v;
        ws[cellAddress] = {
          f: storedFormula,
          v: typeof prev === 'number' ? prev : 0,
          t: 'n',
        };
        responseValue = null;
      }
    } else {
      const cellValue = typeof value === 'number' ? value : String(value || '');
      ws[cellAddress] = {
        v: cellValue,
        t: typeof value === 'number' ? 'n' : 's',
      };
      responseValue = cellValue;
    }

    const updatedBuffer = write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64Updated = Buffer.from(updatedBuffer).toString('base64');

    await prisma.knowledgeSnippet.update({
      where: { key_appId: { key: 'workbook_data', appId: cacheAppId } },
      data: { content: base64Updated },
    });

    // Cached parse is stale after persist — drop it so the next GET re-parses.
    invalidateParsedWorkbookCache(cacheAppId);

    return NextResponse.json({
      success: true,
      message: `Updated ${sheet}!${cellAddress}`,
      cell: cellAddress,
      value: responseValue ?? null,
      formula,
      unevaluable,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheet-data/update-cell] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
