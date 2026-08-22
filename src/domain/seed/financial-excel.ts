/**
 * Parse financial projections from an Excel workbook — sheet-agnostic.
 *
 * Previously the parser hard-required a sheet named 'RedRuby' (fixed row
 * numbers) and threw when it was missing. It now reads EVERY sheet:
 *
 *  1. Legacy known layouts (RedRuby / 2027 / 2029 / 2030) keep their exact
 *     fixed-row behavior for backward compatibility with the original
 *     cashflow budget workbook (including the fixed English P&L template).
 *  2. Any other sheet is parsed generically:
 *       - detect the label column (most matches against known P&L labels),
 *       - detect the period axis: month-name/date columns, 4-digit year
 *         columns, or a "Periode/Per/Month of <Month> <Year>" label for
 *         single-period actuals,
 *       - match KPI rows by label for revenue / staff / net / ebitda,
 *       - emit `pnlLines` from the **workbook's own row structure** (COA
 *         codes + descriptions) so the Monthly P&L Breakdown mirrors PL /
 *         SUMPL instead of the legacy RedRuby checklist,
 *       - emit one projection per detected period.
 *  3. Sheets that yield nothing (GL, TB, BS, COS, daily logs, …) are
 *     skipped with a warning — never a hard error.
 */
import { read, readFile, utils } from 'xlsx';
import type { WorkBook, WorkSheet } from 'xlsx';
import { PNL_LINE_ITEMS, rowForItem, layoutForSheet } from '@/domain/seed/pnl-rows';
import { enrichPnlLinesWithMetrics } from '@/domain/financial/pnl-calculator';
import type { PnlLine as CalcPnlLine } from '@/domain/financial/pnl-calculator';

export type ProjectionDataType = 'actual' | 'forecast';
export type ProjectionScenario = 'actual' | 'conservative' | 'realistic' | 'aspirational';

export interface PnlLine {
  key: string;
  label: string;
  value: number | null;
  pct?: boolean;
  sub?: boolean;
  header?: boolean;
}

export interface FinancialProjectionRow {
  period: string;
  year: number;
  month: number;
  dataType: ProjectionDataType;
  scenario: ProjectionScenario;
  revenue: number;
  ebitda: number;
  netIncome: number;
  guests: number;
  staffCost: number;
  pnlLines: PnlLine[];
}

// ── Legacy fixed-row layouts (backward compatibility) ──────────────

interface SheetConfig {
  ebitda: number;
  revenue: number | { actual: number; forecast: number };
  guests: number | { actual: number; forecast: number };
  netIncome: number | { actual: number; forecast: number };
}

const SHEET_CONFIG: Record<string, SheetConfig> = {
  RedRuby: {
    ebitda: 94,
    revenue: { actual: 29, forecast: 28 },
    guests: { actual: 23, forecast: 22 },
    netIncome: { actual: 19, forecast: 16 },
  },
  '2027': {
    ebitda: 66,
    revenue: 21,
    guests: 19,
    netIncome: 17,
  },
  '2029': {
    ebitda: 66,
    revenue: 21,
    guests: 19,
    netIncome: 17,
  },
  '2030': {
    ebitda: 66,
    revenue: 21,
    guests: 19,
    netIncome: 17,
  },
};

const LEGACY_SHEET_NAMES = ['RedRuby', '2027', '2029', '2030'] as const;

function getCell(sheet: WorkSheet, col: number, row: number): unknown {
  const addr = utils.encode_cell({ c: col - 1, r: row - 1 });
  const cell = sheet[addr];
  return cell ? cell.v : null;
}

function getStaffCost(sheet: WorkSheet, col: number, sheetName: string): number {
  const costRows =
    sheetName === 'RedRuby' ? [47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 66] : [35, 37, 39, 41, 43, 44];
  let total = 0;
  for (const r of costRows) {
    const v = getCell(sheet, col, r);
    if (v != null && typeof v === 'number' && !Number.isNaN(v)) total += v;
  }
  return total;
}

function pickRow(
  cfg: number | { actual: number; forecast: number },
  dataType: ProjectionDataType,
): number {
  return typeof cfg === 'object' ? cfg[dataType === 'actual' ? 'actual' : 'forecast'] : cfg;
}

