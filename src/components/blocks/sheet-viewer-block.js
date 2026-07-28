'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
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
function formatCellValue(key, value) {
    if (value === '' || value === undefined || value === null)
        return '';
    if (typeof value === 'number') {
        if (isLikelyFinancial(key, value)) {
            if (value >= 1_000_000_000)
                return `IDR ${(value / 1_000_000_000).toFixed(2)}B`;
            if (value >= 1_000_000)
                return `IDR ${(value / 1_000_000).toLocaleString('id-ID')}`;
            if (value >= 1_000)
                return `IDR ${(value / 1_000).toFixed(0)}K`;
            return value.toLocaleString('id-ID');
        }
        return value.toLocaleString('id-ID');
    }
    return String(value);
}
export function SheetViewerBlock({ config }) {
    const { sheet, title } = config;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PER_PAGE });
    const { data: payload, isLoading, error: queryError } = useGetSheetDataQuery({ sheet: sheet ?? '', page: paginationModel.page + 1, perPage: PER_PAGE }, { skip: !sheet });
    const columns = useMemo(() => {
        const sd = payload?.data;
        if (!sd)
            return [];
        return sd.columns.map((col) => ({
            field: col,
            headerName: col,
            flex: 1,
            minWidth: 100,
            sortable: true,
            filterable: true,
            resizable: true,
            valueGetter: (_value, row) => {
                const raw = row[col];
                if (isLikelyFinancial(col, raw) && typeof raw === 'number') {
                    return raw; // keep numeric for sorting
                }
                return raw ?? '';
            },
            valueFormatter: (value) => {
                if (typeof value === 'number' && isLikelyFinancial(col, value)) {
                    return formatCellValue(col, value);
                }
                return value ?? '';
            },
        }));
    }, [payload]);
    const rows = useMemo(() => {
        const sd = payload?.data;
        if (!sd)
            return [];
        return sd.rows.map((row, idx) => ({
            ...row,
            _rowIndex: (sd.page - 1) * sd.perPage + idx + 1,
        }));
    }, [payload]);
    const data = payload?.data;
    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 130px)', minHeight: 400, width: '100%' }, children: [title ? (_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 1, flexShrink: 0 }, children: title })) : null, !sheet ? (_jsx(Typography, { color: "text.secondary", children: "No sheet configured." })) : isLoading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, { size: 24 }) })) : queryError ? (_jsx(Typography, { color: "error", children: String(queryError) })) : data ? (_jsx(DataGrid, { rows: rows, columns: columns, getRowId: (row) => row._rowIndex, loading: isLoading, rowCount: data.totalRows, paginationMode: "server", paginationModel: paginationModel, onPaginationModelChange: setPaginationModel, pageSizeOptions: [PER_PAGE], disableRowSelectionOnClick: true, sx: {
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '& .MuiDataGrid-cell': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                    '& .MuiDataGrid-columnHeader': { fontWeight: 700 },
                } })) : null] }));
}
