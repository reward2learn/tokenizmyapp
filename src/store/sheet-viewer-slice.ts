import { createListenerMiddleware, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GridRowId } from '@mui/x-data-grid';
import { sheetDataApi, type SheetDataParams } from '@/store/apis/sheet-data-api';

/**
 * SheetViewer UI state — the single source of truth for the spreadsheet
 * viewer block (formula mode, cell selection, drag state, pinned columns,
 * status-bar aggregates). All mutations flow through reducers so the store
 * owns every transition; the component only dispatches actions and reads
 * selectors. Formula-mode persistence (per-session) is handled at the store
 * layer via a listener middleware — components never touch storage.
 */

export interface CellRef {
  rowId: GridRowId;
  field: string;
}

export type CellKey = string;

export interface SheetViewerState {
  /** Excel formula editing/evaluation mode (persisted per session). */
  formulaMode: boolean;
  /** Selected cells as `${rowId}|${field}` keys. */
  selectedCells: CellKey[];
  /** Whole-column cell selection (all cells of the column on the current page). */
  selectedColumns: string[];
  /** Most recently activated cell (anchor for Shift ranges). */
  lastClickedCell: CellRef | null;
  /** True while a drag-to-select gesture is in progress. */
  dragActive: boolean;
  /** Cell where the current drag started. */
  dragAnchor: CellRef | null;
  /** User-pinned (frozen) column fields, in left-to-right pin order. */
  pinnedColumns: string[];
  /** Extra status-bar aggregate functions (beyond STAT_DEFAULTS). */
  extraStats: string[];
  /**
   * Mobile touch-selection mode: armed after a long-press on a cell; while
   * active the grid disables touch panning (touch-action: none) so a drag
   * grows the cell selection instead of scrolling.
   */
  touchSelectMode: boolean;
  /** Exact args of the last successful sheet GET — lets other components
   *  (e.g. the chat drawer) read the same data from the RTK Query cache. */
  activeSheetArg: SheetDataParams | null;
}

const FORMULA_MODE_KEY = 'sheetViewer.formulaMode';

function readFormulaMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(FORMULA_MODE_KEY) === '1';
  } catch {
    return false; // storage unavailable — default to off
  }
}

const initialState: SheetViewerState = {
  formulaMode: readFormulaMode(),
  selectedCells: [],
  selectedColumns: [],
  lastClickedCell: null,
  dragActive: false,
  dragAnchor: null,
  pinnedColumns: [],
  extraStats: [],
  touchSelectMode: false,
  activeSheetArg: null,
};

/** cellKey factory shared by reducers and selectors. */
export function cellKeyOf(rowId: GridRowId, field: string): CellKey {
  return `${rowId}|${field}`;
}

/**
 * Bounding-box range between anchor and current cells, resolved against the
 * grid's CURRENT display order (post-sort/post-filter row order and pinned-
 * aware column order). Pure — no component involvement.
 */
export function computeCellRange(
  anchor: CellRef,
  current: CellRef,
  rowOrder: GridRowId[],
  colOrder: string[],
): CellKey[] {
  const anchorRowIdx = rowOrder.indexOf(anchor.rowId);
  const currentRowIdx = rowOrder.indexOf(current.rowId);
  const anchorColIdx = colOrder.indexOf(anchor.field);
  const currentColIdx = colOrder.indexOf(current.field);

  if (anchorRowIdx === -1 || currentRowIdx === -1 || anchorColIdx === -1 || currentColIdx === -1) {
    return [cellKeyOf(current.rowId, current.field)];
  }

  const minR = Math.min(anchorRowIdx, currentRowIdx);
  const maxR = Math.max(anchorRowIdx, currentRowIdx);
  const minC = Math.min(anchorColIdx, currentColIdx);
  const maxC = Math.max(anchorColIdx, currentColIdx);

  const keys: CellKey[] = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      keys.push(cellKeyOf(rowOrder[r], colOrder[c]));
    }
  }
  return keys;
}

