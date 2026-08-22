/**
 * Workbook → DB-sheet mapping helpers.
 *
 * The sheet viewer serves workbook data as JSON rows keyed by column header
 * (deduplicated, e.g. "Total", "Total_2"), with an automatically detected
 * header row. These helpers are the single source of truth for that mapping —
 * the sheet-data API route, the formula-reference mapper, and the import-time
 * formula extraction all use them so a formula cell reference ("V46") maps to
 * the exact same (column key, data-row offset) the application displays.
 *
 * Detection strategy (in order of preference):
 *   1. header_keywords / period_axis — score candidate rows for DESCRIPTION /
 *      Amount / year / month / Excel-serial month headers; skip title banners
 *      even when the title sits in column B/C.
 *   2. first_content — first row+col with any non-empty cell (like-for-like).
 *   3. first_numeric — first cell that looks like a data number anchors the
 *      data block; the row above / col to the left become header axes.
 */
import { utils } from 'xlsx';
import type { WorkSheet } from 'xlsx';

const HEADER_KEYWORDS =
  /description|amount|total|date|revenue|account|name|qty|price|cost|sales|income|expense|balance|number|ref|period|transaction|debit|credit|unit|rate|pct|margin|bills|covers|guests|staff|code|type|category|item|product|service|charge|discount|tax|subtotal|net|gross|metric|input\s*data|variance|previous|current/i;

/** Title / section banners — not column headers. Matched against ANY cell. */
const TITLE_KEYWORDS =
  /^(profit\s*&?\s*loss|balance\s*sheet|trial\s*balance|general\s*ledger|periode|period|month\s*of|per\s+[a-z]|periode:|input\s*data|auto\s*calc|pt\s+)/i;

const MONTH_PREFIX =
  /^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|mei|okt|des|agt|agu|ags|agst)\w*/i;

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export type DetectionMethod =
  | 'header_keywords'
  | 'period_axis'
  | 'first_content'
  | 'first_numeric';

export interface HeaderRowInfo {
  /** 1-based Excel row of the detected header (first data row = headerRow + 1). */
  headerRow: number;
  /** Normalized header texts, in column order (may contain ''). */
  headers: string[];
  /** How the header row was chosen (optional for backward compat callers). */
  method?: DetectionMethod;
  /** 0-based first column that belongs to the table (optional). */
  firstDataCol?: number;
}

export interface TableOrigin extends HeaderRowInfo {
  method: DetectionMethod;
  /** 1-based first data row (usually headerRow + 1). */
  firstDataRow: number;
  /** 0-based first content / data column. */
  firstDataCol: number;
}

function isEmpty(cell: unknown): boolean {
  return cell === '' || cell === undefined || cell === null;
}

function isExcelError(str: string): boolean {
  return str === '#N/A' || str === '#REF!' || str === '#VALUE!' || str === '#DIV/0!';
}

function isNumericCell(cell: unknown): boolean {
  if (cell == null || cell === '') return false;
  if (typeof cell === 'number') return Number.isFinite(cell);
  const str = String(cell).trim();
  if (!str || isExcelError(str)) return false;
  if (/^[\d,.-]+%?$/.test(str)) {
    const n = Number(str.replace(/%$/, '').replace(/,/g, ''));
    return Number.isFinite(n);
  }
  return false;
}

/** Large magnitude → almost certainly a value cell, not a year/month header. */
function isLargeAmount(cell: unknown): boolean {
  if (typeof cell !== 'number' || !Number.isFinite(cell)) return false;
  const abs = Math.abs(cell);
  // Years 1900–2100 and Excel month serials (~40k–60k) are excluded.
  if (abs >= 1900 && abs <= 2100) return false;
  if (abs > 20000 && abs < 60000) return false;
  return abs >= 1000;
}

function isYearHeader(cell: unknown): boolean {
  if (typeof cell === 'number' && cell >= 1900 && cell <= 2100 && Number.isInteger(cell)) {
    return true;
  }
  if (typeof cell === 'string' && /^(19|20)\d{2}$/.test(cell.trim())) return true;
  return false;
}

/** Excel serial that lands on day-of-month 1 → month column header. */
function excelSerialMonth(cell: unknown): { month: number; year: number } | null {
  if (typeof cell !== 'number' || cell <= 20000 || cell >= 60000) return null;
  const d = new Date(Math.round((cell - 25569) * 86400000));
  if (Number.isNaN(d.getTime())) return null;
  if (d.getUTCDate() !== 1) return null;
  return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
}

