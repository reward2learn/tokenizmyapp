/**
 * Dynamic table-origin / header mapping tests.
 * Fixtures mirror the June 2026 Red Ruby accountant workbook layouts.
 */
import { describe, expect, it } from 'vitest';
import { utils, write, read } from 'xlsx';
import {
  detectTableOrigin,
  findHeaderRow,
  buildColumnKeys,
  normalizeHeaderCell,
  synthesizeEmptyHeaders,
  isPercentColumnKey,
  formatPercentDisplay,
  parsePercentInput,
} from './workbook-mapping';

function sheetFromAoa(aoa: unknown[][]) {
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet(aoa);
  utils.book_append_sheet(wb, ws, 'S');
  // Round-trip so types match real xlsx reads.
  return read(write(wb, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer' }).Sheets.S!;
}

describe('normalizeHeaderCell', () => {
  it('converts Excel month-start serials to Mon YYYY', () => {
    // 46054 = 2026-02-01
    expect(normalizeHeaderCell(46054)).toBe('Feb 2026');
    expect(normalizeHeaderCell(46174)).toBe('Jun 2026');
  });

  it('converts mid-month Excel serials to ISO dates (daily columns)', () => {
    // 46175 = 2026-06-02
    expect(normalizeHeaderCell(46175)).toBe('2026-06-02');
  });

  it('keeps year numbers and month strings', () => {
    expect(normalizeHeaderCell(2020)).toBe('2020');
    expect(normalizeHeaderCell('Jan 2026')).toBe('Jan 2026');
  });
});

describe('detectTableOrigin — SUMPL-style', () => {
  it('finds DESCRIPTION + year/month headers and normalizes serial months', () => {
    const ws = sheetFromAoa([
      [null, ' PROFIT & LOSS'],
      [null, 'Per June 2026'],
      [
        null,
        'DESCRIPTION',
        null,
        2020,
        null,
        2021,
        null,
        'Jan 2026',
        null,
        46054,
        null,
        46174,
        null,
        'TOTAL',
      ],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, '4-0000', 'INCOME'],
      [null, '4-2100', 'Sales Food', 411_109_661, null, 188_042_074, null, 181_630_000, null, 150_019_250, null, 177_970_625, null, 1_000_000_000],
      [null, '4-9999', 'Total Income', 7_669_858_390, null, 3_759_467_923, null, 2_275_608_308, null, 1_638_312_957, null, 1_975_304_568, null, 10_000_000_000],
    ]);

    const origin = detectTableOrigin(ws);
    expect(origin.headerRow).toBe(3);
    expect(origin.method).toMatch(/period_axis|header_keywords/);

    const keys = buildColumnKeys(origin.headers).filter((k) => !k.startsWith('__hidden_'));
    expect(keys).toContain('DESCRIPTION');
    expect(keys).toContain('Account'); // synthesized name column
    expect(keys).toContain('2020');
    expect(keys).toContain('Jan 2026');
    expect(keys).toContain('Feb 2026'); // was serial 46054
    expect(keys).toContain('Jun 2026'); // was serial 46174
    expect(keys).toContain('TOTAL');
  });
});

describe('detectTableOrigin — SumBS title-banner trap', () => {
  it('skips BALANCE SHEET title and picks DESCRIPTION + years', () => {
    const ws = sheetFromAoa([
      [null, null, 'BALANCE SHEET'],
      [null, null, 'PT TAMAN BINTANG BALI'],
      [null, 'DESCRIPTION', null, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      [null, null, null, null, null, null, null, null, null, null],
      [null, '1-0000', 'Assets'],
      [null, '1-1100', 'Cash', 9_082_541, 73_595_939, 324_589_148, 185_096_902, 113_303_266, 47_680_765, 21_152_433],
    ]);

    const origin = detectTableOrigin(ws);
    expect(origin.headerRow).toBe(3);
    const keys = buildColumnKeys(origin.headers).filter((k) => !k.startsWith('__hidden_'));
    expect(keys).toContain('DESCRIPTION');
    expect(keys).toContain('2020');
    expect(keys).toContain('2026');
    expect(keys).not.toContain('BALANCE SHEET');
  });
});

describe('detectTableOrigin — BEP period row vs data row', () => {
  it('prefers INPUT DATA / month headers over Total Revenue values', () => {
    const ws = sheetFromAoa([
      ['MONTHLY BREAK EVEN POINT (BEP)'],
      [null],
      ['INPUT DATA', 45658, 45689, 'MARC 2025', 'APRL 2025', 46023, 46054, 46174],
      ['Total Revenue', 2_674_811_722, 2_237_314_460, 2_247_865_214, 2_718_424_448, 2_275_608_308, 1_638_312_957, 1_975_304_568],
      ['Total Payroll', 546_183_562, 574_530_968, 562_042_137, 575_423_866, 552_090_375, 546_118_416, 620_122_268],
    ]);

    const origin = detectTableOrigin(ws);
    expect(origin.headerRow).toBe(3);
    const keys = buildColumnKeys(origin.headers).filter((k) => !k.startsWith('__hidden_'));
    expect(keys.some((k) => /2025|2026|Jan|Feb|Mar|Apr|May|Jun|INPUT/i.test(k))).toBe(true);
    // Must not use revenue amounts as column names.
    expect(keys.some((k) => k.includes('2674811722'))).toBe(false);
  });
});

describe('detectTableOrigin — PL single-period', () => {
  it('exposes Account name column between DESCRIPTION and Amount', () => {
    const ws = sheetFromAoa([
      [null, null, 'PROFIT & LOSS'],
      [null, null, 'Periode: June 2026'],
      [null, null, 'PT Taman Bintang Bali'],
      [null, 'DESCRIPTION', null, 'Amount'],
      [null, null, null, 'IDR'],
      [null, '4-0000', 'INCOME'],
      [null, '4-2100', 'Sales Food', 177_970_625],
      [null, '4-9999', 'Total Income', 1_975_304_568],
    ]);

    const origin = detectTableOrigin(ws);
    expect(origin.headerRow).toBe(4);
    const keys = buildColumnKeys(origin.headers).filter((k) => !k.startsWith('__hidden_'));
    expect(keys).toEqual(expect.arrayContaining(['DESCRIPTION', 'Account', 'Amount']));
  });
});

describe('fallback — first_content / first_numeric', () => {
  it('falls back to first content when no header keywords exist', () => {
    const ws = sheetFromAoa([
      [null, null, null],
      [null, 'Alpha', 'Beta', 'Gamma'],
      [null, 'a1', 'b1', 'c1'],
      [null, 'a2', 'b2', 'c2'],
    ]);
    const origin = detectTableOrigin(ws);
    expect(['first_content', 'first_numeric', 'header_keywords', 'period_axis']).toContain(origin.method);
    const keys = buildColumnKeys(origin.headers).filter((k) => !k.startsWith('__hidden_'));
    expect(keys.length).toBeGreaterThanOrEqual(2);
  });

  it('uses first numeric cell to anchor when headers are blank', () => {
    const ws = sheetFromAoa([
      [null, null, null, null],
      [null, null, null, null],
      [null, 'X', 'Y', 'Z'],
      [null, 100_000, 200_000, 300_000],
    ]);
    const origin = detectTableOrigin(ws);
    expect(origin.method === 'first_numeric' || origin.method === 'first_content' || origin.method === 'header_keywords').toBe(
      true,
    );
    expect(origin.headerRow).toBeGreaterThanOrEqual(1);
  });
});

describe('percent display (display-only)', () => {
  it('detects percent column keys', () => {
    expect(isPercentColumnKey('2020 %')).toBe(true);
    expect(isPercentColumnKey('%')).toBe(true);
    expect(isPercentColumnKey('Variance %')).toBe(true);
    expect(isPercentColumnKey('Amount %')).toBe(true);
    expect(isPercentColumnKey('2020')).toBe(false);
    expect(isPercentColumnKey('DESCRIPTION')).toBe(false);
  });

  it('formats Excel ratios as 2-d.p. percent strings', () => {
    expect(formatPercentDisplay(0.2)).toBe('20.00%');
    expect(formatPercentDisplay(0.2000)).toBe('20.00%');
    expect(formatPercentDisplay(0.323)).toBe('32.30%');
    expect(formatPercentDisplay(-0.07)).toBe('-7.00%');
    expect(formatPercentDisplay(0)).toBe('0.00%');
  });

  it('re-rounds already-suffixed percent strings', () => {
    expect(formatPercentDisplay('32%')).toBe('32.00%');
    expect(formatPercentDisplay('32.3 %')).toBe('32.30%');
  });

  it('parses edit input back to Excel ratios', () => {
    expect(parsePercentInput('20.00%')).toBe(0.2);
    expect(parsePercentInput('20%')).toBe(0.2);
    expect(parsePercentInput(0.2)).toBe(0.2);
    expect(parsePercentInput('20')).toBe(0.2); // percent-points when > 1.5
    expect(parsePercentInput('0.25')).toBe(0.25); // already a ratio
  });
});

describe('synthesizeEmptyHeaders', () => {
  it('names text interstitial columns Account and pct columns from neighbor', () => {
    const headers = ['', 'DESCRIPTION', '', '2020', '', '2021'];
    const data = [
      [null, '4-2100', 'Sales Food', 100, 0.32, 200],
      [null, '4-2200', 'Sales Bev', 150, 0.28, 250],
    ];
    const filled = synthesizeEmptyHeaders(headers, data);
    expect(filled[2]).toBe('Account');
    expect(filled[4]).toMatch(/2020\s*%/);
  });
});

describe('findHeaderRow backward compat', () => {
  it('returns headerRow + headers', () => {
    const ws = sheetFromAoa([
      ['Description', 'Amount', 'Total'],
      ['Food', 10, 10],
    ]);
    const info = findHeaderRow(ws);
    expect(info.headerRow).toBe(1);
    expect(info.headers[0]).toMatch(/Description/i);
    expect(info.method).toBeDefined();
  });
});
