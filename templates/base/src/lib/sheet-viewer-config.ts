/**
 * Sheet viewer table configuration (column widths + row height).
 *
 * Persisted per sheet in knowledge_snippets.workbook_sheet_viewer_config:
 *   { version: 1, sheets: { "<tab>": { columnWidths: { "<col>": px }, rowHeight: px } } }
 *
 * Column widths are saved by column NAME (stable across imports as long as
 * headers don't change); row height is a single value for the sheet.
 * Custom-column widths are included under their custom column names.
 */

export const SHEET_VIEWER_CONFIG_SNIPPET_KEY = 'workbook_sheet_viewer_config';
export const DEFAULT_ROW_HEIGHT = 52; // MUI DataGrid default

export interface SheetViewerConfig {
  /** Column name -> pixel width (only columns the user resized). */
  columnWidths: Record<string, number>;
  /** Row height in px. */
  rowHeight: number;
}

export interface SheetViewerConfigStore {
  version: 1;
  sheets: Record<string, SheetViewerConfig>;
}

export function emptySheetViewerConfigStore(): SheetViewerConfigStore {
  return { version: 1, sheets: {} };
}

/** Parse a stored snippet (tolerant of missing/corrupt payloads). */
export function parseSheetViewerConfigStore(json: string | null | undefined): SheetViewerConfigStore {
  if (!json) return emptySheetViewerConfigStore();
  try {
    const parsed = JSON.parse(json) as SheetViewerConfigStore;
    if (!parsed || typeof parsed !== 'object' || !parsed.sheets || typeof parsed.sheets !== 'object') {
      return emptySheetViewerConfigStore();
    }
    return { version: 1, sheets: parsed.sheets };
  } catch {
    return emptySheetViewerConfigStore();
  }
}

/** Per-sheet config with defaults applied. */
export function getSheetViewerConfig(
  store: SheetViewerConfigStore,
  sheet: string,
): SheetViewerConfig {
  const c = store.sheets[sheet];
  return {
    columnWidths: c?.columnWidths ?? {},
    rowHeight: typeof c?.rowHeight === 'number' && c.rowHeight > 0 ? c.rowHeight : DEFAULT_ROW_HEIGHT,
  };
}

/**
 * Merge a patch into the store and return the new store (pure — the caller
 * persists it). Widths merge per column; rowHeight replaces when provided.
 */
export function mergeSheetViewerConfig(
  store: SheetViewerConfigStore,
  sheet: string,
  patch: { columnWidths?: Record<string, number>; rowHeight?: number },
): SheetViewerConfigStore {
  const current = store.sheets[sheet] ?? { columnWidths: {}, rowHeight: DEFAULT_ROW_HEIGHT };
  const widths = { ...current.columnWidths };
  if (patch.columnWidths) {
    for (const [name, px] of Object.entries(patch.columnWidths)) {
      const w = Math.floor(Number(px));
      if (Number.isFinite(w) && w >= 40) widths[name] = w;
      else if (Number.isFinite(w) && w < 40) delete widths[name]; // collapse to auto
    }
  }
  return {
    version: 1,
    sheets: {
      ...store.sheets,
      [sheet]: {
        columnWidths: widths,
        rowHeight:
          typeof patch.rowHeight === 'number' && patch.rowHeight >= 32 && patch.rowHeight <= 120
            ? Math.floor(patch.rowHeight)
            : current.rowHeight,
      },
    },
  };
}
