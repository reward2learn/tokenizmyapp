'use client';

import { useCallback, useEffect, useMemo, useState, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
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
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import type {
  GridColDef,
  GridValidRowModel,
  GridSortModel,
  GridRowModel,
  GridColumnHeaderParams,
  GridRowSelectionModel,
  GridCellParams,
  GridRowId,
} from '@mui/x-data-grid';
import { GridToolbarContainer, useGridApiRef, GridFooter, GridEditInputCell } from '@mui/x-data-grid';
import type { GridRenderEditCellParams } from '@mui/x-data-grid';
import { useGetSheetDataQuery, useUpdateSheetCellMutation } from '@/store/apis/sheet-data-api';
import type { UpdateSheetCellParams, SheetDataResponse } from '@/store/apis/sheet-data-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendStreamingMessage } from '@/store/chat-stream-slice';
import { setChatDrawerOpen } from '@/store/ui-slice';
import { buildCellsPrompt, type PromptRow } from '@/lib/sheet-prompt';
import {
  setFormulaMode,
  toggleCell,
  shiftSelectRange,
  dragStart,
  dragMove,
  dragEnd,
  clearCellSelection,
  togglePinnedColumn,
  toggleExtraStat,
  selectFormulaMode,
  selectDragActive,
  selectSelectedCells,
  selectPinnedColumns,
  selectExtraStats,
  selectTouchSelectMode,
  setTouchSelectMode,
} from '@/store/sheet-viewer-slice';

const DataGrid = dynamic(
  () => import('@mui/x-data-grid').then((m) => ({ default: m.DataGrid })),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
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

function isLikelyFinancial(key: string, value: unknown): boolean {
  if (typeof value === 'number' && Math.abs(value) > 1000) return true;
  const k = key.toLowerCase();
  return /amount|total|sales|revenue|cost|price|balance|amount|sum|income|expense/i.test(k);
}

function formatCellValue(key: string, value: unknown): string | number {
  if (value === '' || value === undefined || value === null) return '';
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

  // Expose picker state + popup repositioning to the grid-level handlers.
  useEffect(() => {
    pickerRef.current = { active: picker, append, reposition };
    return () => {
      if (pickerRef.current) pickerRef.current = null;
    };
  }, [picker, append, reposition, pickerRef]);

  if (!isFormulaMode) {
    const { pickerRef: _pickerRef, ...rest } = props;
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
  const { sheet, title } = config as SheetViewerConfig;
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
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include' as const,
    ids: new Set<GridRowId>(),
  });
  // Formula-builder cell-picking handle (set by the active FormulaEditCell)
  const formulaPickerRef = useRef<FormulaPickerHandle | null>(null);
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

  const { data: payload, isLoading, error: queryError, refetch } = useGetSheetDataQuery(
    { sheet: sheet ?? '', page: paginationModel.page + 1, perPage: PER_PAGE, formulas: formulaMode ? 1 : 0 },
    { skip: !sheet },
  );

  const [updateSheetCell] = useUpdateSheetCellMutation();

  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    // Fallback for any external sort model changes (e.g. column menu). For header clicks,
    // we use custom onColumnHeaderClick to support multi-sort in Community edition.
    const limitedModel = newSortModel.slice(0, 3);
    setSortModel(limitedModel);
    // Cell selection is page/view-scoped — stale selections must not leak across views.
    dispatch(clearCellSelection());
    console.log("[SheetViewerBlock] Sort model updated (external):", limitedModel);
  }, [dispatch]);

  /**
   * Custom multi-column sort handler for MUI X Community edition.
   * - Normal click: replaces sortModel with this column only (cycles asc → desc → none)
   * - Shift+Click: adds to multi-sort (append as lowest priority, asc), or toggles direction/remove if already present
   * - Max 3 columns
   * - Uses event.defaultMuiPrevented to bypass default single-column sort behavior
   * - Console logs added for Shift key debugging
   */
  const handleColumnHeaderClick = useCallback((
    params: GridColumnHeaderParams,
    event: React.MouseEvent<HTMLElement>
  ) => {
    const field = params.field;
    console.log(`[SheetViewerBlock] Column header clicked - field: "${field}", shiftKey: ${event.shiftKey}, currentSortModel:`, sortModel);

    if (field === '__check__' || field === 'actions') {
      return;
    }

    // Prevent default MUI sort behavior so we can fully control multi-sort
    (event as any).defaultMuiPrevented = true;

    const currentModel = [...sortModel];
    const existingIdx = currentModel.findIndex((s) => s.field === field);
    let newModel: GridSortModel = [];

    if (!event.shiftKey) {
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
      // Shift+Click: manage multi-sort (add/remove/toggle up to 3 columns)
      if (existingIdx !== -1) {
        // Already present: cycle asc -> desc -> remove (preserves priority order for others)
        const currentDir = currentModel[existingIdx].sort;
        if (currentDir === 'asc') {
          currentModel[existingIdx] = { field, sort: 'desc' };
          newModel = currentModel;
          console.log(`[SheetViewerBlock] Shift+click: toggled "${field}" to desc (position ${existingIdx + 1})`);
        } else {
          // desc -> remove from model
          newModel = currentModel.filter((s) => s.field !== field);
          console.log(`[SheetViewerBlock] Shift+click: removed "${field}" from multi-sort`);
        }
      } else {
        // Not present: add at end with asc (if under limit)
        if (currentModel.length >= 3) {
          console.log('[SheetViewerBlock] Max 3 sort columns reached - cannot add more');
          newModel = currentModel;
        } else {
          newModel = [...currentModel, { field, sort: 'asc' }];
          console.log(`[SheetViewerBlock] Shift+click: added "${field}" as sort #${newModel.length}`);
        }
      }
    }

    setSortModel(newModel);
    dispatch(clearCellSelection());
  }, [sortModel, dispatch]);

  const handleSettingsClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsAnchor(null);
  }, []);

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
    [updateSheetCell, sheet, formulaMode],
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

    return orderedColumnFields.map((col) => {
      const isPinned = pinnedSet.has(col);
      const sortIndex = sortModel.findIndex((s) => s.field === col);
      // Update column sortDirection based on current sortModel so DataGrid shows correct arrows
      // and header state. sortIndex is used both for column metadata and badge display (1, 2, 3).
      const sortDirection = sortIndex >= 0 ? sortModel[sortIndex].sort : null;

      return {
        field: col,
        headerName: col,
        // Pinned columns get fixed width for better sticky behavior
        flex: isPinned ? 0 : 1,
        minWidth: isPinned ? 140 : 100,
        width: isPinned ? 160 : undefined,
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
          if (isLikelyFinancial(col, raw) && typeof raw === 'number') {
            return raw; // keep numeric for sorting/filtering
          }
          return raw ?? '';
        },
        valueFormatter: (value: unknown, row: GridValidRowModel) => {
          if (typeof value === 'number' && isLikelyFinancial(col, value)) {
            return formatCellValue(col, value);
          }
          // Unevaluable formulas have no cached value — show the formula text
          // so the user can see the cell is formula-driven.
          // Formula text is only shown when formula mode is enabled.
          if (formulaMode && (value === '' || value === null || value === undefined)) {
            const formula = (row as Record<string, unknown>)[`${col}_formula`];
            if (typeof formula === 'string' && formula.length > 0) return formula;
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
        valueParser: (value: unknown) => {
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
          // Keep custom renderHeader that shows sort numbers (1, 2, 3) for multi-column sort.
          // The badge appears next to column name based on position in sortModel.
          const index = sortIndex >= 0 ? sortIndex + 1 : null;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {params.colDef.headerName}
              {index !== null && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
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
                  }}
                >
                  {index}
                </Box>
              )}
            </Box>
          );
        },
      };
    });
  }, [payload, pinnedColumns, sortModel, formulaMode]);

  const rows = useMemo(() => {
    const sd = payload?.data as SheetDataResponse | undefined;
    if (!sd) return [];
    return sd.rows.map((row, idx) => ({
      ...row,
      _rowIndex: (sd.page - 1) * sd.perPage + idx + 1,
    }));
  }, [payload]);

  // Current display order (post-sort/post-filter) for range math — mirrors what
  // the user sees, falling back to page order when the grid isn't mounted yet.
  const getRowOrder = useCallback((): GridRowId[] => {
    const sortedIds = apiRef.current ? (apiRef.current.getSortedRowIds() as GridRowId[]) : [];
    return sortedIds.length > 0
      ? sortedIds
      : rows.map((r: any) => r._rowIndex ?? r.id);
  }, [apiRef, rows]);

  const getColOrder = useCallback((): string[] => columns.map((c) => c.field), [columns]);

  // Compute Excel-style aggregates over the currently selected cells
  const cellStats = useMemo(() => {
    if (selectedCellSet.size < 2) return null; // only for multi-cell selections
    const rowById = new Map(rows.map((r: any) => [r._rowIndex, r]));
    const all: unknown[] = [];
    selectedCellSet.forEach((key) => {
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
  }, [selectedCellSet, rows, extraStats]);

  // Dynamic sticky styles for user-selected pinned columns (Community edition workaround)
  // NOTE: True column pinning with auto-width handling, resize support, and scroll sync
  // requires MUI X Data Grid Pro. This CSS approach has limitations:
  // - Fixed approximate widths; does not auto-adjust on column resize
  // - May have z-index/overlap issues with filters or other features
  // - Reordering pinned columns via state controls left position order
  const pinnedSx = useMemo(() => {
    const sx: Record<string, any> = {
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

    let currentLeft = 0;
    const pinnedWidth = 160; // Matches the fixed width we set for pinned cols
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

      currentLeft += pinnedWidth;
    });

    return sx;
  }, [pinnedColumns]);

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
    if (!sd || rows.length === 0 || selectedCells.length === 0) return '';
    return buildCellsPrompt({
      sheet: sd.sheet,
      rows: rows as PromptRow[],
      colOrder: columns.map((c) => c.field),
      selectedKeys: selectedCells,
    });
  }, [payload, rows, selectedCells, columns]);

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
      `Sent ${selectedCells.length} cell${selectedCells.length !== 1 ? 's' : ''} to AI chat`
    );
    handleSettingsClose();
  }, [buildSelectionPrompt, dispatch, chatMessages, selectedCells.length, showCopyToast, handleSettingsClose]);

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
      const colFields = columns.map((c) => c.field);
      const headers = [
        'Row #',
        ...colFields.map((f) => {
          const colDef = columns.find((c) => c.field === f);
          return colDef?.headerName || String(f);
        }),
      ];

      const selectedRowData = rows.filter((row) => {
        const rowId = (row as any)._rowIndex ?? (row as any).id;
        return selectedIds.includes(rowId as GridRowId);
      });

      const tsvRows = selectedRowData.map((row) => {
        const rowAny = row as any;
        const values = [
          rowAny._rowIndex || rowAny.id || '',
          ...colFields.map((field: string) => {
            let val = rowAny[field];
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
      if (cell.field === '__check__') return; // row checkbox column
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
    if (selectedCellSet.size === 0) return false;

    const sd = payload?.data;
    if (!sd || rows.length === 0) {
      showCopyToast('No data available for cell copy');
      return false;
    }

    const selectedRowIds = new Set<string>();
    const selectedFieldsSet = new Set<string>();
    selectedCellSet.forEach((k) => {
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
        (r: any) => String(r._rowIndex ?? r.id) === rowIdStr
      ) as any;
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
        `Copied ${selectedCellSet.size} cell${selectedCellSet.size !== 1 ? 's' : ''} ` +
          `(${tsvRows.length}×${colOrder.length}) to clipboard`
      );
      return true;
    } catch (error) {
      console.error('Cell clipboard copy failed:', error);
      showCopyToast('Failed to copy cells to clipboard');
      return false;
    }
  }, [selectedCellSet, rows, columns, payload, showCopyToast]);

  // onCellKeyDown handler to capture Ctrl+C (and Cmd+C on Mac) globally on the grid
  const handleCellKeyDown = useCallback(
    (params: GridCellParams, event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        dispatch(clearCellSelection());
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        // Prioritize cell selection (Ctrl for multi, Shift for range); fallback to row copy if none
        if (selectedCells.length > 0) {
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
    [dispatch, selectedCells, rowSelectionModel, handleCopySelection, copySelectedCells]
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

  const getCellClassName = useCallback((params: GridCellParams) => {
    const key = getCellKey(params.id, params.field);
    return selectedCellSet.has(key) ? 'selected-cell' : '';
  }, [selectedCellSet, getCellKey]);

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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
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
            }}
            onPointerDown={handleGridPointerDown}
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
            onPointerCancel={handleGridPointerUp}
            onMouseDownCapture={handleGridMouseDownCapture}
            // Grid-internal scrolling doesn't reposition portaled popups, so
            // re-anchor the floating formula builder on every scroll.
            onScrollCapture={() => formulaPickerRef.current?.reposition?.()}
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
              slots={{
                toolbar: CustomToolbar,
                footer: CustomFooter,
              }}
              editMode="cell"
              tabNavigation="content" // Tab moves to next cell (Shift+Tab previous), wraps rows
              sx={pinnedSx}
            />
          </Box>

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
                      checked={formulaMode}
                      onChange={(e) => dispatch(setFormulaMode(e.target.checked))}
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
                  disabled={selectedCells.length === 0}
                  onClick={handleSendSelectionToChat}
                  sx={{ mx: 2 }}
                >
                  Send selected cells to AI chat
                </Button>
              </ListItem>
              <Typography variant="caption" sx={{ px: 3, pb: 1, display: 'block', color: 'text.secondary' }}>
                {selectedCells.length > 0
                  ? `Will send ${selectedCells.length} selected cell${selectedCells.length !== 1 ? 's' : ''} as data for the AI prompt.`
                  : 'Select cells (Ctrl/Shift click or drag) to enable.'}
              </Typography>
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
                        checked={pinnedColumns.includes(col)}
                        onChange={() => dispatch(togglePinnedColumn(col))}
                        size="small"
                      />
                    }
                    label={col}
                    sx={{ width: '100%', mx: 0 }}
                  />
                </ListItem>
              ))}
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

