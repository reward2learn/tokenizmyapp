/**
 * Import-time Excel formula extraction + reference mapping.
 *
 * When a workbook is imported the raw xlsx is cached in the database
 * (knowledge_snippets.workbook_data) and served to the sheet viewer as JSON
 * rows keyed by column header with a detected header row. This module walks
 * every sheet of the imported workbook and:
 *
 *   1. finds ALL formula cells ("=SUM(V46:V54)", "=PL!D7", ...),
 *   2. maps each formula cell itself to the DB-sheet coordinates the
 *      application displays (column key + data-row offset + absolute A1),
 *   3. maps every reference inside the formula to the same coordinates
 *      (cross-sheet refs included), so a formula can be computed against the
 *      DB-saved sheet data even when raw grid positions shift between
 *      imports,
 *   4. computes a best-effort value with the same evaluator the API uses
 *      (src/lib/excel-formula.ts) so consumers have an import-time snapshot.
 *
 * The resulting WorkbookFormulaMap is persisted as a knowledge_snippets JSON
 * entry (key "workbook_formulas") by both import paths (seed-runner and the
 * workbook-ingest workflow).
 */
import { utils } from 'xlsx';
import type { WorkBook, WorkSheet } from 'xlsx';
import { evaluateFormula, collectReferences } from '@/lib/excel-formula';
import { findHeaderRow, buildColumnKeys, type HeaderRowInfo } from '@/lib/workbook-mapping';

/** One reference (cell or range) inside a formula, mapped to DB coordinates. */
export interface MappedFormulaRef {
  /** Target sheet tab name ('' when the reference stays on the formula's sheet). */
  sheet: string;
  /** 'cell' for A1 references, 'range' for A1:B2 / A:A references. */
  kind: 'cell' | 'range';
  /** DB column key of the referenced cell (undefined when it points at an empty/out-of-header column). */
  colKey?: string;
  /** 1-based data-row offset relative to the target sheet's header row (undefined when it points at a header/title row). */
  relRow?: number;
  /** Raw A1 address as written in the formula ("$" stripped), e.g. "V46". */
  absCell: string;
  /** Range end coordinates when kind === 'range'. */
  end?: {
    colKey?: string;
    relRow?: number;
    absCell: string;
  };
}

/** A single formula cell found during import, with its mapped references. */
export interface MappedFormula {
  /** Absolute A1 address of the formula cell, e.g. "V46". */
  cell: string;
  /** Normalized formula string ("=SUM(V46:V54)"). */
  formula: string;
  /** DB column key of the formula cell itself. */
  colKey?: string;
  /** 1-based data-row offset of the formula cell. */
  relRow?: number;
  /** Absolute row (1-based) / column (1-based) in the raw grid. */
  absRow: number;
  absCol: number;
  /** Best-effort value computed at import time by evaluateFormula. */
  value?: unknown;
  /** True when the import-time evaluation could not compute a value. */
  unevaluable: boolean;
  /** Every cell/range reference in the formula, mapped to DB coordinates. */
  refs: MappedFormulaRef[];
}

/** Per-sheet formula inventory. */
export interface SheetFormulaMap {
  headerRow: number;
  headers: string[];
  columnKeys: string[];
  formulas: MappedFormula[];
}

/** Formula inventory for the whole workbook, keyed by tab name. */
export type WorkbookFormulaMap = Record<string, SheetFormulaMap>;

function isCellAddress(key: string): boolean {
  return /^[A-Z]+\d+$/.test(key);
}

