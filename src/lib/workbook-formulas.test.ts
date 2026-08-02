/**
 * Formula inventory + reference mapping tests.
 *
 * Builds real in-memory xlsx workbooks (SheetJS write → read round-trip) and
 * verifies that buildWorkbookFormulaMap:
 *   - finds every formula cell,
 *   - maps formula cells and their references to the DB-sheet coordinates the
 *     sheet viewer serves (column key + 1-based data-row offset),
 *   - maps cross-sheet references,
 *   - computes best-effort values with the same evaluator the API uses.
 */
import { describe, expect, it } from 'vitest';
import { utils, read, write } from 'xlsx';
import type { WorkBook } from 'xlsx';
import { collectReferences } from '@/lib/excel-formula';
import { buildWorkbookFormulaMap } from '@/lib/workbook-formulas';

/**
 * P&L sheet:
 *   r0: title row          (skipped by header detection)
 *   r1: header row         -> headerRow = 2 (1-based), columns A..G
 *   r2..r5: data rows
 * Formulas (beyond the aoa grid):
 *   E6 =SUM(E3:E5)         Revenue range, relRow 4
 *   G6 =G3+G4+G5           Balance cells, relRow 4
 *   B7 =IF(B3=0,"",B3*2)   Amount, relRow 5
 *   C8 =FUTUREFN(B3)       unevaluable, relRow 6
 */
function buildPlWorkbook(): WorkBook {
  // Grid must extend to the formula addresses (SheetJS drops cells outside
  // !ref on write): rows through 9, columns through C on BEP.
  const plRows = [
    ['Profit & Loss'],
    ['Description', 'Amount', 'Total', 'Date', 'Revenue', 'Expense', 'Balance'],
    ['Food Sales', 100, 100, '2026-01-01', 100, 0, 100],
    ['Beverage', 50, 50, '2026-01-02', 50, 0, 50],
    ['Labor', 0, 0, '2026-01-03', 0, 40, -40],
    ['Total', 150, 150, '', 150, 40, 110],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
  ];
  const ws = utils.aoa_to_sheet(plRows);
  ws['E6'] = { t: 'n', v: 150, f: 'SUM(E3:E5)' };
  ws['G6'] = { t: 'n', v: 110, f: 'G3+G4+G5' };
  ws['B7'] = { t: 'n', v: 200, f: 'IF(B3=0,"",B3*2)' };
  ws['C8'] = { t: 'n', v: 0, f: 'FUTUREFN(B3)' };

  // BEP sheet with a cross-sheet reference to PL!E6 (headerRow 1: Metric/Value)
  const bep = utils.aoa_to_sheet([
    ['Metric', 'Value', ''],
    ['Rev', 150, ''],
    ['', '', ''],
  ]);
  bep['C2'] = { t: 'n', v: 150, f: 'PL!E6' };

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'PL');
  utils.book_append_sheet(wb, bep, 'BEP');
  return wb;
}

function roundTrip(wb: WorkBook): WorkBook {
  const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
  return read(buf, { type: 'buffer', cellFormula: true });
}

describe('collectReferences', () => {
  it('extracts single cells and ranges', () => {
    expect(collectReferences('=SUM(V46:V54)')).toEqual([
      { addr: 'V46', end: 'V54' },
    ]);
    expect(collectReferences('=V46*2')).toEqual([{ addr: 'V46' }]);
  });

  it('extracts cross-sheet references (plain and quoted)', () => {
    expect(collectReferences('=PL!D7 + PL!D8')).toEqual([
      { sheet: 'PL', addr: 'D7' },
      { sheet: 'PL', addr: 'D8' },
    ]);
    expect(collectReferences("='Sheet 1'!A1")).toEqual([{ sheet: 'Sheet 1', addr: 'A1' }]);
  });

  it('skips function names that look like cell refs (LOG10, SUMIFS)', () => {
    expect(collectReferences('=LOG10(A1)')).toEqual([{ addr: 'A1' }]);
    expect(collectReferences('=SUMIFS(C:C,B:B,">5")')).toEqual([
      { addr: 'C', end: 'C' },
      { addr: 'B', end: 'B' },
    ]);
  });
});

describe('buildWorkbookFormulaMap', () => {
  const map = buildWorkbookFormulaMap(roundTrip(buildPlWorkbook()));

  it('finds every formula cell per sheet', () => {
    expect(Object.keys(map)).toEqual(['PL', 'BEP']);
    expect(map.PL.formulas).toHaveLength(4);
    expect(map.BEP.formulas).toHaveLength(1);
  });

  it('detects the PL header row and maps the formula cell coordinates', () => {
    expect(map.PL.headerRow).toBe(2);
    const sum = map.PL.formulas.find((f) => f.cell === 'E6')!;
    expect(sum.formula).toBe('=SUM(E3:E5)');
    expect(sum.colKey).toBe('Revenue'); // header text at column E
    expect(sum.relRow).toBe(4); // 1-based data offset (E6 → r5, headerRow 2)
    expect(sum.absRow).toBe(6);
    expect(sum.absCol).toBe(5);
  });

  it('maps range references to the same DB coordinates', () => {
    const sum = map.PL.formulas.find((f) => f.cell === 'E6')!;
    expect(sum.refs).toEqual([
      {
        sheet: '',
        kind: 'range',
        colKey: 'Revenue',
        relRow: 1, // E3 → first data row
        absCell: 'E3',
        end: { colKey: 'Revenue', relRow: 3, absCell: 'E5' },
      },
    ]);
  });

  it('maps plain cell references', () => {
    const g = map.PL.formulas.find((f) => f.cell === 'G6')!;
    expect(g.refs).toEqual([
      { sheet: '', kind: 'cell', colKey: 'Balance', relRow: 1, absCell: 'G3' },
      { sheet: '', kind: 'cell', colKey: 'Balance', relRow: 2, absCell: 'G4' },
      { sheet: '', kind: 'cell', colKey: 'Balance', relRow: 3, absCell: 'G5' },
    ]);
  });

  it('maps cross-sheet references to the target sheet coordinates', () => {
    const bepFormula = map.BEP.formulas.find((f) => f.cell === 'C2')!;
    expect(bepFormula.refs).toEqual([
      { sheet: 'PL', kind: 'cell', colKey: 'Revenue', relRow: 4, absCell: 'E6' },
    ]);
  });

  it('computes best-effort values with the shared evaluator', () => {
    const sum = map.PL.formulas.find((f) => f.cell === 'E6')!;
    expect(sum.value).toBe(150);
    expect(sum.unevaluable).toBe(false);
    const ifFormula = map.PL.formulas.find((f) => f.cell === 'B7')!;
    expect(ifFormula.value).toBe(200);
    expect(ifFormula.unevaluable).toBe(false);
  });

  it('marks unsupported formulas unevaluable', () => {
    const bad = map.PL.formulas.find((f) => f.cell === 'C8')!;
    expect(bad.unevaluable).toBe(true);
    expect(bad.value).toBeUndefined();
  });
});
