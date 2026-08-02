/**
 * Server-side sheet sorting tests (global sort semantics).
 */
import { describe, expect, it } from 'vitest';
import { compareSheetValues, sortSheetRows } from '@/lib/sheet-data-sort';

describe('compareSheetValues', () => {
  it('sorts numbers numerically (not lexically)', () => {
    expect(compareSheetValues(2, 10)).toBeLessThan(0);
    expect(compareSheetValues('2', '10')).toBeLessThan(0);
    expect(compareSheetValues(100, 50)).toBeGreaterThan(0);
  });

  it('parses formatted number strings ("1,200" / "3 500")', () => {
    expect(compareSheetValues('1,200', '900')).toBeGreaterThan(0);
    expect(compareSheetValues('3 500', '3,600')).toBeLessThan(0);
  });

  it('keeps blanks last in BOTH directions', () => {
    expect(compareSheetValues('', 5)).toBeGreaterThan(0);
    expect(compareSheetValues(null, 5)).toBeGreaterThan(0);
    expect(compareSheetValues(5, '')).toBeLessThan(0);
  });

  it('sorts text locale-aware with natural numbers', () => {
    expect(compareSheetValues('Row 2', 'Row 10')).toBeLessThan(0);
    expect(compareSheetValues('Apple', 'banana')).toBeLessThan(0);
  });

  it('sorts numbers before text', () => {
    expect(compareSheetValues(1, 'abc')).toBeLessThan(0);
    expect(compareSheetValues('abc', 1)).toBeGreaterThan(0);
  });
});

describe('sortSheetRows', () => {
  const rows = [
    { Col: 3, Name: 'Charlie' },
    { Col: 1, Name: 'Alice' },
    { Col: 2, Name: 'Bob' },
    { Col: '', Name: 'Empty' },
    { Col: 3, Name: 'David' },
  ];

  it('sorts ascending by one column with blanks last', () => {
    const sorted = sortSheetRows(rows, [['Col', 'asc']]);
    expect(sorted.map((r) => r.Name)).toEqual(['Alice', 'Bob', 'Charlie', 'David', 'Empty']);
  });

  it('sorts descending by one column with blanks last', () => {
    const sorted = sortSheetRows(rows, [['Col', 'desc']]);
    // Stable: equal keys (Col=3) keep input order — Charlie (idx 0) before David (idx 3).
    expect(sorted.map((r) => r.Name)).toEqual(['Charlie', 'David', 'Bob', 'Alice', 'Empty']);
  });

  it('is stable for equal keys', () => {
    const sorted = sortSheetRows(rows, [['Col', 'asc']]);
    const charlie = sorted.findIndex((r) => r.Name === 'Charlie');
    const david = sorted.findIndex((r) => r.Name === 'David');
    expect(charlie).toBeLessThan(david); // input order preserved
  });

  it('multi-key: secondary column breaks ties', () => {
    const multi = [
      { A: 1, B: 'z' },
      { A: 1, B: 'a' },
      { A: 0, B: 'm' },
    ];
    const sorted = sortSheetRows(multi, [['A', 'asc'], ['B', 'asc']]);
    expect(sorted.map((r) => r.B)).toEqual(['m', 'a', 'z']);
  });

  it('returns rows unchanged when no sort is requested', () => {
    expect(sortSheetRows(rows, [])).toBe(rows);
  });
});
