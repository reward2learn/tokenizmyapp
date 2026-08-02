/**
 * Sheet-viewer range editing primitives (fill handle + paste).
 *
 * Pure functions — no React, no DOM. The component supplies display-order
 * row/col lists and a value getter; this module decides WHAT to write and
 * with which formulaMode, Excel-style:
 *
 * - Drag-fill copies a block (tiling) OR extends a numeric series when the
 *   source is a single row (horizontal) or single column (vertical).
 * - Formula strings are shifted like Excel relative references ($-locked
 *   parts stay put), unless the token is a known function name.
 * - Paste parses TSV (clipboard plain text) into a cell grid.
 */

import type { GridRowId } from '@mui/x-data-grid';

/** Cell to write produced by fill/paste. */
export interface FillTargetCell {
  rowId: GridRowId;
  field: string;
  value: unknown;
  formulaMode: boolean;
}

/** Inputs for buildFillCells. */
export interface BuildFillCellsArgs {
  /** Display-order row ids of the source block (contiguous). */
  sourceRows: GridRowId[];
  /** Display-order column fields of the source block (contiguous). */
  sourceCols: string[];
  /** Full display-order row ids (page). */
  rowOrder: GridRowId[];
  /** Full display-order column fields. */
  colOrder: string[];
  /** Display-order cell the drag ended on. */
  target: { rowId: GridRowId; field: string };
  /** Reads the current display value of a cell. */
  getValue: (rowId: GridRowId, field: string) => unknown;
  /** Reads the stored formula of a cell (undefined for plain values). */
  getFormula?: (rowId: GridRowId, field: string) => string | undefined;
}

export interface FillRect {
  r0: number;
  r1: number;
  c0: number;
  c1: number;
}

/**
 * Compute the cells a fill handle drag must write.
 * Returns [] when the target is outside the grid or inside the source.
 */
export function buildFillCells(args: BuildFillCellsArgs): FillTargetCell[] {
  const { sourceRows, sourceCols, rowOrder, colOrder, target, getValue, getFormula } = args;

  const srcR0 = rowOrder.indexOf(sourceRows[0]);
  const srcR1 = rowOrder.indexOf(sourceRows[sourceRows.length - 1]);
  const srcC0 = colOrder.indexOf(sourceCols[0]);
  const srcC1 = colOrder.indexOf(sourceCols[sourceCols.length - 1]);
  if (srcR0 === -1 || srcR1 === -1 || srcC0 === -1 || srcC1 === -1) return [];

  const tR = rowOrder.indexOf(target.rowId);
  const tC = colOrder.indexOf(target.field);
  if (tR === -1 || tC === -1) return [];

  // Union rect (Excel only ever EXTENDS a fill, never shrinks it).
  const dst: FillRect = {
    r0: Math.min(srcR0, tR),
    r1: Math.max(srcR1, tR),
    c0: Math.min(srcC0, tC),
    c1: Math.max(srcC1, tC),
  };

  const h = srcR1 - srcR0 + 1;
  const w = srcC1 - srcC0 + 1;
  const isVerticalSeries = w === 1 && h >= 2;
  const isHorizontalSeries = h === 1 && w >= 2;

  const out: FillTargetCell[] = [];
  for (let r = dst.r0; r <= dst.r1; r++) {
    for (let c = dst.c0; c <= dst.c1; c++) {
      if (r >= srcR0 && r <= srcR1 && c >= srcC0 && c <= srcC1) continue; // inside source

      const rowId = rowOrder[r];
      const field = colOrder[c];

      if (isVerticalSeries) {
        const target = fillSeriesValue(
          srcR0, srcR1, r,
          (rr) => getValue(rowOrder[rr], colOrder[srcC0]),
          (rr) => getFormula?.(rowOrder[rr], colOrder[srcC0]),
        );
        if (target) out.push({ ...target, rowId, field });
      } else if (isHorizontalSeries) {
        const target = fillSeriesValue(
          srcC0, srcC1, c,
          (cc) => getValue(rowOrder[srcR0], colOrder[cc]),
          (cc) => getFormula?.(rowOrder[srcR0], colOrder[cc]),
        );
        if (target) out.push({ ...target, rowId, field });
      } else {
        // Copy-block: tile the source, shifting formulas by the tile offset.
        const sr = srcR0 + ((r - srcR0) % h);
        const sc = srcC0 + ((c - srcC0) % w);
        const srcRowId = rowOrder[sr];
        const srcField = colOrder[sc];
        const formula = getFormula?.(srcRowId, srcField);
        if (formula !== undefined && typeof formula === 'string' && formula.startsWith('=')) {
          out.push({
            rowId,
            field,
            value: shiftFormulaRefs(formula, r - sr, c - sc),
            formulaMode: true,
          });
        } else {
          out.push({ rowId, field, value: getValue(srcRowId, srcField), formulaMode: false });
        }
      }
    }
  }
  return out;
}

