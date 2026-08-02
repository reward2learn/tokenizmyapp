import { createAction, createListenerMiddleware, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { sheetDataApi, type UpdateSheetCellParams } from '@/store/apis/sheet-data-api';

/**
 * Sheet-viewer undo/redo history.
 *
 * Every successful cell edit (workbook cell OR custom-column cell) records a
 * SheetUndoEntry with the exact update-cell params needed to restore the
 * PRE-EDIT state (`backward` — used by Undo) and the POST-EDIT state
 * (`forward` — used by Redo). Both directions re-route through the same
 * /api/sheet-data/update-cell endpoint the grid uses, so undo/redo is
 * automatically correct for formula cells (formula strings + formulaMode),
 * custom columns, and cells edited on any page.
 *
 * Applying an undo/redo is performed by a listener middleware (the same
 * pattern as the sheet-viewer formula-mode persistence): components just
 * dispatch `requestUndo()` / `requestRedo()` (context menu, Ctrl+Z /
 * Ctrl+Shift+Z, toolbar buttons) and the store drives the mutation.
 *
 * History is capped at 200 entries; a fresh edit clears the redo branch
 * (standard editor semantics).
 */

export interface SheetUndoEntry {
  /** Params that restore the cell to its state BEFORE the edit. */
  backward: UpdateSheetCellParams;
  /** Params that restore the cell to its state AFTER the edit. */
  forward: UpdateSheetCellParams;
  at: string;
}

export interface UndoRedoState {
  undoStack: SheetUndoEntry[];
  redoStack: SheetUndoEntry[];
  /** True while an undo/redo mutation is in flight (guards double triggers). */
  applying: boolean;
}

const MAX_HISTORY = 200;

const initialState: UndoRedoState = {
  undoStack: [],
  redoStack: [],
  applying: false,
};

export const undoRedoSlice = createSlice({
  name: 'undoRedo',
  initialState,
  reducers: {
    /** Record a completed cell edit. Clears the redo branch. */
    pushSheetChange(state, action: PayloadAction<SheetUndoEntry>) {
      if (state.applying) return; // changes triggered by undo/redo don't re-record
      const entry = action.payload;
      // No-op guard: value AND formula mode unchanged → nothing to undo.
      if (
        entry.backward.value === entry.forward.value &&
        entry.backward.formulaMode === entry.forward.formulaMode
      ) {
        return;
      }
      state.undoStack = [...state.undoStack, entry].slice(-MAX_HISTORY);
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

async function applyEntry(
  listenerApi: {
    dispatch: (action: unknown) => {
      unwrap: () => Promise<unknown>;
    };
    getState: () => { undoRedo: UndoRedoState };
  },
  params: UpdateSheetCellParams,
): Promise<boolean> {
  listenerApi.dispatch(setApplying(true) as never);
  try {
    await listenerApi.dispatch(
      sheetDataApi.endpoints.updateSheetCell.initiate(params) as never,
    ).unwrap();
    return true;
  } catch {
    return false; // failed undo/redo — entry stays in place
  } finally {
    listenerApi.dispatch(setApplying(false) as never);
  }
}

undoRedoListener.startListening({
  actionCreator: requestUndo,
  effect: async (_action, listenerApi) => {
    const { undoStack, applying } = (listenerApi.getState() as { undoRedo: UndoRedoState }).undoRedo;
    if (applying || undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1];
    const ok = await applyEntry(listenerApi as never, entry.backward);
    if (ok) listenerApi.dispatch(popUndoPushRedo());
  },
});

undoRedoListener.startListening({
  actionCreator: requestRedo,
  effect: async (_action, listenerApi) => {
    const { redoStack, applying } = (listenerApi.getState() as { undoRedo: UndoRedoState }).undoRedo;
    if (applying || redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];
    const ok = await applyEntry(listenerApi as never, entry.forward);
    if (ok) listenerApi.dispatch(popRedoPushUndo());
  },
});

export const undoRedoListenerMiddleware = undoRedoListener.middleware;
