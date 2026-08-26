'use client';

import { useCallback, useEffect, useMemo, useState, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Slider from '@mui/material/Slider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FunctionsIcon from '@mui/icons-material/Functions';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import ChatIcon from '@mui/icons-material/Chat';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  GridColDef,
  GridValidRowModel,
  GridSortModel,
  GridRowModel,
  GridColumnHeaderParams,
  GridRowSelectionModel,
  GridCellParams,
  GridRowId,
  MuiEvent,
} from '@mui/x-data-grid';
import { GridToolbarContainer, useGridApiRef, GridFooter, GridEditInputCell } from '@mui/x-data-grid';
import type { GridRenderEditCellParams, GridColumnResizeParams } from '@mui/x-data-grid';
import { useGetSheetDataQuery, useUpdateSheetCellMutation, useUpdateSheetCellsMutation, useGetCustomColumnsQuery, useCreateCustomColumnMutation, useDeleteCustomColumnMutation, useGetSheetViewerConfigQuery, useSaveSheetViewerConfigMutation } from '@/store/apis/sheet-data-api';
import type { UpdateSheetCellParams, SheetDataResponse } from '@/store/apis/sheet-data-api';
import { buildFillCells, buildPasteCells, parseTsv, type FillTargetCell } from '@/lib/sheet-fill';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendStreamingMessage } from '@/store/chat-stream-slice';
import { setChatDrawerOpen } from '@/store/ui-slice';
import { pushSheetChange, requestUndo, requestRedo, selectCanUndo, selectCanRedo, type SheetUndoBatchEntry } from '@/store/undo-redo-slice';
import { setSelectedRange } from '@/store/sheet-viewer-slice';
import { buildCellsPrompt, type PromptRow } from '@/lib/sheet-prompt';
import {
  isPercentColumnKey,
  formatPercentDisplay,
  parsePercentInput,
} from '@/lib/workbook-mapping';
import {
  setFormulaMode,
  setPinnedColumns,
  selectSingleCell,
  toggleCell,
  shiftSelectRange,
  shiftSelectColumns,
  dragStart,
  dragMove,
  dragEnd,
  clearCellSelection,
  toggleExtraStat,
  selectFormulaMode,
  selectDragActive,
  selectSelectedCells,
  selectPinnedColumns,
  selectExtraStats,
  selectTouchSelectMode,
  selectSelectedColumns,
  setTouchSelectMode,
  toggleColumn,
} from '@/store/sheet-viewer-slice';

const DataGrid = dynamic(
  () => import('@mui/x-data-grid').then((m) => ({ default: m.DataGrid })),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <BrandedLoadingIndicator size={24} />
      </Box>
    ),
  },
);

interface SheetViewerConfig {
  sheet?: string;
  columns?: string[];
  title?: string;
}

const PER_PAGE = 100;

/** Excel-style row-number gutter column (always sticky-left). */
const ROW_NUMBER_COL = '__rowNumber__';
const ROW_NUMBER_COL_WIDTH = 56;
/**
 * Width of MUI's built-in row-selection checkbox column (field `__check__`).
 * Fixed at 50px in `GRID_CHECKBOX_SELECTION_COL_DEF` and NOT resizable — the
 * freeze-pane sticky offsets must reserve this space for it.
 */
const CHECKBOX_COL_WIDTH = 50;
/** Pinned (frozen) column default width when no saved width exists. */
const DEFAULT_PINNED_WIDTH = 160;

/** Extract the Excel column letters from an A1 cell ref ("C6" → "C", "AMQ5" → "AMQ"). */
function colLetterFromRef(ref: string | undefined): string {
  if (typeof ref !== 'string') return '';
  const m = ref.match(/^([A-Z]+)\d+$/);
  return m ? m[1] : '';
}

function isLikelyFinancial(key: string, value: unknown): boolean {
  if (isPercentColumnKey(key)) return false;
  if (typeof value === 'number' && Math.abs(value) > 1000) return true;
  const k = key.toLowerCase();
  return /amount|total|sales|revenue|cost|price|balance|amount|sum|income|expense/i.test(k);
}

function formatCellValue(key: string, value: unknown): string | number {
  if (value === '' || value === undefined || value === null) return '';
  // Display-only: percent columns show "20.00%"; edit mode uses the raw row value.
  if (isPercentColumnKey(key)) return formatPercentDisplay(value);
  if (typeof value === 'number') {
    if (isLikelyFinancial(key, value)) {
      // Values are full IDR amounts; display in thousands with K suffix
      // (620,122,268 -> "IDR 620,122K") and billions with B suffix.
      const abs = Math.abs(value);
      if (abs >= 1_000_000_000) return `IDR ${(value / 1_000_000_000).toFixed(2)}B`;
      if (abs >= 1_000) return `IDR ${(value / 1_000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
      return `IDR ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString('en-US');
  }
  return String(value);
}

/** Handle the formula editor exposes to the grid for cell-picking mode. */
export interface FormulaPickerHandle {
  active: boolean;
  /** Appends a cell reference (e.g. "D6") to the formula being edited. */
  append: (ref: string, isRangeEnd: boolean) => void;
  /** Re-anchors the floating formula popup after grid scroll / window resize. */
  reposition?: () => void;
  /** Re-focuses the formula text field after a cell was picked (the grid
   *  moves focus to the clicked cell — this restores keyboard input). */
  focus?: () => void;
}

// ── Formula structure helpers (shared by the editor + pill popup) ─────────────────────────────────
const FN_IDENT_RE = /^[A-Za-z][A-Za-z0-9_.]*$/;

interface FormulaParts {
  /** Function name ('' when the formula isn't a simple FN(...) form). */
  fn: string;
  /** Top-level comma-separated arguments inside the parens. */
  args: string[];
  /** Text after '=' when the formula isn't a simple FN(...) form. */
  tail: string;
}

/**
 * Splits an in-progress formula ("=SUM(V46,") into its visible parts: the
 * function name and its top-level arguments. Free-form expressions without
 * a leading function ("=V46*2") are kept whole in `tail` so the pill popup
 * never loses user-typed text.
 */
function parseFormulaParts(value: string): FormulaParts {
  const text = value.startsWith('=') ? value.slice(1) : value;
  const openIdx = text.indexOf('(');
  if (openIdx === -1) return { fn: '', args: [], tail: text };
  const head = text.slice(0, openIdx).trim();
  if (!FN_IDENT_RE.test(head)) return { fn: '', args: [], tail: text };
  const args: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of text.slice(openIdx + 1)) {
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      if (depth === 0) break;
      depth--;
    } else if (ch === ',' && depth === 0) {
      args.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim() !== '') args.push(cur.trim());
  if (args[args.length - 1] === '') args.pop(); // "=SUM(V46," -> one arg
  return { fn: head, args, tail: text };
}

function buildFormulaText(fn: string, args: string[]): string {
  return `=${fn}(${args.join(',')})`;
}

/**
 * Custom edit cell — the Excel formula builder with a part-by-part popup.
 *
 * When the edited value starts with "=" (existing formula cell or the user
 * just typed "="), the in-cell editor keeps a compact text field for typing
 * plus a floating popup that lays out each part of the formula as pills:
 *   - "=" prefix + the function pill (opens the grouped ƒ dropdown; ✓
 *     marks functions the server can calculate immediately),
 *   - one pill per argument ("V46", "V46:V54") — click to make it the
 *     active slot, ✕ deletes it, "+" adds another,
 *   - a pick-cells toggle: while active, clicking grid cells fills the
 *     active argument (plain click = set/append, Shift+click = extend into
 *     a range), then ✓ applies the formula (Enter) / ✕ cancels (Escape).
 * Non-formula edits keep the default MUI cell editor.
 */
function FormulaEditCell(
  props: GridRenderEditCellParams & { pickerRef: React.MutableRefObject<FormulaPickerHandle | null> },
) {
  const { id, field, api, value, pickerRef } = props;
  const row = props.row as Record<string, unknown>;
  const formula = row[`${field}_formula`];
  const [picker, setPicker] = useState(false);
  const [fnAnchor, setFnAnchor] = useState<null | HTMLElement>(null);
  // Which argument pill receives the next picked cell reference.
  const [activeArg, setActiveArg] = useState<number | null>(null);
  // Fixed position of the floating formula popup (anchored to the cell).
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fnBtnRef = useRef<HTMLButtonElement>(null);
  // Guards the one-time seed below so user edits are never reverted, and holds
  // the latest formula text for append/insert (avoids stale-render closures).
  const seededRef = useRef(false);
  const latestRef = useRef(typeof value === 'string' ? value : '');
  latestRef.current = typeof value === 'string' ? value : '';

  // Seed the editor with the cell's formula (if any) exactly once when editing
  // starts. Re-running on every value change would clobber what the user is
  // typing/picking — the formula flow must never revert mid-edit.
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (typeof formula === 'string' && formula.length > 0 && formula !== value) {
      api.setEditCellValue({ id, field, value: formula });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, id, field]);

  const isFormulaMode = typeof value === 'string' && value.startsWith('=');
  const parts = useMemo(
    () => (isFormulaMode ? parseFormulaParts(value) : { fn: '', args: [], tail: '' }),
    [value, isFormulaMode],
  );

  // Auto-open the function list right after the user types "="
  useEffect(() => {
    if (isFormulaMode && value === '=' && fnBtnRef.current) {
      setFnAnchor(fnBtnRef.current);
    }
  }, [isFormulaMode, value]);

  const applyValue = useCallback(
    (next: string) => {
      latestRef.current = next;
      api.setEditCellValue({ id, field, value: next, debounceMs: 0 });
    },
    [api, id, field],
  );

  const setFunction = (fn: string) => {
    const cur = parseFormulaParts(latestRef.current);
    // Keep existing arguments when switching functions; start with one empty
    // slot when there are none so the user can immediately pick cells.
    const args = cur.fn ? (cur.args.length > 0 ? cur.args : ['']) : [''];
    applyValue(buildFormulaText(fn, args));
    setFnAnchor(null);
    setActiveArg(0);
    setPicker(true);
  };

  const append = useCallback(
    (ref: string, isRangeEnd: boolean) => {
      const cur = parseFormulaParts(latestRef.current);
      if (!cur.fn) {
        // Free-form expression: plain click replaces it, Shift+click extends a range.
        const tail = cur.tail;
        applyValue(isRangeEnd ? `=${tail ? `${tail}:` : ''}${ref}` : `=${ref}`);
        return;
      }
      const args = [...cur.args];
      if (args.length === 0) args.push('');
      const target = activeArg !== null && activeArg < args.length ? activeArg : args.length - 1;
      if (isRangeEnd) {
        // Extend the active slot into / within a range ("V46" -> "V46:V54").
        const slot = args[target] ?? '';
        const colon = slot.indexOf(':');
        args[target] = colon !== -1 ? `${slot.slice(0, colon)}:${ref}` : `${slot}:${ref}`;
      } else if (activeArg !== null && activeArg < args.length) {
        args[activeArg] = ref; // replace the active slot
      } else {
        args.push(ref); // append a new argument (Excel point-mode)
      }
      applyValue(buildFormulaText(cur.fn, args));
    },
    [activeArg, applyValue],
  );

  const addArg = () => {
    const cur = parseFormulaParts(latestRef.current);
    if (!cur.fn) return;
    const args = [...cur.args, ''];
    applyValue(buildFormulaText(cur.fn, args));
    setActiveArg(args.length - 1);
    setPicker(true);
  };

  const removeArg = (idx: number) => {
    const cur = parseFormulaParts(latestRef.current);
    if (!cur.fn) return;
    applyValue(buildFormulaText(cur.fn, cur.args.filter((_, i) => i !== idx)));
    setActiveArg((a) => {
      if (a === null || a === idx) return null;
      return a > idx ? a - 1 : a;
    });
  };

  const activateArg = (idx: number) => {
    setActiveArg(idx);
    setPicker(true);
  };

  // Excel-style auto-completion on commit: close any open parentheses so the
  // formula is syntactically valid (and thus evaluable) when Enter is pressed.
  const commitValue = (): string => {
    const cur = latestRef.current;
    const opens = (cur.match(/\(/g) || []).length;
    const closes = (cur.match(/\)/g) || []).length;
    return opens > closes ? cur + ')'.repeat(opens - closes) : cur;
  };

  const commitEdit = () => {
    const cur = parseFormulaParts(latestRef.current);
    // Rebuild from the pills when editing a FN(...) form (normalizes trailing
    // commas); otherwise just auto-close unclosed parens.
    const finalValue = cur.fn ? buildFormulaText(cur.fn, cur.args) : commitValue();
    applyValue(finalValue);
    api.stopCellEditMode({ id, field });
  };

  const cancelEdit = () => {
    api.stopCellEditMode({ id, field, ignoreModifications: true });
  };

  // ── Floating popup positioning (anchored to the edited cell) ────────────────────────────
  const computePopupPos = useCallback((): { top: number; left: number } | null => {
    const el = api.getCellElement(id, field);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const barHeight = 64; // approximate popup height + gap
    let top = rect.bottom + 6;
    if (top + barHeight > window.innerHeight) top = Math.max(4, rect.top - barHeight);
    return { top, left: rect.left };
  }, [api, id, field]);

  useEffect(() => {
    if (!isFormulaMode) {
      setPopupPos(null);
      return;
    }
    setPopupPos(computePopupPos());
  }, [isFormulaMode, computePopupPos]);

  // Keep the popup glued to the cell when the window resizes.
  useEffect(() => {
    if (!isFormulaMode) return;
    const onResize = () => setPopupPos(computePopupPos());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isFormulaMode, computePopupPos]);

  const reposition = useCallback(() => setPopupPos(computePopupPos()), [computePopupPos]);

  // Re-focus the formula text field after a grid cell was picked. MUI X moves
  // its focus state to the clicked cell (and stops the edit session on
  // cellFocusOut unless the grid-level onCellEditStop guard prevents it) — a
  // macrotask lets the grid's own focus handling settle before we restore input.
  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  // Expose picker state + popup repositioning to the grid-level handlers.
  useEffect(() => {
    pickerRef.current = { active: picker, append, reposition, focus: focusInput };
    return () => {
      if (pickerRef.current) pickerRef.current = null;
    };
  }, [picker, append, reposition, focusInput, pickerRef]);

  if (!isFormulaMode) {
    const { pickerRef: _pickerRef, ...rest } = props;
    void _pickerRef;
    return <GridEditInputCell {...rest} />;
  }

  return (
    <>
      <Box
        data-formula-editor
        sx={{ display: 'flex', alignItems: 'center', gap: 0.25, width: '100%', minWidth: 260 }}
      >
        <TextField
          inputRef={inputRef}
          autoFocus
          fullWidth
          size="small"
          variant="standard"
          value={value}
          onChange={(e) => applyValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              commitEdit();
            } else if (e.key === 'Escape') {
              e.stopPropagation();
              cancelEdit();
            }
          }}
          onFocus={(e) => e.target.select()}
          placeholder="=FUNCTION(cell refs…)"
          slotProps={{ input: { sx: { fontSize: '0.8125rem', py: 0 } } }}
        />
        <Tooltip title="Insert Excel function">
          <IconButton ref={fnBtnRef} size="small" onClick={(e) => setFnAnchor(e.currentTarget)}>
            <FunctionsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={fnAnchor} open={Boolean(fnAnchor)} onClose={() => setFnAnchor(null)}>
          {FORMULA_FUNCTIONS.map((g) => [
            <ListSubheader key={g.group} sx={{ bgcolor: 'background.paper', lineHeight: '28px' }}>
              {g.group}
            </ListSubheader>,
            ...g.fns.map((fn) => (
              <MenuItem key={fn} dense onClick={() => setFunction(fn)} sx={{ justifyContent: 'space-between', gap: 3 }}>
                {fn}
                {EVALUABLE_FORMULAS.has(fn) && (
                  <Typography variant="caption" color="text.secondary">✓ instant</Typography>
                )}
              </MenuItem>
            )),
          ])}
        </Menu>
      </Box>

      {popupPos &&
        createPortal(
          <Box
            data-formula-builder
            sx={{
              position: 'fixed',
              top: popupPos.top,
              left: popupPos.left,
              zIndex: 1400,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexWrap: 'wrap',
              maxWidth: 'min(760px, calc(100vw - 12px))',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 6,
              px: 1,
              py: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              =
            </Typography>
            {parts.fn ? (
              <>
                <Chip
                  size="small"
                  label={parts.fn}
                  color="primary"
                  onClick={(e) => setFnAnchor(e.currentTarget)}
                  sx={{ fontWeight: 600 }}
                />
                {parts.args.map((arg, idx) => (
                  <Chip
                    key={idx}
                    size="small"
                    label={arg === '' ? `range ${idx + 1}` : arg}
                    color={activeArg === idx ? 'primary' : 'default'}
                    variant={activeArg === idx ? 'filled' : 'outlined'}
                    onClick={() => activateArg(idx)}
                    onDelete={() => removeArg(idx)}
                    sx={{ fontFamily: 'monospace' }}
                  />
                ))}
                <Chip
                  size="small"
                  label="+"
                  variant="outlined"
                  onClick={addArg}
                  sx={{ minWidth: 30, fontWeight: 700 }}
                />
              </>
            ) : (
              <Chip
                size="small"
                label={parts.tail === '' ? 'expression' : parts.tail}
                variant="outlined"
                color={activeArg === 0 ? 'primary' : 'default'}
                onClick={() => activateArg(0)}
                sx={{ fontFamily: 'monospace' }}
              />
            )}
            <Tooltip
              title={
                picker
                  ? 'Picking cells: click a cell to add it (Shift+click = range).'
                  : 'Pick cells from the sheet'
              }
            >
              <IconButton size="small" color={picker ? 'primary' : 'default'} onClick={() => setPicker((p) => !p)}>
                <AdsClickIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Apply formula (Enter)">
              <IconButton size="small" color="success" onClick={commitEdit}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel (Esc)">
              <IconButton size="small" onClick={cancelEdit}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>,
          document.body,
        )}
    </>
  );
}

