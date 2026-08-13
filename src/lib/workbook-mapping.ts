/**
 * Workbook → DB-sheet mapping helpers.
 *
 * The sheet viewer serves workbook data as JSON rows keyed by column header
 * (deduplicated, e.g. "Total", "Total_2"), with an automatically detected
 * header row. These helpers are the single source of truth for that mapping —
 * the sheet-data API route, the formula-reference mapper, and the import-time
 * formula extraction all use them so a formula cell reference ("V46") maps to
 * the exact same (column key, data-row offset) the application displays.
 */
import { utils } from 'xlsx';
import type { WorkSheet } from 'xlsx';

// Header row detection (mirrors the logic historically duplicated in the
// sheet-data route and workbook-analyzer.ts).
const HEADER_KEYWORDS = /description|amount|total|date|revenue|account|name|qty|price|cost|sales|income|expense|balance|number|ref|period|transaction|debit|credit|unit|rate|pct|margin|bills|covers|guests|staff|code|type|category|item|product|service|charge|discount|tax|subtotal|net|gross/i;
const TITLE_KEYWORDS = /^(profit\s*&?\s*loss|balance\s*sheet|trial\s*balance|general\s*ledger|periode|period|month\s*of|input\s*data|auto\s*calc)/i;

export interface HeaderRowInfo {
  /** 1-based Excel row of the detected header (first data row = headerRow + 1). */
  headerRow: number;
  /** Raw header texts, in column order (may contain ''). */
  headers: string[];
}

export function findHeaderRow(ws: WorkSheet): HeaderRowInfo {
  const rows = utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
  const maxScan = Math.min(rows.length, 20);

  let bestRow = 0;
  let bestScore = 0;
  let bestHeaders: string[] = [];

  for (let i = 0; i < maxScan; i++) {
    const row = rows[i] ?? [];
    const nonEmpty = row.filter((c) => c !== '' && c !== undefined && c !== null) as unknown[];
    const nonEmptyCount = nonEmpty.length;
    if (nonEmptyCount === 0) continue;

    const firstCell = String(row[0] ?? '').trim();
    if (nonEmptyCount <= 2 && TITLE_KEYWORDS.test(firstCell)) continue;

    let headerLikeCount = 0;
    let numericCount = 0;
    for (const cell of nonEmpty) {
      const str = String(cell);
      if (str === '#N/A' || str === '#REF!' || str === '#VALUE!') continue;
      const num = Number(cell);
      const isNumeric = typeof cell === 'number' || (typeof cell === 'string' && /^[\d,.-]+$/.test(str.trim()) && isFinite(num));
      if (isNumeric && Math.abs(num) > 0) numericCount++;
      else if (HEADER_KEYWORDS.test(str)) headerLikeCount++;
    }

    const textRatio = nonEmptyCount > 0 ? (nonEmptyCount - numericCount) / nonEmptyCount : 0;
    const score = headerLikeCount * 3 + textRatio * 2 + (nonEmptyCount >= 3 ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
      bestRow = i;
      bestHeaders = row.map((c) => String(c ?? ''));
    }
  }

  if (bestScore < 2 && rows.length > 0) {
    const firstRow = (rows[0] ?? []).map((c) => String(c ?? ''));
    return { headerRow: 1, headers: firstRow };
  }

  return { headerRow: bestRow + 1, headers: bestHeaders };
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
