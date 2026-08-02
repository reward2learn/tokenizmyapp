/**
 * Sheet viewer config store tests (column widths + row height persistence).
 */
import { describe, expect, it } from 'vitest';
import {
  emptySheetViewerConfigStore,
  getSheetViewerConfig,
  mergeSheetViewerConfig,
  parseSheetViewerConfigStore,
  DEFAULT_ROW_HEIGHT,
} from '@/lib/sheet-viewer-config';

describe('parseSheetViewerConfigStore', () => {
  it('returns an empty store for missing/corrupt payloads', () => {
    expect(parseSheetViewerConfigStore(null).sheets).toEqual({});
    expect(parseSheetViewerConfigStore('not json').sheets).toEqual({});
    expect(parseSheetViewerConfigStore('{"foo":1}').sheets).toEqual({});
  });

  it('parses a valid store', () => {
    const store = parseSheetViewerConfigStore(
      JSON.stringify({ version: 1, sheets: { PL: { columnWidths: { Amount: 120 }, rowHeight: 60 } } }),
    );
    expect(getSheetViewerConfig(store, 'PL').columnWidths.Amount).toBe(120);
    expect(getSheetViewerConfig(store, 'PL').rowHeight).toBe(60);
  });
});

describe('mergeSheetViewerConfig', () => {
  it('merges widths per column and replaces rowHeight', () => {
    let store = emptySheetViewerConfigStore();
    store = mergeSheetViewerConfig(store, 'PL', { columnWidths: { Amount: 120 } });
    store = mergeSheetViewerConfig(store, 'PL', { columnWidths: { Date: 140 }, rowHeight: 64 });
    const cfg = getSheetViewerConfig(store, 'PL');
    expect(cfg.columnWidths).toEqual({ Amount: 120, Date: 140 });
    expect(cfg.rowHeight).toBe(64);
  });

  it('rejects out-of-range row heights and keeps previous value', () => {
    let store = emptySheetViewerConfigStore();
    store = mergeSheetViewerConfig(store, 'PL', { rowHeight: 64 });
    store = mergeSheetViewerConfig(store, 'PL', { rowHeight: 500 });
    expect(getSheetViewerConfig(store, 'PL').rowHeight).toBe(64);
  });

  it('drops widths below the minimum (collapse to auto)', () => {
    const store = mergeSheetViewerConfig(emptySheetViewerConfigStore(), 'PL', {
      columnWidths: { Amount: 120, Notes: 20 },
    });
    expect(getSheetViewerConfig(store, 'PL').columnWidths).toEqual({ Amount: 120 });
  });

  it('keeps sheets isolated per tab', () => {
    let store = emptySheetViewerConfigStore();
    store = mergeSheetViewerConfig(store, 'PL', { rowHeight: 60 });
    expect(getSheetViewerConfig(store, 'BEP').rowHeight).toBe(DEFAULT_ROW_HEIGHT);
  });

  it('defaults row height when unset', () => {
    const store = emptySheetViewerConfigStore();
    expect(getSheetViewerConfig(store, 'PL').rowHeight).toBe(DEFAULT_ROW_HEIGHT);
  });
});
