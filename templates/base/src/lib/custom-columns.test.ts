/**
 * Custom-columns overlay tests.
 *
 * Verifies the hardened invariants of the custom-column design:
 *   - custom columns get slots in the reserved virtual band (>= 1024) and
 *     freed slots are reused,
 *   - inserting a custom column NEVER shifts workbook column indices (the
 *     merge is a pure display-layer operation),
 *   - formulas referencing cells after an inserted custom column keep their
 *     A1 addresses and still evaluate (workbook buffer untouched),
 *   - custom-column formulas can reference workbook cells AND other
 *     custom-column cells via the transient overlay.
 */
import { describe, expect, it } from 'vitest';
import { utils, read, write } from 'xlsx';
import type { WorkBook } from 'xlsx';
import { evaluateFormula } from '@/lib/excel-formula';
import {
  VIRTUAL_COL_BASE,
  emptyCustomColumnsStore,
  nextVirtualSlot,
  virtualAddress,
  virtualLetter,
  mergeColumnOrder,
  resolveSheetColumns,
  applyCustomColumnOverlay,
  evaluateCustomColumnCell,
  type CustomColumn,
  type CustomColumnsStore,
} from '@/lib/custom-columns';

/** Workbook: header row 1 (Item/Qty/Price/Total), data rows 2..4. */
function buildWb(): WorkBook {
  const rows = [
    ['Item', 'Qty', 'Price', 'Total'],
    ['A', 2, 25, 50],
    ['B', 4, 50, 200],
    ['C', 1, 100, 100],
  ];
  const ws = utils.aoa_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'PL');
  return read(write(wb, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer', cellFormula: true });
}

function makeCol(partial: Partial<CustomColumn> & { name: string }): CustomColumn {
  return {
    id: partial.id ?? `id-${partial.name}`,
    sheet: partial.sheet ?? 'PL',
    name: partial.name,
    position: partial.position ?? 0,
    virtualCol: partial.virtualCol ?? VIRTUAL_COL_BASE,
    cells: partial.cells ?? {},
    createdAt: partial.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: partial.updatedAt ?? '2026-01-01T00:00:00.000Z',
  };
}

describe('virtual slot allocation', () => {
  it('starts at the reserved base and increments', () => {
    const store = emptyCustomColumnsStore();
    expect(nextVirtualSlot(store)).toBe(VIRTUAL_COL_BASE);
    store.columns.push(makeCol({ name: 'Notes', virtualCol: nextVirtualSlot(store) }));
    expect(nextVirtualSlot(store)).toBe(VIRTUAL_COL_BASE + 1);
  });

  it('reuses freed slots after a column is deleted', () => {
    const store = emptyCustomColumnsStore();
    const first = makeCol({ name: 'Notes', virtualCol: nextVirtualSlot(store) });
    store.columns.push(first);
    const second = makeCol({ name: 'Memo', virtualCol: nextVirtualSlot(store) });
    store.columns.push(second);
    store.columns = store.columns.filter((c) => c.id !== first.id);
    expect(nextVirtualSlot(store)).toBe(VIRTUAL_COL_BASE); // freed slot reused
  });

  it('virtual addresses use Excel letters beyond real columns', () => {
    expect(virtualLetter(VIRTUAL_COL_BASE)).toBe('AMK');
    const col = makeCol({ name: 'Notes', virtualCol: VIRTUAL_COL_BASE });
    expect(virtualAddress(col, 3)).toBe('AMK3');
  });
});

describe('mergeColumnOrder', () => {
  const workbookCols = ['Item', 'Qty', 'Price', 'Total'];

  it('inserts a custom column at its position without shifting others', () => {
    const customs = [makeCol({ name: 'Notes', position: 1 })];
    const merged = mergeColumnOrder(workbookCols, customs);
    expect(merged).toEqual(['Item', 'Notes', 'Qty', 'Price', 'Total']);
  });

  it('appends when position is at the end', () => {
    const customs = [makeCol({ name: 'Notes', position: workbookCols.length })];
    expect(mergeColumnOrder(workbookCols, customs)).toEqual([...workbookCols, 'Notes']);
  });

  it('clamps out-of-range positions and keeps same-position order stable', () => {
    const customs = [
      makeCol({ name: 'A', position: -5, createdAt: '2026-01-01T00:00:00.000Z' }),
      makeCol({ name: 'B', position: 999, createdAt: '2026-01-02T00:00:00.000Z' }),
      makeCol({ name: 'C', position: 1, createdAt: '2026-01-01T00:00:00.000Z' }),
      makeCol({ name: 'D', position: 1, createdAt: '2026-01-02T00:00:00.000Z' }),
    ];
    const merged = mergeColumnOrder(workbookCols, customs);
    // Same-position customs insert at the same index — the later-created one
    // (D) is inserted first in iteration order and displaces C one slot right.
    expect(merged).toEqual(['A', 'D', 'C', 'Item', 'Qty', 'Price', 'Total', 'B']);
  });

  it('keeps workbook columns in original order (index invariant)', () => {
    const customs = [makeCol({ name: 'X', position: 0 }), makeCol({ name: 'Y', position: 2 })];
    const merged = mergeColumnOrder(workbookCols, customs);
    const workbookOrder = merged.filter((c) => workbookCols.includes(c));
    expect(workbookOrder).toEqual(workbookCols);
  });
});

describe('overlay evaluation', () => {
  it('evaluates a custom-column formula referencing a workbook cell (D3*2 = 400)', () => {
    const wb = buildWb();
    const store: CustomColumnsStore = {
      version: 1,
      columns: [
        makeCol({
          name: 'Double Total',
          virtualCol: VIRTUAL_COL_BASE,
          position: 4,
          cells: { '3': { formula: '=D3*2', value: null } },
        }),
      ],
    };
    applyCustomColumnOverlay(wb, store, 'PL');
    const ws = wb.Sheets['PL']!;
    const result = evaluateFormula(wb, ws, '=D3*2', 0, virtualAddress(store.columns[0], 3));
    expect(result.unevaluable).toBe(false);
    expect(result.value).toBe(400); // row 3 Total = 200 → 200*2
  });

  it('keeps workbook formulas working after a custom column is inserted', () => {
    const wb = buildWb();
    // Add a real workbook formula: E2 = D2*2 (Total doubled) — header row 1 → E2 data row 1.
    const ws = wb.Sheets['PL']!;
    ws['E2'] = { t: 'n', v: 100, f: 'D2*2' };
    const wb2 = read(write(wb, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer', cellFormula: true });

    const store: CustomColumnsStore = {
      version: 1,
      columns: [makeCol({ name: 'Notes', virtualCol: VIRTUAL_COL_BASE, position: 0 })],
    };
    applyCustomColumnOverlay(wb2, store, 'PL');
    const ws2 = wb2.Sheets['PL']!;
    // Formula at E2 references D2 — inserting the custom column at position 0
    // must not change that address: D2 still resolves to row 2 / col D.
    const result = evaluateFormula(wb2, ws2, '=D2*2', 0, 'E2');
    expect(result.unevaluable).toBe(false);
    expect(result.value).toBe(100);
  });

  it('evaluates a custom formula referencing ANOTHER custom column', () => {
    const wb = buildWb();
    const store: CustomColumnsStore = {
      version: 1,
      columns: [
        makeCol({
          name: 'Double Total',
          virtualCol: VIRTUAL_COL_BASE,
          position: 4,
          cells: { '4': { formula: '=D4*2', value: null } },
        }),
        makeCol({
          name: 'Triple Double',
          virtualCol: VIRTUAL_COL_BASE + 1,
          position: 5,
          cells: { '4': { formula: `=${virtualLetter(VIRTUAL_COL_BASE)}4*3`, value: null } },
        }),
      ],
    };
    applyCustomColumnOverlay(wb, store, 'PL');
    const ws = wb.Sheets['PL']!;
    // Evaluate col2's STORED formula "=AMK4*3" (AMK = col1's virtual letter).
    const result = evaluateFormula(
      wb,
      ws,
      `=${virtualLetter(VIRTUAL_COL_BASE)}4*3`,
      0,
      virtualAddress(store.columns[1], 4),
    );
    expect(result.unevaluable).toBe(false);
    expect(result.value).toBe(600); // (D4=100)*2 = 200, *3 = 600
  });

  it('falls back to stored values when formula mode is off', () => {
    const wb = buildWb();
    const store: CustomColumnsStore = {
      version: 1,
      columns: [
        makeCol({
          name: 'Notes',
          virtualCol: VIRTUAL_COL_BASE,
          position: 4,
          cells: { '2': { value: 'hello' }, '3': { formula: '=D3*2', value: 99 } },
        }),
      ],
    };
    applyCustomColumnOverlay(wb, store, 'PL');
    const ws = wb.Sheets['PL']!;
    const off = evaluateCustomColumnCell(wb, ws, store.columns[0], 2, false);
    expect(off.value).toBe('hello');
    const on = evaluateCustomColumnCell(wb, ws, store.columns[0], 3, true);
    expect(on.unevaluable).toBe(false);
    expect(on.value).toBe(400); // row 3 Total = 200 → D3*2
  });

  it('resolveSheetColumns filters and orders by position then creation', () => {
    const store: CustomColumnsStore = {
      version: 1,
      columns: [
        makeCol({ name: 'B', position: 1, createdAt: '2026-01-02T00:00:00.000Z' }),
        makeCol({ name: 'A', position: 0 }),
        makeCol({ name: 'OtherSheet', position: 0, sheet: 'BEP' }),
      ],
    };
    const resolved = resolveSheetColumns(store, 'PL');
    expect(resolved.map((c) => c.name)).toEqual(['A', 'B']);
  });
});