function extractPnlLines(sheet: WorkSheet, col: number, sheetName: string): PnlLine[] {
  const layout = layoutForSheet(sheetName);
  const lines: PnlLine[] = [];
  for (const item of PNL_LINE_ITEMS) {
    if (item.header) {
      lines.push({ key: item.key, label: item.label, header: true, value: null });
      continue;
    }
    const row = rowForItem(item, layout);
    const raw = row ? getCell(sheet, col, row) : null;
    const value =
      raw != null && typeof raw === 'number' && !Number.isNaN(raw) ? raw : null;
    lines.push({
      key: item.key,
      label: item.label,
      value,
      pct: !!item.pct,
      sub: !!item.sub,
    });
  }
  return lines;
}

function projectionRow(args: {
  period: string;
  year: number;
  month: number;
  dataType: ProjectionDataType;
  scenario: ProjectionScenario;
  sheet: WorkSheet;
  col: number;
  sheetName: string;
  cfg: SheetConfig;
}): FinancialProjectionRow {
  const { period, year, month, dataType, scenario, sheet, col, sheetName, cfg } = args;
  const revenueRow = pickRow(cfg.revenue, dataType);
  const guestsRow = pickRow(cfg.guests, dataType);
  const netIncomeRow = pickRow(cfg.netIncome, dataType);

  return {
    period,
    year,
    month,
    dataType,
    scenario,
    revenue: Math.round(Number(getCell(sheet, col, revenueRow) ?? 0)),
    ebitda: Math.round(Number(getCell(sheet, col, cfg.ebitda) ?? 0)),
    netIncome: Math.round(Number(getCell(sheet, col, netIncomeRow) ?? 0)),
    guests: Math.round(Number(getCell(sheet, col, guestsRow) ?? 0)),
    staffCost: Math.round(getStaffCost(sheet, col, sheetName)),
    pnlLines: extractPnlLines(sheet, col, sheetName),
  };
}

/** Parse a known legacy sheet (fixed row layout). Returns [] when absent. */
function parseLegacySheet(wb: WorkBook, sheetName: string): FinancialProjectionRow[] {
  const sheet = wb.Sheets[sheetName];
  const cfg = SHEET_CONFIG[sheetName];
  if (!sheet || !cfg) return [];

  const rows: FinancialProjectionRow[] = [];
  if (sheetName === 'RedRuby') {
    // Jan–May actuals, Jun–Dec conservative forecast (legacy columns 4–8 / 9–15).
    for (let col = 4; col <= 8; col++) {
      const month = col - 3;
      rows.push(
        projectionRow({
          period: `2026-${String(month).padStart(2, '0')}`,
          year: 2026,
          month,
          dataType: 'actual',
          scenario: 'actual',
          sheet,
          col,
          sheetName,
          cfg,
        }),
      );
    }
    for (let col = 9; col <= 15; col++) {
      const month = col - 3;
      rows.push(
        projectionRow({
          period: `2026-${String(month).padStart(2, '0')}`,
          year: 2026,
          month,
          dataType: 'forecast',
          scenario: 'conservative',
          sheet,
          col,
          sheetName,
          cfg,
        }),
      );
    }
    return rows;
  }

  const year = Number(sheetName);
  const scenario = (sheetName === '2029' ? 'realistic' : sheetName === '2030' ? 'aspirational' : 'conservative') as ProjectionScenario;
  for (let col = 4; col <= 15; col++) {
    const month = col - 3;
    rows.push(
      projectionRow({
        period: `${sheetName}-${String(month).padStart(2, '0')}`,
        year,
        month,
        dataType: 'forecast',
        scenario,
        sheet,
        col,
        sheetName,
        cfg,
      }),
    );
  }
  return rows;
}

// ── Generic sheet parsing (any layout) ─────────────────────────────

/** Fallback year when a sheet has month columns but no year anywhere. */
const DEFAULT_YEAR = 2026;

type MetricKind = 'revenue' | 'staff' | 'net' | 'ebitda' | 'interest' | 'depr' | 'guests' | 'otherfixed';

interface MetricAlias {
  kind: MetricKind;
  patterns: string[];
}