/**
 * Series fill along one axis. `at(idx)` reads the source value at index idx
 * (row or column index), `formulaAt` its stored formula.
 * Returns undefined when the target is not beyond the source on that axis.
 */
function fillSeriesValue(
  src0: number,
  src1: number,
  targetIdx: number,
  at: (idx: number) => unknown,
  formulaAt?: (idx: number) => string | undefined,
): { value: unknown; formulaMode: boolean } | undefined {
  if (targetIdx >= src0 && targetIdx <= src1) return undefined;
  const below = targetIdx > src1;
  const edgeIdx = below ? src1 : src0;
  const secondIdx = below ? src1 - 1 : src0 + 1;
  const steps = below ? targetIdx - src1 : src0 - targetIdx;

  // Numeric series? Both edge values must be numeric.
  const edge = at(edgeIdx);
  const second = at(secondIdx);
  const edgeNum = toFiniteNumber(edge);
  const secondNum = toFiniteNumber(second);

  // Formula at the edge → shift per step (Excel relative refs).
  const formula = formulaAt?.(edgeIdx);
  if (formula !== undefined && typeof formula === 'string' && formula.startsWith('=')) {
    const rowDelta = below ? steps : -steps;
    return { value: shiftFormulaRefs(formula, rowDelta, 0), formulaMode: true };
  }

  if (edgeNum !== undefined && secondNum !== undefined && edgeNum !== secondNum) {
    const delta = edgeNum - secondNum;
    const value = edgeNum + delta * steps; // delta is signed along the drag axis
    return { value, formulaMode: false };
  }

  // Non-numeric or flat: copy the edge value as-is.
  return { value: edge, formulaMode: false };
}

function toFiniteNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

/** True when the token looks like a function name, not a cell reference. */
const KNOWN_FUNCTION_NAMES = new Set([
  'ABS', 'AND', 'AVERAGE', 'CHOOSE', 'COLUMN', 'COUNT', 'COUNTA', 'DATE', 'IF', 'INDEX',
  'INT', 'MATCH', 'MAX', 'MIN', 'MOD', 'OR', 'POWER', 'PRODUCT', 'PROPER', 'ROUND',
  'ROUNDDOWN', 'ROUNDUP', 'SQRT', 'SUBTOTAL', 'SUM', 'SUMIF', 'TEXT', 'TRIM',
  'VLOOKUP', 'WEEKDAY',
  // Unsupported-but-real functions whose names would otherwise match the
  // A1-ref pattern (letters + digits).
  'LOG10', 'LOG2', 'DEC2HEX', 'HEX2DEC', 'DEC2BIN', 'BIN2DEC', 'DEC2OCT', 'OCT2DEC',
]);

/** Cell-ref token: optional $, 1–3 letters, optional $, digits. */
const REF_RE = /\$?[A-Z]{1,3}\$?\d+/g;

/**
 * Shift A1-style references inside a formula by (rowDelta, colDelta),
 * honoring $ locks (Excel semantics): $A1 stays in column A but shifts rows;
 * A$1 stays on row 1 but shifts columns; $A$1 never moves.
 * Function names (and other identifiers) are never touched.
 */
