import type { ChartKpi } from '@/store/ui-slice';

export const CHART_KPIS: ChartKpi[] = ['ebitda', 'revenue', 'net_income', 'guests'];

export const KPI_LABELS: Record<ChartKpi, string> = {
  ebitda: 'EBITDA',
  revenue: 'Revenue',
  net_income: 'Net Profit',
  guests: 'Guests',
  staff_cost: 'Staff Cost %',
};

export const SCENARIO_TARGETS: Record<
  ChartKpi,
  { conservative: string; realistic: string; aspirational: string; label: string }
> = {
  ebitda: {
    conservative: 'IDR 7.5B',
    realistic: 'IDR 8.4B',
    aspirational: 'IDR 15.5B',
    label: 'EBITDA',
  },
  revenue: {
    conservative: 'IDR 3.5B',
    realistic: 'IDR 3.8B',
    aspirational: 'IDR 5.5B',
    label: 'Revenue',
  },
  net_income: {
    conservative: 'IDR 2.9B',
    realistic: 'IDR 3.1B',
    aspirational: 'IDR 4.5B',
    label: 'Net Profit',
  },
  guests: {
    conservative: '8,850/mo',
    realistic: '9,180/mo',
    aspirational: '10,110/mo',
    label: 'Guests',
  },
  staff_cost: {
    conservative: '16.5%',
    realistic: '15.5%',
    aspirational: '11.5%',
    label: 'Staff Cost %',
  },
};

const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

export function labelToPeriod(label: string): string | null {
  const parts = label.split(' ');
  if (parts.length !== 2) return null;
  const mm = MONTH_MAP[parts[0]];
  if (!mm) return null;
  return `${parts[1]}-${mm}`;
}

export function formatChartValue(kpi: ChartKpi, val: number | null | undefined, signed = true): string {
  if (val == null || Number.isNaN(val)) return '—';
  if (kpi === 'guests') {
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(0);
  }
  const abs = Math.abs(val);
  const sign = signed ? (val < 0 ? '-' : '+') : '';
  if (abs >= 1_000_000_000) return `${sign}IDR ${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}IDR ${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000) return `${sign}IDR ${(abs / 1_000).toFixed(0)}K`;
  return `${sign}IDR ${abs.toFixed(0)}`;
}

export function formatIdr(value: number | null | undefined, signed = false): string {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  const prefix = signed && value < 0 ? '-' : signed && value > 0 ? '+' : '';
  if (abs >= 1_000_000_000) return `${prefix}IDR ${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${prefix}IDR ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${prefix}IDR ${Math.round(abs).toLocaleString('en-ID')}`;
  return `${prefix}IDR ${abs.toFixed(0)}`;
}

export function axisTickCallback(kpi: ChartKpi, val: number | string): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (kpi === 'guests') {
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toFixed(0);
  }
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export const MONTH_ABBREV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Inclusive year range of `Mon YYYY` labels (e.g. Jan 2026 … Dec 2027). */
export function buildYearMonthLabels(startYear: number, endYear: number): string[] {
  const labels: string[] = [];
  for (let y = startYear; y <= endYear; y++) {
    for (const mon of MONTH_ABBREV) {
      labels.push(`${mon} ${y}`);
    }
  }
  return labels;
}

/**
 * Default chart window: previous calendar year through next year (36 months).
 * Keeps the month dropdown usable even before projections are seeded.
 */
export function defaultChartMonthLabels(now = new Date()): string[] {
  const y = now.getFullYear();
  return buildYearMonthLabels(y - 1, y + 1);
}

export function findCurrentMonthIndex(labels: string[]): number {
  const now = new Date();
  const needle = `${MONTH_ABBREV[now.getMonth()]} ${now.getFullYear()}`;
  return labels.findIndex((l) => l === needle);
}

/** Decode ?month= query values (e.g. Aug+2026 or Aug%2B2026 → "Aug 2026"). */
export function parseMonthQueryParam(value: string | null | undefined): string | null {
  if (!value) return null;
  const decoded = value.replace(/\+/g, ' ').trim();
  return decoded || null;
}

/**
 * Prefer revenue actuals as the "has data" signal; otherwise the first series
 * that contains any non-null value.
 */
export function pickActualSeriesForDefault(
  actual: Record<string, (number | null)[]> | undefined,
): (number | null)[] | undefined {
  if (!actual) return undefined;
  if (actual.revenue?.some((v) => v != null)) return actual.revenue;
  for (const series of Object.values(actual)) {
    if (series?.some((v) => v != null)) return series;
  }
  return actual.revenue;
}

/**
 * Default month when nothing is selected / URL has no ?month=.
 *
 * Prefer the latest month with a non-null actual (scan backwards). If no
 * actuals exist, fall back to calendar "now" when that label is present,
 * otherwise the first label.
 */
export function resolveDefaultMonthIndex(
  labels: string[],
  actualSeries?: (number | null)[] | null,
): number {
  if (!labels.length) return 0;

  if (actualSeries?.length) {
    const end = Math.min(actualSeries.length, labels.length) - 1;
    for (let i = end; i >= 0; i--) {
      if (actualSeries[i] != null) return i;
    }
  }

  const currentIdx = findCurrentMonthIndex(labels);
  return currentIdx >= 0 ? currentIdx : 0;
}

export function resolveMonthIndex(
  labels: string[],
  selectedLabel: string | null,
  actualSeries?: (number | null)[] | null,
): number {
  if (!labels.length) return -1;
  if (selectedLabel) {
    const idx = labels.indexOf(selectedLabel);
    if (idx >= 0) return idx;
  }
  return resolveDefaultMonthIndex(labels, actualSeries);
}