// ── Excel formula catalog for the in-cell formula builder ────────────────
const FORMULA_FUNCTIONS: { group: string; fns: string[] }[] = [
  { group: 'Math & Trig', fns: ['SUM', 'AVERAGE', 'MIN', 'MAX', 'PRODUCT', 'COUNT', 'COUNTA', 'COUNTBLANK', 'SUMSQ', 'MEDIAN', 'MODE', 'STDEV', 'VAR', 'ABS', 'SQRT', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'MOD', 'POWER', 'INT', 'SUMPRODUCT'] },
  { group: 'Logical', fns: ['IF', 'IFERROR', 'AND', 'OR', 'NOT', 'TRUE', 'FALSE'] },
  { group: 'Lookup & Reference', fns: ['VLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH', 'CHOOSE', 'OFFSET', 'INDIRECT'] },
  { group: 'Text', fns: ['CONCATENATE', 'TEXT', 'TRIM', 'LEN', 'LEFT', 'RIGHT', 'MID', 'UPPER', 'LOWER', 'SUBSTITUTE'] },
  { group: 'Date & Time', fns: ['TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'WEEKDAY', 'EOMONTH'] },
  { group: 'Financial', fns: ['PMT', 'FV', 'PV', 'RATE', 'NPER', 'NPV', 'IRR'] },
];

/** Formulas the server evaluator can actually compute (src/lib/excel-formula.ts). */
const EVALUABLE_FORMULAS = new Set([
  'SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'COUNTA', 'PRODUCT', 'ABS', 'INT',
  'SQRT', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'MOD', 'POWER', 'IF', 'SUBTOTAL',
  'AND', 'OR', 'TRIM', 'PROPER', 'CHOOSE', 'DATE', 'WEEKDAY', 'COLUMN',
  'SUMIF', 'VLOOKUP', 'MATCH', 'INDEX', 'TEXT', 'IFERROR',
]);

// ── Status-bar aggregate functions (Excel-style) ────────────────────────
const STAT_DEFAULTS = ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNTA'] as const;
const STAT_OPTIONS = [
  'AVERAGEA', 'COUNT', 'COUNTBLANK', 'DEVSQ', 'GCD', 'GEOMEAN', 'HARMEAN',
  'LCM', 'MAXA', 'MEDIAN', 'MINA', 'MODE', 'MULTINOMIAL', 'OR', 'PRODUCT',
  'STDEV', 'STDEVP', 'STDEVPA', 'SUMSQ', 'VAR', 'VARA', 'VARP', 'AVEDEV', 'VARPA',
  'T', 'F',
];

function statSum(a: number[]): number { return a.reduce((s, v) => s + v, 0); }
function statAvg(a: number[]): number { return a.length ? statSum(a) / a.length : NaN; }
function statVarSample(a: number[]): number {
  const m = statAvg(a);
  return a.length > 1 ? statSum(a.map((v) => (v - m) ** 2)) / (a.length - 1) : NaN;
}
function statVarPop(a: number[]): number {
  const m = statAvg(a);
  return a.length ? statSum(a.map((v) => (v - m) ** 2)) / a.length : NaN;
}
function statGcd(a: number, b: number): number {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
function statLcm(a: number, b: number): number {
  if (!a || !b) return 0;
  return Math.abs(Math.round(a * b)) / statGcd(a, b);
}
function statFact(n: number): number { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function statMedian(a: number[]): number {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function statMode(a: number[]): number {
  const counts = new Map<number, number>();
  for (const v of a) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: number | null = null; let bestCount = 1;
  for (const [v, c] of counts) if (c > bestCount) { best = v; bestCount = c; }
  return best ?? NaN; // no repeated value → N/A (Excel MODE behavior)
}
// AVERAGEA/MAXA/MINA/STDEVA/VARA style coercion: text → 0, TRUE → 1, FALSE → 0
function statCoerce(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    if (t === 'true') return 1;
    if (t === 'false') return 0;
    const n = Number(v.replace(/[,\s]/g, ''));
    return isFinite(n) ? n : 0;
  }
  return 0;
}

function computeCellStat(fn: string, nums: number[], all: unknown[]): number | string {
  const nonEmpty = all.filter((v) => v !== '' && v !== null && v !== undefined);
  const coerced = nonEmpty.map(statCoerce);
  switch (fn) {
    case 'SUM': return statSum(nums);
    case 'AVERAGE': return statAvg(nums);
    case 'MIN': return nums.length ? Math.min(...nums) : NaN;
    case 'MAX': return nums.length ? Math.max(...nums) : NaN;
    case 'COUNTA': return nonEmpty.length;
    case 'COUNT': return nums.length;
    case 'COUNTBLANK': return all.length - nonEmpty.length;
    case 'AVERAGEA': return statAvg(coerced);
    case 'MAXA': return coerced.length ? Math.max(...coerced) : NaN;
    case 'MINA': return coerced.length ? Math.min(...coerced) : NaN;
    case 'MEDIAN': return statMedian(nums);
    case 'MODE': return statMode(nums);
    case 'PRODUCT': return nums.length ? nums.reduce((p, v) => p * v, 1) : NaN;
    case 'SUMSQ': return statSum(nums.map((v) => v * v));
    case 'DEVSQ': { const m = statAvg(nums); return statSum(nums.map((v) => (v - m) ** 2)); }
    case 'GEOMEAN': {
      const pos = nums.filter((v) => v > 0);
      return pos.length === nums.length && nums.length
        ? Math.pow(nums.reduce((p, v) => p * v, 1), 1 / nums.length) : NaN;
    }
    case 'HARMEAN': {
      const pos = nums.filter((v) => v > 0);
      return pos.length === nums.length && nums.length
        ? nums.length / statSum(nums.map((v) => 1 / v)) : NaN;
    }
    case 'GCD': return nums.length ? nums.reduce(statGcd) : NaN;
    case 'LCM': return nums.length ? nums.reduce(statLcm) : NaN;
    case 'MULTINOMIAL': {
      const ints = nums.map((v) => Math.round(Math.abs(v)));
      const total = statSum(ints);
      return ints.length ? statFact(total) / ints.reduce((p, v) => p * statFact(v), 1) : NaN;
    }
    case 'STDEV': return Math.sqrt(statVarSample(nums));
    case 'STDEVP': return Math.sqrt(statVarPop(nums));
    case 'STDEVA': return Math.sqrt(statVarSample(coerced));
    case 'STDEVPA': return Math.sqrt(statVarPop(coerced));
    case 'VAR': return statVarSample(nums);
    case 'VARA': return statVarSample(coerced);
    case 'VARP': return statVarPop(nums);
    case 'VARPA': return statVarPop(coerced);
    case 'AVEDEV': {
      const m = statAvg(nums);
      return nums.length ? statSum(nums.map((v) => Math.abs(v - m))) / nums.length : NaN;
    }
    case 'OR': return nonEmpty.some((v) =>
      v === true || v === 'TRUE' || v === 'true' || (typeof v === 'number' && v !== 0)
    ) ? 'TRUE' : 'FALSE';
    case 'T': {
      // Excel T(): text if the value is text, otherwise empty string
      const firstText = nonEmpty.find((v) => typeof v === 'string' && v.trim() !== '');
      return typeof firstText === 'string' ? firstText : '';
    }
    case 'F': return 'FALSE'; // Excel F() takes no arguments and always returns FALSE
    default: return NaN;
  }
}

function formatStatValue(v: number | string): string {
  if (typeof v === 'string') return v === '' ? '\u2014' : v; // TRUE / FALSE / T() empty -> em dash
  if (!isFinite(v)) return 'N/A';
  if (Number.isInteger(v)) return v.toLocaleString('en-US');
  return v.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

export function SheetViewerBlock({ config }: { config: Record<string, unknown> }) {
  const { sheet } = config as SheetViewerConfig;
  // apiRef gives access to the DataGrid's CURRENT display order (post-sort/post-filter)
  const apiRef = useGridApiRef();

  const dispatch = useAppDispatch();
  const chatMessages = useAppSelector((s) => s.chatStream.messages);
  // Sheet-viewer UI state lives in the Redux store (single source of truth).
  // The component only reads selectors and dispatches actions — no local
  // mirrors, no state refs, no effects for state wiring.
  const formulaMode = useAppSelector(selectFormulaMode);
  const dragActive = useAppSelector(selectDragActive);
  const touchSelectMode = useAppSelector(selectTouchSelectMode);
  const selectedCells = useAppSelector(selectSelectedCells);
  const pinnedColumns = useAppSelector(selectPinnedColumns);
  const extraStats = useAppSelector(selectExtraStats);
  // Derived O(1) membership view for render paths.
  const selectedCellSet = useMemo(() => new Set(selectedCells), [selectedCells]);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PER_PAGE });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  /** Draft values in Table Settings — applied only when the user clicks Save. */
  const [settingsDraft, setSettingsDraft] = useState<{
    formulaMode: boolean;
    rowHeight: number;
    pinnedColumns: string[];
  } | null>(null);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include' as const,
    ids: new Set<GridRowId>(),
  });
  // Formula-builder cell-picking handle (set by the active FormulaEditCell)
  const formulaPickerRef = useRef<FormulaPickerHandle | null>(null);
  // While the formula builder is in picking mode, the cell currently under the
  // pointer — drives the Excel-style row/column reference highlight so the user
  // can read the exact reference ("C6") they are about to add to the formula.
  const [pickingHover, setPickingHover] = useState<{ rowId: GridRowId; field: string } | null>(null);
  // Mobile long-press tracking: a stationary 400ms press on a cell arms
  // touch-selection mode (gesture-local transient, cleaned up on release).
  const touchPressRef = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    x: number;
    y: number;
    fired: boolean;
  }>({ timer: null, x: 0, y: 0, fired: false });
  const [statsAnchor, setStatsAnchor] = useState<HTMLElement | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Server-side sorting: the sort model is serialized into the query so the
  // backend sorts the ENTIRE column set before pagination (rows beyond the
  // loaded page included); the grid's own re-sort of the returned page is
  // idempotent (rows already arrive in globally-correct order).
  const sortByArg = useMemo(
    () => JSON.stringify(sortModel.map((srt) => [srt.field, srt.sort] as [string, 'asc' | 'desc'])),
    [sortModel],
  );
  const { data: payload, isLoading, error: queryError, refetch } = useGetSheetDataQuery(
    { sheet: sheet ?? '', page: paginationModel.page + 1, perPage: PER_PAGE, formulas: formulaMode ? 1 : 0, sortBy: sortByArg },
    { skip: !sheet },
  );

  const [updateSheetCell] = useUpdateSheetCellMutation();
  // Whole-column selection (header shift-select + header-menu toggle) — the
  // target set for batch column resizing. Declared early: the columns memo
  // below reads it to tint selected headers.
  const selectedColumns = useAppSelector(selectSelectedColumns);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  // ── Custom columns (overlay) ──────────────────────────────────────
  const { data: customsData } = useGetCustomColumnsQuery(
    { sheet: sheet ?? '' },
    { skip: !sheet },
  );
  const [createCustomColumn, { isLoading: creatingCustom }] = useCreateCustomColumnMutation();
  const [deleteCustomColumn] = useDeleteCustomColumnMutation();
  const customColumns = useMemo(
    () => customsData?.data?.columns ?? [],
    [customsData?.data?.columns],
  );
  const [customName, setCustomName] = useState('');
  const [customPosition, setCustomPosition] = useState('end');

  const handleCreateCustomColumn = useCallback(async () => {
    if (!sheet || !customName.trim()) return;
    try {
      await createCustomColumn({
        sheet,
        name: customName.trim(),
        position: customPosition === 'end' ? undefined : Number(customPosition),
      }).unwrap();
      setCustomName('');
      setCustomPosition('end');
      setSnackbarMessage(`Custom column "${customName.trim()}" added`);
      setSnackbarOpen(true);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setSnackbarMessage(e?.data?.error ?? 'Failed to add custom column');
      setSnackbarOpen(true);
    }
  }, [sheet, customName, customPosition, createCustomColumn]);

  const handleDeleteCustomColumn = useCallback(
    async (id: string, name: string) => {
      if (!sheet) return;
      try {
        await deleteCustomColumn({ id, sheet }).unwrap();
        setSnackbarMessage(`Custom column "${name}" removed`);
        setSnackbarOpen(true);
      } catch (err: unknown) {
        const e = err as { data?: { error?: string } };
        setSnackbarMessage(e?.data?.error ?? 'Failed to remove custom column');
        setSnackbarOpen(true);
      }
    },
    [sheet, deleteCustomColumn],
  );

  // Shared create (used by both the settings form and the header-menu dialog).
  const createColumnAt = useCallback(
    async (name: string, position: number | undefined): Promise<boolean> => {
      if (!sheet || !name.trim()) return false;
      try {
        await createCustomColumn({ sheet, name: name.trim(), position }).unwrap();
        setSnackbarMessage(`Custom column "${name.trim()}" added`);
        setSnackbarOpen(true);
        return true;
      } catch (err: unknown) {
        const e = err as { data?: { error?: string } };
        setSnackbarMessage(e?.data?.error ?? 'Failed to add custom column');
        setSnackbarOpen(true);
        return false;
      }
    },
    [sheet, createCustomColumn],
  );

  // ── Table configuration (column widths + row height, persisted per sheet) ──
  const { data: configPayload } = useGetSheetViewerConfigQuery(
    { sheet: sheet ?? '' },
    { skip: !sheet },
  );
  const [saveSheetViewerConfig] = useSaveSheetViewerConfigMutation();
  const viewerConfig = configPayload?.data;
  const savedWidths = useMemo(
    () => viewerConfig?.columnWidths ?? {},
    [viewerConfig?.columnWidths],
  );
  // Live width overrides — updated on EVERY resize so pinned sticky offsets and
  // batch-resized columns track the rendered widths immediately (the debounced
  // server save below only persists them; it never drives the UI mid-drag).
  const [liveWidths, setLiveWidths] = useState<Record<string, number>>({});
  // Effective width source: live (in-session) overrides win over saved widths.
  const effWidths = useMemo(() => ({ ...savedWidths, ...liveWidths }), [savedWidths, liveWidths]);
  // Local override while the slider is being dragged; falls back to saved.
  const [rowHeightLocal, setRowHeightLocal] = useState<number | null>(null);
  const rowHeight = rowHeightLocal ?? viewerConfig?.rowHeight ?? 52;

  const widthSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleColumnWidthChange = useCallback(
    (params: GridColumnResizeParams) => {
      if (!sheet) return;
      const resizedField = params.colDef.field;
      const resizedWidth = params.width;
      // Batch resize: when 2+ columns are selected and the resized column is
      // one of them, apply the new width to every selected column (Excel-like).
      const isBatch =
        selectedColumns.length > 1 && selectedColumns.includes(resizedField);
      const affected = isBatch ? [...selectedColumns] : [resizedField];

      // 1) Apply live immediately (drives pinned sticky offsets + re-layout).
      setLiveWidths((prev) => {
        const next = { ...prev };
        affected.forEach((f) => {
          next[f] = resizedWidth;
        });
        return next;
      });
      // 2) Persist (debounced) — the config API merges per-column widths.
      if (widthSaveTimer.current) clearTimeout(widthSaveTimer.current);
      widthSaveTimer.current = setTimeout(() => {
        const widths: Record<string, number> = {};
        affected.forEach((f) => {
          widths[f] = resizedWidth;
        });
        void saveSheetViewerConfig({ sheet, columnWidths: widths });
      }, 600);
    },
    [sheet, saveSheetViewerConfig, selectedColumns],
  );

  const handleRowHeightChange = useCallback((_e: unknown, v: number | number[]) => {
    const h = Array.isArray(v) ? v[0] : v;
    setSettingsDraft((prev) => (prev ? { ...prev, rowHeight: h } : prev));
  }, []);

  const handleSettingsClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setSettingsDraft({
        formulaMode,
        rowHeight,
        pinnedColumns: [...pinnedColumns],
      });
      setSettingsAnchor(event.currentTarget);
    },
    [formulaMode, rowHeight, pinnedColumns],
  );

  const handleSettingsClose = useCallback(() => {
    setSettingsAnchor(null);
    setSettingsDraft(null);
  }, []);

  const handleSettingsSave = useCallback(async () => {
    if (!settingsDraft || !sheet) return;
    dispatch(setFormulaMode(settingsDraft.formulaMode));
    dispatch(setPinnedColumns(settingsDraft.pinnedColumns));
    setRowHeightLocal(settingsDraft.rowHeight);
    try {
      await saveSheetViewerConfig({ sheet, rowHeight: settingsDraft.rowHeight }).unwrap();
      setSnackbarMessage('Table settings saved');
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage('Could not save table settings');
      setSnackbarOpen(true);
    }
    setSettingsAnchor(null);
    setSettingsDraft(null);
  }, [settingsDraft, sheet, dispatch, saveSheetViewerConfig]);

  const settingsDirty =
    settingsDraft !== null &&
    (settingsDraft.formulaMode !== formulaMode ||
      settingsDraft.rowHeight !== rowHeight ||
      settingsDraft.pinnedColumns.length !== pinnedColumns.length ||
      settingsDraft.pinnedColumns.some((col, i) => col !== pinnedColumns[i]));

  // ── Per-column header menu (three-dot) ──
  const [colMenuAnchor, setColMenuAnchor] = useState<HTMLElement | null>(null);
  const [colMenuField, setColMenuField] = useState<string | null>(null);
  const [customColumnDialog, setCustomColumnDialog] = useState<{ position: number } | null>(null);
  const [customColumnName, setCustomColumnName] = useState('');
  const customNames = useMemo(() => new Set(customColumns.map((c) => c.name)), [customColumns]);

  // Insert a custom column BEFORE/AFTER the clicked column. Position is the
  // index among the workbook's ORIGINAL visible columns (custom columns are
  // display overlays and never shift workbook column indices).
  const handleInsertCustomColumn = useCallback(
    (side: 'before' | 'after') => {
      const merged = payload?.data?.columns ?? [];
      const i = merged.indexOf(colMenuField ?? '');
      if (i < 0) return;
      let position = 0;
      for (let j = 0; j < i; j++) {
        if (!customNames.has(merged[j])) position++;
      }
      if (side === 'after' && !customNames.has(merged[i])) position++;
      setColMenuAnchor(null);
      setCustomColumnName('');
      setCustomColumnDialog({ position });
    },
    [payload, colMenuField, customNames],
  );

  const handleColumnSelectCells = useCallback(() => {
    if (!colMenuField) return;
    dispatch(toggleColumn(colMenuField));
    setColMenuAnchor(null);
  }, [colMenuField, dispatch]);

  const handleCreateCustomColumnFromDialog = useCallback(async () => {
    if (!customColumnDialog) return;
    const ok = await createColumnAt(customColumnName, customColumnDialog.position);
    if (ok) setCustomColumnDialog(null);
  }, [customColumnDialog, customColumnName, createColumnAt]);

  // Global undo/redo shortcuts. While a cell editor or text field has
  // focus (input/textarea), the native editor undo takes precedence.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      e.preventDefault();
      if (e.shiftKey) dispatch(requestRedo());
      else dispatch(requestUndo());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    // Fallback for any external sort model changes (e.g. column menu). For header clicks,
    // we use custom onColumnHeaderClick to support multi-sort in Community edition.
    const limitedModel = newSortModel.slice(0, 3);
    setSortModel(limitedModel);
    // Cell selection is page/view-scoped — stale selections must not leak across views.
    dispatch(clearCellSelection());
    console.log("[SheetViewerBlock] Sort model updated (external):", limitedModel);
  }, [dispatch]);

  const processRowUpdate = useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel): Promise<GridRowModel> => {
      const sheetName = sheet ?? '';
      if (!sheetName) return oldRow;

      // Detect changed field (cell editing typically changes one field at a time)
      let changedField: string | null = null;
      let newValue: unknown = null;
      for (const key in newRow) {
        if (
          newRow[key as keyof typeof newRow] !==
          oldRow[key as keyof typeof oldRow] &&
          !key.startsWith('_') &&
          key !== 'id'
        ) {
          changedField = key;
          newValue = newRow[key as keyof typeof newRow];
          break;
        }
      }

      if (!changedField) return oldRow;

      try {
        // CRITICAL: Use _excelRow (actual Excel row from initial load) not _rowIndex (page-sequential)
      // _rowIndex is just the position within the current page and does NOT correspond to the Excel row
      const excelRow = Number(newRow._excelRow) || Number(newRow._rowIndex) || 1;

      const params: UpdateSheetCellParams = {
        sheet: sheetName,
        rowIndex: excelRow,
        column: changedField,
        value: newValue,
        // Pass the original Excel cell reference if available (e.g. "D7")
        _excelCell: newRow[`${changedField}_cell`] || undefined,
        // Also pass _excelRow directly for backend to use
        _excelRow: excelRow,
        formulaMode,
      };

        const resp = await updateSheetCell(params).unwrap();
        // Record the change for undo/redo: backward restores the pre-edit
        // state (formula cells are restored as formulas via formulaMode),
        // forward restores the exact edit that was just applied.
        const oldFormula =
          typeof oldRow[`${changedField}_formula`] === 'string'
            ? (oldRow[`${changedField}_formula`] as string)
            : undefined;
        const backwardParams: UpdateSheetCellParams = {
          sheet: sheet ?? '',
          rowIndex: excelRow,
          column: changedField,
          value: oldFormula ?? oldRow[changedField],
          _excelCell: oldRow[`${changedField}_cell`] || undefined,
          _excelRow: excelRow,
          formulaMode: oldFormula ? true : formulaMode,
        };
        dispatch(
          pushSheetChange({
            backward: backwardParams,
            forward: params,
            at: new Date().toISOString(),
          }),
        );
        // Reload the sheet after a successful update so dependent cells
        // (recalculated formulas, cross-cell values) reflect the change.
        void refetch();
        const data = resp?.data as
          | { value?: unknown; formula?: string; unevaluable?: boolean }
          | undefined;
        const updatedRow = { ...newRow };
        const formulaStr =
          typeof data?.formula === 'string' ? data.formula : '';
        updatedRow[`${changedField}_formula`] = formulaStr;
        updatedRow[`${changedField}_unevaluable`] = data?.unevaluable ?? false;
        if (data?.value !== undefined && data?.value !== null) {
          // Server-evaluated result (formula) or the plain value — keep display correct
          updatedRow[changedField] = data.value;
        } else if (formulaStr) {
          // Unevaluable formula: no cached value; valueFormatter shows the formula
          updatedRow[changedField] = '';
        }
        return updatedRow;
      } catch (error) {
        console.error('Failed to update sheet cell:', error);
        // Re-throw to let DataGrid revert the row to old values
        throw error;
      }
    },
    [updateSheetCell, sheet, formulaMode, dispatch, refetch],
  );

  const columns: GridColDef[] = useMemo(() => {
    const sd = payload?.data;
    if (!sd) return [];

    const pinnedSet = new Set(pinnedColumns);
    // Reorder columns so pinned ones appear first (left side). This helps with sticky CSS.
    const orderedColumnFields = [
      ...pinnedColumns.filter((c) => sd.columns.includes(c)),
      ...sd.columns.filter((c) => !pinnedColumns.includes(c)),
    ];

    // Excel column letters ("A", "B", ... "C") derived from the authoritative
    // A1 cell refs the backend attaches to every row (includes hidden-column
    // offsets and virtual custom-column letters, e.g. "AMQ5").
    const firstRow = sd.rows[0] as Record<string, unknown> | undefined;
    const colLetters: Record<string, string> = {};
    orderedColumnFields.forEach((col) => {
      colLetters[col] = colLetterFromRef(
        typeof firstRow?.[`${col}_cell`] === 'string'
          ? (firstRow[`${col}_cell`] as string)
          : undefined,
      );
    });

    // Excel-style alignment: numeric columns right-align, text columns
    // left-align. A column counts as numeric when the majority of its
    // non-empty values on the current page are JS numbers (dates arrive as
    // Excel serial numbers, so they right-align too — like Excel).
    const numericFields = new Set<string>();
    orderedColumnFields.forEach((col) => {
      let numeric = 0;
      let other = 0;
      for (const row of sd.rows) {
        const v = row[col];
        if (v === null || v === undefined || v === '') continue;
        if (typeof v === 'number') numeric += 1;
        else other += 1;
      }
      if (numeric > 0 && numeric >= other) numericFields.add(col);
    });

    const gutterCol: GridColDef = {
      field: ROW_NUMBER_COL,
      headerName: '',
      width: effWidths[ROW_NUMBER_COL] ?? ROW_NUMBER_COL_WIDTH,
      minWidth: ROW_NUMBER_COL_WIDTH,
      flex: 0,
      sortable: false,
      filterable: false,
      editable: false,
      resizable: true,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      // Excel-style row-number gutter: shows the REAL Excel row (header rows
      // shift the numbers, so page-sequential _rowIndex would be misleading).
      renderCell: (params) => {
        const row = params.row as Record<string, unknown>;
        const excelRow = Number(row._excelRow) || Number(row._rowIndex) || '';
        return (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', userSelect: 'none' }}
          >
            {excelRow}
          </Typography>
        );
      },
    };

    return [
      gutterCol,
      ...orderedColumnFields.map((col) => {
        const isPinned = pinnedSet.has(col);
        const sortIndex = sortModel.findIndex((s) => s.field === col);
        // Update column sortDirection based on current sortModel so DataGrid shows correct arrows
        // and header state. sortIndex is used both for column metadata and badge display (1, 2, 3).
        const sortDirection = sortIndex >= 0 ? sortModel[sortIndex].sort : null;
        const letter = colLetters[col];

        return {
          field: col,
          headerName: col,
          // Numeric columns right-align, text columns left-align (Excel-style).
          align: numericFields.has(col) ? ('right' as const) : ('left' as const),
          // Saved/live (persisted) widths apply to EVERY column — including
          // freeze-pane (pinned) columns — so a resized pinned column keeps
          // its width across reloads. Unsaved columns flex to fill space.
          flex: effWidths[col] ? 0 : isPinned ? 0 : 1,
          minWidth: isPinned ? 140 : 100,
          width: effWidths[col] ?? (isPinned ? DEFAULT_PINNED_WIDTH : undefined),
          sortable: true,
          sortDirection,
          filterable: true,
          resizable: true,
          // Freeze-pane (pinned) columns are read-only — only non-frozen columns
          // can be edited so the sticky identifier columns are never modified.
          editable: !isPinned,
          // Note: pinnedColumns prop requires MUI X Pro. We use CSS sticky workaround below.
          sortIndex, // for reference (also used by custom renderHeader)
          valueGetter: (_value: unknown, row: GridValidRowModel) => {
            const raw = row[col];
            // Keep raw numbers (including Excel % ratios like 0.2) for sort/edit.
            if (typeof raw === 'number') return raw;
            if (isLikelyFinancial(col, raw) && typeof raw === 'number') {
              return raw;
            }
            return raw ?? '';
          },
          valueFormatter: (value: unknown, row: GridValidRowModel) => {
            // Display-only percent: 0.2 → "20.00%". Edit cell uses valueGetter raw.
            if (isPercentColumnKey(col)) {
              return formatPercentDisplay(value);
            }
            if (typeof value === 'number' && isLikelyFinancial(col, value)) {
              return formatCellValue(col, value);
            }
            // Formula cells keep displaying their computed values; the formula
            // text only appears while the cell is being edited. The one
            // exception is a genuinely unevaluable formula (the API sets
            // `_unevaluable: true` — no value exists), where the text is shown
            // so the user can see the cell is formula-driven.
            if (formulaMode && (value === '' || value === null || value === undefined)) {
              const formula = (row as Record<string, unknown>)[`${col}_formula`];
              const unevaluable = (row as Record<string, unknown>)[`${col}_unevaluable`];
              if (typeof formula === 'string' && formula.length > 0 && unevaluable === true) {
                return formula;
              }
            }
            return value ?? '';
          },
          // Formula builder editor only when formula mode is enabled; otherwise
          // the default MUI cell editor (plain text/values) is used.
          renderEditCell: formulaMode
            ? (params: GridRenderEditCellParams) => (
                <FormulaEditCell {...params} pickerRef={formulaPickerRef} />
              )
            : undefined,
          // Coerce edited strings back to numbers so IDR formatting is preserved
          // after commit (also accepts "620,122K" / "IDR 700K" style input).
          // Percent columns: "20.00%" / "20" → Excel ratio 0.2; raw 0.2 stays 0.2.
          valueParser: (value: unknown) => {
            if (isPercentColumnKey(col)) return parsePercentInput(value);
            if (typeof value !== 'string') return value;
            const t = value.trim().replace(/^IDR\s*/i, '');
            if (!t) return '';
            if (formulaMode && t.startsWith('=')) return t; // Excel formula — pass through untouched (formula mode only)
            const m = t.match(/^(-?[\d.,]+)\s*([KMBkmb])?$/);
            if (m) {
              let num = Number(m[1].replace(/,/g, ''));
              if (m[2]) {
                const mult: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9 };
                num *= mult[m[2].toUpperCase()];
              }
              return isFinite(num) ? num : t;
            }
            const cleaned = t.replace(/[^\d.-]/g, '');
            if (!cleaned) return t;
            const n = Number(cleaned);
            return isFinite(n) ? n : t;
          },
          renderHeader: (params: GridColumnHeaderParams) => {
            // Custom renderHeader: Excel column-letter reference badge +
            // multi-sort badges (1, 2, 3) plus the per-column three-dot menu
            // (insert custom column before/after, select column).
            const index = sortIndex >= 0 ? sortIndex + 1 : null;
            const isColSelected = selectedColumns.includes(col);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0.5 }}>
                {letter && (
                  <Box
                    component="span"
                    title={`Column ${letter}`}
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      px: 0.5,
                      py: 0.35,
                      borderRadius: 0.75,
                      color: formulaMode ? 'primary.main' : 'text.secondary',
                      bgcolor: isColSelected ? 'primary.50' : 'action.hover',
                      border: isColSelected ? '1px solid' : '1px solid transparent',
                      borderColor: isColSelected ? 'primary.main' : undefined,
                      flexShrink: 0,
                    }}
                  >
                    {letter}
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {params.colDef.headerName}
                </Box>
                {index !== null && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.5,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      px: 1,
                      py: 0.25,
                      borderRadius: '12px',
                      lineHeight: 1,
                      minWidth: 18,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {index}
                  </Box>
                )}
                <IconButton
                  size="small"
                  aria-label={`Options for column ${col}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setColMenuField(col);
                    setColMenuAnchor(e.currentTarget);
                  }}
                  sx={{ p: 0.25, ml: 0.25, flexShrink: 0 }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          },
        };
      }),
    ];
  }, [payload, pinnedColumns, sortModel, formulaMode, effWidths, selectedColumns]);

  const rows = useMemo(() => {
    const sd = payload?.data as SheetDataResponse | undefined;
    if (!sd) return [];
    // Backend sets _rowIndex to the row's position in the GLOBALLY sorted
    // order (page 1 → 1..perPage, page 2 → perPage+1.., ...) — a unique grid
    // row id. _excelRow still points at the original Excel cell for edits.
    return sd.rows.map((row) => ({ ...row }));
  }, [payload]);

  // Current display order (post-sort/post-filter) for range math — mirrors what
  // the user sees, falling back to page order when the grid isn't mounted yet.
  const getRowOrder = useCallback((): GridRowId[] => {
    const sortedIds = apiRef.current ? (apiRef.current.getSortedRowIds() as GridRowId[]) : [];
    return sortedIds.length > 0
      ? sortedIds
      : rows.map((r) => (r._rowIndex ?? r.id) as GridRowId);
  }, [apiRef, rows]);

  // Data-column order only — the Excel-style row-number gutter is a display
  // column and must never participate in cell/range math.
  const getColOrder = useCallback(
    (): string[] => columns.filter((c) => c.field !== ROW_NUMBER_COL).map((c) => c.field),
    [columns],
  );

  /**
   * Custom column-header click handler for MUI X Community edition.
   * - Normal click: replaces sortModel with this column only (cycles asc → desc → none)
   * - Shift+Click: selects the contiguous column range from the last selected
   *   column (header shift-select) — the batch-resize target set. Resizing any
   *   selected column then applies the width to ALL selected columns.
   * - Alt+Click: multi-sort (add/remove/toggle up to 3 columns; was Shift+click
   *   before header shift-select took over the Shift modifier)
   * - Uses event.defaultMuiPrevented to bypass default single-column sort behavior
   */
  const handleColumnHeaderClick = useCallback((
    params: GridColumnHeaderParams,
    event: MuiEvent<React.MouseEvent<HTMLElement>>
  ) => {
    const field = params.field;
    console.log(`[SheetViewerBlock] Column header clicked - field: "${field}", shiftKey: ${event.shiftKey}, altKey: ${event.altKey}`);

    if (field === '__check__' || field === 'actions' || field === ROW_NUMBER_COL) {
      return;
    }

    // Prevent default MUI sort behavior so we fully control the click semantics
    event.defaultMuiPrevented = true;

    // ── Shift+click: header shift-select (batch resize target set) ──────
    if (event.shiftKey) {
      const colOrder = getColOrder();
      dispatch(shiftSelectColumns({ current: field, colOrder }));
      console.log('[SheetViewerBlock] Shift+click: selected column range ending at', field);
      return;
    }

    const currentModel = [...sortModel];
    const existingIdx = currentModel.findIndex((s) => s.field === field);
    let newModel: GridSortModel = [];

    if (!event.altKey) {
      // Normal click: replace entire sort model with this column (asc → desc → none cycle)
      const currentDir = currentModel.find((s) => s.field === field)?.sort;
      let nextDir: 'asc' | 'desc' | null = null;

      if (currentDir === 'asc') {
        nextDir = 'desc';
      } else if (currentDir === 'desc') {
        nextDir = null;
      } else {
        nextDir = 'asc';
      }

      if (nextDir) {
        newModel = [{ field, sort: nextDir }];
      } else {
        newModel = [];
      }
      console.log(`[SheetViewerBlock] Normal click on "${field}": set to ${nextDir || 'unsorted'}, model:`, newModel);
    } else {
      // Alt+Click: manage multi-sort (add/remove/toggle up to 3 columns)
      if (existingIdx !== -1) {
        // Already present: cycle asc -> desc -> remove (preserves priority order for others)
        const currentDir = currentModel[existingIdx].sort;
        if (currentDir === 'asc') {
          currentModel[existingIdx] = { field, sort: 'desc' };
          newModel = currentModel;
          console.log(`[SheetViewerBlock] Alt+click: toggled "${field}" to desc (position ${existingIdx + 1})`);
        } else {
          // desc -> remove from model
          newModel = currentModel.filter((s) => s.field !== field);
          console.log(`[SheetViewerBlock] Alt+click: removed "${field}" from multi-sort`);
        }
      } else {
        // Not present: add at end with asc (if under limit)
        if (currentModel.length >= 3) {
          console.log('[SheetViewerBlock] Max 3 sort columns reached - cannot add more');
          newModel = currentModel;
        } else {
          newModel = [...currentModel, { field, sort: 'asc' }];
          console.log(`[SheetViewerBlock] Alt+click: added "${field}" as sort #${newModel.length}`);
        }
      }
    }

    setSortModel(newModel);
    dispatch(clearCellSelection());
  }, [sortModel, dispatch, getColOrder]);

  // ── Right-click context menu (cells, row/column headers) ──
  const [ctxMenu, setCtxMenu] = useState<{
    mouseX: number;
    mouseY: number;
    target: 'cell' | 'row' | 'column' | 'none';
    column?: string;
  } | null>(null);

  // Effective selection = cell selection ∪ whole-row selection (checkboxes) ∪
  // whole-column selection — page scope, so the status-bar aggregates and the
  // AI-chat prompt work for rows and columns the same way they do for cells.
  const effectiveSelectionKeys = useMemo(() => {
    const keys = new Set<string>(selectedCells);
    const fields = columns.map((c) => c.field).filter((f) => f !== ROW_NUMBER_COL);
    if (selectedColumns.length > 0) {
      rows.forEach((r) => {
        const rid = r._rowIndex ?? r.id;
        selectedColumns.forEach((f) => keys.add(`${rid}|${f}`));
      });
    }
    if (rowSelectionModel.ids.size > 0) {
      rows.forEach((r) => {
        const rid = r._rowIndex ?? r.id;
        if (rowSelectionModel.ids.has(rid as GridRowId)) {
          fields.forEach((f) => keys.add(`${rid}|${f}`));
        }
      });
    }
    return keys;
  }, [selectedCells, selectedColumns, rowSelectionModel, rows, columns]);

  const cellStats = useMemo(() => {
    if (effectiveSelectionKeys.size < 2) return null; // only for multi-cell selections
    const rowById = new Map(rows.map((r) => [r._rowIndex, r]));
    const all: unknown[] = [];
    effectiveSelectionKeys.forEach((key) => {
      const sep = key.lastIndexOf('|');
      const rId = key.slice(0, sep);
      const field = key.slice(sep + 1);
      const row = rowById.get(Number(rId));
      if (row && field in row) all.push(row[field]);
    });
    if (all.length === 0) return null;
    const nonEmpty = all.filter((v) => v !== '' && v !== null && v !== undefined);
    const nums = nonEmpty
      .map((v) => (typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''))))
      .filter((v) => typeof v === 'number' && isFinite(v));
    const fns = [...STAT_DEFAULTS, ...extraStats];
    return fns.map((fn) => ({ label: fn, value: formatStatValue(computeCellStat(fn, nums, all)) }));
  }, [effectiveSelectionKeys, rows, extraStats]);

  // Dynamic sticky styles for user-selected pinned columns (Community edition workaround)
  // NOTE: True column pinning with auto-width handling, resize support, and scroll sync
  // requires MUI X Data Grid Pro. This CSS approach has limitations:
  // - Left offsets track the CURRENT rendered column widths (live resize
  //   updates keep them in sync while dragging), so frozen columns no longer
  //   drift when their widths change.
  // - May have z-index/overlap issues with filters or other features
  // - Reordering pinned columns via state controls left position order
  const pinnedSx = useMemo(() => {
    const sx: Record<string, unknown> = {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      '& .MuiDataGrid-cell': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '& .MuiDataGrid-columnHeader': { fontWeight: 700 },
      '& .MuiDataGrid-columnHeaders': { backgroundColor: 'background.paper' },
      // Cell selection highlighting (Ctrl/Shift multi-cell select)
      '& .selected-cell': {
        bgcolor: 'primary.100 !important',
        borderColor: 'primary.main',
        '&:hover': {
          bgcolor: 'primary.200 !important',
        },
      },
    };

    // FREEZE PANE — the far-left block that must never scroll away:
    // 1) row-selection checkbox column (`__check__`, MUI-injected, 50px)
    // 2) Excel-style row-number gutter
    // 3) user-pinned data columns
    // All three are CSS-sticky with LEFT offsets that reserve the exact width
    // of every frozen column to their left. MUI's own column virtualization
    // would otherwise UNMOUNT these columns once their natural x-position
    // scrolls out of the viewport (they disappear) — the grid therefore runs
    // with `disableVirtualization` (see DataGrid props).
    //
    // Row-selection checkbox column — frozen at the far left.
    sx['& .MuiDataGrid-columnHeader[data-field="__check__"]'] = {
      position: 'sticky',
      left: 0,
      zIndex: 6,
      bgcolor: 'background.paper',
    };
    sx['& .MuiDataGrid-cell[data-field="__check__"]'] = {
      position: 'sticky',
      left: 0,
      zIndex: 4,
      bgcolor: 'background.paper',
    };

    // Excel-style row-number gutter — sticks right after the checkbox column.
    const gutterHeaderSelector = `& .MuiDataGrid-columnHeader[data-field="${ROW_NUMBER_COL}"]`;
    const gutterCellSelector = `& .MuiDataGrid-cell[data-field="${ROW_NUMBER_COL}"]`;
    sx[gutterHeaderSelector] = {
      position: 'sticky',
      left: CHECKBOX_COL_WIDTH,
      zIndex: 5,
      bgcolor: 'background.paper',
      // Separator shadow only when the gutter is the LAST frozen column
      // (no user-pinned columns); otherwise the last pinned column carries it.
      boxShadow: pinnedColumns.length === 0 ? '2px 0 6px -2px rgba(0, 0, 0, 0.15)' : 'none',
    };
    sx[gutterCellSelector] = {
      position: 'sticky',
      left: CHECKBOX_COL_WIDTH,
      zIndex: 3,
      bgcolor: 'background.paper',
    };

    // Header shift-selected columns (batch-resize target set) get a visible
    // tint so the user sees exactly which columns a resize will affect.
    selectedColumns.forEach((field) => {
      sx[`& .MuiDataGrid-columnHeader[data-field="${field}"]`] = {
        bgcolor: 'primary.50 !important',
      };
    });

    // Freeze-pane columns stick with LEFT offsets equal to the CURRENT widths
    // of every column to their left (checkbox + gutter + earlier pinned columns).
    let currentLeft = CHECKBOX_COL_WIDTH + (effWidths[ROW_NUMBER_COL] ?? ROW_NUMBER_COL_WIDTH);
    pinnedColumns.forEach((field, idx) => {
      const selectorHeader = `& .MuiDataGrid-columnHeader[data-field="${field}"]`;
      const selectorCell = `& .MuiDataGrid-cell[data-field="${field}"]`;
      const isLastPinned = idx === pinnedColumns.length - 1;

      sx[selectorHeader] = {
        position: 'sticky',
        left: currentLeft,
        zIndex: 3,
        bgcolor: 'background.paper',
        boxShadow: isLastPinned ? '4px 0 8px -2px rgba(0, 0, 0, 0.1)' : 'none',
      };
      sx[selectorCell] = {
        position: 'sticky',
        left: currentLeft,
        zIndex: 2,
        bgcolor: 'background.paper',
      };

      currentLeft += effWidths[field] ?? DEFAULT_PINNED_WIDTH;
    });

    return sx as SxProps<Theme>;
  }, [pinnedColumns, effWidths, selectedColumns]);

  // Excel-style row/column reference highlight while picking cells into a
  // formula: the hovered cell's column header (letter badge) and row-number
  // gutter cell light up so the user can read the exact reference ("C6") they
  // are about to add. Applied to the wrapper Box (NOT the DataGrid sx) so the
  // grid's memoized props stay stable — no per-mousemove grid re-renders.
  const pickingHoverSx = useMemo(() => {
    if (!pickingHover) return null;
    const sx: Record<string, Record<string, string | number>> = {};
    if (pickingHover.field !== ROW_NUMBER_COL) {
      sx[`& .MuiDataGrid-columnHeader[data-field="${pickingHover.field}"]`] = {
        bgcolor: 'primary.100 !important',
      };
    }
    const rowOrder = getRowOrder();
    const rowIndex = rowOrder.indexOf(pickingHover.rowId);
    if (rowIndex >= 0) {
      sx[`& .MuiDataGrid-cell[data-field="${ROW_NUMBER_COL}"][data-rowindex="${rowIndex}"]`] = {
        bgcolor: 'primary.100 !important',
        color: 'primary.main !important',
        fontWeight: 700,
      };
    }
    return sx;
  }, [pickingHover, getRowOrder]);

  // Show toast notification for copy action
  const showCopyToast = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, []);

  // Build a compact TSV prompt from the current cell selection (headers +
  // values) to hand the data to the AI chat. Shared with the chat drawer's
  // "Attach from page" (src/lib/sheet-prompt.ts).
  const buildSelectionPrompt = useCallback((): string => {
    const sd = payload?.data;
    if (!sd || rows.length === 0 || effectiveSelectionKeys.size === 0) return '';
    return buildCellsPrompt({
      sheet: sd.sheet,
      rows: rows as PromptRow[],
      colOrder: getColOrder(),
      selectedKeys: Array.from(effectiveSelectionKeys),
    });
  }, [payload, rows, effectiveSelectionKeys, getColOrder]);

  const handleSendSelectionToChat = useCallback(() => {
    const prompt = buildSelectionPrompt();
    if (!prompt) {
      showCopyToast('Select cells first (Ctrl/Shift click or drag)');
      return;
    }
    const message = `Here is the data I selected from the spreadsheet. Please analyze it:\n\n${prompt}`;
    void dispatch(sendStreamingMessage({ message, history: chatMessages }));
    // Surface the chat so the user sees the data land in the conversation.
    dispatch(setChatDrawerOpen(true));
    showCopyToast(
      `Sent ${effectiveSelectionKeys.size} cell${effectiveSelectionKeys.size !== 1 ? 's' : ''} to AI chat`
    );
    handleSettingsClose();
  }, [buildSelectionPrompt, dispatch, chatMessages, effectiveSelectionKeys.size, showCopyToast, handleSettingsClose]);

  // Enhanced multi-row copy functionality (MUI X v9 compatible with new GridRowSelectionModel {type, ids: Set}):
  // - When Ctrl/Cmd+C pressed, copies BOTH column headers AND row data as TSV
  // - Includes 'Row #' identifier column
  // - Uses raw values (numbers as-is) so it pastes cleanly into Excel/Google Sheets
  // - Shows toast with count of copied rows
  // - Supports multi-row checkbox selection + falls back to current focused row
  const handleCopySelection = useCallback(
    async (selectionModel: GridRowSelectionModel) => {
      const selectedIds = Array.from(selectionModel.ids);
      if (selectedIds.length === 0) {
        showCopyToast('No rows selected');
        return;
      }

      const sd = payload?.data;
      if (!sd || rows.length === 0) {
        showCopyToast('No data available');
        return;
      }

      // Use column order from current columns (respects pinned column reordering)
      const colFields = columns
        .map((c) => c.field)
        .filter((f) => f !== ROW_NUMBER_COL); // exclude the row-number gutter
      const headers = [
        'Row #',
        ...colFields.map((f) => {
          const colDef = columns.find((c) => c.field === f);
          return colDef?.headerName || String(f);
        }),
      ];

      const selectedRowData = rows.filter((row) => {
        const rowId = row._rowIndex ?? row.id;
        return selectedIds.includes(rowId as GridRowId);
      });

      const tsvRows = selectedRowData.map((row) => {
        const values = [
          row._rowIndex || row.id || '',
          ...colFields.map((field: string) => {
            let val = row[field];
            if (val == null) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val); // raw value for spreadsheet compatibility (no locale strings)
          }),
        ];
        return values.join('\t');
      });

      const tsvContent = [headers.join('\t'), ...tsvRows].join('\n');

      try {
        await navigator.clipboard.writeText(tsvContent);
        showCopyToast(`Copied ${selectedRowData.length} rows to clipboard`);
      } catch (error) {
        console.error('Clipboard copy failed:', error);
        showCopyToast('Failed to copy to clipboard');
      }
    },
    [payload, rows, columns, showCopyToast]
  );

  // ── Multi-cell range editing: fill handle + paste ──────────────────
  // Excel-style: drag the selection-box corner handle to fill (copy / series /
  // formula-shift), or Ctrl+V to paste a TSV range from the clipboard. Both go
  // through the batch update API and record ONE undo entry for the whole range.
  const lastClickedCell = useAppSelector((s) => s.sheetViewer.lastClickedCell);
  const [updateSheetCells] = useUpdateSheetCellsMutation();

  // Read a row's live cell + formula by grid row id.
  const readRow = useCallback(
    (rowId: GridRowId): Record<string, unknown> | undefined =>
      rows.find((r) => String(r._rowIndex ?? r.id) === String(rowId)) as Record<string, unknown> | undefined,
    [rows],
  );

  const buildRangeParams = useCallback(
    (cells: FillTargetCell[]): { forward: UpdateSheetCellParams[]; backward: UpdateSheetCellParams[] } => {
      const forward: UpdateSheetCellParams[] = [];
      const backward: UpdateSheetCellParams[] = [];
      for (const c of cells) {
        const r = readRow(c.rowId);
        // Auto-extended paste rows carry their computed Excel row explicitly
        // (they have no grid row object yet); everything else reads _excelRow.
        const excelRow = c.excelRow ?? (Number(r?._excelRow) || Number(c.rowId) || 1);
        const cellRef = typeof r?.[`${c.field}_cell`] === 'string' ? (r?.[`${c.field}_cell`] as string) : undefined;
        const oldFormula =
          typeof r?.[`${c.field}_formula`] === 'string' ? (r?.[`${c.field}_formula`] as string) : undefined;
        const base = {
          sheet: sheet ?? '',
          rowIndex: excelRow,
          column: c.field,
          _excelCell: cellRef,
          _excelRow: excelRow,
        };
        forward.push({ ...base, value: c.value, formulaMode: c.formulaMode });
        backward.push({
          ...base,
          value: oldFormula ?? r?.[c.field],
          formulaMode: oldFormula ? true : false,
        });
      }
      return { forward, backward };
    },
    [readRow, sheet],
  );

  // Write a range (fill/paste) via the batch API, record ONE undo entry, and
  // select the written range so the user sees exactly what changed.
  const applyRangeWrite = useCallback(
    async (
      cells: FillTargetCell[],
      selRect: { r0: number; c0: number; r1: number; c1: number } | null,
      message: string,
    ) => {
      if (cells.length === 0) return;
      const { forward, backward } = buildRangeParams(cells);
      try {
        const resp = await updateSheetCells({ sheet: sheet ?? '', cells: forward }).unwrap();
        const data = resp?.data as { failed?: number } | undefined;
        const failed = data?.failed ?? 0;
        // One undo entry for the whole range (a single Ctrl+Z reverts the fill/paste).
        const batch: SheetUndoBatchEntry = {
          cells: forward.map((f, i) => ({ backward: backward[i], forward: f })),
          at: new Date().toISOString(),
        };
        dispatch(pushSheetChange(batch));
        // Select the range that was written (Excel leaves the filled range selected).
        if (selRect) {
          const rowOrder = getRowOrder();
          const colOrder = getColOrder();
          const keys: string[] = [];
          for (let r = selRect.r0; r <= selRect.r1; r++) {
            for (let c = selRect.c0; c <= selRect.c1; c++) {
              if (rowOrder[r] != null && colOrder[c] != null) keys.push(`${rowOrder[r]}|${colOrder[c]}`);
            }
          }
          const anchorRow = rowOrder[selRect.r1];
          const anchorCol = colOrder[selRect.c1];
          if (anchorRow != null && anchorCol != null) {
            dispatch(setSelectedRange({ keys, anchor: { rowId: anchorRow, field: anchorCol } }));
          }
        }
        showCopyToast(failed > 0 ? `${message} (${failed} skipped)` : `${message} · ${cells.length} cell${cells.length !== 1 ? 's' : ''}`);
      } catch (error) {
        console.error('Range write failed:', error);
        showCopyToast('Range write failed — see console');
      }
    },
    [buildRangeParams, updateSheetCells, sheet, dispatch, getRowOrder, getColOrder, showCopyToast],
  );

  // ── Clear selection contents (Delete key / context menu) ─────────────
  const clearSelectedCells = useCallback(
    (message = 'Cleared') => {
      if (effectiveSelectionKeys.size === 0) return;
      const rowOrder = getRowOrder();
      const colOrder = getColOrder();
      const cells: FillTargetCell[] = [];
      let minR = Infinity;
      let maxR = -Infinity;
      let minC = Infinity;
      let maxC = -Infinity;
      for (const key of effectiveSelectionKeys) {
        const [rId, f] = key.split('|');
        if (f === '__check__') continue;
        const ri = rowOrder.indexOf(rId as GridRowId);
        const ci = colOrder.indexOf(f);
        if (ri === -1 || ci === -1) continue;
        cells.push({ rowId: rId as GridRowId, field: f, value: '', formulaMode: false });
        minR = Math.min(minR, ri);
        maxR = Math.max(maxR, ri);
        minC = Math.min(minC, ci);
        maxC = Math.max(maxC, ci);
      }
      if (cells.length === 0) return;
      void applyRangeWrite(cells, { r0: minR, c0: minC, r1: maxR, c1: maxC }, message);
    },
    [effectiveSelectionKeys, getRowOrder, getColOrder, applyRangeWrite],
  );

  // ── Fill handle (selection-box corner drag) ─────────────────────────
  // The handle is rendered ONLY for contiguous rectangular cell selections —
  // exactly the state Excel draws a fill handle for.
  const fillSource = useMemo(() => {
    if (effectiveSelectionKeys.size === 0) return null;
    const rowOrder = getRowOrder();
    const colOrder = getColOrder();
    const rowIdxSet = new Set<number>();
    const colIdxSet = new Set<number>();
    for (const key of effectiveSelectionKeys) {
      const [rId, f] = key.split('|');
      const ri = rowOrder.indexOf(rId as GridRowId);
      const ci = colOrder.indexOf(f);
      if (ri === -1 || ci === -1) return null;
      rowIdxSet.add(ri);
      colIdxSet.add(ci);
    }
    const rs = Array.from(rowIdxSet).sort((a, b) => a - b);
    const cs = Array.from(colIdxSet).sort((a, b) => a - b);
    const contiguous = rs.length === rs[rs.length - 1] - rs[0] + 1 && cs.length === cs[cs.length - 1] - cs[0] + 1;
    if (!contiguous || rs.length * cs.length !== effectiveSelectionKeys.size) return null;
    return {
      rows: rs.map((i) => rowOrder[i]),
      cols: cs.map((i) => colOrder[i]),
      r0: rs[0],
      r1: rs[rs.length - 1],
      c0: cs[0],
      c1: cs[cs.length - 1],
    };
  }, [effectiveSelectionKeys, getRowOrder, getColOrder]);

  // Position of the selection box corner handle, relative to the grid wrapper.
  const [fillRect, setFillRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  /** Live preview of the range the current fill drag will write. */
  const [fillPreview, setFillPreview] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const gridWrapRef = useRef<HTMLDivElement | null>(null);

  const updateFillHandlePosition = useCallback(() => {
    if (!fillSource || !gridWrapRef.current) {
      setFillRect(null);
      return;
    }
    const api = apiRef.current;
    const wrapRect = gridWrapRef.current.getBoundingClientRect();
    const corners = [
      api?.getCellElement(fillSource.rows[0], fillSource.cols[0]),
      api?.getCellElement(fillSource.rows[fillSource.rows.length - 1], fillSource.cols[fillSource.cols.length - 1]),
    ].filter(Boolean) as HTMLElement[];
    if (corners.length < 2) {
      setFillRect(null); // virtualized off-screen — hide until scrolled into view
      return;
    }
    const a = corners[0].getBoundingClientRect();
    const b = corners[1].getBoundingClientRect();
    setFillRect({
      top: Math.min(a.top, b.top) - wrapRect.top,
      left: Math.min(a.left, b.left) - wrapRect.left,
      width: Math.abs(b.right - a.left),
      height: Math.abs(b.bottom - a.top),
    });
  }, [fillSource, apiRef]);

  useEffect(() => {
    updateFillHandlePosition();
    window.addEventListener('resize', updateFillHandlePosition);
    return () => window.removeEventListener('resize', updateFillHandlePosition);
  }, [updateFillHandlePosition]);

  const fillDragRef = useRef<{ srcRows: GridRowId[]; srcCols: string[] } | null>(null);
  const fillTargetRef = useRef<{ rowId: GridRowId; field: string } | null>(null);

  const handleFillPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !fillSource) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    fillDragRef.current = { srcRows: fillSource.rows, srcCols: fillSource.cols };
    fillTargetRef.current = null;
  }, [fillSource]);

  const handleFillPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!fillDragRef.current || !fillSource || !gridWrapRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cellEl = el?.closest?.('.MuiDataGrid-cell') as HTMLElement | null;
    if (!cellEl) return;
    const field = cellEl.getAttribute('data-field');
    if (!field || field === '__check__') return;
    const rowIndex = cellEl.closest('.MuiDataGrid-row')?.getAttribute('data-rowindex');
    if (rowIndex == null) return;
    const rowOrder = getRowOrder();
    const rowId = rowOrder[Number(rowIndex)];
    if (rowId == null) return;
    fillTargetRef.current = { rowId, field };

    // Preview: union of the source block and the current drag target, drawn
    // from the corner cells' DOM rects (mirrors the fill math exactly).
    const colOrder = getColOrder();
    const tR = rowOrder.indexOf(rowId);
    const tC = colOrder.indexOf(field);
    if (tR === -1 || tC === -1) return;
    const r0 = Math.min(fillSource.r0, tR);
    const r1 = Math.max(fillSource.r1, tR);
    const c0 = Math.min(fillSource.c0, tC);
    const c1 = Math.max(fillSource.c1, tC);
    const api = apiRef.current;
    const a = api?.getCellElement(rowOrder[r0], colOrder[c0]);
    const b = api?.getCellElement(rowOrder[r1], colOrder[c1]);
    if (!a || !b) return;
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const wrapRect = gridWrapRef.current.getBoundingClientRect();
    setFillPreview({
      top: Math.min(ra.top, rb.top) - wrapRect.top,
      left: Math.min(ra.left, rb.left) - wrapRect.left,
      width: Math.abs(rb.right - ra.left),
      height: Math.abs(rb.bottom - ra.top),
    });
  }, [fillSource, getRowOrder, getColOrder, apiRef]);

  const handleFillPointerUp = useCallback(
    (_e: React.PointerEvent<HTMLDivElement>) => {
      const drag = fillDragRef.current;
      fillDragRef.current = null;
      setFillPreview(null);
      if (!drag) return;
      const target = fillTargetRef.current;
      fillTargetRef.current = null;
      if (!target) return;
      const rowOrder = getRowOrder();
      const colOrder = getColOrder();
      const cells = buildFillCells({
        sourceRows: drag.srcRows,
        sourceCols: drag.srcCols,
        rowOrder,
        colOrder,
        target,
        getValue: (rowId, field) => readRow(rowId)?.[field],
        getFormula: (rowId, field) => {
          const f = readRow(rowId)?.[`${field}_formula`];
          return typeof f === 'string' ? f : undefined;
        },
      });
      const tR = rowOrder.indexOf(target.rowId);
      const tC = colOrder.indexOf(target.field);
      const srcR0 = rowOrder.indexOf(drag.srcRows[0]);
      const srcR1 = rowOrder.indexOf(drag.srcRows[drag.srcRows.length - 1]);
      const srcC0 = colOrder.indexOf(drag.srcCols[0]);
      const srcC1 = colOrder.indexOf(drag.srcCols[drag.srcCols.length - 1]);
      if (tR === -1 || tC === -1 || srcR0 === -1 || srcC0 === -1) return;
      void applyRangeWrite(
        cells,
        { r0: srcR0, c0: srcC0, r1: Math.max(srcR1, tR), c1: Math.max(srcC1, tC) },
        'Filled',
      );
    },
    [getRowOrder, getColOrder, readRow, applyRangeWrite],
  );

  // ── Paste (Ctrl+V) — TSV range from the clipboard ───────────────────
  const handleGridPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const text = e.clipboardData?.getData('text/plain');
      if (!text || text.trim() === '') return;
      const anchor = lastClickedCell;
      if (!anchor) {
        showCopyToast('Click a cell first to anchor the paste');
        return;
      }
      e.preventDefault();
      const rowOrder = getRowOrder();
      const colOrder = getColOrder();
      const aR = rowOrder.indexOf(anchor.rowId);
      const aC = colOrder.indexOf(anchor.field);
      if (aR === -1 || aC === -1) return;
      const grid = parseTsv(text);
      const rowsById = new Map<GridRowId, Record<string, unknown>>(rows.map((r) => [(r._rowIndex ?? r.id) as GridRowId, r]));
      const anchorRow = rowsById.get(anchor.rowId) as Record<string, unknown> | undefined;
      const { cells, skipped, newRows } = buildPasteCells({
        grid,
        anchorRowIdx: aR,
        anchorColIdx: aC,
        rowOrder,
        colOrder,
        rowsById,
        formulaMode,
        anchorExcelRow: Number(anchorRow?._excelRow) || undefined,
      });
      if (cells.length === 0) {
        showCopyToast(skipped > 0 ? 'Paste is outside the table bounds' : 'Nothing to paste');
        return;
      }
      // Select the whole pasted rect (anchor → last pasted cell), Excel-style.
      const lastR = Math.min(aR + grid.length - 1, rowOrder.length - 1);
      const lastC = Math.min(aC + grid[0].length - 1, colOrder.length - 1);
      const extra = newRows > 0 ? ` + ${newRows} new row${newRows !== 1 ? 's' : ''}` : '';
      const note = skipped > 0 ? ` (${skipped} outside table)` : '';
      void applyRangeWrite(cells, { r0: aR, c0: aC, r1: lastR, c1: lastC }, `Pasted${extra}${note}`);
    },
    [lastClickedCell, getRowOrder, getColOrder, rows, formulaMode, applyRangeWrite, showCopyToast],
  );

  const getCellKey = useCallback((rowId: GridRowId, field: string): string => {
    return `${rowId}|${field}`;
  }, []);

  // Cell selection is fully store-driven: plain click / Ctrl+click / Shift+click /
  // drag all dispatch to the sheetViewer slice from the wrapper's pointer
  // handlers. onCellClick is reserved for the formula-builder picking mode
  // (append the clicked cell's Excel reference, e.g. "D6"; Shift+click appends
  // a range ":D9") — and must never mutate selection while picking.
  const handleCellClick = useCallback(
    (params: GridCellParams, event: React.MouseEvent<HTMLElement>) => {
      const picker = formulaPickerRef.current;
      if (!picker?.active) return;
      const cellRef = (params.row as Record<string, unknown>)[`${params.field}_cell`];
      if (typeof cellRef === 'string' && cellRef.length > 0) {
        picker.append(cellRef, event.shiftKey);
        // The grid moves focus to the clicked cell on mouseup — put the caret
        // back into the formula editor so typing continues into the formula.
        picker.focus?.();
      }
    },
    [],
  );

  // ── Drag-to-select multiple cells (store-driven pointer events) ───────
  // MUI X v9 does not expose onCellMouse* DataGrid props, and apiRef event
  // subscriptions would need an effect — so the wrapper Box around the grid
  // handles pointer events directly and dispatches every transition to the
  // sheetViewer slice (single source of truth, zero effect-based wiring).
  const resolveCellFromEvent = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): { rowId: GridRowId; field: string } | null => {
      const target = e.target as HTMLElement | null;
      if (!target) return null;
      const cellEl = target.closest('.MuiDataGrid-cell');
      if (!cellEl) return null;
      const field = cellEl.getAttribute('data-field');
      if (!field) return null;
      const rowEl = cellEl.closest('.MuiDataGrid-row');
      const rowIndex = rowEl?.getAttribute('data-rowindex');
      if (rowIndex == null) return null;
      const rowOrder = getRowOrder();
      const rowId = rowOrder[Number(rowIndex)];
      if (rowId == null) return null;
      return { rowId, field };
    },
    [getRowOrder],
  );

  const handleGridPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return; // left button only
      const cell = resolveCellFromEvent(e);
      if (!cell) return;
      if (cell.field === '__check__' || cell.field === ROW_NUMBER_COL) return; // row checkbox / row-number gutter column
      if (formulaPickerRef.current?.active) return; // picking mode → onCellClick handles it
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-formula-editor]')) return; // inside the formula editor
      if (target?.closest('.MuiDataGrid-cell--editing')) return; // active edit session

      const rowOrder = getRowOrder();
      const colOrder = getColOrder();

      // ── Touch gestures (mobile) ─────────────────────────────────
      if (e.pointerType === 'touch') {
        if (touchSelectMode) {
          // Selection mode is armed: any touch drag grows the selection from
          // this cell (touch-action: none prevents panning while armed).
          dispatch(dragStart(cell));
          return;
        }
        // First touch on a cell: wait for a stationary long-press (scroll
        // gestures move >10px and cancel the timer), then arm selection mode.
        const press = touchPressRef.current;
        if (press.timer) clearTimeout(press.timer);
        touchPressRef.current = {
          x: e.clientX,
          y: e.clientY,
          fired: false,
          timer: setTimeout(() => {
            touchPressRef.current.fired = true;
            dispatch(dragStart(cell));
            // Haptic confirmation where supported (iOS Safari: no-op).
            try {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10);
            } catch {
              /* not supported */
            }
          }, 400),
        };
        return;
      }

      // ── Mouse / pen ─────────────────────────────────────────────
      if (e.ctrlKey || e.metaKey) {
        dispatch(toggleCell(cell)); // non-contiguous toggle
      } else if (e.shiftKey) {
        dispatch(shiftSelectRange({ current: cell, rowOrder, colOrder })); // range from last anchor
      } else {
        dispatch(dragStart(cell)); // plain click / drag start
      }
    },
    [resolveCellFromEvent, getRowOrder, getColOrder, dispatch, touchSelectMode],
  );

  const handleGridPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // A pending touch long-press is really a scroll once the finger moves
      // beyond the threshold — cancel it so scrolling stays native.
      if (e.pointerType === 'touch') {
        const press = touchPressRef.current;
        if (press.timer) {
          const dx = e.clientX - press.x;
          const dy = e.clientY - press.y;
          if (Math.hypot(dx, dy) > 10) {
            clearTimeout(press.timer);
            press.timer = null;
          }
        }
      }
      // Formula picking: track the hovered cell so the row/column reference
      // indicators (row-number gutter + column letter) highlight where the
      // next picked reference will point. No drag/selection in picking mode.
      if (formulaPickerRef.current?.active) {
        const cell = resolveCellFromEvent(e);
        setPickingHover(cell);
        return;
      }
      if (!dragActive) return;
      const cell = resolveCellFromEvent(e);
      if (!cell) return;
      dispatch(dragMove({ current: cell, rowOrder: getRowOrder(), colOrder: getColOrder() }));
    },
    [dragActive, resolveCellFromEvent, getRowOrder, getColOrder, dispatch],
  );

  const handleGridPointerUp = useCallback(
    (e?: React.PointerEvent<HTMLDivElement>) => {
      const press = touchPressRef.current;
      if (press.timer) {
        clearTimeout(press.timer);
        press.timer = null;
      }
      // A completed long-press arms touch-selection mode for the NEXT gesture:
      // the finger-lift selects the anchor cell, then dragging grows the range.
      if (press.fired && e?.pointerType === 'touch') {
        dispatch(setTouchSelectMode(true));
      }
      press.fired = false;
      setPickingHover(null);
      dispatch(dragEnd());
    },
    [dispatch],
  );

  // While the formula builder is in cell-picking mode, prevent mousedown on
  // grid cells from stealing focus (which would end the edit session). Runs in
  // the capture phase on the wrapper so it precedes the cell's own mousedown.
  const handleGridMouseDownCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target || target.closest('[data-formula-editor]')) return;
    if (formulaPickerRef.current?.active) e.preventDefault();
  }, []);

  // Right-click anywhere on the grid: build the context menu target.
  // - cell: right-click selects the cell (Excel behavior) → use in chat/copy
  // - row (checkbox column): ensures the row is in rowSelectionModel → chat
  // - column header: adds a "Select all cells in column" entry
  const handleGridContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const cellEl = target.closest('.MuiDataGrid-cell');
      const headerEl = target.closest('.MuiDataGrid-columnHeader');

      let kind: 'cell' | 'row' | 'column' | 'none' = 'none';
      let column: string | undefined;

      if (headerEl && !cellEl) {
        const hField = headerEl.getAttribute('data-field') ?? undefined;
        if (hField === ROW_NUMBER_COL || hField === '__check__') {
          return; // row-number gutter / checkbox header — no column context menu
        }
        kind = 'column';
        column = hField;
      } else if (cellEl) {
        const field = cellEl.getAttribute('data-field');
        if (field === '__check__' || field === ROW_NUMBER_COL) {
          kind = 'row';
        } else {
          kind = 'cell';
          column = field ?? undefined;
          // Excel-like: right-click selects the cell under the cursor.
          const rowEl = cellEl.closest('.MuiDataGrid-row');
          const rowIndex = rowEl?.getAttribute('data-rowindex');
          if (rowIndex != null && column) {
            const rowOrder = getRowOrder();
            const rowId = rowOrder[Number(rowIndex)];
            if (rowId != null && !selectedCellSet.has(getCellKey(rowId, column))) {
              dispatch(selectSingleCell({ rowId, field: column }));
            }
          }
        }
      }

      // Row context: ensure the row is selected so "use in chat" includes it.
      if (kind === 'row') {
        const rowEl = target.closest('.MuiDataGrid-row');
        const rowIndex = rowEl?.getAttribute('data-rowindex');
        if (rowIndex != null) {
          const rowOrder = getRowOrder();
          const rowId = rowOrder[Number(rowIndex)];
          if (rowId != null && !rowSelectionModel.ids.has(rowId as GridRowId)) {
            const ids = new Set(rowSelectionModel.ids);
            ids.add(rowId as GridRowId);
            setRowSelectionModel({ type: 'include', ids });
          }
        }
      }

      setCtxMenu({ mouseX: e.clientX, mouseY: e.clientY, target: kind, column });
    },
    [getRowOrder, getCellKey, selectedCellSet, dispatch, rowSelectionModel],
  );

  // ── Context menu actions ──
  const handlePaginationModelChange = useCallback(
    (m: { page: number; pageSize: number }) => {
      setPaginationModel(m);
      // Cell selection is page-scoped — clear it so stale cells never persist.
      dispatch(clearCellSelection());
    },
    [dispatch],
  );

  // Copy selected cells as TSV sub-grid (preserves structure, raw values, headers for selected columns only)
  // Falls back to row copy if no cells selected. Called preferentially on Ctrl+C.
  const copySelectedCells = useCallback(async () => {
    if (effectiveSelectionKeys.size === 0) return false;

    const sd = payload?.data;
    if (!sd || rows.length === 0) {
      showCopyToast('No data available for cell copy');
      return false;
    }

    const selectedRowIds = new Set<string>();
    const selectedFieldsSet = new Set<string>();
    effectiveSelectionKeys.forEach((k) => {
      const [rId, f] = k.split('|');
      selectedRowIds.add(rId);
      selectedFieldsSet.add(f);
    });

    const rowOrder = Array.from(selectedRowIds).sort((a, b) => Number(a) - Number(b));
    const colOrder = columns.map((c) => c.field).filter((f) => selectedFieldsSet.has(f));

    if (rowOrder.length === 0 || colOrder.length === 0) return false;

    const headers = [
      'Row #',
      ...colOrder.map((f) => {
        const colDef = columns.find((c) => c.field === f);
        return colDef?.headerName || String(f);
      }),
    ];

    const tsvRows: string[] = rowOrder.map((rowIdStr) => {
      const rowAny = rows.find(
        (r) => String(r._rowIndex ?? r.id) === rowIdStr
      ) as Record<string, unknown> | undefined;
      if (!rowAny) return '';
      const values = [
        rowIdStr,
        ...colOrder.map((field) => {
          let val = rowAny[field];
          if (val == null) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        }),
      ];
      return values.join('\t');
    });

    const tsvContent = [headers.join('\t'), ...tsvRows].join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      showCopyToast(
        `Copied ${effectiveSelectionKeys.size} cell${effectiveSelectionKeys.size !== 1 ? 's' : ''} ` +
          `(${tsvRows.length}×${colOrder.length}) to clipboard`
      );
      return true;
    } catch (error) {
      console.error('Cell clipboard copy failed:', error);
      showCopyToast('Failed to copy cells to clipboard');
      return false;
    }
  }, [effectiveSelectionKeys, rows, columns, payload, showCopyToast]);

  const handleContextUndo = useCallback(() => {
    setCtxMenu(null);
    dispatch(requestUndo());
  }, [dispatch]);
  const handleContextRedo = useCallback(() => {
    setCtxMenu(null);
    dispatch(requestRedo());
  }, [dispatch]);
  const handleContextUseInChat = useCallback(() => {
    setCtxMenu(null);
    handleSendSelectionToChat();
  }, [handleSendSelectionToChat]);
  const handleContextCopy = useCallback(() => {
    setCtxMenu(null);
    void copySelectedCells();
  }, [copySelectedCells]);
  const handleContextClear = useCallback(() => {
    setCtxMenu(null);
    clearSelectedCells();
  }, [clearSelectedCells]);
  const handleContextToggleColumn = useCallback(() => {
    if (ctxMenu?.column) dispatch(toggleColumn(ctxMenu.column));
    setCtxMenu(null);
  }, [ctxMenu, dispatch]);

  // onCellKeyDown handler to capture Ctrl+C (and Cmd+C on Mac) globally on the grid
  const handleCellKeyDown = useCallback(
    (params: GridCellParams, event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        dispatch(clearCellSelection());
        return;
      }

      // Excel Delete: clear the contents of every selected cell (one undo step).
      if (event.key === 'Delete') {
        event.preventDefault();
        clearSelectedCells();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        // Prioritize effective selection (cells / rows / columns); fallback to row copy
        if (effectiveSelectionKeys.size > 0) {
          copySelectedCells(); // fire-and-forget (handles its own toast + clipboard)
        } else if (rowSelectionModel.ids.size === 0) {
          const singleModel: GridRowSelectionModel = {
            type: 'include' as const,
            ids: new Set([params.id]),
          };
          handleCopySelection(singleModel);
        } else {
          handleCopySelection(rowSelectionModel);
        }
      }
    },
    [dispatch, effectiveSelectionKeys.size, rowSelectionModel, handleCopySelection, copySelectedCells, clearSelectedCells]
  );

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ pl: 1, gap: 1, alignItems: 'center' }}>
      {rowSelectionModel.ids.size > 0 && (
        <Typography
          variant="body2"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            px: 2,
            py: 0.5,
            bgcolor: 'primary.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'primary.100',
          }}
        >
          {rowSelectionModel.ids.size} row{rowSelectionModel.ids.size !== 1 ? 's' : ''} selected
        </Typography>
      )}
      {selectedColumns.length > 0 && (
        <Typography
          variant="body2"
          sx={{
            color: 'warning.main',
            fontWeight: 600,
            px: 2,
            py: 0.5,
            bgcolor: 'warning.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'warning.100',
          }}
        >
          {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
          {selectedColumns.length > 1 ? ' — resize any selected column to apply to all' : ' (Shift+click headers to batch-select)'}
        </Typography>
      )}
      {selectedCells.length > 0 && (
        <Typography
          variant="body2"
          sx={{
            color: 'secondary.main',
            fontWeight: 600,
            px: 2,
            py: 0.5,
            bgcolor: 'secondary.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'secondary.100',
          }}
        >
          {selectedCells.length} cell{selectedCells.length !== 1 ? 's' : ''} selected (Ctrl/Shift)
        </Typography>
      )}
      {touchSelectMode ? (
        <Tooltip title="Touch-selection is on: drag on the table to select multiple cells. Tap to exit.">
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => dispatch(setTouchSelectMode(false))}
            sx={{ textTransform: 'none', borderRadius: 1, px: 1, minHeight: 32 }}
          >
            <TouchAppIcon fontSize="small" sx={{ mr: 0.5 }} />
            Touch-select on
          </Button>
        </Tooltip>
      ) : null}
      <Tooltip title="Undo (Ctrl+Z)">
        <span>
          <IconButton size="small" disabled={!canUndo} onClick={() => dispatch(requestUndo())}>
            <UndoIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Shift+Z)">
        <span>
          <IconButton size="small" disabled={!canRedo} onClick={() => dispatch(requestRedo())}>
            <RedoIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Reload sheet data">
        <IconButton onClick={() => void refetch()} size="small">
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Settings: Select columns to freeze (pin left)">
        <IconButton onClick={handleSettingsClick} size="small">
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      {/* Standard toolbar features can be extended here (filter, density, columns, etc.).
          Built-in MUI export is available via slots but we use custom TSV+headers copy via Ctrl+C.
          Cell selection (Ctrl+click individual, Shift+click range) now supported with copy. */}
    </GridToolbarContainer>
  );

  const handleStatsClick = (event: React.MouseEvent<HTMLElement>) => setStatsAnchor(event.currentTarget);
  const handleStatsClose = () => setStatsAnchor(null);

  // Footer with left-aligned aggregate bar (Excel-style status bar) + default pagination
  const CustomFooter = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, minHeight: 52, width: '100%', overflowX: 'hidden' }}>
      {cellStats && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', py: 0.5, maxWidth: '60%' }}>
          {cellStats.map((s) => (
            <Box
              key={s.label}
              sx={{
                display: 'flex', alignItems: 'baseline', gap: 0.5, whiteSpace: 'nowrap',
                bgcolor: 'action.hover', borderRadius: 1, px: 1, py: 0.25,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {s.label}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{s.value}</Typography>
            </Box>
          ))}
          <Tooltip title="More functions…">
            <IconButton size="small" onClick={handleStatsClick} sx={{ ml: 0.25 }}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="Table settings">
        <IconButton onClick={handleSettingsClick} size="small">
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <GridFooter />
    </Box>
  );

  const data = payload?.data;
  const openSettings = Boolean(settingsAnchor);
  const draftFormulaMode = settingsDraft?.formulaMode ?? formulaMode;
  const draftRowHeight = settingsDraft?.rowHeight ?? rowHeight;
  const draftPinnedColumns = settingsDraft?.pinnedColumns ?? pinnedColumns;

  const getCellClassName = useCallback((params: GridCellParams) => {
    const key = getCellKey(params.id, params.field);
    return effectiveSelectionKeys.has(key) ? 'selected-cell' : '';
  }, [effectiveSelectionKeys, getCellKey]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 66px)', minHeight: 400, width: '100%' }}>
      {/* {title ? (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, flexShrink: 0 }}>
          {title}
        </Typography>
      ) : null} */}

      {!sheet ? (
        <Typography color="text.secondary">No sheet configured.</Typography>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><BrandedLoadingIndicator size={24} /></Box>
      ) : queryError ? (
        <Typography color="error">{String(queryError)}</Typography>
      ) : data ? (
        <>
          {/* The wrapper Box is the drag-selection surface: MUI X v9 has no
              onCellMouse* DataGrid props, so pointer events on the wrapper
              dispatch every selection transition to the sheetViewer slice
              (Redux single source of truth — no effects, no apiRef events). */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              width: '100%',
              // Touch: pan normally, but while touch-selection mode is armed
              // disable panning so drags grow the cell selection instead.
              touchAction: touchSelectMode ? 'none' : 'manipulation',
              // Prevent iOS long-press text-selection/callout from fighting
              // the long-press cell-selection gesture.
              WebkitTouchCallout: 'none',
              '& .MuiDataGrid-cell': { WebkitTouchCallout: 'none', userSelect: 'none' },
              // Excel-style row/column reference highlight while picking.
              ...(pickingHoverSx ?? {}),
            }}
            onPointerDown={handleGridPointerDown}
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
            onPointerCancel={handleGridPointerUp}
            ref={gridWrapRef}
            onMouseDownCapture={handleGridMouseDownCapture}
            onContextMenu={handleGridContextMenu}
            onPaste={handleGridPaste}
            // Grid-internal scrolling doesn't reposition portaled popups, so
            // re-anchor the floating formula builder + fill handle on scroll.
            onScrollCapture={() => {
              formulaPickerRef.current?.reposition?.();
              updateFillHandlePosition();
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              apiRef={apiRef}
              getRowId={(row) => row._rowIndex}
              loading={isLoading}
              rowCount={data.totalRows}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[PER_PAGE]}
              disableRowSelectionOnClick
              checkboxSelection
              // CRITICAL for the freeze pane: MUI virtualizes columns by their
              // NATURAL x-position, so CSS-sticky frozen columns (checkbox,
              // row-number gutter, pinned columns) would be unmounted once
              // scrolled out of their natural viewport range — making the
              // freeze pane disappear. With virtualization disabled every
              // column stays mounted and the sticky offsets hold at any
              // scroll position. (Grid is bounded: PER_PAGE rows × ~35 cols.)
              disableVirtualization
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              onColumnHeaderClick={handleColumnHeaderClick}
              onCellClick={handleCellClick}
              getCellClassName={getCellClassName}
              // disableMultipleColumnsSorting removed (causes type errors in v9 Community edition).
              // Multi-sort now fully managed via onColumnHeaderClick + controlled sortModel (up to 3 cols).
              // Normal click replaces sort; Shift+click adds/toggles/removes from multi-model.
              processRowUpdate={processRowUpdate}
              onCellKeyDown={handleCellKeyDown}
              // While the formula builder is in cell-picking mode, clicking a
              // grid cell must never end the edit session: MUI X publishes
              // `cellFocusOut` on any cell click (its focus management moves to
              // the clicked cell), which would otherwise stop editing and kill
              // the picker after the FIRST picked reference. defaultMuiPrevented
              // runs first (priority listener) and skips the default stop.
              onCellEditStop={(params, event) => {
                if (formulaPickerRef.current?.active && params.reason === 'cellFocusOut') {
                  event.defaultMuiPrevented = true;
                }
              }}
              rowHeight={rowHeight}
              onColumnWidthChange={handleColumnWidthChange}
              slots={{
                toolbar: CustomToolbar,
                footer: CustomFooter,
              }}
              editMode="cell"
              tabNavigation="content" // Tab moves to next cell (Shift+Tab previous), wraps rows
              sx={pinnedSx}
            />

            {/* Fill drag preview: shows exactly which range will be written
                while the handle is being dragged (cleared on release). */}
            {fillPreview && (
              <Box
                sx={{
                  position: 'absolute',
                  top: fillPreview.top,
                  left: fillPreview.left,
                  width: fillPreview.width,
                  height: fillPreview.height,
                  zIndex: 30,
                  pointerEvents: 'none',
                  border: '2px dashed rgba(25,118,210,.7)',
                  bgcolor: 'rgba(25,118,210,.12)',
                  borderRadius: '2px',
                }}
              />
            )}

            {/* Excel-style fill handle: bottom-right corner of the selected
                block. Drag to fill adjacent cells (copy / numeric series /
                formula refs shift). Hidden while editing or for non-contiguous
                selections — exactly when Excel hides it too. */}
            {fillRect && fillSource && (
              <Box
                onPointerDown={handleFillPointerDown}
                onPointerMove={handleFillPointerMove}
                onPointerUp={handleFillPointerUp}
                onPointerCancel={handleFillPointerUp}
                sx={{
                  position: 'absolute',
                  top: fillRect.top + fillRect.height - 5,
                  left: fillRect.left + fillRect.width - 5,
                  width: 10,
                  height: 10,
                  zIndex: 40,
                  cursor: 'crosshair',
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  bgcolor: '#1976d2',
                  boxShadow: '0 1px 3px rgba(0,0,0,.45)',
                  touchAction: 'none',
                  '&:hover': { transform: 'scale(1.2)' },
                }}
              />
            )}
          </Box>

          {/* Grid context menu: undo/redo + selection actions.
              Right-click targets: cell → select it (Excel behavior) and enable
              "Use in chat" / "Copy"; row checkbox → include row in selection;
              column header → additionally select all cells in that column. */}
          <Menu
            open={Boolean(ctxMenu)}
            onClose={() => setCtxMenu(null)}
            anchorReference="anchorPosition"
            anchorPosition={
              ctxMenu ? { top: ctxMenu.mouseY, left: ctxMenu.mouseX } : undefined
            }
          >
            <MenuItem dense onClick={handleContextUndo} disabled={!canUndo}>
              <UndoIcon fontSize="small" sx={{ mr: 1 }} /> Undo
            </MenuItem>
            <MenuItem dense onClick={handleContextRedo} disabled={!canRedo}>
              <RedoIcon fontSize="small" sx={{ mr: 1 }} /> Redo
            </MenuItem>
            <Divider />
            <MenuItem
              dense
              onClick={handleContextUseInChat}
              disabled={effectiveSelectionKeys.size === 0}
            >
              <ChatIcon fontSize="small" sx={{ mr: 1 }} /> Use in chat
            </MenuItem>
            <MenuItem dense onClick={handleContextCopy} disabled={effectiveSelectionKeys.size === 0}>
              <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Copy selected cells
            </MenuItem>
            <MenuItem dense onClick={handleContextClear} disabled={effectiveSelectionKeys.size === 0}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Clear contents (Del)
            </MenuItem>
            {ctxMenu?.target === 'column' && (
              <MenuItem dense onClick={handleContextToggleColumn}>
                {ctxMenu.column && selectedColumns.includes(ctxMenu.column)
                  ? `Deselect column ${ctxMenu.column}`
                  : `Select all cells in ${ctxMenu.column ?? 'column'}`}
              </MenuItem>
            )}
          </Menu>

          {/* Per-column header menu: insert custom column before/after, select column cells */}
          <Menu
            anchorEl={colMenuAnchor}
            open={Boolean(colMenuAnchor)}
            onClose={() => setColMenuAnchor(null)}
          >
            <MenuItem dense onClick={() => handleInsertCustomColumn('before')}>
              Add custom column before
            </MenuItem>
            <MenuItem dense onClick={() => handleInsertCustomColumn('after')}>
              Add custom column after
            </MenuItem>
            <Divider />
            <MenuItem dense onClick={handleColumnSelectCells}>
              {colMenuField && selectedColumns.includes(colMenuField)
                ? 'Clear column selection'
                : 'Select all cells in column'}
            </MenuItem>
          </Menu>

          {/* Inline dialog for naming a custom column inserted from the header menu */}
          <Dialog
            open={Boolean(customColumnDialog)}
            onClose={() => setCustomColumnDialog(null)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Add custom column</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                size="small"
                label="Column name"
                value={customColumnName}
                onChange={(e) => setCustomColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleCreateCustomColumnFromDialog();
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Custom columns overlay the sheet — formulas and cell input keep their exact Excel positions.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button size="small" onClick={() => setCustomColumnDialog(null)}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!customColumnName.trim()}
                onClick={() => void handleCreateCustomColumnFromDialog()}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>

          {/* Settings Popover for selectable freeze columns */}
          <Popover
            open={openSettings}
            anchorEl={settingsAnchor}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <List sx={{ width: 280, pt: 1 }}>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={draftFormulaMode}
                      onChange={(e) =>
                        setSettingsDraft((prev) =>
                          prev ? { ...prev, formulaMode: e.target.checked } : prev,
                        )
                      }
                      size="small"
                    />
                  }
                  label="Formula mode"
                  sx={{ width: '100%', mx: 0 }}
                />
              </ListItem>
              <Typography variant="caption" sx={{ px: 3, pb: 1, display: 'block', color: 'text.secondary' }}>
                Enable Excel formula editing &amp; evaluation. Off by default — cells are stored as plain values.
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <ListItem>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<ChatIcon fontSize="small" />}
                  disabled={effectiveSelectionKeys.size === 0}
                  onClick={handleSendSelectionToChat}
                  sx={{ mx: 2 }}
                >
                  Send selected cells to AI chat
                </Button>
              </ListItem>
              <Typography variant="caption" sx={{ px: 3, pb: 1, display: 'block', color: 'text.secondary' }}>
                {effectiveSelectionKeys.size > 0
                  ? `Will send ${effectiveSelectionKeys.size} selected cell${effectiveSelectionKeys.size !== 1 ? 's' : ''} (cells, rows & columns) as data for the AI prompt.`
                  : 'Select cells (Ctrl/Shift click or drag), whole rows (checkboxes) or whole columns (header menu) to enable.'}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <ListItem>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                  Row Height
                </Typography>
              </ListItem>
              <ListItem dense>
                <Slider
                  size="small"
                  min={36}
                  max={96}
                  step={2}
                  value={draftRowHeight}
                  onChange={handleRowHeightChange}
                  sx={{ mx: 2 }}
                />
              </ListItem>
              <ListItem dense>
                <Typography variant="caption" sx={{ px: 2, display: 'block', color: 'text.secondary' }}>
                  {draftRowHeight} px — click Save to apply (stored per sheet)
                </Typography>
              </ListItem>
              <Divider sx={{ mb: 1 }} />
              <ListItem>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                  Freeze Columns (Pin Left)
                </Typography>
              </ListItem>
              {data.columns.map((col: string) => (
                <ListItem key={col} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={draftPinnedColumns.includes(col)}
                        onChange={() =>
                          setSettingsDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.pinnedColumns.includes(col)
                              ? prev.pinnedColumns.filter((f) => f !== col)
                              : [...prev.pinnedColumns, col];
                            return { ...prev, pinnedColumns: next };
                          })
                        }
                        size="small"
                      />
                    }
                    label={col}
                    sx={{ width: '100%', mx: 0 }}
                  />
                </ListItem>
              ))}
              <Divider sx={{ mb: 1 }} />
              <ListItem>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                  Custom Columns
                </Typography>
              </ListItem>
              {customColumns.length > 0 && (
                <Box sx={{ px: 2, pb: 1, maxHeight: 140, overflowY: 'auto' }}>
                  {customColumns.map((cc) => (
                    <Box key={cc.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                        {cc.name}
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                          {' '}· col {cc.position + 1}
                        </Typography>
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label={`Delete custom column ${cc.name}`}
                        onClick={() => handleDeleteCustomColumn(cc.id, cc.name)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ px: 2, pb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Column name (e.g. Notes)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={creatingCustom}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="Position"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    sx={{ minWidth: 130 }}
                  >
                    <MenuItem value="end">At end</MenuItem>
                    {data.columns.map((col: string, idx: number) => (
                      <MenuItem key={col} value={String(idx)}>
                        Before &ldquo;{col}&rdquo;
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!customName.trim() || creatingCustom}
                    onClick={handleCreateCustomColumn}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ px: 3, pb: 1, display: 'block', color: 'text.secondary' }}>
                Custom columns overlay the sheet — formulas and cell input keep their exact Excel positions.
              </Typography>
              <Divider sx={{ my: 1 }} />
              <ListItem sx={{ justifyContent: 'flex-end', gap: 1, pb: 2 }}>
                <Button size="small" onClick={handleSettingsClose}>
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!settingsDirty}
                  onClick={() => void handleSettingsSave()}
                >
                  Save
                </Button>
              </ListItem>
            </List>
           </Popover>

          {/* Status-bar function picker (extra aggregates) */}
          <Popover
            open={Boolean(statsAnchor)}
            anchorEl={statsAnchor}
            onClose={handleStatsClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <List sx={{ width: 240, maxHeight: 360, overflowY: 'auto', pt: 1 }}>
              <ListItem>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                  Additional Stats
                </Typography>
              </ListItem>
              {STAT_OPTIONS.map((fn) => (
                <ListItem key={fn} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={extraStats.includes(fn)}
                        onChange={() => dispatch(toggleExtraStat(fn))}
                        size="small"
                      />
                    }
                    label={fn}
                    sx={{ width: '100%', mx: 0 }}
                  />
                </ListItem>
              ))}
            </List>
          </Popover>
         </>
       ) : null}

       {/* Copy success notification */}
       <Snackbar
         open={snackbarOpen}
         autoHideDuration={2500}
         onClose={() => setSnackbarOpen(false)}
         message={snackbarMessage}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
       />
     </Box>
   );
 }

