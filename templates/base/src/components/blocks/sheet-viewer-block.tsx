'use client';

import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import type { GridColDef, GridValidRowModel, GridRowSelectionModel, GridCellParams, GridRowId } from '@mui/x-data-grid';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { useGetSheetDataQuery } from '@/store/apis/sheet-data-api';

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

interface SheetDataPayload {
  sheet: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
  perPage: number;
  totalPages: number;
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
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include' as const,
    ids: new Set<GridRowId>(),
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { data: payload, isLoading, error: queryError } = useGetSheetDataQuery(
    { sheet: sheet ?? '', page: paginationModel.page + 1, perPage: PER_PAGE },
    { skip: !sheet },
  );

  const columns: GridColDef[] = useMemo(() => {
    const sd = payload?.data;
    if (!sd) return [];
    return sd.columns.map((col) => ({
      field: col,
      headerName: col,
      flex: 1,
      minWidth: 100,
      sortable: true,
      filterable: true,
      resizable: true,
      valueGetter: (_value: unknown, row: GridValidRowModel) => {
        const raw = row[col];
        if (isLikelyFinancial(col, raw) && typeof raw === 'number') {
          return raw; // keep numeric for sorting
        }
        return raw ?? '';
      },
      valueFormatter: (value: unknown) => {
        if (typeof value === 'number' && isLikelyFinancial(col, value)) {
          return formatCellValue(col, value);
        }
        return value ?? '';
      },
    }));
  }, [payload]);

  const rows = useMemo(() => {
    const sd = payload?.data;
    if (!sd) return [];
    return sd.rows.map((row, idx) => ({
      ...row,
      _rowIndex: (sd.page - 1) * sd.perPage + idx + 1,
    }));
  }, [payload]);

  // Show toast for copy feedback
  const showCopyToast = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, []);

  const handleCopySelection = useCallback(
    async (selectionModel: GridRowSelectionModel) => {
      const selectedIds = Array.from(selectionModel.ids);
      if (selectedIds.length === 0) {
        showCopyToast('No rows selected');
        return;
      }

      const sd = payload?.data as SheetDataPayload | undefined;
      if (!sd || rows.length === 0) {
        showCopyToast('No data available');
        return;
      }

      const colFields = sd.columns; // simple order from payload
      const headers = ['Row #', ...colFields];

      const selectedRowData = rows.filter((row: any) => {
        const rowId = (row as any)._rowIndex ?? (row as any).id;
        return selectedIds.includes(rowId as GridRowId);
      });

      const tsvRows = selectedRowData.map((row: any) => {
        const values = [
          row._rowIndex || row.id || '',
          ...colFields.map((field) => {
            let val = row[field];
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
        showCopyToast(`Copied ${selectedRowData.length} rows to clipboard`);
      } catch (error) {
        console.error('Clipboard copy failed:', error);
        showCopyToast('Failed to copy to clipboard');
      }
    },
    [payload, rows, showCopyToast]
  );

  const handleCellKeyDown = useCallback(
    (params: GridCellParams, event: KeyboardEvent<HTMLElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        if (rowSelectionModel.ids.size === 0) {
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
    [rowSelectionModel, handleCopySelection]
  );

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ pl: 1, gap: 1, alignItems: 'center' }}>
      {rowSelectionModel.ids.size > 0 && (
        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
          {rowSelectionModel.ids.size} row{rowSelectionModel.ids.size !== 1 ? 's' : ''} selected
        </Typography>
      )}
      {/* Custom toolbar with selection count; Ctrl+C for TSV copy with headers */}
    </GridToolbarContainer>
  );

  const data = payload?.data;
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
          checkboxSelection
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
          onCellKeyDown={handleCellKeyDown}
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            // Freeze first column (CSS workaround — MUI Community doesn't support pinnedColumns)
            ...(columns[0] ? {
              [`& .MuiDataGrid-columnHeader[data-field="${columns[0].field}"]`]: {
                position: 'sticky', left: 0, zIndex: 3, bgcolor: 'background.paper',
              },
              [`& .MuiDataGrid-cell[data-field="${columns[0].field}"]`]: {
                position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper',
              },
            } : {}),

            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            '& .MuiDataGrid-cell': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
            '& .MuiDataGrid-columnHeader': { fontWeight: 700 },
          }}
        />
      ) : null}

      {/* Copy notification */}
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
