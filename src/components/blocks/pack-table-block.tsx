'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import type { GridCellParams, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { GridToolbarContainer } from '@mui/x-data-grid';
import {
  useGetPackTableRowsQuery,
  useGetPackTableMetaQuery,
  useCreatePackTableRowMutation,
  useUpdatePackTableRowMutation,
  useDeletePackTableRowMutation,
} from '@/store/apis/pack-table-api';
import type { PackTableColumnMeta, PackTableListResponse, PackTableMetaResponse, PackTableRow } from '@/store/apis/pack-table-api';

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

// ── Types ────────────────────────────────────────────────────────────────────

export interface PackTableConfig {
  table?: string;
  title?: string;
  pageSize?: number;
  readonly?: boolean;
  columns?: string[];
  minTier?: 'public' | 'pin' | 'google';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Logical column kind derived from the SQL data type reported by /meta. */
function columnKind(dataType: string): 'boolean' | 'integer' | 'decimal' | 'datetime' | 'date' | 'time' | 'json' | 'text' {
  const dt = dataType.toUpperCase();
  if (dt === 'BOOLEAN') return 'boolean';
  if (dt === 'INTEGER' || dt === 'BIGINT' || dt === 'SMALLINT') return 'integer';
  if (dt === 'NUMERIC' || dt === 'DECIMAL' || dt === 'REAL' || dt === 'DOUBLE PRECISION' || dt === 'FLOAT') return 'decimal';
  if (dt === 'TIMESTAMP' || dt === 'TIMESTAMPTZ' || dt === 'DATETIME') return 'datetime';
  if (dt === 'DATE') return 'date';
  if (dt === 'TIME' || dt === 'TIMETZ') return 'time';
  if (dt === 'JSON' || dt === 'JSONB') return 'json';
  return 'text';
}

function humanizeFieldName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatJson(value: unknown): string {
  if (value === undefined || value === null) return '';
  try {
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Extract a human message from RTK Query errors ({ data: { error } } or { error }). */
function getErrorMessage(err: unknown): string {
  if (!err) return 'Something went wrong';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  const obj = err as { data?: unknown; error?: unknown };
  if (obj.data && typeof obj.data === 'object' && 'error' in obj.data) {
    const e = (obj.data as { error?: unknown }).error;
    if (typeof e === 'string' && e) return e;
  }
  if (typeof obj.error === 'string' && obj.error) return obj.error;
  return 'Something went wrong';
}

/**
 * Coerce + validate the dialog form values into the API payload.
 * Empty optional fields are omitted (create) or sent as '' for plain text
 * columns (update — so clearing a field actually clears it). Required fields
 * missing → field errors, dialog stays open.
 */
function buildPayload(
  values: Record<string, unknown>,
  metas: PackTableColumnMeta[],
  mode: 'create' | 'update',
): { payload: Record<string, unknown>; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const payload: Record<string, unknown> = {};
  for (const meta of metas) {
    const kind = columnKind(meta.dataType);
    const raw = values[meta.name];
    const empty = raw === undefined || raw === null || raw === '';
    if (empty) {
      if (meta.required) {
        errors[meta.name] = 'Required';
        continue;
      }
      if (mode === 'update' && kind === 'text') payload[meta.name] = '';
      continue;
    }
    if (kind === 'boolean') {
      payload[meta.name] = Boolean(raw);
      continue;
    }
    if (kind === 'integer') {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        errors[meta.name] = 'Must be a whole number';
        continue;
      }
      payload[meta.name] = n;
      continue;
    }
    if (kind === 'decimal') {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) {
        errors[meta.name] = 'Must be a number';
        continue;
      }
      payload[meta.name] = n;
      continue;
    }
    if (kind === 'json') {
      if (typeof raw === 'object' && raw !== null) {
        payload[meta.name] = raw;
        continue;
      }
      try {
        payload[meta.name] = JSON.parse(String(raw));
      } catch {
        errors[meta.name] = 'Invalid JSON';
      }
      continue;
    }
    if (kind === 'datetime') {
      const s = String(raw);
      if (Number.isNaN(Date.parse(s))) {
        errors[meta.name] = 'Invalid ISO date-time';
        continue;
      }
      payload[meta.name] = s;
      continue;
    }
    payload[meta.name] = String(raw);
  }
  return { payload, errors };
}

// ── Per-type form field (add/edit dialog) ───────────────────────────────────

interface PackTableFormFieldProps {
  meta: PackTableColumnMeta;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
}

function PackTableFormField({ meta, value, error, onChange }: PackTableFormFieldProps) {
  const kind = columnKind(meta.dataType);
  const label = humanizeFieldName(meta.name);
  const fieldId = `pack-table-field-${meta.name}`;

  if (kind === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            id={fieldId}
            checked={Boolean(value)}
            onChange={(e) => onChange(meta.name, e.target.checked)}
          />
        }
        label={label}
      />
    );
  }

  if (kind === 'json') {
    return (
      <TextField
        id={fieldId}
        fullWidth
        size="small"
        multiline
        minRows={3}
        maxRows={8}
        label={label}
        value={value === undefined || value === null ? '' : String(value)}
        onChange={(e) => onChange(meta.name, e.target.value)}
        error={Boolean(error)}
        helperText={error ?? 'JSON object — validated on save'}
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8125rem' } } }}
      />
    );
  }

  const placeholder =
    kind === 'datetime'
      ? 'YYYY-MM-DDTHH:mm:ss.sssZ'
      : kind === 'date'
        ? 'YYYY-MM-DD'
        : kind === 'time'
          ? 'HH:mm:ss'
          : undefined;
  const numeric = kind === 'integer' || kind === 'decimal';

  return (
    <TextField
      id={fieldId}
      fullWidth
      size="small"
      label={label}
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(e) => onChange(meta.name, e.target.value)}
      error={Boolean(error)}
      helperText={error ?? undefined}
      placeholder={placeholder}
      type={numeric ? 'number' : 'text'}
      slotProps={
        numeric
          ? { htmlInput: { step: kind === 'integer' ? '1' : 'any', inputMode: 'decimal' } }
          : undefined
      }
    />
  );
}

