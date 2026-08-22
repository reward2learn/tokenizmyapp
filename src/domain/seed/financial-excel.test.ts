import { describe, expect, it } from 'vitest';
import { utils, write } from 'xlsx';
import { parseFinancialProjectionsFromBuffer } from './financial-excel';

/** Build an xlsx buffer from row arrays (cell arrays are 0-indexed). */
function wbBuffer(sheets: Record<string, unknown[][]>): Buffer {
  const wb = utils.book_new();
  for (const [name, aoa] of Object.entries(sheets)) {
    utils.book_append_sheet(wb, utils.aoa_to_sheet(aoa), name);
  }
  return Buffer.from(write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

describe('financial-excel — sheet-agnostic parsing', () => {
  it('parses the legacy RedRuby fixed-row layout (backward compatible)', () => {
    // Legacy layout: labels in col B, months in row 4 (D=Jan serial, E..O names, P=Total).
    const rows: unknown[][] = Array.from({ length: 95 }, () => Array(16).fill(null));
    rows[3] = [
      null, null, null, 46023, 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December', 'Total',
    ];
    // 1-based rows used by SHEET_CONFIG:
    // revenue actual 29 / forecast 28, guests actual 23 / forecast 22,
    // netIncome actual 19 / forecast 16, ebitda 94, staff rows 47..66.
    const set = (row1: number, col1: number, v: number) => {
      rows[row1 - 1][col1 - 1] = v;
    };
    for (let col = 4; col <= 8; col++) {
      set(29, col, 100_000 + col); // revenue (actual)
      set(94, col, 5_000 + col); // ebitda
      set(19, col, 800 + col); // net income
      set(23, col, 100 + col); // guests
      for (const r of [47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 66]) set(r, col, 10);
    }
    for (let col = 9; col <= 15; col++) {
      set(28, col, 200_000 + col); // revenue (forecast)
      set(94, col, 6_000 + col); // ebitda
      set(16, col, 900 + col); // net income
      set(22, col, 120 + col); // guests
      for (const r of [47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 66]) set(r, col, 10);
    }

    const buf = wbBuffer({ RedRuby: rows });
    const projections = parseFinancialProjectionsFromBuffer(buf);

    expect(projections).toHaveLength(12);
    expect(projections[0]).toMatchObject({
      period: '2026-01',
      dataType: 'actual',
      scenario: 'actual',
      revenue: 100_004,
      ebitda: 5_004,
      netIncome: 804,
      guests: 104,
      staffCost: 110,
    });
    expect(projections[5]).toMatchObject({
      period: '2026-06',
      dataType: 'forecast',
      scenario: 'conservative',
      revenue: 200_009,
    });
  });

  it('parses a generic single-period COA P&L sheet (accountant PL layout)', () => {
    const rows: unknown[][] = Array.from({ length: 140 }, () => Array(6).fill(null));
    rows[0] = [null, null, 'PROFIT & LOSS'];
    rows[1] = [null, null, 'Periode: June 2026'];
    rows[2] = [null, null, 'PT Taman Bintang Bali'];
    rows[3] = [null, 'DESCRIPTION', null, 'Amount'];
    rows[4] = [null, null, null, 'IDR'];
    rows[5] = [null, '4-0000', 'INCOME'];
    rows[16] = [null, '4-9999', 'Total Income', 1_975_304_568];
    rows[28] = [null, '5-9999', 'Total Cost Of Sales', 757_493_028];
    rows[43] = [null, '6-1199', 'Total Salary And Wages', 620_122_268];
    rows[108] = [null, null, 'GROSS OPERATING PROFIT', 117_298_718];
    rows[119] = [null, '6-4199', 'Total Depreciations & Amortisations', 123_737_864];
    rows[131] = [null, '8-1000', 'Interest Expenses', 54_484_524];
    rows[137] = [null, null, 'PROFIT AND LOSS', -104_182_314];

    const projections = parseFinancialProjectionsFromBuffer(wbBuffer({ PL: rows }));

    expect(projections).toHaveLength(1);
    expect(projections[0]).toMatchObject({
      period: '2026-06',
      dataType: 'actual',
      scenario: 'actual',
      revenue: 1_975_304_568,
      staffCost: 620_122_268,
      netIncome: -104_182_314,
      // EBITDA derived: net + interest + depreciation.
      ebitda: -104_182_314 + 54_484_524 + 123_737_864,
    });
    // Workbook-native lines mirror the COA (not the legacy RedRuby checklist).
    const labels = projections[0].pnlLines.map((l) => l.label);
    expect(labels.some((l) => /Total Income/i.test(l))).toBe(true);
    expect(labels.some((l) => /INCOME/i.test(l))).toBe(true);
    expect(projections[0].pnlLines.find((l) => l.key === 'total_income_idr')?.value).toBe(
      1_975_304_568,
    );
    expect(projections[0].pnlLines.find((l) => l.key === 'net_income_pre_tax')?.value).toBe(
      -104_182_314,
    );
    // Derived EBITDA is appended when the sheet has no EBITDA row.
    expect(projections[0].pnlLines.find((l) => l.key === 'ebitda')?.value).toBe(
      -104_182_314 + 54_484_524 + 123_737_864,
    );
  });

  it('parses generic month-column sheets (BEP-style)', () => {
    const rows: unknown[][] = Array.from({ length: 10 }, () => Array(5).fill(null));
    rows[0] = ['MONTHLY BREAK EVEN POINT (BEP)'];
    rows[2] = ['INPUT DATA', 45658, 45689, 'MARC 2025', 'APRL 2025'];
    rows[3] = ['Total Revenue', 2_674_811_722, 2_237_314_460, 2_247_865_214, 2_718_424_448];
    rows[4] = ['Total Cost of Sales', 1_086_259_845, 971_362_490, 892_223_022, 1_042_743_924];
    rows[5] = ['Total Payroll', 546_183_562, 574_530_968, 562_042_137, 575_423_866];
    rows[6] = ['Other Fixed Cost', 428_916_859, 376_290_260, 387_731_467, 392_955_826];

    const projections = parseFinancialProjectionsFromBuffer(wbBuffer({ BEP: rows }));

    expect(projections).toHaveLength(4);
    expect(projections[0]).toMatchObject({
      period: '2025-01',
      dataType: 'forecast',
      scenario: 'conservative',
      revenue: 2_674_811_722,
      staffCost: 546_183_562,
    });
    expect(projections[2]).toMatchObject({ period: '2025-03' });
    expect(projections[3]).toMatchObject({ period: '2025-04' });
  });

  it('parses generic year-column sheets (SUMPL-style annual actuals)', () => {
    const rows: unknown[][] = Array.from({ length: 140 }, () => Array(10).fill(null));
    rows[0] = [null, 'PROFIT & LOSS'];
    rows[1] = [null, 'Per June 2026'];
    rows[2] = [null, 'DESCRIPTION', null, '2020', null, '2021', null, '2022'];
    rows[5] = [null, '4-0000', 'INCOME'];
    rows[16] = [null, '4-9999', 'Total Income', 1_000_000_000, null, 1_200_000_000, null, 1_500_000_000];
    rows[43] = [null, '6-1199', 'Total Salary And Wages', 300_000_000, null, 350_000_000, null, 400_000_000];
    rows[137] = [null, null, 'PROFIT AND LOSS', 50_000_000, null, 60_000_000, null, 70_000_000];

    const projections = parseFinancialProjectionsFromBuffer(wbBuffer({ SUMPL: rows }));

    expect(projections).toHaveLength(3);
    expect(projections[0]).toMatchObject({
      period: '2020-12',
      year: 2020,
      dataType: 'actual',
      scenario: 'actual',
      revenue: 1_000_000_000,
      staffCost: 300_000_000,
      netIncome: 50_000_000,
    });
    expect(projections[2]).toMatchObject({ period: '2022-12', revenue: 1_500_000_000 });
  });

  it('skips unrecognized sheets without throwing and returns []', () => {
    const gl = [
      ['', '', 'GENERAL LEDGER'],
      ['DATE', 'REFF#', '', 'ACCT NAME', 'DESCRIPTION'],
      [4, 46174, 'DS26-0601', '4-2100', 'Sales Food TERRACE'],
    ];
    const tb = [
      ['TRIAL BALANCE'],
      ['DESCRIPTION', '', 'QTY', 'DB', 'CR'],
      ['1-1100', 'Cash', null, 638_838_402, 642_880_644],
    ];

    const projections = parseFinancialProjectionsFromBuffer(wbBuffer({ GL: gl, TB: tb }));
    expect(projections).toEqual([]);
  });

  it('returns [] for an empty workbook', () => {
    const wb = utils.book_new();
    utils.book_append_sheet(wb, utils.aoa_to_sheet([['hello']]), 'Sheet1');
    const projections = parseFinancialProjectionsFromBuffer(
      Buffer.from(write(wb, { type: 'buffer', bookType: 'xlsx' })),
    );
    expect(projections).toEqual([]);
  });
});

describe('financial-excel — mixed layouts', () => {
  it('parses annual columns AND monthly columns in the same sheet (SUMPL-style)', () => {
    const rows: unknown[][] = Array.from({ length: 140 }, () => Array(24).fill(null));
    rows[0] = [null, 'PROFIT & LOSS'];
    rows[1] = [null, 'Per June 2026'];
    rows[2] = [
      null, 'DESCRIPTION', null, '2020', null, '2021', null, '2022',
      null, '2023', null, '2024', null, '2025', null, 'Jan 2026', null, 'Feb 2026',
    ];
    rows[5] = [null, '4-0000', 'INCOME'];
    rows[15] = [
      null, '4-9999', 'Total Income',
      1_000_000_000, null, 1_200_000_000, null, 1_500_000_000,
      null, 1_700_000_000, null, 1_900_000_000, null, 2_100_000_000,
      null, 150_000_000, null, 160_000_000,
    ];
    rows[42] = [
      null, '6-1199', 'Total Salary And Wages',
      300_000_000, null, 350_000_000, null, 400_000_000,
      null, 420_000_000, null, 450_000_000, null, 470_000_000,
      null, 50_000_000, null, 52_000_000,
    ];
    rows[136] = [
      null, null, 'PROFIT AND LOSS',
      50_000_000, null, 60_000_000, null, 70_000_000,
      null, 80_000_000, null, 90_000_000, null, 100_000_000,
      null, 10_000_000, null, 11_000_000,
    ];

    const projections = parseFinancialProjectionsFromBuffer(wbBuffer({ SUMPL: rows }));

    // 6 annual rows (2020–2025) + 2 monthly rows (Jan/Feb 2026).
    expect(projections).toHaveLength(8);
    expect(projections[0]).toMatchObject({ period: '2020-12', dataType: 'actual', scenario: 'actual', revenue: 1_000_000_000 });
    expect(projections[5]).toMatchObject({ period: '2025-12', revenue: 2_100_000_000 });
    expect(projections[6]).toMatchObject({ period: '2026-01', dataType: 'actual', scenario: 'actual', revenue: 150_000_000, staffCost: 50_000_000 });
    expect(projections[7]).toMatchObject({ period: '2026-02', revenue: 160_000_000 });
  });
});
