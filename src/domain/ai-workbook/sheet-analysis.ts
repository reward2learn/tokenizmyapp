/**
 * Workbook Sheet Analysis (deterministic pre-pass)
 *
 * A dependency-free heuristic pass over extracted sheets that produces
 * "AnalysisHints" — structured context that:
 *   - is fed into the COMPREHEND prompt to bias the model (Phase 2),
 *   - gives the route layer a fast pre-AI status ("we see 4 sheets, mostly
 *     numeric, likely IDR, period hints 2026-06").
 *
 * No application aliases and no external deps — safe to bundle into the
 * Vercel Workflow step bundle.
 */
import type { ExtractedSheet } from './extract-sheets';
import { SHEET_CATEGORIES, type AiSheetCategory } from './extract-sheets';

// ── Hints ────────────────────────────────────────────────────────────

export interface SheetHints {
  tabName: string;
  rowCount: number;
  colCount: number;
  numericRatio: number;
  currencyHints: string[];
  periodHints: string[];
  labelHints: string[];
  /** Best-guess category from label matching, or null when ambiguous. */
  likelyCategory: AiSheetCategory | null;
}

export interface AnalysisHints {
  workbook: {
    sheetCount: number;
    totalRows: number;
    totalNonEmptyCells: number;
    overallNumericRatio: number;
    currencyGuess: string | null;
    periodGuess: string | null;
  };
  sheets: SheetHints[];
}

// ── Heuristic tables ─────────────────────────────────────────────────

const CURRENCY_PATTERNS: Array<[string, RegExp]> = [
  ['IDR', /\b(?:IDR|Rp\.?|Rupiah)\b/i],
  ['USD', /\b(?:USD|\$)\b/],
  ['EUR', /\b(?:EUR|€)\b/],
  ['GBP', /\b(?:GBP|£)\b/],
];

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
];

function periodPatterns(): RegExp[] {
  return [
    /\b(19|20)\d{2}[-/](0?[1-9]|1[0-2])(?:[-/]\d{1,2})?\b/g, // YYYY-MM, YYYY-MM-DD
    /\b(0?[1-9]|1[0-2])[-/](19|20)\d{2}\b/g, // MM-YYYY
    new RegExp(`\\b(?:${MONTH_NAMES.join('|')})\\b`, 'gi'), // month names
    /\bQ[1-4][ -]?(?:19|20)\d{2}\b/gi, // Q1 2026
  ];
}

const LABEL_CATEGORY_MAP: Array<[AiSheetCategory, string[]]> = [
  ['profit_loss', ['PROFIT & LOSS', 'PROFIT AND LOSS', 'Laba Rugi', 'INCOME STATEMENT', 'P&L', 'EBITDA', 'NET PROFIT', 'NET INCOME', 'LABA BERSIH', 'RUGI']],
  ['balance_sheet', ['BALANCE SHEET', 'NERACA', 'ASSET', 'LIABILIT', 'EKUITAS', 'EQUITY', 'TOTAL ASSETS']],
  ['trial_balance', ['TRIAL BALANCE', 'NERACA SALDO']],
  ['general_ledger', ['GENERAL LEDGER', 'BUKU BESAR', 'JURNAL']],
  ['cost_of_sales', ['COST OF SALES', 'COGS', 'HARGA POKOK', 'FOOD COST', 'BEVERAGE COST']],
  ['break_even', ['BREAK EVEN', 'BREAK-EVEN', 'BEP', 'TITIK IMPAS']],
  ['daily_sales', ['DAILY SALES', 'PENJUALAN HARIAN', 'OMZET']],
  ['month_on_month', ['MONTH ON MONTH', 'MOM', 'BULANAN']],
  ['variance', ['VARIANCE', 'VARIANSI', 'SELISIH', 'ACTUAL VS BUDGET', 'ACTUAL VS']],
  ['summary_pl', ['SUMMARY P&L', 'RINGKASAN LABA RUGI', 'SUMMARY PROFIT']],
  ['summary_bs', ['SUMMARY BALANCE', 'RINGKASAN NERACA']],
];

function collectHints(text: string): { currency: string[]; periods: string[]; labels: string[] } {
  const currency: string[] = [];
  for (const [name, re] of CURRENCY_PATTERNS) {
    if (re.test(text)) currency.push(name);
  }

  const periods: string[] = [];
  for (const re of periodPatterns()) {
    const matches = text.match(re);
    if (matches) periods.push(...matches);
  }

  const labels: string[] = [];
  for (const [, terms] of LABEL_CATEGORY_MAP) {
    for (const term of terms) {
      if (text.toUpperCase().includes(term.toUpperCase())) labels.push(term);
    }
  }

  return { currency, periods, labels };
}

function guessCategory(labels: string[]): AiSheetCategory | null {
  const scores = new Map<AiSheetCategory, number>();
  for (const [category, terms] of LABEL_CATEGORY_MAP) {
    let score = 0;
    for (const term of terms) {
      if (labels.includes(term)) score += term.length; // longer terms are more specific
    }
    if (score > 0) scores.set(category, score);
  }
  if (scores.size === 0) return null;
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 1 && sorted[0]![1] === sorted[1]![1]) return null; // tie → ambiguous
  return sorted[0]![0];
}

function bestGuess<T>(values: string[]): T | null {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0] as unknown as T;
}

// ── Public API ───────────────────────────────────────────────────────

/** Analyze extracted sheets (EXTRACT output) into deterministic hints. */
export function analyzeSheets(sheets: ExtractedSheet[]): AnalysisHints {
  const sheetHints: SheetHints[] = sheets.map((s) => {
    const { currency, periods, labels } = collectHints(s.text);
    return {
      tabName: s.tabName,
      rowCount: s.stats.rowCount,
      colCount: s.stats.colCount,
      numericRatio: s.stats.numericRatio,
      currencyHints: currency,
      periodHints: periods,
      labelHints: labels,
      likelyCategory: guessCategory(labels),
    };
  });

  const totalRows = sheetHints.reduce((acc, s) => acc + s.rowCount, 0);
  const totalNonEmptyCells = sheets.reduce((acc, s) => acc + s.stats.nonEmptyCells, 0);
  const weightedNumeric = sheets.reduce(
    (acc, s) => acc + s.stats.numericRatio * s.stats.nonEmptyCells,
    0,
  );

  const allCurrency = sheetHints.flatMap((s) => s.currencyHints);
  const allPeriods = sheetHints.flatMap((s) => s.periodHints);

  return {
    workbook: {
      sheetCount: sheets.length,
      totalRows,
      totalNonEmptyCells,
      overallNumericRatio: totalNonEmptyCells > 0 ? weightedNumeric / totalNonEmptyCells : 0,
      currencyGuess: bestGuess<string>(allCurrency),
      periodGuess: bestGuess<string>(allPeriods),
    },
    sheets: sheetHints,
  };
}

export { SHEET_CATEGORIES };
export type { AiSheetCategory };