/** Label patterns recognized in arbitrary workbooks (COA style + legacy). */
const METRIC_ALIASES: MetricAlias[] = [
  { kind: 'revenue', patterns: ['total income idr', 'total income', 'total revenue'] },
  { kind: 'staff', patterns: ['total salary and wages', 'total salary & wage costs', 'total payroll'] },
  { kind: 'net', patterns: ['profit and loss', 'net income pre tax/service', 'net income'] },
  { kind: 'ebitda', patterns: ['ebitda'] },
  { kind: 'interest', patterns: ['interest expenses', 'bank & card fees / interest'] },
  { kind: 'depr', patterns: ['total depreciations & amortisations', 'depreciations & amortisations'] },
  { kind: 'guests', patterns: ['total guests per month', 'guests - club per month'] },
  { kind: 'otherfixed', patterns: ['other fixed cost'] },
];

const MONTH_PREFIX_TO_INDEX: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7,
  aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  // Indonesian abbreviations ("Mei", "Okt", "Des", "Agt/Agu/Ags/Agst", "Maret" via mar…)
  mei: 5, okt: 10, des: 12, agt: 8, agu: 8, ags: 8, agst: 8,
};

function norm(cell: unknown): string {
  return String(cell ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function toNumber(cell: unknown): number | null {
  if (cell == null) return null;
  if (typeof cell === 'number' && !Number.isNaN(cell)) return cell;
  const n = Number(cell);
  return Number.isFinite(n) && String(cell).trim() !== '' ? n : null;
}

/** Interpret a header cell as a month (name, abbreviation, serial date). */
function monthFromCell(cell: unknown): { month: number; year?: number } | null {
  if (cell == null) return null;
  if (typeof cell === 'number') {
    if (cell >= 1 && cell <= 12) return { month: Math.round(cell) };
    // Excel serial date — only accept month-start serials (BEP-style headers).
    if (cell > 20000 && cell < 60000) {
      const d = new Date(Math.round((cell - 25569) * 86400000));
      if (d.getUTCDate() === 1) return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
      return null;
    }
    return null;
  }
  const text = norm(cell);
  if (!text) return null;
  const m = text.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|mei|okt|des|agt|agu|ags|agst)\w*\s*\.?\s*(\d{4})?/);
  if (!m) return null;
  const month = MONTH_PREFIX_TO_INDEX[m[1]!];
  if (!month) return null;
  return { month, year: m[2] ? Number(m[2]) : undefined };
}

/** Find a header row with ≥3 month cells → month axis. */
function detectMonthAxis(grid: unknown[][]): Map<number, { month: number; year?: number }> | null {
  for (let r = 0; r < Math.min(grid.length, 10); r++) {
    const cols = new Map<number, { month: number; year?: number }>();
    const row = grid[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const m = monthFromCell(row[c]);
      if (m) cols.set(c, m);
    }
    if (cols.size >= 3) return cols;
  }
  return null;
}

/** Find a header row with ≥2 four-digit years → year axis. */
function detectYearAxis(grid: unknown[][]): Map<number, number> | null {
  for (let r = 0; r < Math.min(grid.length, 10); r++) {
    const cols = new Map<number, number>();
    const row = grid[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      let year: number | null = null;
      if (typeof cell === 'number' && cell >= 1900 && cell <= 2100) year = cell;
      else if (typeof cell === 'string' && /^(19|20)\d{2}$/.test(cell.trim())) year = Number(cell.trim());
      if (year != null) cols.set(c, year);
    }
    if (cols.size >= 2) return cols;
  }
  return null;
}

/** "Periode: June 2026" / "Per June 2026" / "MONTH OF June 2026" → { year, month }. */
function detectPeriodLabel(grid: unknown[][]): { year: number; month: number } | null {
  for (let r = 0; r < Math.min(grid.length, 6); r++) {
    const row = grid[r];
    if (!row) continue;
    for (const cell of row) {
      if (cell == null || typeof cell === 'number') continue;
      const text = norm(cell);
      const m = text.match(/(?:periode|period|month of|per|as of|for)\s*[:.]?\s*([a-z]+)\s*((?:19|20)\d{2})/);
      if (!m) continue;
      const month = monthFromCell(m[1]!);
      if (month) return { year: Number(m[2]!), month: month.month };
    }
  }
  return null;
}

