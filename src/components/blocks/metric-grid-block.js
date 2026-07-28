'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { useGetDashboardDataQuery } from '@/store/apis/dashboard-api';
const FALLBACK_ROWS = [
    { metric: 'Monthly Revenue', may: 'IDR 2.24B', conservative: 'IDR 3.52B', realistic: 'IDR 3.75B', aspirational: 'IDR 5.45B' },
    { metric: 'Monthly EBITDA', may: '+IDR 166M', conservative: '+IDR 625M', realistic: '+IDR 697M', aspirational: 'IDR 1.29B', bold: true },
    { metric: 'EBITDA Margin', may: '7.5%', conservative: '21.5%', realistic: '22.5%', aspirational: '28.6%' },
    { metric: 'Guests/Month', may: '4,817', conservative: '8,850', realistic: '9,180', aspirational: '10,110' },
    { metric: 'Avg Spend/Guest', may: '~IDR 544K', conservative: 'IDR 398K', realistic: 'IDR 409K', aspirational: 'IDR 539K' },
];
export function MetricGridBlock({ config }) {
    parseBlockConfig('metric_grid', config);
    const { data, isLoading } = useGetDashboardDataQuery();
    const rows = !isLoading && data?.data?.targetRows?.length
        ? data.data.targetRows
        : (!isLoading ? FALLBACK_ROWS : null);
    if (!rows)
        return null;
    return (_jsxs(Box, { component: "section", sx: { mx: 'auto', px: 3, py: 4 }, children: [_jsx(Typography, { variant: "h5", component: "h2", sx: { fontWeight: 800, textAlign: 'center', mb: 1 }, children: "12-Month Target" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { textAlign: 'center', mb: 3 }, children: "From barely breaking even to industry-leading margins." }), _jsx(TableContainer, { component: Paper, elevation: 0, sx: { border: '1px solid', borderColor: 'divider' }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Metric" }), _jsx(TableCell, { children: "May 2026" }), _jsx(TableCell, { children: "Conservative" }), _jsx(TableCell, { children: "Realistic" }), _jsx(TableCell, { children: "Aspirational" })] }) }), _jsx(TableBody, { children: rows.map((row) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontWeight: row.bold ? 700 : 400 }, children: row.metric }), _jsx(TableCell, { sx: { fontWeight: row.bold ? 700 : 400 }, children: row.may }), _jsx(TableCell, { sx: { fontWeight: row.bold ? 700 : 400 }, children: row.conservative }), _jsx(TableCell, { sx: { fontWeight: row.bold ? 700 : 400 }, children: row.realistic }), _jsx(TableCell, { sx: { fontWeight: row.bold ? 700 : 400 }, children: row.aspirational })] }, row.metric))) })] }) })] }));
}