export const sheetViewerSlice = createSlice({
  name: 'sheetViewer',
  initialState,
  reducers: {
    setFormulaMode(state, action: PayloadAction<boolean>) {
      state.formulaMode = action.payload;
    },
    /** Plain click — select exactly one cell. */
    selectSingleCell(state, action: PayloadAction<CellRef>) {
      state.selectedCells = [cellKeyOf(action.payload.rowId, action.payload.field)];
      state.selectedColumns = [];
      state.lastClickedCell = action.payload;
      state.dragActive = false;
      state.dragAnchor = null;
    },
    /** Ctrl/Cmd+click — toggle one cell without clearing the rest. */
    toggleCell(state, action: PayloadAction<CellRef>) {
      const key = cellKeyOf(action.payload.rowId, action.payload.field);
      const has = state.selectedCells.includes(key);
      state.selectedCells = has
        ? state.selectedCells.filter((k) => k !== key)
        : [...state.selectedCells, key];
      state.selectedColumns = [];
      state.lastClickedCell = action.payload;
      state.dragActive = false;
      state.dragAnchor = null;
    },
    /** Shift+click — range from the last clicked cell to the current one. */
    shiftSelectRange(
      state,
      action: PayloadAction<{ current: CellRef; rowOrder: GridRowId[]; colOrder: string[] }>,
    ) {
      const anchor = state.lastClickedCell;
      if (!anchor) {
        state.selectedCells = [cellKeyOf(action.payload.current.rowId, action.payload.current.field)];
        state.lastClickedCell = action.payload.current;
        state.selectedColumns = [];
        return;
      }
      state.selectedColumns = [];
      state.selectedCells = computeCellRange(anchor, action.payload.current, action.payload.rowOrder, action.payload.colOrder);
      state.lastClickedCell = action.payload.current;
      state.dragActive = false;
      state.dragAnchor = null;
    },
    /** Drag gesture began on a cell — seed the selection with it. */
    dragStart(state, action: PayloadAction<CellRef>) {
      state.dragActive = true;
      state.dragAnchor = action.payload;
      state.lastClickedCell = action.payload;
      state.selectedCells = [cellKeyOf(action.payload.rowId, action.payload.field)];
      state.selectedColumns = [];
    },
    /** Drag moved over a cell — grow the rectangular selection. */
    dragMove(
      state,
      action: PayloadAction<{ current: CellRef; rowOrder: GridRowId[]; colOrder: string[] }>,
    ) {
      if (!state.dragActive || !state.dragAnchor) return;
      state.selectedCells = computeCellRange(state.dragAnchor, action.payload.current, action.payload.rowOrder, action.payload.colOrder);
      state.lastClickedCell = action.payload.current;
    },
    /** Drag gesture ended — selection stands as-is. */
    dragEnd(state) {
      state.dragActive = false;
      state.dragAnchor = null;
    },
    clearCellSelection(state) {
      state.selectedCells = [];
      state.selectedColumns = [];
      state.lastClickedCell = null;
      state.dragActive = false;
      state.dragAnchor = null;
    },
    /** Toggle whole-column cell selection (all cells of the column, page scope). */
    toggleColumn(state, action: PayloadAction<string>) {
      const field = action.payload;
      state.selectedColumns = state.selectedColumns.includes(field)
        ? state.selectedColumns.filter((f) => f !== field)
        : [...state.selectedColumns, field];
    },
    clearColumnSelection(state) {
      state.selectedColumns = [];
    },
    setPinnedColumns(state, action: PayloadAction<string[]>) {
      state.pinnedColumns = action.payload;
    },
    togglePinnedColumn(state, action: PayloadAction<string>) {
      const field = action.payload;
      state.pinnedColumns = state.pinnedColumns.includes(field)
        ? state.pinnedColumns.filter((f) => f !== field)
        : [...state.pinnedColumns, field];
    },
    setExtraStats(state, action: PayloadAction<string[]>) {
      state.extraStats = action.payload;
    },
    toggleExtraStat(state, action: PayloadAction<string>) {
      const fn = action.payload;
      state.extraStats = state.extraStats.includes(fn)
        ? state.extraStats.filter((f) => f !== fn)
        : [...state.extraStats, fn];
    },
    setTouchSelectMode(state, action: PayloadAction<boolean>) {
      state.touchSelectMode = action.payload;
      if (!action.payload) {
        state.dragActive = false;
        state.dragAnchor = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Initialize pinned columns to the first data column once (and only once)
    // per sheet load — pure store-driven state, no component effect needed.
    // Also records the exact request args so other components (chat drawer)
    // can read the same data straight from the RTK Query cache.
    builder.addMatcher(
      sheetDataApi.endpoints.getSheetData.matchFulfilled,
      (state, action) => {
        const sd = action.payload.data;
        state.activeSheetArg = action.meta.arg.originalArgs;
        if (state.pinnedColumns.length === 0 && sd && sd.columns.length > 0) {
          state.pinnedColumns = [sd.columns[0]];
        }
      },
    );
  },
});

export const {
  setFormulaMode,
  selectSingleCell,
  toggleCell,
  shiftSelectRange,
  dragStart,
  dragMove,
  dragEnd,
  clearCellSelection,
  setPinnedColumns,
  togglePinnedColumn,
  setExtraStats,
  toggleExtraStat,
  setTouchSelectMode,
  toggleColumn,
  clearColumnSelection,
} = sheetViewerSlice.actions;

/** Persist formula mode for the session whenever the store value changes. */
export const sheetViewerListener = createListenerMiddleware();
sheetViewerListener.startListening({
  actionCreator: setFormulaMode,
  effect: (action) => {
    try {
      sessionStorage.setItem(FORMULA_MODE_KEY, action.payload ? '1' : '0');
    } catch {
      /* storage unavailable — in-memory only */
    }
  },
});
export const sheetViewerListenerMiddleware = sheetViewerListener.middleware;

/** Convenience selectors (component reads state through these). */
export const selectFormulaMode = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.formulaMode;
export const selectDragActive = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.dragActive;
export const selectSelectedCells = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.selectedCells;
export const selectSelectedColumns = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.selectedColumns;
export const selectPinnedColumns = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.pinnedColumns;
export const selectExtraStats = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.extraStats;
export const selectTouchSelectMode = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.touchSelectMode;
export const selectActiveSheetArg = (s: { sheetViewer: SheetViewerState }) => s.sheetViewer.activeSheetArg;