export function shiftFormulaRefs(formula: string, rowDelta: number, colDelta: number): string {
  if (rowDelta === 0 && colDelta === 0) return formula;
  if (typeof formula !== 'string') return formula;

  return formula.replace(REF_RE, (token) => {
    const upper = token.toUpperCase();
    // LOG10-style names: excluded so =LOG10(5) is never corrupted.
    if (KNOWN_FUNCTION_NAMES.has(upper)) return token;
    // Part of a longer identifier (e.g. Sheet1!A1 where Sheet1 is a sheet).
    return shiftRefToken(token, rowDelta, colDelta);
  });
}

function shiftRefToken(token: string, rowDelta: number, colDelta: number): string {
  const m = token.match(/^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/);
  if (!m) return token;
  const [, colLock, letters, rowLock, digits] = m;

  let col = colToNumber(letters.toUpperCase());
  let row = Number(digits);
  if (!colLock && colDelta !== 0) col += colDelta;
  if (!rowLock && rowDelta !== 0) row += rowDelta;
  if (col < 1 || row < 1) return token; // clamped out of range — keep original

  return `${colLock}${numberToCol(col)}${rowLock}${row}`;
}

const A_CODE = 'A'.charCodeAt(0);

function colToNumber(letters: string): number {
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - A_CODE + 1);
  }
  return n;
}

function numberToCol(n: number): string {
  let s = '';
  let v = n;
  while (v > 0) {
    const rem = (v - 1) % 26;
    s = String.fromCharCode(A_CODE + rem) + s;
    v = Math.floor((v - 1) / 26);
  }
  return s;
}

// ── Paste (TSV) ────────────────────────────────────────────────────

/** Parse clipboard plain text into a row-major grid ('' for blank cells). */
export function parseTsv(text: string): string[][] {
  const rows = text.split(/\r?\n/);
  // Excel strips trailing blank rows from a paste.
  while (rows.length > 0 && rows[rows.length - 1].trim() === '') rows.pop();
  return rows.map((line) => line.split('\t'));
}

/** Convert a pasted text cell to a cell value (numbers stay numbers). */
export function textToCellValue(text: string): unknown {
  if (text === '') return '';
  if (Number.isFinite(Number(text)) && text.trim() !== '' && /^[+-]?\d*\.?\d+([eE][+-]?\d+)?$/.test(text.trim())) {
    return Number(text);
  }
  return text;
}

/**
 * Expand a pasted grid starting at the anchor cell.
 * Cells beyond the page bounds are skipped (returns keys + params separately
 * so the caller can report them). Each returned param carries _excelRow /
 * _excelCell for correct writes after sorting.
 */
export function buildPasteCells(args: {
  grid: string[][];
  anchorRowIdx: number;
  anchorColIdx: number;
  rowOrder: GridRowId[];
  colOrder: string[];
  rowsById: Map<GridRowId, Record<string, unknown>>;
  formulaMode: boolean;
}): { cells: FillTargetCell[]; skipped: number } {
  const { grid, anchorRowIdx, anchorColIdx, rowOrder, colOrder, rowsById, formulaMode } = args;
  const cells: FillTargetCell[] = [];
  let skipped = 0;

  for (let r = 0; r < grid.length; r++) {
    const rowIdx = anchorRowIdx + r;
    if (rowIdx >= rowOrder.length) {
      skipped += grid[r].length;
      continue;
    }
    const rowId = rowOrder[rowIdx];
    const row = rowsById.get(rowId);
    if (!row) {
      skipped += grid[r].length;
      continue;
    }
    for (let c = 0; c < grid[r].length; c++) {
      const colIdx = anchorColIdx + c;
      if (colIdx >= colOrder.length) {
        skipped += 1;
        continue;
      }
      const raw = grid[r][c];
      const field = colOrder[colIdx];
      const isFormula = formulaMode && raw.startsWith('=');
      cells.push({
        rowId,
        field,
        value: isFormula ? raw : textToCellValue(raw),
        formulaMode: isFormula,
      });
    }
  }
  return { cells, skipped };
}