/** Any Excel date serial in the modern range → calendar date parts. */
function excelSerialDate(cell: unknown): { year: number; month: number; day: number } | null {
  if (typeof cell !== 'number' || cell <= 20000 || cell >= 60000) return null;
  const d = new Date(Math.round((cell - 25569) * 86400000));
  if (Number.isNaN(d.getTime())) return null;
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function isMonthHeader(cell: unknown): boolean {
  if (excelSerialMonth(cell) || excelSerialDate(cell)) return true;
  if (cell == null || typeof cell === 'number') return false;
  const text = String(cell).trim().toLowerCase();
  if (!text) return false;
  return /^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|mei|okt|des|agt|agu|ags|agst)\w*\s*\.?\s*((?:19|20)\d{2})?$/.test(
    text,
  );
}

/**
 * Normalize a raw header cell for DB column keys:
 *   46054 → "Feb 2026", 46175 → "2026-06-02", 2020 → "2020", "Jan 2026" stays.
 * Pass `forceIsoDates` when the row is a daily axis (consecutive serials).
 */
export function normalizeHeaderCell(cell: unknown, forceIsoDates = false): string {
  if (isEmpty(cell)) return '';
  const anyDate = excelSerialDate(cell);
  if (anyDate) {
    if (!forceIsoDates && anyDate.day === 1) {
      return `${MONTH_NAMES[anyDate.month - 1]} ${anyDate.year}`;
    }
    const mm = String(anyDate.month).padStart(2, '0');
    const dd = String(anyDate.day).padStart(2, '0');
    return `${anyDate.year}-${mm}-${dd}`;
  }
  if (typeof cell === 'number' && cell >= 1900 && cell <= 2100 && Number.isInteger(cell)) {
    return String(cell);
  }
  if (typeof cell === 'number' && Number.isFinite(cell)) {
    return Number.isInteger(cell) ? String(cell) : String(cell);
  }
  return String(cell).replace(/\s+/g, ' ').trim();
}

/** True when ≥3 Excel serials in the row look like consecutive calendar days. */
function isDailyAxisRow(row: unknown[]): boolean {
  const serials: number[] = [];
  for (const cell of row) {
    if (typeof cell === 'number' && excelSerialDate(cell)) serials.push(cell);
  }
  if (serials.length < 3) return false;
  serials.sort((a, b) => a - b);
  let consecutive = 0;
  for (let i = 1; i < serials.length; i++) {
    if (serials[i]! - serials[i - 1]! === 1) consecutive++;
  }
  return consecutive >= 2;
}

function normalizeHeaderRow(raw: unknown[]): string[] {
  const daily = isDailyAxisRow(raw);
  return raw.map((c) => normalizeHeaderCell(c, daily));
}

function rowHasTitleBanner(row: unknown[]): boolean {
  let nonEmpty = 0;
  let titleHit = false;
  for (const cell of row) {
    if (isEmpty(cell)) continue;
    nonEmpty++;
    const str = String(cell).trim();
    if (TITLE_KEYWORDS.test(str) && !HEADER_KEYWORDS.test(str)) titleHit = true;
    // "INPUT DATA" is both a banner label AND a period-axis marker — not a skip.
    if (/^input\s*data$/i.test(str)) return false;
  }
  return titleHit && nonEmpty <= 3;
}

function scoreHeaderRow(row: unknown[]): { score: number; periodHits: number; keywordHits: number } {
  const nonEmpty = row.filter((c) => !isEmpty(c));
  if (nonEmpty.length === 0) return { score: 0, periodHits: 0, keywordHits: 0 };

  let keywordHits = 0;
  let periodHits = 0;
  let largeAmountHits = 0;
  let numericCount = 0;

  for (const cell of nonEmpty) {
    const str = String(cell);
    if (isExcelError(str)) continue;

    if (isYearHeader(cell) || isMonthHeader(cell)) {
      periodHits++;
      continue;
    }

    if (isLargeAmount(cell)) {
      largeAmountHits++;
      numericCount++;
      continue;
    }

    if (isNumericCell(cell)) {
      numericCount++;
      continue;
    }

    if (HEADER_KEYWORDS.test(str)) keywordHits++;
  }

  const textRatio =
    nonEmpty.length > 0 ? (nonEmpty.length - numericCount - largeAmountHits) / nonEmpty.length : 0;

  // Period-axis rows (SUMPL / BEP / Daily Sales) win even when keyword count is low.
  let score =
    keywordHits * 4 +
    periodHits * 5 +
    textRatio * 2 +
    (nonEmpty.length >= 3 ? 2 : 0) -
    largeAmountHits * 4;

  // Strong boost when DESCRIPTION (or Amount) co-occurs with periods.
  const hasDescription = nonEmpty.some((c) => /^description$/i.test(String(c).trim()));
  if (hasDescription && periodHits >= 2) score += 8;
  if (hasDescription && keywordHits >= 1) score += 3;

  return { score, periodHits, keywordHits };
}

