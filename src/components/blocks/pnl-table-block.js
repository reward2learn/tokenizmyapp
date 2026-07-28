'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { formatIdr } from '@/lib/chart-utils';
import { useGetChartOverviewQuery, useGetPnlDetailQuery } from '@/store/apis/financial-api';
import { useAppSelector } from '@/store/hooks';
function staffCostPct(revenue, staffCost) {
    if (revenue == null || staffCost == null || revenue === 0)
        return '—';
    return `${((staffCost / revenue) * 100).toFixed(1)}%`;
}
function formatPnlCell(line, value) {
    if (value == null || Number.isNaN(value))
        return '—';
    if (line.pct) {
        const pct = Math.abs(value) <= 1 ? value * 100 : value;
        return `${pct.toFixed(1)}%`;
    }
    if (line.key && /(guests_day|guests_month|fte|_count)$/.test(line.key)) {
        return Math.round(value).toLocaleString('en-ID');
    }
    return formatIdr(value, true);
}
function getKpiAt(actual, forecast, idx) {
    const a = actual?.[idx];
    if (a != null)
        return a;
    const f = forecast?.[idx];
    return f != null ? f : null;
}
export function PnlTableBlock({ config }) {
    parseBlockConfig('pnl_table', config);
    const selectedMonthLabel = useAppSelector((s) => s.ui.selectedMonthLabel);
    const selectedMonthPeriod = useAppSelector((s) => s.ui.selectedMonthPeriod);
    const { data: overviewData } = useGetChartOverviewQuery('conservative');
    const overview = overviewData?.data;
    const monthIndex = useMemo(() => {
        if (!selectedMonthLabel || !overview?.labels)
            return -1;
        return overview.labels.indexOf(selectedMonthLabel);
    }, [selectedMonthLabel, overview?.labels]);
    const period = selectedMonthPeriod ?? '';
    const { data: pnlData, isLoading, isError } = useGetPnlDetailQuery(period, {
        skip: !period,
    });
    const summaryRow = useMemo(() => {
        if (monthIndex < 0 || !overview)
            return null;
        const rev = getKpiAt(overview.actual.revenue, overview.forecast.revenue, monthIndex);
        const ebit = getKpiAt(overview.actual.ebitda, overview.forecast.ebitda, monthIndex);
        const guests = getKpiAt(overview.actual.guests, overview.forecast.guests, monthIndex);
        const sc = getKpiAt(overview.actual.staff_cost, overview.forecast.staff_cost, monthIndex);
        const net = getKpiAt(overview.actual.net_income, overview.forecast.net_income, monthIndex);
        return { rev, ebit, guests, sc, net };
    }, [monthIndex, overview]);
    const breakdownRows = useMemo(() => {
        const scenarios = pnlData?.data?.scenarios;
        if (!scenarios)
            return [];
        const template = scenarios.conservative?.lines?.length
            ? scenarios.conservative.lines
            : scenarios.actual?.lines ?? [];
        const cols = ['actual', 'conservative', 'realistic', 'aspirational'];
        return template.map((line) => {
            const values = {};
            for (const col of cols) {
                const scenarioLines = scenarios[col]?.lines ?? [];
                const match = scenarioLines.find((l) => l.key === line.key);
                values[col] = formatPnlCell(line, match?.value ?? null);
            }
            return { label: line.label ?? line.key ?? '—', values };
        });
    }, [pnlData]);
    return (_jsxs(Box, { component: "section", sx: { maxWidth: 900, mx: 'auto', px: 3, pb: 6 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2 }, children: selectedMonthLabel
                    ? `${selectedMonthLabel} — P&L Detail`
                    : 'Select a month on the chart' }), _jsx(TableContainer, { component: Paper, elevation: 0, sx: { mb: 4, border: '1px solid', borderColor: 'divider' }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Month" }), _jsx(TableCell, { children: "Revenue" }), _jsx(TableCell, { children: "EBITDA" }), _jsx(TableCell, { children: "Guests" }), _jsx(TableCell, { children: "Staff Cost %" }), _jsx(TableCell, { children: "Net Profit" })] }) }), _jsx(TableBody, { children: summaryRow && selectedMonthLabel ? (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("strong", { children: selectedMonthLabel }) }), _jsx(TableCell, { children: formatIdr(summaryRow.rev) }), _jsx(TableCell, { children: formatIdr(summaryRow.ebit, true) }), _jsx(TableCell, { children: summaryRow.guests != null
                                            ? Math.round(summaryRow.guests).toLocaleString('en-ID')
                                            : '—' }), _jsx(TableCell, { children: staffCostPct(summaryRow.rev, summaryRow.sc) }), _jsx(TableCell, { children: formatIdr(summaryRow.net, true) })] })) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", sx: { color: 'text.secondary' }, children: "Click a month bar above to view details" }) })) })] }) }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700, mb: 1.5 }, children: "Monthly P&L Breakdown" }), isLoading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, { size: 28 }) })) : isError || !period ? (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { textAlign: 'center', py: 3 }, children: "P&L detail loads when a month is selected" })) : (_jsx(TableContainer, { component: Paper, elevation: 0, sx: { border: '1px solid', borderColor: 'divider' }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Line Item" }), _jsx(TableCell, { sx: { color: 'primary.main', fontWeight: 600 }, children: "Actuals" }), _jsx(TableCell, { children: "Conservative" }), _jsx(TableCell, { children: "Realistic" }), _jsx(TableCell, { children: "Aspirational" })] }) }), _jsx(TableBody, { children: breakdownRows.length ? (breakdownRows.map((row) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: row.label }), _jsx(TableCell, { sx: { color: 'primary.main', fontWeight: 600 }, children: row.values.actual }), _jsx(TableCell, { children: row.values.conservative }), _jsx(TableCell, { children: row.values.realistic }), _jsx(TableCell, { children: row.values.aspirational })] }, row.label)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, align: "center", sx: { color: 'text.secondary' }, children: "No P&L lines for this period" }) })) })] }) }))] }));
}
