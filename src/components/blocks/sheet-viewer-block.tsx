'use client';

import { useCallback, useEffect, useMemo, useState, useRef, type KeyboardEvent } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
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
import SettingsIcon from '@mui/icons-material/Settings';
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
import { GridToolbarContainer, useGridApiRef } from '@mui/x-data-grid';
import { useGetSheetDataQuery, useUpdateSheetCellMutation } from '@/store/apis/sheet-data-api';
import type { UpdateSheetCellParams, SheetDataResponse } from '@/store/apis/sheet-data-api';

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
      if (value >= 1_000_000_000) return `IDR ${(value / 1_000_000_000).toFixed(2)}B`;
      if (value >= 1_000_000) return `IDR ${(value / 1_000_000).toLocaleString('id-ID')}`;
      if (value >= 1_000) return `IDR ${(value / 1_000).toFixed(0)}K`;
      return value.toLocaleString('id-ID');
    }
    return value.toLocaleString('id-ID');
  }
  return String(value);
}

export function SheetViewerBlock({ config }: { config: Record<string, unknown> }) {
  const { sheet, title } = config as SheetViewerConfig;
  // apiRef gives access to the DataGrid's CURRENT display order (post-sort/post-filter)
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PER_PAGE });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include' as const,
    ids: new Set<GridRowId>(),
  });
  // Cell-level multi-selection (Ctrl for individual, Shift for range/grouped cells)
  // Keys are `${rowId}|${field}`. Supports copy via Ctrl+C (prioritized over row selection).
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const lastClickedCellRef = useRef<{ rowId: GridRowId; field: string } | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: payload, isLoading, error: queryError } = useGetSheetDataQuery(
    { sheet: sheet ?? '', page: paginationModel.page + 1, perPage: PER_PAGE },
    { skip: !sheet },
  );

  const [updateSheetCell] = useUpdateSheetCellMutation();

  // Initialize pinned columns to first column when data loads (for freeze example)
  useEffect(() => {
    const sd = payload?.data;
    if (sd && pinnedColumns.length === 0 && sd.columns.length > 0) {
      setPinnedColumns([sd.columns[0]]);
    }
  }, [payload?.data, pinnedColumns.length]);

  // Clear cell selection on pagination or sort changes (prevents stale selections across pages)
  useEffect(() => {
    setSelectedCells(new Set());
    lastClickedCellRef.current = null;
  }, [paginationModel.page, sortModel]);

  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    // Fallback for any external sort model changes (e.g. column menu). For header clicks,
    // we use custom onColumnHeaderClick to support multi-sort in Community edition.
    const limitedModel = newSortModel.slice(0, 3);
    setSortModel(limitedModel);
    console.log("[SheetViewerBlock] Sort model updated (external):", limitedModel);
  }, []);

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
  }, [sortModel]);

  const handleSettingsClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsAnchor(null);
  }, []);

  const togglePinnedColumn = useCallback((colField: string) => {
    setPinnedColumns((prev) =>
      prev.includes(colField)
        ? prev.filter((f) => f !== colField)
        : [...prev, colField]
    );
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
      };

        await updateSheetCell(params).unwrap();
        return newRow; // Optimistic update succeeds - keep new row in UI
      } catch (error) {
        console.error('Failed to update sheet cell:', error);
        // Re-throw to let DataGrid revert the row to old values
        throw error;
      }
    },
    [updateSheetCell, sheet],
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
        editable: true, // All columns editable with write-back
        // Note: pinnedColumns prop requires MUI X Pro. We use CSS sticky workaround below.
        sortIndex, // for reference (also used by custom renderHeader)
        valueGetter: (_value: unknown, row: GridValidRowModel) => {
          const raw = row[col];
          if (isLikelyFinancial(col, raw) && typeof raw === 'number') {
            return raw; // keep numeric for sorting/filtering
          }
          return raw ?? '';
        },
        valueFormatter: (value: unknown) => {
          if (typeof value === 'number' && isLikelyFinancial(col, value)) {
            return formatCellValue(col, value);
          }
          return value ?? '';
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
  }, [payload, pinnedColumns, sortModel]);

  const rows = useMemo(() => {
    const sd = payload?.data as SheetDataResponse | undefined;
    if (!sd) return [];
    return sd.rows.map((row, idx) => ({
      ...row,
      _rowIndex: (sd.page - 1) * sd.perPage + idx + 1,
    }));
  }, [payload]);

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

  // New: Cell-level multi-selection with Ctrl (toggle individual/non-contiguous) + Shift (range/grouped contiguous cells)
  // Range uses bounding box of current page's rows (by _rowIndex order) and columns (display order).
  // Visual highlight via .selected-cell class. Ctrl+C prioritizes cells over row selection.
  const handleCellClick = useCallback(
    (params: GridCellParams, event: React.MouseEvent<HTMLElement>) => {
      const { id: rowId, field } = params;
      const key = getCellKey(rowId, field);
      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      console.log(`[SheetViewerBlock] Cell clicked - rowId:${rowId}, field:${field}, ctrl:${isCtrl}, shift:${isShift}, currentCells:${selectedCells.size}`);

      setSelectedCells((prev) => {
        const newSet = new Set(prev);
        if (isShift && lastClickedCellRef.current) {
          const anchor = lastClickedCellRef.current;
          // Use the DataGrid's CURRENT display order (post-sort/post-filter) so the
          // Shift-range matches what the user visually sees. Fall back to _rowIndex
          // numeric order if the api ref is not ready yet.
          const sortedIds = apiRef.current ? (apiRef.current.getSortedRowIds() as any[]) : null;
          const rowOrder: any[] = sortedIds && sortedIds.length > 0
            ? sortedIds
            : rows
                .map((r: any) => r._rowIndex ?? r.id)
                .sort((a: any, b: any) => Number(a) - Number(b));
          const colOrder = columns.map((c) => c.field);

          const anchorRowIdx = rowOrder.indexOf(anchor.rowId);
          const currentRowIdx = rowOrder.indexOf(rowId);
          const anchorColIdx = colOrder.indexOf(anchor.field);
          const currentColIdx = colOrder.indexOf(field);

          if (
            anchorRowIdx === -1 ||
            currentRowIdx === -1 ||
            anchorColIdx === -1 ||
            currentColIdx === -1
          ) {
            newSet.add(key);
          } else {
            const minR = Math.min(anchorRowIdx, currentRowIdx);
            const maxR = Math.max(anchorRowIdx, currentRowIdx);
            const minC = Math.min(anchorColIdx, currentColIdx);
            const maxC = Math.max(anchorColIdx, currentColIdx);
            for (let rIdx = minR; rIdx <= maxR; rIdx++) {
              for (let cIdx = minC; cIdx <= maxC; cIdx++) {
                const rId = rowOrder[rIdx];
                const f = colOrder[cIdx];
                newSet.add(getCellKey(rId, f));
              }
            }
          }
        } else if (isCtrl) {
          // Toggle individual cell (supports non-contiguous multi-select)
          if (newSet.has(key)) {
            newSet.delete(key);
          } else {
            newSet.add(key);
          }
        } else {
          // Normal click: single cell (clears previous)
          newSet.clear();
          newSet.add(key);
        }
        return newSet;
      });

      lastClickedCellRef.current = { rowId, field };
    },
    [rows, columns, selectedCells, getCellKey, apiRef]
  );

  // Copy selected cells as TSV sub-grid (preserves structure, raw values, headers for selected columns only)
  // Falls back to row copy if no cells selected. Called preferentially on Ctrl+C.
  const copySelectedCells = useCallback(async () => {
    if (selectedCells.size === 0) return false;

    const sd = payload?.data;
    if (!sd || rows.length === 0) {
      showCopyToast('No data available for cell copy');
      return false;
    }

    const selectedRowIds = new Set<string>();
    const selectedFieldsSet = new Set<string>();
    selectedCells.forEach((k) => {
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
        `Copied ${selectedCells.size} cell${selectedCells.size !== 1 ? 's' : ''} ` +
          `(${tsvRows.length}×${colOrder.length}) to clipboard`
      );
      return true;
    } catch (error) {
      console.error('Cell clipboard copy failed:', error);
      showCopyToast('Failed to copy cells to clipboard');
      return false;
    }
  }, [selectedCells, rows, columns, payload, showCopyToast]);

  // onCellKeyDown handler to capture Ctrl+C (and Cmd+C on Mac) globally on the grid
  const handleCellKeyDown = useCallback(
    (params: GridCellParams, event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        setSelectedCells(new Set());
        lastClickedCellRef.current = null;
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        // Prioritize cell selection (Ctrl for multi, Shift for range); fallback to row copy if none
        if (selectedCells.size > 0) {
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
    [selectedCells, rowSelectionModel, handleCopySelection, copySelectedCells]
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
      {selectedCells.size > 0 && (
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
          {selectedCells.size} cell{selectedCells.size !== 1 ? 's' : ''} selected (Ctrl/Shift)
        </Typography>
      )}
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

  const data = payload?.data;
  const openSettings = Boolean(settingsAnchor);

  const getCellClassName = useCallback((params: GridCellParams) => {
    const key = getCellKey(params.id, params.field);
    return selectedCells.has(key) ? 'selected-cell' : '';
  }, [selectedCells, getCellKey]);

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
          <DataGrid
            rows={rows}
            columns={columns}
            apiRef={apiRef}
            getRowId={(row) => row._rowIndex}
            loading={isLoading}
            rowCount={data.totalRows}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
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
            }}
            editMode="cell"
            sx={pinnedSx}
          />

          {/* Settings Popover for selectable freeze columns */}
          <Popover
            open={openSettings}
            anchorEl={settingsAnchor}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <List sx={{ width: 280, pt: 1 }}>
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
                        onChange={() => togglePinnedColumn(col)}
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

