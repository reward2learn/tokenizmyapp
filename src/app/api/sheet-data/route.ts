/**
 * Sheet Data API
 *
 * GET /api/sheet-data?sheet=PL&page=1&perPage=200
 * POST /api/sheet-data/update-cell
 *
 * Reads the cached workbook, detects the header row automatically, and returns
 * paginated sheet data as a JSON array of objects keyed by column header.
 *
 * Each row includes _excelCells mapping to preserve original Excel positions
 * even after sorting and filtering in the frontend DataGrid.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { read, utils, write } from 'xlsx';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import { evaluateFormula } from '@/lib/excel-formula';
import { findHeaderRow, buildColumnKeys } from '@/lib/workbook-mapping';
import type { WorkbookFormulaMap } from '@/lib/workbook-formulas';
import { sortSheetRows, type SheetSortBy } from '@/lib/sheet-data-sort';
import {
  CUSTOM_COLUMNS_SNIPPET_KEY,
  parseCustomColumnsStore,
  resolveSheetColumns,
  mergeColumnOrder,
  applyCustomColumnOverlay,
  evaluateCustomColumnCell,
  virtualAddress,
  type CustomColumnsStore,
} from '@/lib/custom-columns';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

// ── GET handler ─────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('sheet');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(1000, Math.max(1, parseInt(searchParams.get('perPage') ?? '200', 10)));

  // Formula mode OFF by default: the GET reads the workbook WITHOUT parsing
  // formula strings (cellFormula: false) and returns no `_formula` metadata,
  // so table loads never trigger formula parsing/operations. When enabled
  // (?formulas=1) formulas are read and attached as `<col>_formula`.
  const formulasEnabled = searchParams.get('formulas') === '1';

  // Server-side sort: JSON array of [column, direction] pairs, e.g.
  // sortBy=[["Amount","desc"],["Date","asc"]]. Sorting happens on the FULL
  // filtered row set BEFORE pagination so the returned page is ordered by the
  // entire column — including rows not loaded into the current page.
  let sortBy: SheetSortBy = [];
  try {
    const raw = searchParams.get('sortBy');
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        sortBy = parsed
          .filter(
            (e): e is [string, 'asc' | 'desc'] =>
              Array.isArray(e) && e.length === 2 &&
              typeof e[0] === 'string' && (e[1] === 'asc' || e[1] === 'desc'),
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
    const cached = await prisma.knowledgeSnippet.findUnique({
      where: { key_appId: { key: 'workbook_data', appId: getCurrentAppId() } },
    });
    if (!cached?.content) {
      return NextResponse.json({ error: 'No workbook cached. Upload the workbook via Config > Source first.' }, { status: 404 });
    }

    const buf = Buffer.from(cached.content, 'base64');
    const wb = read(buf, { type: 'buffer', cellFormula: formulasEnabled });

    // Import-time formula inventory (knowledge_snippets.workbook_formulas).
    // Used as a value fallback for formula cells the live evaluator cannot
    // compute; every reference inside it is mapped to DB-sheet coordinates.
    let formulaMap: WorkbookFormulaMap | null = null;
    if (formulasEnabled) {
      try {
        const mapSnippet = await prisma.knowledgeSnippet.findUnique({
          where: { key_appId: { key: 'workbook_formulas', appId: getCurrentAppId() } },
        });
        if (mapSnippet?.content) formulaMap = JSON.parse(mapSnippet.content) as WorkbookFormulaMap;
      } catch {
        formulaMap = null;
      }
    }

    const tabName = wb.SheetNames?.find((n) => 
      typeof n === "string" && n.toLowerCase() === sheetName.toLowerCase()
    );
    if (!tabName) {
      return NextResponse.json({
        error: `Sheet "${sheetName}" not found`,
        availableSheets: wb.SheetNames,
      }, { status: 404 });
    }

    const ws = wb.Sheets[tabName]!;

    // Custom-column overlay store (knowledge_snippets.workbook_custom_columns).
    // Custom columns are NEVER written into the workbook buffer, so Excel
    // column indices (and every formula reference) are preserved no matter how
    // many custom columns are inserted.
    let customStore: CustomColumnsStore = parseCustomColumnsStore(null);
    try {
      const customSnippet = await prisma.knowledgeSnippet.findUnique({
        where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: getCurrentAppId() } },
      });
      customStore = parseCustomColumnsStore(customSnippet?.content ?? null);
    } catch {
      customStore = parseCustomColumnsStore(null);
    }
    const customs = resolveSheetColumns(customStore, tabName);

    // Detect the correct header row
    const { headerRow, headers } = findHeaderRow(ws);

    // Build clean column keys with deduplication
    const columnKeys = buildColumnKeys(headers);

    const columns = columnKeys.filter((k) => !k.startsWith('__hidden_'));

    // Parse data using deduplicated column keys
    const allRows = utils.sheet_to_json<Record<string, unknown>>(ws, {
      header: columnKeys,
      defval: '',
      range: headerRow + 1 // Skip header row
    });

    // Remove empty or metadata rows
    const dataRows = allRows.filter((row) => {
      const filled = Object.entries(row).filter(([, v]) => v !== '' && v !== undefined && v !== null);
      const naOnly = filled.every(([, v]) => String(v) === '#N/A');
      if (filled.length === 0 || naOnly) return false;
      
      const isHeader = filled.length === columns.length && 
                      columns.every((c) => String(row[c] ?? '') === c);
      return !isHeader;
    });

    // Apply the custom-column overlay AFTER sheet_to_json (so virtual cells can
    // never leak into the workbook JSON) and BEFORE formula evaluation (so
    // formulas — workbook or custom — can reference custom-column cells).
    // In-memory only; workbook_data in the DB is never touched.
    applyCustomColumnOverlay(wb, customStore, tabName);

    // Add original Excel cell references to each row
    // This ensures that after sorting/filtering in the frontend, we can still map back to the correct Excel cell
    // CRITICAL: Use columnKeys (not columns) for the Excel column index to preserve correct cell positions
    const rowsWithCellRefs = dataRows.map((row, idx) => {
      const excelRow = headerRow + 1 + idx; // Excel is 1-based
      const rowWithRefs: Record<string, unknown> = { 
        ...row, 
        _excelRow: excelRow 
      };

      // Add cell reference for each column using the ORIGINAL columnKeys index
      // (which matches the actual Excel column position, including hidden columns)
      columnKeys.forEach((colKey, colIdx) => {
        if (colKey.startsWith("__hidden_")) return; // skip hidden columns
        const cellAddress = utils.encode_cell({ r: excelRow, c: colIdx });
        rowWithRefs[`${colKey}_cell`] = cellAddress;
        // Formula strings are only attached when formula mode is enabled;
        // the default load returns cached values only (no formula parsing).
        if (formulasEnabled) {
          const cell = ws[cellAddress];
          // Excel stores formulas WITHOUT the leading "=" (OOXML); normalize to
          // "=..." so the frontend formula editor/display treats it as a formula.
          if (cell && typeof cell.f === 'string' && cell.f.trim().length > 0) {
            const formula = cell.f.startsWith('=') ? cell.f : '=' + cell.f;
            rowWithRefs[`${colKey}_formula`] = formula;
            // Compute the formula's value against the DB-saved sheet data so
            // formula cells keep showing values (never formula text) unless the
            // cell is being edited. Falls back to the cached xlsx value, then to
            // the import-time formula map snapshot.
            const result = evaluateFormula(wb, ws, formula, 0, cellAddress);
            rowWithRefs[`${colKey}_unevaluable`] = result.unevaluable;
            if (!result.unevaluable) {
              rowWithRefs[colKey] = result.value ?? '';
            } else {
              const current = rowWithRefs[colKey];
              if (current === '' || current === undefined || current === null) {
                const mapped = formulaMap?.[tabName]?.formulas?.find((f) => f.cell === cellAddress);
                if (mapped && !mapped.unevaluable && mapped.value !== undefined) {
                  rowWithRefs[colKey] = mapped.value;
                }
              }
            }
          }
        }
      });

      // Attach custom-column (overlay) cells for this row. Same 1-based Excel
      // row as the workbook row; virtual addresses never collide with real
      // cells, so custom-column formulas resolve to the transient overlay.
      customs.forEach((ccol) => {
        const cellKey = String(excelRow);
        rowWithRefs[`${ccol.name}_cell`] = virtualAddress(ccol, excelRow);
        const stored = ccol.cells[cellKey];
        if (formulasEnabled && stored?.formula && stored.formula.trim().length > 0) {
          rowWithRefs[`${ccol.name}_formula`] = stored.formula.startsWith('=')
            ? stored.formula
            : '=' + stored.formula;
        }
        const customResult = evaluateCustomColumnCell(wb, ws, ccol, excelRow, formulasEnabled);
        rowWithRefs[ccol.name] = customResult.value ?? '';
        rowWithRefs[`${ccol.name}_unevaluable`] = customResult.unevaluable;
      });

      return rowWithRefs;
    });

    const totalRows = rowsWithCellRefs.length;
    const totalPages = Math.ceil(totalRows / perPage);

    // Sort the ENTIRE filtered row set (all pages) before slicing, so the
    // current page arrives in globally-correct order — the sort query hits the
    // backend and covers every row of the column, not just the loaded page.
    const sortedRows = sortSheetRows(rowsWithCellRefs as Array<Record<string, unknown>>, sortBy);

    const startIdx = (page - 1) * perPage;
    const rows = sortedRows.slice(startIdx, startIdx + perPage).map((r, i) => ({
      ...(r as object),
      // 1-based position in the GLOBALLY sorted order — unique row id for the
      // grid and stable across pages; _excelRow still points at the original
      // Excel cell for edits.
      _rowIndex: startIdx + i + 1,
    }));

    const data = {
      sheet: tabName,
      headerRow,
      // Merge custom columns at their display positions; workbook columns keep
      // their original order/indices (formulas referencing them are unaffected).
      columns: mergeColumnOrder(columns, customs),
      rows,
      totalRows,
      returnedRows: rows.length,
      page,
      perPage,
      totalPages,
    };

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

    console.log("[sheet-data/update-cell] Received payload:", { 
      sheet, rowIndex, column, value, _excelCell 
    });

    if (!sheet || (!rowIndex && !_excelCell) || !column) {
      return NextResponse.json({ 
        error: 'Missing required fields: sheet, rowIndex/_cell, column' 
      }, { status: 400 });
    }

    const cached = await prisma.knowledgeSnippet.findUnique({
      where: { key_appId: { key: 'workbook_data', appId: getCurrentAppId() } },
    });

    if (!cached?.content) {
      return NextResponse.json({ 
        error: 'No workbook cached. Upload via Config > Source first.' 
      }, { status: 404 });
    }

    const buf = Buffer.from(cached.content, 'base64');
    const wb = read(buf, { type: 'buffer', cellFormula: true });

    const tabName = wb.SheetNames?.find((n) => 
      typeof n === "string" && n.toLowerCase() === sheet.toLowerCase()
    );
    if (!tabName) {
      return NextResponse.json({ 
        error: `Sheet "${sheet}" not found`,
        availableSheets: wb.SheetNames || [] 
      }, { status: 404 });
    }

    const ws = wb.Sheets?.[tabName];
    if (!ws) {
      return NextResponse.json({ error: `Worksheet "${tabName}" not found` }, { status: 404 });
    }

    let cellAddress: string;

    if (_excelCell) {
      // Use the original Excel cell reference if provided (preferred)
      cellAddress = _excelCell;
      console.log(`[sheet-data/update-cell] Using original Excel cell: ${cellAddress}`);
    } else {
      // Fallback: calculate from rowIndex and column (for backward compatibility)
      const { headers: rawHeaders } = findHeaderRow(ws);
      const columnKeys = buildColumnKeys(rawHeaders);

      const colIndex = columnKeys.findIndex((key, idx) => {
        const rawHeader = String(rawHeaders[idx] ?? '').trim();
        const searchColumn = String(column ?? '').trim();
        return rawHeader === searchColumn || 
               key.toLowerCase() === searchColumn.toLowerCase() ||
               rawHeader.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '') ||
               key.toLowerCase().replace(/\s+/g, '') === searchColumn.toLowerCase().replace(/\s+/g, '');
      });

      if (colIndex === -1) {
        return NextResponse.json({ 
          error: `Column "${column}" not found in sheet "${sheet}". Available: ${columnKeys.filter(k => !k.startsWith('__hidden_')).join(', ')}` 
        }, { status: 400 });
      }

      const excelRow = Number(rowIndex) + 1;
      cellAddress = utils.encode_cell({ r: excelRow, c: colIndex });
    }

    // Excel formula support: when the edited value starts with "=" the cell
    // stores a formula (f) and the calculated result (v) when evaluable.
    // Unevaluable formulas (VLOOKUP, CHOOSE, cross-sheet exotic, ...) are stored
    // without a cached value — Excel recalculates them on open.
    const isFormula = typeof value === 'string' && value.trim().startsWith('=');
    let responseValue: unknown = value;
    let formula: string | undefined;
    let unevaluable = false;

    if (isFormula) {
      formula = value.trim();
      const storedFormula = formula.replace(/^=/, '');
      const result = evaluateFormula(wb, ws, formula, 0, cellAddress);
      unevaluable = result.unevaluable;
      // Ensure Excel recalculates all formulas when the workbook is next opened
      // (cached values written by SheetJS may be stale for unevaluable formulas).
      if (wb.Workbook) (wb.Workbook as unknown as { CalcPr: { fullCalcOnLoad: boolean } }).CalcPr = { fullCalcOnLoad: true };
      if (!unevaluable) {
        responseValue = result.value;
        if (typeof responseValue === 'number') {
          ws[cellAddress] = { f: storedFormula, v: responseValue, t: 'n', w: String(responseValue) };
        } else {
          const strVal = String(responseValue ?? '');
          ws[cellAddress] = { f: storedFormula, v: strVal, t: 's', w: strVal };
        }
      } else {
        // SheetJS drops formula-only cells on read (f without v), so keep the
        // previous cached value to preserve the cell; Excel recalcs on open.
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
      // Replacing the whole cell object also clears any previous formula
      ws[cellAddress] = {
        v: cellValue,
        t: typeof value === 'number' ? 'n' : 's',
      };
      responseValue = cellValue;
    }

    const updatedBuffer = write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64Updated = Buffer.from(updatedBuffer).toString('base64');

    await prisma.knowledgeSnippet.update({
      where: { key_appId: { key: 'workbook_data', appId: getCurrentAppId() } },
      data: { content: base64Updated },
    });

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