function readGrid(ws: WorkSheet): unknown[][] {
  return utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as unknown[][];
}

function findFirstContent(grid: unknown[][]): { row: number; col: number } | null {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      if (!isEmpty(row[c]) && !isExcelError(String(row[c]))) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * First numeric *data* cell (not a year / month-serial header). Used as a
 * foolproof anchor: header is typically the row above, labels to the left.
 */
function findFirstNumericData(grid: unknown[][]): { row: number; col: number } | null {
  for (let r = 0; r < Math.min(grid.length, 40); r++) {
    const row = grid[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (!isNumericCell(cell)) continue;
      if (isYearHeader(cell) || excelSerialMonth(cell)) continue;
      if (typeof cell === 'number' && cell >= 1 && cell <= 31 && !isLargeAmount(cell)) {
        // Ambiguous small ints (day numbers) — keep scanning unless clearly an amount.
        if (!isLargeAmount(cell) && Math.abs(cell) < 100) continue;
      }
      // Prefer clear amounts or decimals.
      if (typeof cell === 'number' && (isLargeAmount(cell) || !Number.isInteger(cell) || Math.abs(cell) >= 100)) {
        return { row: r, col: c };
      }
      if (typeof cell === 'string' && isNumericCell(cell)) {
        return { row: r, col: c };
      }
    }
  }
  // Looser pass: any numeric that isn't a year/month serial.
  for (let r = 0; r < Math.min(grid.length, 40); r++) {
    const row = grid[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (!isNumericCell(cell)) continue;
      if (isYearHeader(cell) || excelSerialMonth(cell)) continue;
      return { row: r, col: c };
    }
  }
  return null;
}

/**
 * Fill blank header cells from sample data so account-name columns between
 * DESCRIPTION and Amount/years become visible ("Account") instead of __hidden_.
 * Pure %-only interstitial columns stay blank (→ hidden) unless they have a
 * neighboring named period, in which case they become "<period> %".
 */
export function synthesizeEmptyHeaders(
  headers: string[],
  dataRows: unknown[][],
  sampleLimit = 20,
): string[] {
  const out = headers.map((h) => h);
  const used = new Set(out.map((h) => h.trim().toLowerCase()).filter(Boolean));

  const unique = (base: string): string => {
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) {
      name = `${base}_${n++}`;
    }
    used.add(name.toLowerCase());
    return name;
  };

  const prevNamed = (idx: number): string | null => {
    for (let i = idx - 1; i >= 0; i--) {
      if (out[i]?.trim()) return out[i]!.trim();
    }
    return null;
  };

  for (let c = 0; c < out.length; c++) {
    if (out[c]!.trim()) continue;

    const samples: unknown[] = [];
    for (let r = 0; r < Math.min(dataRows.length, sampleLimit); r++) {
      const v = dataRows[r]?.[c];
      if (!isEmpty(v) && !isExcelError(String(v))) samples.push(v);
    }
    if (samples.length === 0) continue;

    let text = 0;
    let pct = 0;
    let num = 0;
    for (const v of samples) {
      if (typeof v === 'string' && /%$/.test(v.trim())) {
        pct++;
        continue;
      }
      if (typeof v === 'number' && Math.abs(v) > 0 && Math.abs(v) <= 1.5) {
        pct++;
        continue;
      }
      if (isNumericCell(v)) {
        num++;
        continue;
      }
      text++;
    }

    if (pct >= samples.length * 0.5 && num + text < pct) {
      const prev = prevNamed(c);
      if (prev && !/%$/i.test(prev)) {
        out[c] = unique(`${prev} %`);
      }
      continue;
    }

    if (text >= samples.length * 0.4) {
      // Prefer "Account" when left neighbor is DESCRIPTION / account code column.
      const left = prevNamed(c)?.toLowerCase() ?? '';
      const base =
        left.includes('description') || left.includes('code') || /^[0-9]-/.test(String(samples[0]))
          ? 'Account'
          : 'Label';
      out[c] = unique(base);
      continue;
    }

    if (num > 0) {
      out[c] = unique(`Column ${utils.encode_col(c)}`);
    }
  }

  return out;
}

/**
 * Full table-origin detection for a worksheet.
 * Prefer this over findHeaderRow when you need method / firstDataCol.
 */
