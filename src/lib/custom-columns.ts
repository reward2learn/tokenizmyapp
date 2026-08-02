/**
 * Custom columns for the Sheet Viewer — hardened overlay design.
 *
 * Why an overlay (and NOT workbook mutation):
 *
 *   Option A — insert the column into the xlsx (Excel-style) requires shifting
 *   every cell right of the insertion point, rewriting EVERY formula in every
 *   sheet (A1 refs, ranges, cross-sheet, $ anchors), re-writing cached values,
 *   and re-mapping the import-time formula inventory. Any reference we fail to
 *   parse risks corrupting financial data — the evaluator is a subset, so a
 *   "hardened" guarantee is impossible.
 *
 *   Option B — virtual overlay (this module): the workbook buffer in the
 *   database is NEVER modified. Custom columns live in their own knowledge
 *   snippet (workbook_custom_columns) and are merged into the GET response at
 *   a display position. Formulas keep their original Excel A1 addresses, so
 *   inserting a custom column has ZERO impact on formulas referencing columns
 *   after the insertion point (the "existing index" is retained by
 *   construction) and no formula or cell-input data is lost.
 *
 * Each custom column is assigned a column slot in a RESERVED VIRTUAL BAND
 * (Excel column index >= VIRTUAL_COL_BASE, far beyond any real workbook), so:
 *   - custom-column formulas can reference workbook cells (picked as A1 refs)
 *     AND other custom columns (via their virtual letters, e.g. "AMQ5"),
 *   - evaluation happens against a transient in-memory overlay of the freshly
 *     read workbook — never persisted back to workbook_data,
 *   - slots are stable: deleting/adding columns never remaps existing
 *     formula references (a deleted custom column simply resolves to empty).
 */

import { utils } from 'xlsx';
import type { WorkBook, WorkSheet } from 'xlsx';

export const CUSTOM_COLUMNS_SNIPPET_KEY = 'workbook_custom_columns';

/** Reserved 0-based Excel column index where custom columns live (AMQ+). */
export const VIRTUAL_COL_BASE = 1024;

/** A single custom-column cell: plain input, formula, or both. */
export interface CustomColumnCell {
  /** Plain cell value ('' when only a formula is stored). */
  value?: unknown;
  /** Formula string when the input started with '=' (formula mode). */
  formula?: string;
  /** True when the stored formula could not be evaluated locally. */
  unevaluable?: boolean;
}

/** A custom column definition for one sheet. */
export interface CustomColumn {
  /** Stable id (uuid) — used by PATCH/DELETE. */
  id: string;
  /** Target sheet tab name. */
  sheet: string;
  /** Header text — unique per sheet (case-insensitive). */
  name: string;
  /** Display insertion index among the workbook's VISIBLE columns; clamped on read. */
  position: number;
  /** Reserved 0-based Excel column index in the virtual band. */
  virtualCol: number;
  /** Cell contents keyed by 1-based Excel row number (matches _excelRow). */
  cells: Record<string, CustomColumnCell>;
  createdAt: string;
  updatedAt: string;
}

export interface CustomColumnsStore {
  version: 1;
  columns: CustomColumn[];
}

export function emptyCustomColumnsStore(): CustomColumnsStore {
  return { version: 1, columns: [] };
}

/** Parse a stored snippet (tolerant of missing/corrupt payloads). */
export function parseCustomColumnsStore(json: string | null | undefined): CustomColumnsStore {
  if (!json) return emptyCustomColumnsStore();
  try {
    const parsed = JSON.parse(json) as CustomColumnsStore;
    if (!parsed || !Array.isArray(parsed.columns)) return emptyCustomColumnsStore();
    return { version: 1, columns: parsed.columns };
  } catch {
    return emptyCustomColumnsStore();
  }
}

/**
 * Lowest free virtual slot >= VIRTUAL_COL_BASE. Freed slots (deleted columns)
 * are reused so create/delete cycles never grow the band.
 */
export function nextVirtualSlot(store: CustomColumnsStore): number {
  const used = new Set(store.columns.map((c) => c.virtualCol));
  let slot = VIRTUAL_COL_BASE;
  while (used.has(slot)) slot++;
  return slot;
}

/** Excel letter of a virtual column index (0-based) — e.g. 1024 -> "AMQ". */
export function virtualLetter(colIdx: number): string {
  return utils.encode_col(colIdx);
}

/** Full virtual A1 address for a custom-column cell (e.g. "AMQ5"). */
export function virtualAddress(col: CustomColumn, excelRow: number): string {
  return `${virtualLetter(col.virtualCol)}${excelRow}`;
}

