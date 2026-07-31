/**
 * Workbook Sheet Extraction (dependency-free)
 *
 * Pure sheet serialization + structural statistics. This module intentionally
 * has NO application aliases (`@/...`), no zod, and no OpenAI imports so that
 * it can be bundled into Vercel Workflow step bundles (workflows/workbook-ingest)
 * without dragging the whole domain layer along.
 *
 * The AI-first pipeline serializes every sheet to plain text (tab name + rows)
 * and lets the model do the comprehension. The structural statistics produced
 * here feed a deterministic ANALYZE pre-pass that enriches the AI prompt.
 */
import { read, utils } from 'xlsx';
import type { WorkBook, WorkSheet } from 'xlsx';

export const SHEET_CATEGORIES = [
  'daily_sales',
  'profit_loss',
  'balance_sheet',
  'trial_balance',
  'general_ledger',
  'cost_of_sales',
  'month_on_month',
  'break_even',
  'variance',
  'summary_pl',
  'summary_bs',
  'other',
] as const;
export type AiSheetCategory = (typeof SHEET_CATEGORIES)[number];

export const MAX_SHEET_ROWS = 40;
export const MAX_SHEET_COLS = 16;
export const MAX_CELL_CHARS = 80;

export interface RenderedSheet {
  tabName: string;
  text: string;
}

/**
 * Structural statistics of a single sheet, computed from the FULL grid
 * (not the capped render). Used by the deterministic ANALYZE pre-pass.
 */
export interface SheetStats {
  tabName: string;
  /** Total rows present in the sheet (full grid). */
  rowCount: number;
  /** Maximum number of columns with content in any row. */
  colCount: number;
  /** Fraction of non-empty cells that look numeric (0..1). */
  numericRatio: number;
  /** Non-empty cell count (used for density weighting). */
  nonEmptyCells: number;
}

export interface ExtractedSheet extends RenderedSheet {
  stats: SheetStats;
}

function formatCell(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(2).replace(/\.00$/, '');
  }
  const s = String(v).replace(/\s+/g, ' ').trim();
  return s.length > MAX_CELL_CHARS ? s.slice(0, MAX_CELL_CHARS - 1) + '…' : s;
}

function readFullGrid(sheet: WorkSheet): unknown[][] {
  return utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true }) as unknown[][];
}

function capGrid(grid: unknown[][], maxRows: number, maxCols: number): unknown[][] {
  const capped: unknown[][] = [];
  for (let r = 0; r < Math.min(grid.length, maxRows); r++) {
    const row = grid[r] ?? [];
    const trimmed = row.slice(0, maxCols);
    if (trimmed.some((c) => c != null && String(c).trim() !== '')) capped.push(trimmed);
  }
  return capped;
}

function gridToText(grid: unknown[][]): string {
  const lines = grid.map((row, i) => {
    const cells = row.map((c) => formatCell(c));
    // Trim trailing empties for compactness
    while (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    return `R${i + 1}: ${cells.join(' | ')}`;
  });
  return lines.join('\n');
}

function computeStats(tabName: string, grid: unknown[][]): SheetStats {
  let colCount = 0;
  let numericCells = 0;
  let nonEmptyCells = 0;
  for (const row of grid) {
    if (row.length > colCount) colCount = row.length;
    for (const cell of row) {
      if (cell == null || String(cell).trim() === '') continue;
      nonEmptyCells++;
      if (typeof cell === 'number') {
        numericCells++;
      } else if (typeof cell === 'string' && /^[-+]?\d[\d.,]*$/.test(cell.trim())) {
        numericCells++;
      }
    }
  }
  return {
    tabName,
    rowCount: grid.length,
    colCount,
    numericRatio: nonEmptyCells > 0 ? numericCells / nonEmptyCells : 0,
    nonEmptyCells,
  };
}

/** Serialize one worksheet to text (row-numbered, capped) for the AI prompt. */
export function renderSheetForAi(
  wb: WorkBook,
  tabName: string,
  maxRows = MAX_SHEET_ROWS,
  maxCols = MAX_SHEET_COLS,
): RenderedSheet | null {
  const sheet = wb.Sheets[tabName];
  if (!sheet) return null;
  const grid = capGrid(readFullGrid(sheet), maxRows, maxCols);
  if (grid.length === 0) return null;
  return { tabName, text: gridToText(grid) };
}

/** Serialize ALL sheets of a workbook to text blocks. Accepts Uint8Array or Buffer. */
export function renderAllSheetsForAi(buf: Uint8Array): RenderedSheet[] {
  const wb = read(buf, { type: 'buffer' });
  const blocks: RenderedSheet[] = [];
  for (const name of wb.SheetNames ?? []) {
    const rendered = renderSheetForAi(wb, name);
    if (rendered) blocks.push(rendered);
  }
  return blocks;
}

/**
 * Serialize ALL sheets AND compute full-grid structural statistics.
 * This is the EXTRACT output for the workflow pipeline: one parse per
 * sheet produces both the AI prompt block and the ANALYZE hints.
 */
export function extractSheetsWithStats(buf: Uint8Array): ExtractedSheet[] {
  const wb = read(buf, { type: 'buffer' });
  const sheets: ExtractedSheet[] = [];
  for (const name of wb.SheetNames ?? []) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const fullGrid = readFullGrid(sheet);
    if (fullGrid.length === 0) continue;
    const stats = computeStats(name, fullGrid);
    const text = gridToText(capGrid(fullGrid, MAX_SHEET_ROWS, MAX_SHEET_COLS));
    sheets.push({ tabName: name, text, stats });
  }
  return sheets;
}