export function detectTableOrigin(ws: WorkSheet): TableOrigin {
  const grid = readGrid(ws);
  if (grid.length === 0) {
    return {
      headerRow: 1,
      headers: [],
      method: 'first_content',
      firstDataRow: 1,
      firstDataCol: 0,
    };
  }

  const maxScan = Math.min(grid.length, 25);
  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestPeriod = 0;
  let bestKeywords = 0;

  for (let i = 0; i < maxScan; i++) {
    const row = grid[i] ?? [];
    if (rowHasTitleBanner(row)) continue;
    const { score, periodHits, keywordHits } = scoreHeaderRow(row);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
      bestPeriod = periodHits;
      bestKeywords = keywordHits;
    }
  }

  // Confidence threshold: need a real signal, not a lone title word.
  const confident = bestIdx >= 0 && bestScore >= 5 && (bestPeriod >= 2 || bestKeywords >= 1);

  if (confident) {
    const raw = grid[bestIdx] ?? [];
    const normalized = normalizeHeaderRow(raw);
    const dataRows = grid.slice(bestIdx + 1);
    const headers = synthesizeEmptyHeaders(normalized, dataRows);
    const method: DetectionMethod = bestPeriod >= 2 ? 'period_axis' : 'header_keywords';
    const firstDataCol = Math.max(
      0,
      headers.findIndex((h) => h.trim()) >= 0 ? headers.findIndex((h) => h.trim()) : 0,
    );
    return {
      headerRow: bestIdx + 1,
      headers,
      method,
      firstDataRow: bestIdx + 2,
      firstDataCol,
    };
  }

  // Fallback 1 — first content cell (like-for-like table start).
  const content = findFirstContent(grid);
  if (content) {
    const raw = grid[content.row] ?? [];
    const width = Math.max(...grid.map((r) => r.length), raw.length, 1);
    const normalized = Array.from({ length: width }, (_, c) =>
      normalizeHeaderCell(raw[c], isDailyAxisRow(raw)),
    );
    // If this row looks like values not labels, treat the row *above* as header when present.
    const looksLikeData =
      raw.filter((c) => isLargeAmount(c)).length >= 2 ||
      (raw.filter((c) => isNumericCell(c)).length >= 3 &&
        raw.filter((c) => typeof c === 'string' && HEADER_KEYWORDS.test(c)).length === 0);

    if (looksLikeData && content.row > 0) {
      const headerRaw = grid[content.row - 1] ?? [];
      const headerNorm = normalizeHeaderRow(
        Array.from({ length: width }, (_, c) => headerRaw[c]),
      );
      const headers = synthesizeEmptyHeaders(headerNorm, grid.slice(content.row));
      return {
        headerRow: content.row,
        headers,
        method: 'first_content',
        firstDataRow: content.row + 1,
        firstDataCol: content.col,
      };
    }

    const headers = synthesizeEmptyHeaders(normalized, grid.slice(content.row + 1));
    return {
      headerRow: content.row + 1,
      headers,
      method: 'first_content',
      firstDataRow: content.row + 2,
      firstDataCol: content.col,
    };
  }

  // Fallback 2 — first numeric data cell anchors the block.
  const numeric = findFirstNumericData(grid);
  if (numeric) {
    const headerIdx = Math.max(0, numeric.row - 1);
    const width = Math.max(...grid.map((r) => r.length), 1);
    const headerRaw = grid[headerIdx] ?? [];
    const normalized = normalizeHeaderRow(
      Array.from({ length: width }, (_, c) => headerRaw[c]),
    );
    // Ensure label columns left of the numeric block get synthetic names.
    const headers = synthesizeEmptyHeaders(normalized, grid.slice(numeric.row));
    return {
      headerRow: headerIdx + 1,
      headers,
      method: 'first_numeric',
      firstDataRow: numeric.row + 1,
      firstDataCol: numeric.col,
    };
  }

  // Absolute last resort — row 1 as-is.
  const first = normalizeHeaderRow(grid[0] ?? []);
  return {
    headerRow: 1,
    headers: synthesizeEmptyHeaders(first, grid.slice(1)),
    method: 'first_content',
    firstDataRow: 2,
    firstDataCol: 0,
  };
}

export function findHeaderRow(ws: WorkSheet): HeaderRowInfo {
  const origin = detectTableOrigin(ws);
  return {
    headerRow: origin.headerRow,
    headers: origin.headers,
    method: origin.method,
    firstDataCol: origin.firstDataCol,
  };
}

/**
 * Build the deduplicated DB column keys for a header row ("Total", "Total_2",
 * empty headers become "__hidden_<n>") — identical to the sheet-data GET.
 */