/** Custom columns belonging to one sheet, in stable display order. */
export function resolveSheetColumns(store: CustomColumnsStore, sheet: string): CustomColumn[] {
  return store.columns
    .filter((c) => c.sheet === sheet)
    .sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

/** Find a custom column by name (case-insensitive) for a sheet. */
export function resolveCustomColumnByName(
  store: CustomColumnsStore,
  sheet: string,
  name: string,
): CustomColumn | undefined {
  const n = name.trim().toLowerCase();
  return store.columns.find((c) => c.sheet === sheet && c.name.trim().toLowerCase() === n);
}

/**
 * Merge custom columns into the workbook's visible column order.
 *
 * Each custom column's `position` is an index into the ORIGINAL workbook
 * column list (0-based). Positions are clamped to the current length, and
 * customs sharing a position keep insertion order — inserting a custom
 * column never moves any workbook column in the underlying sheet, so
 * formulas referencing those columns keep their A1 indices intact.
 */
export function mergeColumnOrder(
  workbookColumns: string[],
  customs: CustomColumn[],
): string[] {
  const out = [...workbookColumns];
  const ordered = [...customs].sort(
    (a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );
  for (const c of ordered) {
    const idx = Math.max(0, Math.min(c.position, out.length));
    out.splice(idx, 0, c.name);
  }
  return out;
}

/**
 * Transient overlay: write every custom-column cell of `sheet` into the
 * worksheet at its virtual address so evaluateFormula can resolve references
 * to workbook cells AND other custom columns. Mutates the freshly-read
 * workbook in memory only — never persisted.
 *
 * Two passes (Excel-style): pass 1 materializes every cell (plain values and
 * formula shells with their stored value), pass 2 computes each formula cell
 * so cross-custom-column references resolve through the transient sheet's
 * cached values — exactly how Excel stores f + v.
 */
export function applyCustomColumnOverlay(
  wb: WorkBook,
  store: CustomColumnsStore,
  sheet: string,
): void {
  const ws = wb.Sheets[sheet];
  if (!ws) return;
  const formulaCells: Array<{ addr: string; formula: string }> = [];

  // Pass 1: materialize cells.
  for (const col of resolveSheetColumns(store, sheet)) {
    for (const [rowKey, cell] of Object.entries(col.cells)) {
      const excelRow = Number(rowKey);
      if (!Number.isFinite(excelRow)) continue;
      const addr = virtualAddress(col, excelRow);
      if (typeof cell.formula === 'string' && cell.formula.trim().length > 0) {
        const f = cell.formula.trim().startsWith('=') ? cell.formula.trim() : '=' + cell.formula.trim();
        const stored = f.slice(1);
        const v = cell.value ?? '';
        ws[addr] = {
          f: stored,
          v: typeof v === 'number' ? v : String(v ?? ''),
          t: typeof v === 'number' ? 'n' : 's',
        };
        formulaCells.push({ addr, formula: f });
      } else if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
        const v = cell.value;
        ws[addr] = { v, t: typeof v === 'number' ? 'n' : 's' };
      }
    }
  }

  // Pass 2: compute formula cells so references (workbook → custom, custom →
  // custom) resolve through cached values, mirroring Excel's f + v model.
  for (const fc of formulaCells) {
    const result = evaluateFormula(wb, ws, fc.formula, 0, fc.addr);
    if (!result.unevaluable) {
      const v = result.value ?? '';
      ws[fc.addr] = {
        ...ws[fc.addr],
        v,
        t: typeof v === 'number' ? 'n' : 's',
        w: String(v),
      };
    }
  }
}

/**
 * Compute the display value of a custom-column cell against the (overlaid)
 * workbook. Mirrors the workbook cell path: formula mode live-evaluates;
 * otherwise the stored value is returned as-is.
 */
export function evaluateCustomColumnCell(
  wb: WorkBook,
  ws: WorkSheet,
  col: CustomColumn,
  excelRow: number,
  formulaMode: boolean,
): { value: unknown; unevaluable: boolean } {
  const cell = col.cells[String(excelRow)];
  if (!cell) return { value: '', unevaluable: false };
  const formula =
    typeof cell.formula === 'string' && cell.formula.trim().length > 0
      ? (cell.formula.trim().startsWith('=') ? cell.formula.trim() : '=' + cell.formula.trim())
      : '';
  if (formulaMode && formula) {
    const result = evaluateFormulaLocal(wb, ws, formula, virtualAddress(col, excelRow));
    return result;
  }
  return { value: cell.value ?? '', unevaluable: !!cell.unevaluable };
}

// Lazy import of the evaluator to keep this module dependency-light for tests
// that only exercise slot/order logic.
import { evaluateFormula } from '@/lib/excel-formula';

function evaluateFormulaLocal(
  wb: WorkBook,
  ws: WorkSheet,
  formula: string,
  cellAddress: string,
): { value: unknown; unevaluable: boolean } {
  const result = evaluateFormula(wb, ws, formula, 0, cellAddress);
  if (result.unevaluable) return { value: null, unevaluable: true };
  return { value: result.value, unevaluable: false };
}
