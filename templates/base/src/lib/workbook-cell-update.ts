import { utils, type WorkBook, type WorkSheet } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';
import { findHeaderRow, buildColumnKeys } from '@/lib/workbook-mapping';
import {
  applyCustomColumnOverlay,
  resolveCustomColumnByName,
  virtualAddress,
  type CustomColumnCell,
  type CustomColumnsStore,
} from '@/lib/custom-columns';

/** Per-cell update payload (mirrors UpdateSheetCellParams, server-side). */
export interface CellUpdateParams {
  /** Canonical (already-resolved) tab name. */
  sheet: string;
  /** 0-based data row (position within the sheet's data rows). */
  rowIndex?: number;
  /** Column header key (or raw header text). */
  column: string;
  value: unknown;
  /** Original Excel cell reference (e.g. "D7") — preferred when provided. */
  _excelCell?: string;
  /** Actual Excel row (1-based). */
  _excelRow?: number;
  /** When true and value starts with "=", stores/evaluates a formula. */
  formulaMode?: boolean;
}

export interface CellUpdateResult {
  success: boolean;
  /** Excel cell address that was written (e.g. "D7" or custom virtual "AMK7"). */
  cell: string;
  /** Evaluated/display value (null when the formula is unevaluable). */
  value: unknown;
  /** Stored Excel formula (present when the edit was a formula). */
  formula?: string;
  unevaluable: boolean;
  /** True when the write went to a custom-column overlay (not the workbook). */
  isCustom: boolean;
  error?: string;
}

/**
 * Apply ONE cell update in memory — mutates the workbook (or the custom-column
 * overlay store) but persists nothing. Shared by the single update-cell route
 * and the batch route so a range edit behaves exactly like N single edits.
 *
 * Ordering guarantee: sequential calls see each other's effects (a custom-cell
 * write is visible to a later workbook formula evaluation, etc.).
 */
export function applyCellUpdate(
  wb: WorkBook,
  ws: WorkSheet,
  tabName: string,
  customStore: CustomColumnsStore,
  params: CellUpdateParams,
): CellUpdateResult {
  const colStr = String(params.column ?? '').trim();

  // ── Custom-column (overlay) branch ────────────────────────────────
  // Custom columns live in knowledge_snippets.workbook_custom_columns and are
  // NEVER written into the workbook buffer, so Excel column indices and every
  // formula reference stay intact. Edits update the overlay store only.
  const customCol = resolveCustomColumnByName(customStore, tabName, colStr);
  if (customCol) {
    // Overlay all custom columns (incl. this one) so formulas can reference
    // both workbook cells and other custom-column cells. In-memory only.
    applyCustomColumnOverlay(wb, customStore, tabName);

    const excelRow = Number(params._excelRow) || (Number(params.rowIndex) + 1);
    if (!Number.isFinite(excelRow) || excelRow < 1) {
      return {
        success: false,
        cell: virtualAddress(customCol, 1),
        value: null,
        unevaluable: false,
        isCustom: true,
        error: 'Invalid row for custom column cell',
      };
    }
    const cellAddr = virtualAddress(customCol, excelRow);

    const value = params.value;
    const isFormula = !!params.formulaMode && typeof value === 'string' && value.trim().startsWith('=');
    const cell: CustomColumnCell = isFormula
      ? { formula: (typeof value === 'string' ? value : String(value ?? '')).trim() }
      : { value: typeof value === 'number' ? value : String(value ?? '') };

    let responseValue: unknown = cell.value ?? null;
    let unevaluable = false;
    if (isFormula && typeof value === 'string') {
      const result = evaluateFormula(wb, ws, value.trim(), 0, cellAddr);
      unevaluable = result.unevaluable;
      cell.unevaluable = unevaluable;
      if (!unevaluable) {
        cell.value = result.value;
        responseValue = result.value;
      } else {
        responseValue = null;
      }
    }

    customCol.cells[String(excelRow)] = cell;
    customCol.updatedAt = new Date().toISOString();

    return {
      success: true,
      cell: cellAddr,
      value: responseValue ?? null,
      formula: isFormula && typeof value === 'string' ? value.trim() : undefined,
      unevaluable,
      isCustom: true,
    };
  }

  // ── Workbook branch ───────────────────────────────────────────────
  let cellAddress: string;
  if (params._excelCell) {
    // Original Excel cell reference from initial load — preserves position
    // after sorting/filtering.
    cellAddress = params._excelCell;
  } else {
    const { headers: rawHeaders } = findHeaderRow(ws);
    const columnKeys = buildColumnKeys(rawHeaders);
    const colIndex = columnKeys.findIndex((key, idx) => {
      const rawHeader = String(rawHeaders[idx] ?? '').trim();
      return (
        rawHeader === colStr ||
        key.toLowerCase() === colStr.toLowerCase() ||
        rawHeader.toLowerCase().replace(/\s+/g, '') === colStr.toLowerCase().replace(/\s+/g, '') ||
        key.toLowerCase().replace(/\s+/g, '') === colStr.toLowerCase().replace(/\s+/g, '')
      );
    });
    if (colIndex === -1) {
      return {
        success: false,
        cell: '',
        value: null,
        unevaluable: false,
        isCustom: false,
        error: `Column "${colStr}" not found in sheet "${tabName}". Available: ${columnKeys.filter((k) => !k.startsWith('__hidden_')).join(', ')}`,
      };
    }
    const excelRow = Number(params.rowIndex) + 1;
    cellAddress = utils.encode_cell({ r: excelRow, c: colIndex });
  }

  // ── Formula support (gated by formulaMode, default OFF) ───────────
  const value = params.value;
  const isFormula = !!params.formulaMode && typeof value === 'string' && value.trim().startsWith('=');
  let responseValue: unknown = value;
  let formula: string | undefined;
  let unevaluable = false;

  if (isFormula && typeof value === 'string') {
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
      ws[cellAddress] = { f: storedFormula, v: typeof prev === 'number' ? prev : 0, t: 'n' };
      responseValue = null;
    }
  } else {
    const cellValue = typeof value === 'number' ? value : String(value || '');
    // Replacing the whole cell object also clears any previous formula.
    ws[cellAddress] = { v: cellValue, t: typeof value === 'number' ? 'n' : 's' };
    responseValue = cellValue;
  }

  return {
    success: true,
    cell: cellAddress,
    value: responseValue ?? null,
    formula,
    unevaluable,
    isCustom: false,
  };
}
