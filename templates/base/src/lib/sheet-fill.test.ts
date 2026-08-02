import { describe, expect, it } from 'vitest';
import { buildFillCells, buildPasteCells, parseTsv, shiftFormulaRefs, textToCellValue } from '@/lib/sheet-fill';

const ROWS = [1, 2, 3, 4, 5, 6]; // _rowIndex ids
const COLS = ['A', 'B', 'C', 'D'];

type Grid = Record<number, Record<string, unknown>>;

function makeArgs(
  grid: Grid,
  sourceRows: number[],
  sourceCols: string[],
  target: { rowId: number; field: string },
) {
  return {
    sourceRows,
    sourceCols,
    rowOrder: ROWS,
    colOrder: COLS,
    target,
    getValue: (rowId: unknown, field: string) => {
      const r = grid[Number(rowId)] ?? {};
      return r[field];
    },
  };
}

describe('shiftFormulaRefs', () => {
  it('shifts rows and columns', () => {
    expect(shiftFormulaRefs('=A1+B2', 2, 0)).toBe('=A3+B4');
    expect(shiftFormulaRefs('=A1+B2', 0, 1)).toBe('=B1+C2');
    expect(shiftFormulaRefs('=A1+B2', 2, 1)).toBe('=B3+C4');
  });

  it('respects $ locks', () => {
    expect(shiftFormulaRefs('=$A1+A$1+$B$2', 3, 0)).toBe('=$A4+A$1+$B$2');
    expect(shiftFormulaRefs('=$A1+A$1+$B$2', 0, 2)).toBe('=$A1+C$1+$B$2');
  });

  it('never touches function names (incl. LOG10-style traps)', () => {
    expect(shiftFormulaRefs('=SUM(A1:B2)', 1, 0)).toBe('=SUM(A2:B3)');
    expect(shiftFormulaRefs('=LOG10(5)+A1', 1, 0)).toBe('=LOG10(5)+A2');
    expect(shiftFormulaRefs('=SUMIF(A1:A9,">0",A1:A9)', 0, 1)).toBe('=SUMIF(B1:B9,">0",B1:B9)');
  });

  it('shifts both ends of ranges and skips out-of-range refs', () => {
    expect(shiftFormulaRefs('=MAX(A1:B2)', 2, 2)).toBe('=MAX(C3:D4)');
    expect(shiftFormulaRefs('=A1', -5, 0)).toBe('=A1'); // row 1 - 5 < 1 → keep
  });

  it('does not corrupt identifiers that are not refs', () => {
    expect(shiftFormulaRefs('=TEXT(5,"0.0")&A1', 1, 0)).toBe('=TEXT(5,"0.0")&A2');
  });
});

describe('buildFillCells — copy block', () => {
  it('tiles a single cell down a column', () => {
    const grid: Grid = { 1: { A: 5 } };
    const cells = buildFillCells(makeArgs(grid, [1], ['A'], { rowId: 4, field: 'A' }));
    expect(cells.map((c) => [c.rowId, c.value])).toEqual([
      [2, 5],
      [3, 5],
      [4, 5],
    ]);
  });

  it('tiles a 2×2 block in both directions', () => {
    const grid: Grid = {
      1: { A: 1, B: 2 },
      2: { A: 3, B: 4 },
    };
    const cells = buildFillCells(makeArgs(grid, [1, 2], ['A', 'B'], { rowId: 4, field: 'D' }));
    const byKey = new Map(cells.map((c) => [`${c.rowId}|${c.field}`, c.value]));
    // Source corner → target corner rect: rows 1..4 × cols A..D
    expect(byKey.get('3|A')).toBe(1);
    expect(byKey.get('3|B')).toBe(2);
    expect(byKey.get('3|C')).toBe(1); // tiled
    expect(byKey.get('4|A')).toBe(3); // tiled
    expect(byKey.get('4|C')).toBe(3); // tiled
    expect(byKey.get('4|D')).toBe(4); // tiled: source (2,B)
  });

  it('shifts formulas copied in a block fill', () => {
    const grid: Grid = { 1: { A: '=B1*2' } };
    const cells = buildFillCells({
      ...makeArgs(grid, [1], ['A'], { rowId: 3, field: 'A' }),
      getFormula: (rowId: unknown, field: string) => {
        if (Number(rowId) === 1 && field === 'A') return '=B1*2';
        return undefined;
      },
    });
    expect(cells[0]).toMatchObject({ rowId: 2, value: '=B2*2', formulaMode: true });
    expect(cells[1]).toMatchObject({ rowId: 3, value: '=B3*2', formulaMode: true });
  });
});

