'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useGetReportsQuery } from '@/store/apis/financial-api';
import { useGetSheetDataQuery } from '@/store/apis/sheet-data-api';
const DataGrid = dynamic(() => import('@mui/x-data-grid').then((m) => ({ default: m.DataGrid })), {
    ssr: false,
    loading: () => (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, { size: 24 }) })),
});
const PER_PAGE = 100;
function isLikelyFinancial(key, value) {
    if (typeof value === 'number' && Math.abs(value) > 1000)
        return true;
    const k = key.toLowerCase();
    return /amount|total|sales|revenue|cost|price|balance|amount|sum|income|expense/i.test(k);
}
function SheetDataView({ sheet, title }) {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PER_PAGE });
    const { data: payload, isLoading, error: queryError } = useGetSheetDataQuery({ sheet, page: paginationModel.page + 1, perPage: PER_PAGE });
    const data = payload?.data;
    const error = queryError ? (queryError instanceof Error ? queryError.message : 'Request failed') : null;
    const columns = useMemo(() => {
        if (!data)
            return [];
        return data.columns.map((col) => ({
            field: col,
            headerName: col,
            flex: 1,
            minWidth: 100,
            sortable: true,
            filterable: true,
            resizable: true,
            valueGetter: (_value, row) => {
                const raw = row[col];
                if (isLikelyFinancial(col, raw) && typeof raw === 'number')
                    return raw;
                return raw ?? '';
            },
            valueFormatter: (value) => {
                if (typeof value === 'number' && isLikelyFinancial(col, value)) {
                    if (value >= 1_000_000_000)
                        return `IDR ${(value / 1_000_000_000).toFixed(2)}B`;
                    if (value >= 1_000_000)
                        return `IDR ${(value / 1_000_000).toLocaleString('id-ID')}`;
                    if (value >= 1_000)
                        return `IDR ${(value / 1_000).toFixed(0)}K`;
                    return value.toLocaleString('id-ID');
                }
                return value ?? '';
            },
        }));
    }, [data]);
    const rows = useMemo(() => {
        if (!data)
            return [];
        return data.rows.map((row, idx) => ({
            ...row,
            _rowIndex: (data.page - 1) * data.perPage + idx + 1,
        }));
    }, [data]);
    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 140px)', minHeight: 400, mx: 'auto', px: 3, py: 1.5 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2, flexShrink: 0 }, children: title ?? `${sheet} — Data` }), isLoading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, { size: 24 }) })) : error ? (_jsx(Typography, { color: "error", children: error })) : data ? (_jsx(DataGrid, { rows: rows, columns: columns, getRowId: (row) => row._rowIndex, loading: isLoading, rowCount: data.totalRows, paginationMode: "server", paginationModel: paginationModel, onPaginationModelChange: setPaginationModel, pageSizeOptions: [PER_PAGE], disableRowSelectionOnClick: true, sx: {
                    flex: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '& .MuiDataGrid-cell': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                    '& .MuiDataGrid-columnHeader': { fontWeight: 700 },
                } })) : null] }));
}
// ── Z-Report rollup view (default, when no sheet config) ──
function formatIdr(value) {
    if (value == null)
        return '—';
    const n = typeof value === 'bigint' ? Number(value) : Number(value);
    if (Number.isNaN(n))
        return '—';
    return `IDR ${Math.round(n).toLocaleString('en-ID')}`;
}
function periodLabel(row, period) {
    if (period === 'daily')
        return String(row.date ?? '—');
    if (period === 'weekly') {
        const start = row.period_start;
        if (start instanceof Date)
            return start.toISOString().slice(0, 10);
        return String(start ?? '—').slice(0, 10);
    }
    return String(row.month ?? '—');
}
const PERIOD_TABS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
];
function ZReportRollupView() {
    const [period, setPeriod] = useState('monthly');
    const { data, isLoading, isError } = useGetReportsQuery({ period });
    const metrics = (data?.data?.metrics ?? []);
    return (_jsxs(Box, { component: "section", sx: { mx: 'auto', px: 3, py: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2 }, children: "Z-Report Rollup" }), _jsx(Paper, { elevation: 0, sx: { border: '1px solid', borderColor: 'divider', mb: 2 }, children: _jsx(Tabs, { value: period, onChange: (_e, value) => setPeriod(value), variant: "scrollable", scrollButtons: "auto", children: PERIOD_TABS.map((tab) => _jsx(Tab, { value: tab.value, label: tab.label }, tab.value)) }) }), isLoading ? _jsx(Typography, { color: "text.secondary", children: "Loading reports\u2026" }) : null, isError ? _jsx(Typography, { color: "error", children: "Failed to load reports." }) : null, !isLoading && !isError ? (_jsx(Paper, { elevation: 0, sx: { border: '1px solid', borderColor: 'divider', overflow: 'auto' }, children: _jsxs(Table, { size: "small", "data-testid": "reports-rollup-table", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Period" }), _jsx(TableCell, { align: "right", children: "Revenue" }), _jsx(TableCell, { align: "right", children: "Guests" }), _jsx(TableCell, { align: "right", children: "Avg Spend" }), _jsx(TableCell, { align: "right", children: "GoFood" }), _jsx(TableCell, { align: "right", children: "Dine-In" })] }) }), _jsx(TableBody, { children: metrics.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No Z-report data for this period." }) }) })) : (metrics.map((row, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: periodLabel(row, period) }), _jsx(TableCell, { align: "right", children: formatIdr(row.revenue) }), _jsx(TableCell, { align: "right", children: String(row.guests_count ?? '—') }), _jsx(TableCell, { align: "right", children: formatIdr(row.avg_spend) }), _jsx(TableCell, { align: "right", children: formatIdr(row.gofood_revenue) }), _jsx(TableCell, { align: "right", children: formatIdr(row.direct_orders) })] }, `${periodLabel(row, period)}-${index}`)))) })] }) })) : null] }));
}
// ── Main component — dispatches based on config ─────────
export function ReportsRollupBlock({ config }) {
    const sheet = config?.sheet;
    if (sheet) {
        return _jsx(SheetDataView, { sheet: sheet, title: config?.title });
    }
    return _jsx(ZReportRollupView, {});
}