export function buildColumnKeys(headers: string[]): string[] {
  const seen = new Map<string, number>();
  let emptyColIdx = 0;
  return headers.map((h) => {
    const trimmed = (h || '').toString().trim();
    if (!trimmed) return `__hidden_${emptyColIdx++}`;
    const count = seen.get(trimmed) ?? 0;
    seen.set(trimmed, count + 1);
    return count > 0 ? `${trimmed}_${count}` : trimmed;
  });
}

/**
 * True for columns that represent percentages (interstitial "2020 %", bare "%",
 * "Variance %", "Amount %", etc.). Used for display-only formatting.
 */
export function isPercentColumnKey(key: string): boolean {
  const k = key.trim();
  if (!k || k.startsWith('__hidden_')) return false;
  if (k === '%' || /^pct(_\d+)?$/i.test(k)) return true;
  if (/\s+%$/.test(k)) return true; // "2020 %", "May 2026 %"
  if (/%\s*$/.test(k) || /\bpct\b/i.test(k) || /percent/i.test(k)) return true;
  if (/variance\s*%/i.test(k) || /margin/i.test(k) && /%/i.test(k)) return true;
  return false;
}

/**
 * Display-only percent format: Excel ratio `0.2` → `"20.00%"`.
 * Already-suffixed strings are re-rounded to 2 d.p. Raw values are unchanged
 * in the row model so edit mode still shows the full underlying number.
 */
export function formatPercentDisplay(value: unknown): string {
  if (value === '' || value === undefined || value === null) return '';

  if (typeof value === 'string') {
    const t = value.trim();
    if (!t || t === '-' || isExcelError(t)) return t;
    if (/%\s*$/.test(t)) {
      const n = Number(t.replace(/%/g, '').replace(/,/g, '').trim());
      if (!Number.isFinite(n)) return t;
      return `${n.toFixed(2)}%`;
    }
    const asNum = Number(t.replace(/,/g, ''));
    if (!Number.isFinite(asNum)) return t;
    return formatPercentDisplay(asNum);
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);

  // Excel stores percentages as fractions (0.2 = 20%). Values clearly already
  // in percent-points (|v| > 1.5) are left as-is aside from rounding.
  const points = Math.abs(value) <= 1.5 ? value * 100 : value;
  return `${points.toFixed(2)}%`;
}

/**
 * Parse a display/edit string back to an Excel ratio for percent columns.
 * `"20.00%"` / `"20"` → `0.2`; `"0.2"` → `0.2`.
 */
export function parsePercentInput(value: unknown): unknown {
  if (value === '' || value === undefined || value === null) return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.abs(value) > 1.5 ? value / 100 : value;
  }
  if (typeof value !== 'string') return value;
  const t = value.trim();
  if (!t) return '';
  const hasPct = /%\s*$/.test(t);
  const n = Number(t.replace(/%/g, '').replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return value;
  if (hasPct) return n / 100;
  // Bare number in a % column: treat >1.5 as percent-points, else as ratio.
  return Math.abs(n) > 1.5 ? n / 100 : n;
}

/**
 * Map an Excel cell address to the DB-sheet coordinates.
 *
 * @param ws          the worksheet the address belongs to
 * @param addr        A1-style address ("V46", "$A$1")
 * @param headerInfo  precomputed findHeaderRow(ws) result (recomputed per call
 *                    if omitted — pass it when mapping many cells)
 */
export function mapCellToData(
  ws: WorkSheet,
  addr: string,
  headerInfo?: HeaderRowInfo,
): { colKey?: string; relRow?: number; absRow: number; absCol: number } {
  const clean = addr.replace(/\$/g, '');
  const decoded = utils.decode_cell(clean);
  const info = headerInfo ?? findHeaderRow(ws);
  // First data row = headerRow + 1 → 1-based data offset; rows at/above the
  // header (title rows) get relRow <= 0 / undefined (they are not data).
  const relRow = decoded.r - info.headerRow + 1;
  const columnKeys = buildColumnKeys(info.headers);
  const rawHeader = info.headers[decoded.c] ?? '';
  const colKey = rawHeader.trim() ? columnKeys[decoded.c] : undefined;
  return {
    colKey,
    relRow: relRow >= 1 ? relRow : undefined,
    absRow: decoded.r + 1,
    absCol: decoded.c + 1,
  };
}

/** @internal exported for unit tests */
export const __test__ = {
  scoreHeaderRow,
  rowHasTitleBanner,
  isMonthHeader,
  isYearHeader,
  excelSerialMonth,
  MONTH_PREFIX,
};