/** Grid empty-state overlay. */
function NoRowsOverlay() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Typography color="text.secondary">No rows yet — add the first record.</Typography>
    </Box>
  );
}

// ── Block ────────────────────────────────────────────────────────────────────

export function PackTableBlock({ config }: { config: Record<string, unknown> }) {
  const { table: tableRaw, title, pageSize: pageSizeRaw, readonly, columns: columnsConfig } =
    config as PackTableConfig;
  const table = typeof tableRaw === 'string' && tableRaw.trim() ? tableRaw.trim() : null;
  const pageSize = Math.min(Math.max(Math.floor(typeof pageSizeRaw === 'number' ? pageSizeRaw : 50), 1), 500);
  const isReadonly = readonly === true;
  const configuredColumns =
    Array.isArray(columnsConfig) ? columnsConfig.filter((c): c is string => typeof c === 'string') : undefined;

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');

  // Add/edit dialog state (editingRow === null → create mode).
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, []);

  // Server-side sort: serialize the sort model as JSON [["col","asc"]] pairs
  // (max 3 — the API validates against table metadata).
  const sortByArg = useMemo(
    () =>
      JSON.stringify(
        sortModel
          .slice(0, 3)
          .filter((s): s is { field: string; sort: 'asc' | 'desc' } => s.sort !== null)
          .map((s) => [s.field, s.sort] as [string, 'asc' | 'desc']),
      ),
    [sortModel],
  );

  const { data, isLoading, error: rowsError, refetch } = useGetPackTableRowsQuery({
    table: table ?? '',
    page: paginationModel.page + 1,
    perPage: pageSize,
    sortBy: sortByArg,
    q,
  });
  const { data: metaData, isLoading: metaLoading, error: metaError } = useGetPackTableMetaQuery({
    table: table ?? '',
  });
  // RTK Query hooks return the standard envelope — unwrap to the payload.
  const payload = data?.data as PackTableListResponse | undefined;
  const metaPayload = metaData?.data as PackTableMetaResponse | undefined;

  const [createRow, { isLoading: creating }] = useCreatePackTableRowMutation();
  const [updateRow, { isLoading: updating }] = useUpdatePackTableRowMutation();
  const [deleteRow, { isLoading: deleting }] = useDeletePackTableRowMutation();

  // Debounced search (300ms) — resets to page 1 when the query changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim());
      setPaginationModel((p) => (p.page === 0 ? p : { ...p, page: 0 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // After a delete (or any refetch) the current page may exceed totalPages —
  // clamp back to the last valid page so the grid never sits on an empty page.
  useEffect(() => {
    if (!payload) return;
    if (payload.totalPages > 0 && paginationModel.page + 1 > payload.totalPages) {
      setPaginationModel((p) => ({ ...p, page: Math.max(0, payload.totalPages - 1) }));
    }
  }, [payload, paginationModel.page]);

  const handlePaginationModelChange = useCallback((m: { page: number; pageSize: number }) => {
    setPaginationModel(m);
  }, []);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model.slice(0, 3));
    setPaginationModel((p) => (p.page === 0 ? p : { ...p, page: 0 }));
  }, []);

  const metaByName = useMemo(
    () => new Map((metaPayload?.columns ?? []).map((c) => [c.name, c])),
    [metaPayload],
  );

  const writableMetas = useMemo(
    () =>
      (metaPayload?.writableColumns ?? [])
        .map((name) => metaByName.get(name))
        .filter((m): m is PackTableColumnMeta => Boolean(m)),
    [metaPayload, metaByName],
  );

  // Displayed columns: config subset + order, else id first + writable columns.
  // tenant_slug is always hidden; base columns (id, created_at, updated_at)
  // render read-only when present.
  const visibleFields = useMemo(() => {
    if (!metaPayload) return [];
    const preferred =
      configuredColumns && configuredColumns.length > 0
        ? configuredColumns
        : ['id', ...metaPayload.writableColumns];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const name of preferred) {
      if (name === 'tenant_slug') continue;
      if (!metaByName.has(name) || seen.has(name)) continue;
      seen.add(name);
      out.push(name);
    }
    return out;
  }, [metaPayload, configuredColumns, metaByName]);

  const openAddDialog = useCallback(() => {
    if (isReadonly) return;
    const initial: Record<string, unknown> = {};
    for (const meta of writableMetas) {
      initial[meta.name] = columnKind(meta.dataType) === 'boolean' ? false : '';
    }
    setEditingRow(null);
    setFormValues(initial);
    setFormErrors({});
    setFormOpen(true);
  }, [isReadonly, writableMetas]);

  const openEditDialog = useCallback(
    (row: Record<string, unknown>) => {
      if (isReadonly) return;
      const initial: Record<string, unknown> = {};
      for (const meta of writableMetas) {
        const kind = columnKind(meta.dataType);
        const v = row[meta.name];
        if (kind === 'json') {
          initial[meta.name] = v === undefined || v === null ? '' : JSON.stringify(v, null, 2);
        } else if (kind === 'boolean') {
          initial[meta.name] = Boolean(v);
        } else {
          initial[meta.name] = v === undefined || v === null ? '' : v;
        }
      }
      setEditingRow(row);
      setFormValues(initial);
      setFormErrors({});
      setFormOpen(true);
    },
    [isReadonly, writableMetas],
  );

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingRow(null);
    setFormErrors({});
  }, []);

  const handleFormChange = useCallback((name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!table) return;
    const { payload, errors } = buildPayload(formValues, writableMetas, editingRow ? 'update' : 'create');
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      if (editingRow) {
        await updateRow({ table, id: String(editingRow.id ?? ''), data: payload }).unwrap();
      } else {
        await createRow({ table, data: payload }).unwrap();
      }
      closeForm();
      showSnackbar(editingRow ? 'Row updated' : 'Row created');
      void refetch();
    } catch (err) {
      // Grid keeps old rows — the dialog stays open with the user's input.
      showSnackbar(getErrorMessage(err));
    }
  }, [table, editingRow, formValues, writableMetas, createRow, updateRow, closeForm, showSnackbar, refetch]);

  const handleDelete = useCallback(async () => {
    if (!table || !deleteTarget) return;
    const id = String(deleteTarget.id ?? '');
    try {
      await deleteRow({ table, id }).unwrap();
      setDeleteTarget(null);
      showSnackbar('Row deleted');
      void refetch();
    } catch (err) {
      setDeleteTarget(null);
      showSnackbar(getErrorMessage(err));
    }
  }, [table, deleteTarget, deleteRow, showSnackbar, refetch]);

  const handleCellDoubleClick = useCallback(
    (params: GridCellParams) => {
      if (params.field === 'actions' || isReadonly) return;
      openEditDialog(params.row as Record<string, unknown>);
    },
    [isReadonly, openEditDialog],
  );

  const colDefs: GridColDef[] = useMemo(() => {
    const cols: GridColDef[] = visibleFields.map((name) => {
      const meta = metaByName.get(name);
      const kind = columnKind(meta?.dataType ?? 'TEXT');
      const base: GridColDef = {
        field: name,
        headerName: name,
        sortable: true,
        filterable: false,
        resizable: true,
        editable: false, // editing happens in the dialog, never inline
      };
      switch (kind) {
        case 'boolean':
          return {
            ...base,
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
              <Checkbox
                size="small"
                checked={Boolean(params.value)}
                disabled
                slotProps={{ input: { 'aria-label': humanizeFieldName(name) } }}
              />
            ),
          };
        case 'integer':
          return {
            ...base,
            width: 130,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (v: unknown) =>
              typeof v === 'number' ? v.toLocaleString('en-US') : (v ?? ''),
          };
        case 'decimal':
          return {
            ...base,
            width: 140,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (v: unknown) =>
              typeof v === 'number'
                ? v.toLocaleString('en-US', { maximumFractionDigits: 2 })
                : (v ?? ''),
          };
        case 'datetime':
          return { ...base, width: 230 };
        case 'date':
          return { ...base, width: 140 };
        case 'time':
          return { ...base, width: 110 };
        case 'json':
          return {
            ...base,
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
              <Typography
                noWrap
                title={formatJson(params.value)}
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              >
                {formatJson(params.value)}
              </Typography>
            ),
          };
        default:
          return { ...base, flex: 1, minWidth: 140 };
      }
    });

    if (!isReadonly) {
      cols.push({
        field: 'actions',
        headerName: '',
        width: 132,
        sortable: false,
        filterable: false,
        resizable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const row = params.row as Record<string, unknown>;
          const rowId = String(row.id ?? '');
          return (
            <Stack direction="row" spacing={0.25} sx={{ height: '100%', alignItems: 'center' }}>
              <Tooltip title="Edit row">
                <IconButton
                  size="small"
                  aria-label={`Edit row ${rowId}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(row);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete row">
                <IconButton
                  size="small"
                  aria-label={`Delete row ${rowId}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(row);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      });
    }
    return cols;
  }, [visibleFields, metaByName, isReadonly, openEditDialog]);

  const rows: PackTableRow[] = payload?.rows ?? [];
  const totalRows = payload?.totalRows ?? 0;
  const displayTitle = title ?? (table ? humanizeFieldName(table) : '');
  const saving = creating || updating;

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ pl: 1, pr: 1, py: 0.5, gap: 1, alignItems: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
        {displayTitle}
      </Typography>
      <TextField
        size="small"
        placeholder="Search…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        aria-label={`Search ${displayTitle}`}
        sx={{ maxWidth: 280, width: '100%' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Box sx={{ flexGrow: 1 }} />
      {!isReadonly && (
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
          Add
        </Button>
      )}
      <Tooltip title="Refresh">
        <IconButton size="small" aria-label="Refresh" onClick={() => void refetch()}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </GridToolbarContainer>
  );
  // Missing table config → friendly empty state (hooks above still run).
  if (!table) {
    return (
      <Box
        sx={{
          p: 3,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">Configure a pack table for this block</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: { xs: 460, sm: 580 } }}>
      {metaLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <BrandedLoadingIndicator size={24} />
        </Box>
      ) : metaError ? (
        <Typography color="error" sx={{ py: 2 }}>
          {getErrorMessage(metaError)}
        </Typography>
      ) : rowsError ? (
        <Typography color="error" sx={{ py: 2 }}>
          {getErrorMessage(rowsError)}
        </Typography>
      ) : (
        <DataGrid
          rows={rows}
          columns={colDefs}
          getRowId={(row) => String((row as Record<string, unknown>).id ?? '')}
          loading={isLoading}
          rowCount={totalRows}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[pageSize]}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          onCellDoubleClick={handleCellDoubleClick}
          density="compact"
          slots={{ toolbar: CustomToolbar, noRowsOverlay: NoRowsOverlay }}
          sx={{
            border: '1px solid',
            borderColor: 'var(--app-text-muted)',
            borderRadius: 1,
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& .MuiDataGrid-columnHeader': { fontWeight: 700 },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'background.paper' },
          }}
        />
      )}

      {/* Add / edit dialog — per-type inputs */}
      <Dialog open={formOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRow ? 'Edit row' : 'Add row'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {writableMetas.map((meta) => (
              <PackTableFormField
                key={meta.name}
                meta={meta}
                value={formValues[meta.name]}
                error={formErrors[meta.name]}
                onChange={handleFormChange}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={closeForm}>
            Cancel
          </Button>
          <Button size="small" variant="contained" disabled={saving} onClick={() => void handleSave()}>
            {editingRow ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete row</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Permanently delete row{' '}
            <Box component="span" sx={{ fontFamily: 'monospace' }}>
              {String(deleteTarget?.id ?? '')}
            </Box>
            ? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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