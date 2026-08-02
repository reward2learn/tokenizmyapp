import { createAction, createListenerMiddleware, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { sheetDataApi, type UpdateSheetCellParams } from '@/store/apis/sheet-data-api';

/**
 * Sheet-viewer undo/redo history.
 *
 * Every successful cell edit (workbook cell OR custom-column cell) records an
 * entry with the exact update-cell params needed to restore the PRE-EDIT
 * state (`backward` — used by Undo) and the POST-EDIT state (`forward` — used
 * by Redo). Both directions re-route through the same /api/sheet-data
 * endpoints the grid uses, so undo/redo is automatically correct for formula
 * cells (formula strings + formulaMode), custom columns, and cells edited on
 * any page.
 *
 * Range edits (fill handle, paste) record ONE SheetUndoBatchEntry for the
 * whole range — a single Ctrl+Z undoes the entire paste/fill, exactly like
 * Excel. `applying` is set while an undo/redo mutation is in flight so the
 * resulting refetch-driven re-render never re-records history.
 *
 * History is capped at 200 entries; a fresh edit clears the redo branch.
 */

/** Single-cell undo/redo entry (in-place grid edits). */
export interface SheetUndoEntry {
  /** Params that restore the cell to its state BEFORE the edit. */
  backward: UpdateSheetCellParams;
  /** Params that restore the cell to its state AFTER the edit. */
  forward: UpdateSheetCellParams;
  at: string;
}

/** One backward/forward pair within a range edit. */
export interface SheetUndoCell {
  backward: UpdateSheetCellParams;
  forward: UpdateSheetCellParams;
}

/** Range undo/redo entry (fill handle, paste) — one atomic undo step. */
export interface SheetUndoBatchEntry {
  cells: SheetUndoCell[];
  at: string;
}

export type UndoEntry = SheetUndoEntry | SheetUndoBatchEntry;

export interface UndoRedoState {
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
  /** True while an undo/redo mutation is in flight (guards double triggers). */
  applying: boolean;
}

const MAX_HISTORY = 200;

const initialState: UndoRedoState = {
  undoStack: [],
  redoStack: [],
  applying: false,
};

/** No-op guard shared by single and batch entries (strict value + mode). */
function isNoOpCell(cell: SheetUndoCell): boolean {
  return (
    cell.backward.value === cell.forward.value &&
    cell.backward.formulaMode === cell.forward.formulaMode
  );
}

export const undoRedoSlice = createSlice({
  name: 'undoRedo',
  initialState,
  reducers: {
    /** Record a completed cell edit (single) or range edit (batch). Clears the redo branch. */
    pushSheetChange(state, action: PayloadAction<UndoEntry>) {
      if (state.applying) return; // changes triggered by undo/redo don't re-record
      const entry = action.payload;
      if ('cells' in entry) {
        // Range edit: drop per-cell no-ops; if nothing remains, nothing to undo.
        const cells = entry.cells.filter((c) => !isNoOpCell(c));
        if (cells.length === 0) return;
        state.undoStack = [...state.undoStack, { ...entry, cells }].slice(-MAX_HISTORY);
      } else {
        if (isNoOpCell(entry)) return;
        state.undoStack = [...state.undoStack, entry].slice(-MAX_HISTORY);
      }
      state.redoStack = [];
    },
    /** Move the top undo entry to the redo stack (after the undo mutation succeeded). */
    popUndoPushRedo(state) {
      const entry = state.undoStack[state.undoStack.length - 1];
      if (!entry) return;
      state.undoStack = state.undoStack.slice(0, -1);
      state.redoStack = [...state.redoStack, entry];
    },
    /** Move the top redo entry back to the undo stack (after the redo mutation succeeded). */
    popRedoPushUndo(state) {
      const entry = state.redoStack[state.redoStack.length - 1];
      if (!entry) return;
      state.redoStack = state.redoStack.slice(0, -1);
      state.undoStack = [...state.undoStack, entry];
    },
    setApplying(state, action: PayloadAction<boolean>) {
      state.applying = action.payload;
    },
    clearSheetHistory(state) {
      state.undoStack = [];
      state.redoStack = [];
      state.applying = false;
    },
  },
});

export const undoRedoReducer = undoRedoSlice.reducer;

export const {
  pushSheetChange,
  popUndoPushRedo,
  popRedoPushUndo,
  setApplying,
  clearSheetHistory,
} = undoRedoSlice.actions;

/** Signals for the listener middleware (the slice itself does not mutate). */
export const requestUndo = createAction('undoRedo/requestUndo');
export const requestRedo = createAction('undoRedo/requestRedo');

/** Convenience selectors. */
export const selectUndoRedo = (s: { undoRedo: UndoRedoState }) => s.undoRedo;
export const selectCanUndo = (s: { undoRedo: UndoRedoState }) => s.undoRedo.undoStack.length > 0;
export const selectCanRedo = (s: { undoRedo: UndoRedoState }) => s.undoRedo.redoStack.length > 0;

// ── Listener middleware: performs the actual undo/redo cell mutations ──
export const undoRedoListener = createListenerMiddleware();

/** Dispatch one mutation (single cell) and report success. */
async function applySingle(
  listenerApi: {
    dispatch: (action: unknown) => { unwrap: () => Promise<unknown> };
  },
  params: UpdateSheetCellParams,
): Promise<boolean> {
  try {
    await listenerApi.dispatch(
      sheetDataApi.endpoints.updateSheetCell.initiate(params) as never,
    ).unwrap();
    return true;
  } catch {
    return false; // failed undo/redo — entry stays in place
  }
}

/** Apply an undo/redo entry (single cell or whole range) via the API. */
async function applyEntry(
  listenerApi: {
    dispatch: (action: unknown) => { unwrap: () => Promise<unknown> };
  },
  entry: UndoEntry,
  direction: 'backward' | 'forward',
): Promise<boolean> {
  if ('cells' in entry) {
    // Range edit: replay every cell through the batch endpoint (single
    // round trip). Failures are tolerated — redo retries them; cells that
    // already equal the target state are no-ops server-side anyway.
    try {
      const resp = await listenerApi.dispatch(
        sheetDataApi.endpoints.updateSheetCells.initiate({
          sheet: entry.cells[0]?.backward.sheet ?? entry.cells[0]?.forward.sheet ?? '',
          cells: entry.cells.map((c) => c[direction]),
        }) as never,
      ).unwrap();
      const data = (resp as { data?: { failed?: number } })?.data;
      return data ? data.failed === 0 : false;
    } catch {
      return false;
    }
  }
  return applySingle(listenerApi, entry[direction]);
}

undoRedoListener.startListening({
  actionCreator: requestUndo,
  effect: async (_action, listenerApi) => {
    const { undoStack, applying } = (listenerApi.getState() as { undoRedo: UndoRedoState }).undoRedo;
    if (applying || undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1];
    listenerApi.dispatch(setApplying(true) as never);
    try {
      const ok = await applyEntry(listenerApi as never, entry, 'backward');
      if (ok) listenerApi.dispatch(popUndoPushRedo());
    } finally {
      listenerApi.dispatch(setApplying(false) as never);
    }
  },
});

undoRedoListener.startListening({
  actionCreator: requestRedo,
  effect: async (_action, listenerApi) => {
    const { redoStack, applying } = (listenerApi.getState() as { undoRedo: UndoRedoState }).undoRedo;
    if (applying || redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];
    listenerApi.dispatch(setApplying(true) as never);
    try {
      const ok = await applyEntry(listenerApi as never, entry, 'forward');
      if (ok) listenerApi.dispatch(popRedoPushUndo());
    } finally {
      listenerApi.dispatch(setApplying(false) as never);
    }
  },
});

export const undoRedoListenerMiddleware = undoRedoListener.middleware;
