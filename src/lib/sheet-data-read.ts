/**
 * Read-only workbook sheet queries — shared by GET /api/sheet-data and the
 * chat assistant `query_sheet_data` tool.
 */
import { utils, type WorkBook, type WorkSheet } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';
import { findHeaderRow, buildColumnKeys } from '@/lib/workbook-mapping';
import type { WorkbookFormulaMap } from '@/lib/workbook-formulas';
import { sortSheetRows, type SheetSortBy } from '@/lib/sheet-data-sort';
import {
  findCachedWorkbook,
  getParsedWorkbook,
  withWorksheetOverlay,
  type WorkbookCacheClient,
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
import { buildPagePrompt } from '@/lib/sheet-prompt';

export interface SheetDataPagePayload {
  sheet: string;
  headerRow: number;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  totalRows: number;
  returnedRows: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface QuerySheetDataInput {
  sheet: string;
  page?: number;
  perPage?: number;
  formulas?: boolean;
  sortBy?: SheetSortBy;
  /** Case-insensitive substring match against any visible column in a row. */
  searchText?: string;
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

  customs.forEach((ccol) => {
    rowWithRefs[`${ccol.name}_cell`] = virtualAddress(ccol, excelRow);
    const stored = ccol.cells[String(excelRow)];
    rowWithRefs[ccol.name] = stored?.value ?? '';
  });

  return rowWithRefs;
}

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

function rowMatchesSearch(
  row: Record<string, unknown>,
  columns: string[],
  searchText: string,
): boolean {
  const needle = searchText.trim().toLowerCase();
  if (!needle) return true;
  return columns.some((col) => String(row[col] ?? '').toLowerCase().includes(needle));
}

function buildSheetPagePayload(
  wb: WorkBook,
  ws: WorkSheet,
  tabName: string,
  options: Required<Pick<QuerySheetDataInput, 'page' | 'perPage' | 'formulas'>> & {
    sortBy: SheetSortBy;
    searchText?: string;
    formulaMap: WorkbookFormulaMap | null;
    customStore: CustomColumnsStore;
  },
): SheetDataPagePayload {
  const { page, perPage, formulas, sortBy, searchText, formulaMap, customStore } = options;
  const customs = resolveSheetColumns(customStore, tabName);

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

  let rowsWithCellRefs = dataRows.map((row, idx) =>
    buildRowSkeleton(row, idx, headerRow, columnKeys, customs),
  );

  if (searchText?.trim()) {
    rowsWithCellRefs = rowsWithCellRefs.filter((row) =>
      rowMatchesSearch(row, mergeColumnOrder(columns, customs), searchText),
    );
  }

  const totalRows = rowsWithCellRefs.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));

  const sortedRows = sortSheetRows(rowsWithCellRefs as Array<Record<string, unknown>>, sortBy);
  const startIdx = (page - 1) * perPage;
  const pageRows = sortedRows.slice(startIdx, startIdx + perPage);

  if (formulas) {
    applyCustomColumnOverlay(wb, customStore, tabName, { evaluateFormulas: false });
    const formulaByCell = buildFormulaCellLookup(formulaMap, tabName);
    for (const row of pageRows) {
      evaluateFormulasOnPageRow(row, wb, ws, columnKeys, customs, formulaByCell);
    }
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
}

export async function listWorkbookSheetNames(
  client: WorkbookCacheClient,
): Promise<{ ok: true; sheets: string[] } | { ok: false; error: string }> {
  const cached = await findCachedWorkbook(client);
  if (!cached?.content) {
    return { ok: false, error: 'No workbook cached. Upload the workbook via Config > Source first.' };
  }

  const wb = getParsedWorkbook(cached.content, { cellFormula: false, appId: cached.appId });
  return { ok: true, sheets: wb.SheetNames ?? [] };
}

export async function querySheetDataFromCache(
  client: WorkbookCacheClient,
  input: QuerySheetDataInput,
): Promise<
  | { ok: true; data: SheetDataPagePayload; tsv: string }
  | { ok: false; error: string; availableSheets?: string[] }
> {
  const sheetName = input.sheet?.trim();
  if (!sheetName) {
    return { ok: false, error: 'Sheet name is required (e.g. "BEP Monthly", "PL").' };
  }

  const page = Math.max(1, input.page ?? 1);
  const perPage = Math.min(200, Math.max(1, input.perPage ?? 50));
  const formulasEnabled = input.formulas === true;
  const sortBy = input.sortBy ?? [];

  const cached = await findCachedWorkbook(client);
  if (!cached?.content) {
    return {
      ok: false,
      error: 'No workbook cached. Upload the workbook via Config > Source first.',
    };
  }

  const wb = getParsedWorkbook(cached.content, {
    cellFormula: formulasEnabled,
    appId: cached.appId,
  });

  let formulaMap: WorkbookFormulaMap | null = null;
  if (formulasEnabled) {
    try {
      const mapSnippet = await client.knowledgeSnippet.findUnique({
        where: { key_appId: { key: 'workbook_formulas', appId: cached.appId } },
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
    return {
      ok: false,
      error: `Sheet "${sheetName}" not found in the cached workbook.`,
      availableSheets: wb.SheetNames,
    };
  }

  let customStore: CustomColumnsStore = parseCustomColumnsStore(null);
  try {
    const customSnippet = await client.knowledgeSnippet.findUnique({
      where: { key_appId: { key: CUSTOM_COLUMNS_SNIPPET_KEY, appId: cached.appId } },
    });
    customStore = parseCustomColumnsStore(customSnippet?.content ?? null);
  } catch {
    customStore = parseCustomColumnsStore(null);
  }

  const data = withWorksheetOverlay(wb, tabName, (ws) =>
    buildSheetPagePayload(wb, ws, tabName, {
      page,
      perPage,
      formulas: formulasEnabled,
      sortBy,
      searchText: input.searchText,
      formulaMap,
      customStore,
    }),
  );

  const tsv = buildPagePrompt({
    sheet: data.sheet,
    rows: data.rows,
    colOrder: data.columns,
  });

  const header = [
    `Sheet: ${data.sheet}`,
    `Page ${data.page} of ${data.totalPages} (${data.returnedRows} of ${data.totalRows} rows)`,
    input.searchText?.trim() ? `Filter: rows containing "${input.searchText.trim()}"` : null,
  ].filter(Boolean).join('\n');

  return {
    ok: true,
    data,
    tsv: tsv ? `${header}\n\n${tsv}` : `${header}\n\n(no matching rows on this page)`,
  };
}