/** First 4-digit year mentioned in the top rows (e.g. "Profit & Loss Projections 2026"). */
function detectTitleYear(grid: unknown[][]): number | null {
  for (let r = 0; r < Math.min(grid.length, 6); r++) {
    const row = grid[r];
    if (!row) continue;
    for (const cell of row) {
      if (cell == null) continue;
      const text = String(cell);
      const m = text.match(/(19|20)\d{2}/);
      if (m) return Number(m[0]);
    }
  }
  return null;
}

/** Column with the most recognized P&L labels → the label column. */
function detectLabelColumn(grid: unknown[][]): number | null {
  const recognized = new Set<string>();
  for (const item of PNL_LINE_ITEMS) recognized.add(norm(item.label));
  for (const alias of METRIC_ALIASES) for (const p of alias.patterns) recognized.add(p);

  let bestCol: number | null = null;
  let bestCount = 0;
  for (let c = 0; c < 12; c++) {
    let count = 0;
    for (const row of grid) {
      const cell = row?.[c];
      if (cell == null || typeof cell === 'number') continue;
      const key = norm(cell);
      if (!key) continue;
      for (const label of recognized) {
        if (key.includes(label) || label.includes(key)) {
          count++;
          break;
        }
      }
    }
    if (count > bestCount) {
      bestCount = count;
      bestCol = c;
    }
  }
  return bestCount > 0 ? bestCol : null;
}

/** Numeric value of `cell` if it is a usable number, else null. */
function num(cell: unknown): number | null {
  const n = toNumber(cell);
  return n == null ? null : Math.round(n);
}

/** Account-style codes used in accountant COA workbooks (e.g. 4-2100, 6-1199). */
const ACCOUNT_CODE_RE = /^\d-\d{3,4}[A-Za-z]?$/;

/**
 * Map common sheet totals onto stable metric keys so KPIs / monthly-actuals
 * sync keep working when the breakdown is workbook-native.
 * More-specific patterns must come first.
 */
const LABEL_TO_METRIC_KEY: Array<{ pattern: string; key: string }> = [
  { pattern: 'total income idr', key: 'total_income_idr' },
  { pattern: 'total income', key: 'total_income_idr' },
  { pattern: 'total revenue', key: 'total_income_idr' },
  { pattern: 'total salary and wages', key: 'total_staff_cost' },
  { pattern: 'total salary & wage costs', key: 'total_staff_cost' },
  { pattern: 'total payroll', key: 'total_staff_cost' },
  { pattern: 'net income pre tax/service', key: 'net_income_pre_tax' },
  { pattern: 'profit and loss', key: 'net_income_pre_tax' },
  { pattern: 'net income', key: 'net_income_pre_tax' },
  { pattern: 'ebitda', key: 'ebitda' },
  { pattern: 'total guests per month', key: 'total_guests_month' },
];

function metricKeyForLabel(label: string): string | null {
  const key = norm(label);
  for (const { pattern, key: metricKey } of LABEL_TO_METRIC_KEY) {
    if (key === pattern || key.includes(pattern)) return metricKey;
  }
  return null;
}

function slugLineKey(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64);
  return slug ? `line_${slug}` : 'line_row';
}

function isNoiseWorkbookLabel(label: string, rowIndex: number): boolean {
  const n = norm(label);
  if (
    [
      'description',
      'amount',
      'idr',
      'qty',
      'db',
      'cr',
      '%',
      'previous month',
      'current month',
      'month on month',
      'input data',
    ].includes(n)
  ) {
    return true;
  }
  if (rowIndex < 6 && /^(periode|period|per |month of|as of|for )/.test(n)) return true;
  if (rowIndex < 6 && /^pt\s+/.test(n)) return true;
  // Title banner "PROFIT & LOSS" (no amount) — the bottom total row is kept via value.
  if (rowIndex < 6 && /^profit\s*(&|and)?\s*loss$/.test(n)) return true;
  return false;
}