describe('buildFillCells — numeric series', () => {
  it('extends a vertical numeric series downward and upward', () => {
    const grid: Grid = {
      2: { B: 10 },
      3: { B: 13 },
    };
    const down = buildFillCells(makeArgs(grid, [2, 3], ['B'], { rowId: 5, field: 'B' }));
    expect(down.map((c) => c.value)).toEqual([16, 19]);
    const up = buildFillCells(makeArgs(grid, [2, 3], ['B'], { rowId: 1, field: 'B' }));
    expect(up.map((c) => c.value)).toEqual([7]); // 10,13 → above is 7
  });

  it('extends a horizontal numeric series', () => {
    const grid: Grid = { 1: { A: 1, B: 3, C: 5 } };
    const cells = buildFillCells(makeArgs(grid, [1], ['A', 'B'], { rowId: 1, field: 'D' }));
    // Union covers C and D: series 1,3 → 5,7
    expect(cells.map((c) => c.value)).toEqual([5, 7]);
  });

  it('copies text edge when series is not numeric', () => {
    const grid: Grid = { 2: { A: 'x' }, 3: { A: 'y' } };
    const cells = buildFillCells(makeArgs(grid, [2, 3], ['A'], { rowId: 5, field: 'A' }));
    expect(cells.map((c) => c.value)).toEqual(['y', 'y']);
  });

  it('extends a formula series with shifted refs', () => {
    const grid: Grid = { 1: { A: '=SUM(B1:C1)' }, 2: { A: '=SUM(B2:C2)' } };
    const cells = buildFillCells({
      ...makeArgs(grid, [1, 2], ['A'], { rowId: 4, field: 'A' }),
      getFormula: (rowId: unknown, field: string) =>
        field === 'A' && (Number(rowId) === 1 || Number(rowId) === 2)
          ? `=SUM(B${rowId}:C${rowId})`
          : undefined,
    });
    expect(cells.map((c) => [c.rowId, c.value, c.formulaMode])).toEqual([
      [3, '=SUM(B3:C3)', true],
      [4, '=SUM(B4:C4)', true],
    ]);
  });

  it('returns nothing when target is inside the source', () => {
    const grid: Grid = { 1: { A: 5 } };
    const cells = buildFillCells(makeArgs(grid, [1, 3], ['A'], { rowId: 2, field: 'A' }));
    expect(cells).toEqual([]);
  });
});

describe('parseTsv + textToCellValue', () => {
  it('parses rows and columns, strips trailing blank rows', () => {
    expect(parseTsv('a\tb\nc\td\n\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('keeps numbers numeric and text as text', () => {
    expect(textToCellValue('42')).toBe(42);
    expect(textToCellValue('-3.5')).toBe(-3.5);
    expect(textToCellValue('1,000')).toBe('1,000');
    expect(textToCellValue('abc')).toBe('abc');
    expect(textToCellValue('')).toBe('');
  });
});

// ── buildPasteCells (paste auto-extend) ────────────────────────────
describe('buildPasteCells', () => {
  const rowOrder = [1, 2, 3]; // page has 3 rows
  const colOrder = ['A', 'B', 'C'];
  const rowsById = new Map<number, Record<string, unknown>>([
    [1, { _rowIndex: 1, _excelRow: 4, A: 1 }],
    [2, { _rowIndex: 2, _excelRow: 5, A: 2 }],
    [3, { _rowIndex: 3, _excelRow: 6, A: 3 }],
  ]);

  it('writes within the page using the row excel refs', () => {
    const { cells, skipped, newRows } = buildPasteCells({
      grid: [['x', 'y']],
      anchorRowIdx: 1,
      anchorColIdx: 1,
      rowOrder,
      colOrder,
      rowsById,
      formulaMode: false,
      anchorExcelRow: 5,
    });
    expect(skipped).toBe(0);
    expect(newRows).toBe(0);
    expect(cells).toHaveLength(2);
    expect(cells[0]).toMatchObject({ rowId: 2, field: 'B', value: 'x' });
  });

  it('auto-extends beyond the page into new workbook rows', () => {
    const { cells, skipped, newRows } = buildPasteCells({
      grid: [['a'], ['b'], ['c']],
      anchorRowIdx: 2, // anchor = last visible row (rowId 3, excel row 6)
      anchorColIdx: 0,
      rowOrder,
      colOrder,
      rowsById,
      formulaMode: false,
      anchorExcelRow: 6,
    });
    // r=0 → row 3 (in page), r=1 → new row 7, r=2 → new row 8
    expect(cells).toHaveLength(3);
    expect(cells[0]).toMatchObject({ rowId: 3, field: 'A', value: 'a' });
    expect(cells[0].excelRow).toBeUndefined(); // existing row uses its own ref
    expect(cells[1]).toMatchObject({ field: 'A', value: 'b', excelRow: 7 });
    expect(cells[2]).toMatchObject({ field: 'A', value: 'c', excelRow: 8 });
    expect(newRows).toBe(2);
    expect(skipped).toBe(0);
  });

  it('numbers stay numeric and formulas keep formulaMode on new rows', () => {
    const { cells, newRows } = buildPasteCells({
      grid: [['42'], ['=A7*2']],
      anchorRowIdx: 2,
      anchorColIdx: 0,
      rowOrder,
      colOrder,
      rowsById,
      formulaMode: true,
      anchorExcelRow: 6,
    });
    expect(newRows).toBe(1);
    expect(cells[0]).toMatchObject({ value: 42, formulaMode: false });
    expect(cells[1]).toMatchObject({ value: '=A7*2', formulaMode: true, excelRow: 7 });
  });

  it('still skips cells beyond the column count', () => {
    const { cells, skipped } = buildPasteCells({
      grid: [['a', 'b', 'c', 'd']],
      anchorRowIdx: 0,
      anchorColIdx: 1, // B → only B, C fit
      rowOrder,
      colOrder,
      rowsById,
      formulaMode: false,
    });
    expect(cells.map((c) => c.field)).toEqual(['B', 'C']);
    expect(skipped).toBe(2);
  });
});