/** Map one raw reference token to DB coordinates (target sheet aware). */
function mapRef(
  ref: { sheet?: string; addr: string; end?: string },
  headerCache: Map<string, HeaderRowInfo>,
  wb: WorkBook,
  formulaSheet: string,
): MappedFormulaRef {
  const target = ref.sheet ?? formulaSheet;
  const targetWs = wb.Sheets[target];
  // Same-sheet references keep sheet '' (compact); explicit otherwise.
  const sheet = ref.sheet ?? '';
  if (!targetWs) {
    // Sheet vanished — keep the raw address so nothing is lost.
    return { sheet, kind: 'cell', absCell: ref.addr };
  }
  let header = headerCache.get(target);
  if (!header) {
    header = findHeaderRow(targetWs);
    headerCache.set(target, header);
  }
  const start = mapCellToDataRef(targetWs, ref.addr, header);
  const mapped: MappedFormulaRef = {
    sheet,
    kind: ref.end ? 'range' : 'cell',
    colKey: start.colKey,
    relRow: start.relRow,
    absCell: ref.addr,
  };
  if (ref.end) {
    const end = mapCellToDataRef(targetWs, ref.end, header);
    mapped.end = { colKey: end.colKey, relRow: end.relRow, absCell: ref.end };
  }
  return mapped;
}

/** Column-only (A:A) or full-cell mapping to DB coordinates. */
function mapCellToDataRef(
  ws: WorkSheet,
  addr: string,
  header: HeaderRowInfo,
): { colKey?: string; relRow?: number } {
  const clean = addr.replace(/\$/g, '');
  if (/^[A-Za-z]+$/.test(clean)) {
    // Whole-column reference: column maps to its header key, rows are unbounded.
    const colIdx = utils.decode_col(clean);
    const columnKeys = buildColumnKeys(header.headers);
    const rawHeader = header.headers[colIdx] ?? '';
    return { colKey: rawHeader.trim() ? columnKeys[colIdx] : undefined, relRow: undefined };
  }
  const decoded = utils.decode_cell(clean);
  const relRow = decoded.r - header.headerRow + 1;
  const columnKeys = buildColumnKeys(header.headers);
  const rawHeader = header.headers[decoded.c] ?? '';
  return {
    colKey: rawHeader.trim() ? columnKeys[decoded.c] : undefined,
    relRow: relRow >= 1 ? relRow : undefined,
  };
}

/**
 * Walk every sheet and build the full formula inventory + reference mapping.
 *
 * Expects `wb` parsed with `cellFormula: true` (SheetJS only populates
 * `cell.f` when formula strings are read).
 */
export function buildWorkbookFormulaMap(wb: WorkBook): WorkbookFormulaMap {
  const map: WorkbookFormulaMap = {};
  const headerCache = new Map<string, HeaderRowInfo>();

  for (const tabName of wb.SheetNames) {
    const ws = wb.Sheets[tabName]!;
    const header = findHeaderRow(ws);
    const columnKeys = buildColumnKeys(header.headers);
    const headerCacheKey = tabName;
    headerCache.set(headerCacheKey, header);

    const formulas: MappedFormula[] = [];
    for (const key of Object.keys(ws)) {
      if (key === '!ref' || key === '!margins' || key === '!merges' || key === '!cols' || key === '!rows') continue;
      if (!isCellAddress(key)) continue;
      const cell = ws[key];
      if (!cell || typeof cell.f !== 'string' || cell.f.trim() === '') continue;

      const formula = cell.f.trim().startsWith('=') ? cell.f.trim() : '=' + cell.f.trim();
      const decoded = utils.decode_cell(key);
      const relRow = decoded.r - header.headerRow + 1;
      const rawHeader = header.headers[decoded.c] ?? '';

      const refs: MappedFormulaRef[] = [];
      for (const rawRef of collectReferences(formula)) {
        refs.push(mapRef(rawRef, headerCache, wb, tabName));
      }

      const result = evaluateFormula(wb, ws, formula, 0, key);

      formulas.push({
        cell: key,
        formula,
        colKey: rawHeader.trim() ? columnKeys[decoded.c] : undefined,
        relRow: relRow >= 1 ? relRow : undefined,
        absRow: decoded.r + 1,
        absCol: decoded.c + 1,
        value: result.unevaluable ? undefined : result.value,
        unevaluable: result.unevaluable,
        refs,
      });
    }

    map[tabName] = {
      headerRow: header.headerRow,
      headers: header.headers,
      columnKeys,
      formulas,
    };
  }

  return map;
}