function rowLabelParts(
  grid: unknown[][],
  rowIndex: number,
  labelCol: number,
): { accountCode: string | null; label: string } {
  const raw = grid[rowIndex]?.[labelCol];
  const rawStr = raw == null ? '' : String(raw).trim();
  let accountCode: string | null = null;
  let label = rawStr;

  if (ACCOUNT_CODE_RE.test(rawStr)) {
    accountCode = rawStr.toUpperCase();
    for (const c of [labelCol + 1, labelCol + 2, labelCol - 1]) {
      const neighbor = grid[rowIndex]?.[c];
      if (typeof neighbor === 'string' && neighbor.trim() && !ACCOUNT_CODE_RE.test(neighbor.trim())) {
        label = neighbor.trim();
        break;
      }
    }
  } else {
    for (const c of [labelCol - 1, labelCol - 2, labelCol + 1]) {
      const neighbor = grid[rowIndex]?.[c];
      if (typeof neighbor === 'string' && ACCOUNT_CODE_RE.test(neighbor.trim())) {
        accountCode = neighbor.trim().toUpperCase();
        break;
      }
    }
  }

  return { accountCode, label };
}

function isSectionHeader(
  label: string,
  accountCode: string | null,
  value: number | null,
): boolean {
  // COA section roots (4-0000 INCOME, 5-0000 Cost Of Sales, …) — even when the
  // amount cell is 0 rather than blank.
  if (accountCode && /-\d?0{3}$/.test(accountCode)) return true;
  if (value != null) return false;
  const n = norm(label);
  if (/^(income|expenses|cost of sales|assets|liabilities|equity)$/.test(n)) return true;
  if (label === label.toUpperCase() && label.length > 2 && !/\d/.test(label)) return true;
  return false;
}

/**
 * Emit P&L breakdown lines from the sheet's own rows (COA / BEP / SUMPL),
 * instead of forcing the legacy RedRuby English checklist.
 */
function workbookNativePnlLines(
  grid: unknown[][],
  labelCol: number,
  valueCol: number,
): PnlLine[] {
  const lines: PnlLine[] = [];
  const usedKeys = new Set<string>();

  for (let r = 0; r < grid.length; r++) {
    const cell = grid[r]?.[labelCol];
    if (cell == null || typeof cell === 'number') continue;
    const { accountCode, label } = rowLabelParts(grid, r, labelCol);
    if (!label || isNoiseWorkbookLabel(label, r)) continue;

    const value = num(grid[r]?.[valueCol]);
    const header = isSectionHeader(label, accountCode, value);

    // Keep section headers for structure; skip empty leaf rows (no amount).
    if (!header && value == null) continue;

    const metricKey = metricKeyForLabel(label);
    let key = metricKey ?? (accountCode ? `acct_${accountCode}` : slugLineKey(label));
    if (usedKeys.has(key)) {
      let i = 2;
      while (usedKeys.has(`${key}_${i}`)) i++;
      key = `${key}_${i}`;
    }
    usedKeys.add(key);

    const displayLabel = accountCode && !label.toUpperCase().includes(accountCode)
      ? `${accountCode}  ${label}`
      : label;

    const looksPct =
      /margin|%|percent/.test(norm(label)) && value != null && Math.abs(value) <= 2;

    lines.push({
      key,
      label: displayLabel,
      header: header || undefined,
      value: header ? null : value,
      pct: looksPct || undefined,
      sub: accountCode && !metricKey && !/9{3,4}$/.test(accountCode) ? true : undefined,
    });
  }

  return lines;
}

