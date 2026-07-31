'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
import SettingsIcon from '@mui/icons-material/Settings';
import type {
  GridColDef,
  GridValidRowModel,
  GridSortModel,
  GridRowModel,
  GridColumnHeaderParams,
} from '@mui/x-data-grid';
import { GridToolbarContainer } from '@mui/x-data-grid';
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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PER_PAGE });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);

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

  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    // MUI X DataGrid natively supports multi-column sort when holding Shift while clicking headers.
    // The sortModel array order determines priority (first = primary sort).
    // We limit to max 3 sort columns to avoid performance issues.
    const limitedModel = newSortModel.slice(0, 3);
    setSortModel(limitedModel);
    
    console.log("[SheetViewerBlock] Sort model updated:", limitedModel);
  }, []);

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
        const params: UpdateSheetCellParams = {
          sheet: sheetName,
          rowIndex: Number(newRow._rowIndex || newRow.id),
          column: changedField,
          value: newValue,
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

      return {
        field: col,
        headerName: col,
        // Pinned columns get fixed width for better sticky behavior
        flex: isPinned ? 0 : 1,
        minWidth: isPinned ? 140 : 100,
        width: isPinned ? 160 : undefined,
        sortable: true,
        filterable: true,
        resizable: true,
        editable: true, // All columns editable with write-back
        // Note: pinnedColumns prop requires MUI X Pro. We use CSS sticky workaround below.
        sortIndex, // for reference
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
          // Custom header to show sort index (1, 2, 3...) for multi-column sorts
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

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ pl: 1, gap: 1 }}>
      <Tooltip title="Settings: Select columns to freeze (pin left)">
        <IconButton onClick={handleSettingsClick} size="small">
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      {/* Standard toolbar features can be extended here (filter, density, etc.) */}
    </GridToolbarContainer>
  );

  const data = payload?.data;
  const openSettings = Boolean(settingsAnchor);

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
            getRowId={(row) => row._rowIndex}
            loading={isLoading}
            rowCount={data.totalRows}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[PER_PAGE]}
            disableRowSelectionOnClick
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            disableMultipleColumnsSorting={false}  // Explicitly enable multi-column sort
            processRowUpdate={processRowUpdate}
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
    </Box>
  );
}
