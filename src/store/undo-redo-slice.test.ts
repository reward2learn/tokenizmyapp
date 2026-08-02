import { describe, expect, it } from 'vitest';
import {
  undoRedoReducer,
  clearSheetHistory,
  popRedoPushUndo,
  popUndoPushRedo,
  pushSheetChange,
  selectCanRedo,
  selectCanUndo,
  type UndoRedoState,
} from '@/store/undo-redo-slice';

const params = (value: unknown, formulaMode = false) => ({
  sheet: 'Sheet1',
  rowIndex: 7,
  column: 'B',
  value,
  _excelRow: 7,
  formulaMode,
});

const entry = (backwardValue: unknown, forwardValue: unknown, formulaMode = false) => ({
  backward: params(backwardValue, formulaMode),
  forward: params(forwardValue, formulaMode),
  at: '2026-08-02T00:00:00.000Z',
});

describe('undoRedoReducer', () => {
  it('pushes an entry onto the undo stack and enables undo', () => {
    const state = undoRedoReducer(undefined, pushSheetChange(entry('old', 'new')));
    expect(state.undoStack).toHaveLength(1);
    expect(selectCanUndo({ undoRedo: state } as never)).toBe(true);
    expect(selectCanRedo({ undoRedo: state } as never)).toBe(false);
  });

  it('clears the redo branch when a fresh edit arrives after an undo', () => {
    let state = undoRedoReducer(undefined, pushSheetChange(entry('a1', 'a2')));
    state = undoRedoReducer(state, popUndoPushRedo()); // undo applied → entry to redo
    expect(state.redoStack).toHaveLength(1);
    state = undoRedoReducer(state, pushSheetChange(entry('b1', 'b2')));
    expect(state.undoStack).toHaveLength(1);
    expect(state.redoStack).toHaveLength(0);
  });

  it('skips no-op entries (same value and same formula mode)', () => {
    let state = undoRedoReducer(undefined, pushSheetChange(entry('old', 'new')));
    state = undoRedoReducer(state, pushSheetChange(entry('new', 'new')));
    expect(state.undoStack).toHaveLength(1); // the no-op 'new'→'new' edit is ignored
    const state2 = undoRedoReducer(undefined, pushSheetChange(entry('same', 'same')));
    expect(state2.undoStack).toHaveLength(0); // a purely no-op edit never records
  });

  it('does not record entries while an undo/redo apply is in flight', () => {
    let state = undoRedoReducer(undefined, pushSheetChange(entry('o', 'n')));
    state = undoRedoReducer(state, { type: 'undoRedo/setApplying', payload: true });
    state = undoRedoReducer(state, pushSheetChange(entry('x1', 'x2')));
    expect(state.undoStack).toHaveLength(1);
  });

  it('caps the undo stack at MAX_HISTORY', () => {
    let state: UndoRedoState = { undoStack: [], redoStack: [], applying: false };
    for (let i = 0; i < 250; i++) {
      state = undoRedoReducer(state, pushSheetChange(entry(`old${i}`, `v${i}`)));
    }
    expect(state.undoStack).toHaveLength(200);
  });

  it('undo then redo restores the exact forward params', () => {
    let state = undoRedoReducer(undefined, pushSheetChange(entry('old', 'new')));
    state = undoRedoReducer(state, popUndoPushRedo());
    expect(state.undoStack).toHaveLength(0);
    expect(state.redoStack).toHaveLength(1);
    expect(state.redoStack[0].forward.value).toBe('new');
    state = undoRedoReducer(state, popRedoPushUndo());
    expect(state.undoStack).toHaveLength(1);
    expect(state.undoStack[0].forward.value).toBe('new');
    expect(state.redoStack).toHaveLength(0);
  });

  it('clearSheetHistory resets both stacks', () => {
    let state = undoRedoReducer(undefined, pushSheetChange(entry('a1', 'a2')));
    state = undoRedoReducer(state, clearSheetHistory());
    expect(state.undoStack).toHaveLength(0);
    expect(state.redoStack).toHaveLength(0);
  });
});
