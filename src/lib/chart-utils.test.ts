import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildYearMonthLabels,
  defaultChartMonthLabels,
  parseMonthQueryParam,
  pickActualSeriesForDefault,
  resolveDefaultMonthIndex,
  resolveMonthIndex,
} from '@/lib/chart-utils';

describe('chart-utils month helpers', () => {
  const labels = ['Jan 2026', 'Feb 2026', 'Aug 2026'];

  it('decodes month query params with plus-encoded spaces', () => {
    expect(parseMonthQueryParam('Aug+2026')).toBe('Aug 2026');
    expect(parseMonthQueryParam('Aug 2026')).toBe('Aug 2026');
    expect(parseMonthQueryParam(null)).toBeNull();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds a full year–month label range', () => {
    const built = buildYearMonthLabels(2026, 2026);
    expect(built).toHaveLength(12);
    expect(built[0]).toBe('Jan 2026');
    expect(built[11]).toBe('Dec 2026');
  });

  it('default chart labels span previous through next year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 15, 12));
    const built = defaultChartMonthLabels();
    expect(built).toHaveLength(36);
    expect(built[0]).toBe('Jan 2025');
    expect(built[35]).toBe('Dec 2027');
  });

  it('resolves default month to latest index with actuals when provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 15, 12)); // Aug 2026
    const actuals = [100, 200, null];
    expect(resolveDefaultMonthIndex(labels, actuals)).toBe(1);
  });

  it('falls back to calendar month when no actuals exist', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 12)); // Jul 2026
    const julLabels = ['Jan 2026', 'Jul 2026', 'Aug 2026'];
    expect(resolveDefaultMonthIndex(julLabels)).toBe(1);
    expect(resolveDefaultMonthIndex(julLabels, [null, null, null])).toBe(1);
    expect(resolveDefaultMonthIndex(['Jan 2026'])).toBe(0);
  });

  it('picks revenue actual series when present', () => {
    expect(
      pickActualSeriesForDefault({
        revenue: [1, null],
        ebitda: [9, 9],
      }),
    ).toEqual([1, null]);
  });

  it('resolves selected month index from labels', () => {
    expect(resolveMonthIndex(labels, 'Aug 2026')).toBe(2);
  });

  it('falls back to last actuals when selection is missing or stale', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 15, 12)); // Aug 2026
    const actuals = [10, 20, null];
    expect(resolveMonthIndex(labels, null, actuals)).toBe(1);
    expect(resolveMonthIndex(labels, 'Missing 2026', actuals)).toBe(1);
  });
});