/** Extract metrics (revenue/staff/net/ebitda/…) for a generic sheet column. */
function genericMetrics(
  grid: unknown[][],
  rowByLabel: Map<string, number>,
  valueCol: number,
): { revenue: number; ebitda: number; netIncome: number; guests: number; staffCost: number } {
  const findRow = (patterns: string[]): number | null => {
    for (const p of patterns) {
      for (const [key, r] of rowByLabel) {
        if (key === p) return r; // exact match wins
      }
    }
    for (const p of patterns) {
      for (const [key, r] of rowByLabel) {
        if (key.includes(p)) return r;
      }
    }
    return null;
  };

  const value = (kind: MetricKind): number | null => {
    const alias = METRIC_ALIASES.find((a) => a.kind === kind);
    if (!alias) return null;
    const row = findRow(alias.patterns);
    return row != null ? num(grid[row]?.[valueCol]) : null;
  };

  const revenue = value('revenue') ?? 0;
  const staffCost = value('staff') ?? 0;
  const netExplicit = value('net');
  const ebitdaExplicit = value('ebitda');
  const interest = value('interest') ?? 0;
  const depr = value('depr') ?? 0;
  const otherFixed = value('otherfixed') ?? 0;

  // Derive net income when the sheet has no explicit P&L row (e.g. BEP sheets).
  const netIncome = netExplicit ?? Math.round(revenue - staffCost - otherFixed);
  // Derive EBITDA when missing: net + interest + depreciation.
  const ebitda = ebitdaExplicit ?? netIncome + Math.round(interest + depr);

  return {
    revenue,
    ebitda: Math.round(ebitda),
    netIncome: Math.round(netIncome),
    guests: value('guests') ?? 0,
    staffCost: Math.round(staffCost),
  };
}

/** Generic parse of one sheet → projections (or null when unrecognized). */
function parseGenericSheet(sheet: WorkSheet, sheetName: string): FinancialProjectionRow[] | null {
  const grid = utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true }) as unknown[][];
  if (!grid || grid.length === 0) return null;

  const labelCol = detectLabelColumn(grid);
  if (labelCol == null) return null;

  // Map normalized label text → row index.
  const rowByLabel = new Map<string, number>();
  for (let r = 0; r < grid.length; r++) {
    const cell = grid[r]?.[labelCol];
    if (cell == null || typeof cell === 'number') continue;
    const key = norm(cell);
    if (key) rowByLabel.set(key, r);
  }

  const monthAxis = detectMonthAxis(grid);
  const yearAxis = detectYearAxis(grid);
  const periodLabel = detectPeriodLabel(grid);
  const titleYear = detectTitleYear(grid);
  const sheetYear = /^(19|20)\d{2}$/.test(sheetName) ? Number(sheetName) : null;

  // Year headers (e.g. SUMPL's 2020..2026 columns) are unambiguous — prefer
  // them over month headers when both are present.
  const primaryAxis = yearAxis ?? monthAxis;

  // Which columns hold values? For single-period sheets, pick the column with
  // the most numeric cells on recognized label rows.
  const valueColFor = (_c: number): number => {
    let best = 0;
    let bestCount = -1;
    for (let col = 0; col < Math.min(grid[0]?.length ?? 0, 26); col++) {
      let count = 0;
      for (const r of rowByLabel.values()) {
        const v = grid[r]?.[col];
        if (v != null && toNumber(v) != null) count++;
      }
      if (count > bestCount) {
        bestCount = count;
        best = col;
      }
    }
    return best;
  };

  const makeRow = (
    year: number,
    month: number,
    valueCol: number,
    dataType: ProjectionDataType,
    scenario: ProjectionScenario,
  ): FinancialProjectionRow => {
    const metrics = genericMetrics(grid, rowByLabel, valueCol);
    const pnlLines = enrichPnlLinesWithMetrics(
      workbookNativePnlLines(grid, labelCol, valueCol) as CalcPnlLine[],
      metrics,
    ) as PnlLine[];
    return {
      period: `${year}-${String(month).padStart(2, '0')}`,
      year,
      month,
      dataType,
      scenario,
      ...metrics,
      pnlLines,
    };
  };

  const rows: FinancialProjectionRow[] = [];

  if (primaryAxis) {
    if (yearAxis) {
      // Year columns (e.g. SUMPL) → annual totals stored as YYYY-12 actuals.
      for (const [col, year] of yearAxis) {
        rows.push(makeRow(year, 12, col, 'actual', 'actual'));
      }
      // Mixed layouts: annual columns PLUS monthly columns in the same sheet
      // (e.g. SUMPL = annual 2020–2025 + monthly Jan–Jun 2026).
      if (monthAxis) {
        for (const [col, m] of monthAxis) {
          const year = m.year ?? periodLabel?.year ?? titleYear ?? sheetYear ?? DEFAULT_YEAR;
          const isActual =
            periodLabel != null && periodLabel.year === year && m.month <= periodLabel.month;
          rows.push(
            makeRow(
              year,
              m.month,
              col,
              isActual ? 'actual' : 'forecast',
              isActual ? 'actual' : 'conservative',
            ),
          );
        }
      }
    } else {
      // Months are the primary axis (BEP-style, legacy generic, etc.).
      for (const [col, m] of monthAxis!) {
        const year = m.year ?? periodLabel?.year ?? titleYear ?? sheetYear ?? DEFAULT_YEAR;
        const isActual =
          periodLabel != null && periodLabel.year === year && m.month <= periodLabel.month;
        rows.push(
          makeRow(
            year,
            m.month,
            col,
            isActual ? 'actual' : 'forecast',
            isActual ? 'actual' : 'conservative',
          ),
        );
      }
    }
    return rows;
  }

  if (periodLabel) {
    // Single-period actuals (e.g. the accountant's PL sheet).
    const valueCol = valueColFor(0);
    rows.push(makeRow(periodLabel.year, periodLabel.month, valueCol, 'actual', 'actual'));
    return rows;
  }

  return null;
}

// ── Workbook entry ─────────────────────────────────────────────────

/** Sheets that can look period-shaped but are not P&L statements. */
const NON_PNL_SHEET_RE =
  /^(gl|tb|bs|cos|sumbs|daily\b|general(\s|_)*ledger|trial(\s|_)*balance|balance(\s|_)*sheet|cost(\s|_)*of(\s|_)*sales)/i;

function isNonPnlSheet(name: string): boolean {
  return NON_PNL_SHEET_RE.test(name.trim());
}

/** Prefer real P&L metrics over raw line-count so TB/BS dumps cannot win dedupe. */
function rowCompleteness(row: FinancialProjectionRow): number {
  let score = 0;
  if (row.revenue !== 0) score += 1000;
  if (row.ebitda !== 0) score += 200;
  if (row.netIncome !== 0) score += 200;
  if (row.guests !== 0) score += 50;
  if (row.staffCost !== 0) score += 200;
  let filledLines = 0;
  for (const line of row.pnlLines) {
    if (!line.header && line.value != null) filledLines++;
  }
  // Cap line contribution — a 5k-row ledger must not outrank a proper P&L.
  score += Math.min(filledLines, 150);
  return score;
}

function parseWorkbook(wb: WorkBook): FinancialProjectionRow[] {
  const projections: FinancialProjectionRow[] = [];
  const sheetNames = wb.SheetNames ?? [];

  for (const name of sheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;

    if ((LEGACY_SHEET_NAMES as readonly string[]).includes(name)) {
      projections.push(...parseLegacySheet(wb, name));
      continue;
    }

    if (isNonPnlSheet(name)) {
      console.warn(`[financial-excel] Skipped sheet "${name}": not a P&L statement (ledger/balance/daily)`);
      continue;
    }

    try {
      const generic = parseGenericSheet(sheet, name);
      if (generic && generic.length > 0) {
        projections.push(...generic);
      } else {
        console.warn(`[financial-excel] Skipped sheet "${name}": no recognizable P&L layout`);
      }
    } catch (err) {
      console.warn(
        `[financial-excel] Skipped sheet "${name}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Drop rows with no populated data (ledger/balance sheets that merely look
  // period-shaped), then dedupe identical (period, data_type, scenario) keys
  // keeping the most complete row (e.g. PL beats GL/TB for 2026-06 actual).
  const deduped = new Map<string, FinancialProjectionRow>();
  for (const row of projections) {
    if (rowCompleteness(row) === 0) continue;
    const key = `${row.period}|${row.dataType}|${row.scenario}`;
    const existing = deduped.get(key);
    if (!existing || rowCompleteness(row) > rowCompleteness(existing)) {
      deduped.set(key, row);
    }
  }
  return [...deduped.values()];
}

export function parseFinancialProjectionsFromBuffer(
  data: Buffer | ArrayBuffer | Uint8Array,
): FinancialProjectionRow[] {
  const wb = read(data, { type: 'buffer' });
  return parseWorkbook(wb);
}

export function parseFinancialProjectionsFromExcel(excelPath: string): FinancialProjectionRow[] {
  const wb = readFile(excelPath);
  return parseWorkbook(wb);
}
