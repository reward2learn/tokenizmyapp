'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FinancialChart } from '@/components/charts/financial-chart';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { CHART_KPIS, KPI_LABELS, SCENARIO_TARGETS, labelToPeriod, } from '@/lib/chart-utils';
import { useChartMonthSync } from '@/hooks/use-chart-month-sync';
import { useGetChartOverviewQuery } from '@/store/apis/financial-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setChartKpi, setChartScenario, setSelectedMonth, } from '@/store/ui-slice';
const VALID_KPIS = ['ebitda', 'revenue', 'net_income', 'guests', 'staff_cost'];
const SCENARIOS = ['conservative', 'realistic', 'aspirational'];
function parseKpiParam(value) {
    if (value && VALID_KPIS.includes(value))
        return value;
    return 'ebitda';
}
export function ChartFinancialBlock({ config }) {
    return (_jsx(Suspense, { fallback: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 6 }, children: _jsx(CircularProgress, { size: 28 }) }), children: _jsx(ChartFinancialBlockInner, { config: config }) }));
}
function ChartFinancialBlockInner({ config }) {
    const parsed = parseBlockConfig('chart_financial', config);
    const variant = parsed.variant ?? 'dashboard';
    const height = parsed.height ?? (variant === 'ops' ? 320 : 300);
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const chartKpi = useAppSelector((s) => s.ui.chartKpi);
    const chartScenario = useAppSelector((s) => s.ui.chartScenario);
    const selectedMonthLabel = useAppSelector((s) => s.ui.selectedMonthLabel);
    const scenario = chartScenario ?? (parsed.scenario === 'actual' ? 'conservative' : parsed.scenario ?? 'conservative');
    const conservativeQ = useGetChartOverviewQuery('conservative');
    const realisticQ = useGetChartOverviewQuery('realistic', { skip: variant !== 'ops' });
    const aspirationalQ = useGetChartOverviewQuery('aspirational', { skip: variant !== 'ops' });
    const dashboardQ = useGetChartOverviewQuery(scenario, { skip: variant === 'ops' });
    const primaryData = variant === 'ops' ? conservativeQ.data?.data : dashboardQ.data?.data;
    useChartMonthSync(primaryData, variant === 'ops');
    useEffect(() => {
        const kpiParam = searchParams.get('kpi');
        const scenarioParam = searchParams.get('scenario');
        if (kpiParam)
            dispatch(setChartKpi(parseKpiParam(kpiParam)));
        if (scenarioParam && SCENARIOS.includes(scenarioParam)) {
            dispatch(setChartScenario(scenarioParam));
        }
    }, [searchParams, dispatch]);
    const isLoading = variant === 'ops'
        ? conservativeQ.isLoading || realisticQ.isLoading || aspirationalQ.isLoading
        : dashboardQ.isLoading;
    const isError = variant === 'ops'
        ? conservativeQ.isError || realisticQ.isError || aspirationalQ.isError
        : dashboardQ.isError;
    const labels = primaryData?.labels ?? [];
    const kpi = chartKpi;
    const actualSeries = primaryData?.actual?.[kpi] ?? [];
    const forecastSeries = primaryData?.forecast?.[kpi] ?? [];
    const selectedIndex = useMemo(() => {
        if (!selectedMonthLabel || !labels.length)
            return null;
        const idx = labels.indexOf(selectedMonthLabel);
        return idx >= 0 ? idx : null;
    }, [selectedMonthLabel, labels]);
    const scenarioForecasts = useMemo(() => {
        if (variant !== 'ops')
            return undefined;
        return {
            conservative: conservativeQ.data?.data?.forecast?.[kpi],
            realistic: realisticQ.data?.data?.forecast?.[kpi],
            aspirational: aspirationalQ.data?.data?.forecast?.[kpi],
        };
    }, [variant, kpi, conservativeQ.data, realisticQ.data, aspirationalQ.data]);
    const updateUrl = useCallback((params) => {
        const url = new URL(globalThis.location.href);
        for (const [key, val] of Object.entries(params)) {
            if (val)
                url.searchParams.set(key, val);
            else
                url.searchParams.delete(key);
        }
        globalThis.history.replaceState(null, '', url.toString());
    }, []);
    const handleKpiChange = (next) => {
        dispatch(setChartKpi(next));
        updateUrl({ kpi: next });
    };
    const handleScenarioChange = (next) => {
        dispatch(setChartScenario(next));
        updateUrl({ scenario: next });
    };
    const handleMonthClick = (index, label) => {
        if (index == null || !label) {
            dispatch(setSelectedMonth({ label: null, period: null }));
            updateUrl({ month: null });
            return;
        }
        dispatch(setSelectedMonth({
            label,
            period: labelToPeriod(label),
        }));
        updateUrl({ month: label.replace(' ', '+') });
    };
    const targets = SCENARIO_TARGETS[kpi] ?? SCENARIO_TARGETS.ebitda;
    const kpiFilters = variant === 'dashboard' ? CHART_KPIS : VALID_KPIS;
    return (_jsxs(Box, { component: "section", sx: { maxWidth: 900, mx: 'auto', px: 3, py: 2 }, children: [_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 0.5 }, children: variant === 'ops' ? 'Financial Projections' : 'Profitability Overview' }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1.5, fontSize: '0.78rem' }, children: variant === 'ops'
                            ? 'Actual operational KPIs compared against business review projections.'
                            : `Monthly ${KPI_LABELS[kpi]} — Actual vs Forecast` }), _jsx(ButtonGroup, { size: "small", sx: { mb: variant === 'dashboard' ? 2 : 1 }, children: kpiFilters.map((key) => (_jsx(Button, { variant: kpi === key ? 'contained' : 'outlined', onClick: () => handleKpiChange(key), sx: { textTransform: 'none', fontSize: '0.82rem' }, children: KPI_LABELS[key] }, key))) }), variant === 'ops' ? (_jsx(ButtonGroup, { size: "small", sx: { mb: 2, display: 'flex', flexWrap: 'wrap' }, children: SCENARIOS.map((s) => (_jsx(Button, { variant: scenario === s ? 'contained' : 'outlined', onClick: () => handleScenarioChange(s), sx: { textTransform: 'capitalize', flex: 1, fontSize: '0.82rem' }, children: s }, s))) })) : null] }), variant === 'dashboard' ? (_jsx(Box, { sx: { display: 'flex', gap: 1.25, mb: 2, flexWrap: 'wrap' }, children: ['conservative', 'realistic', 'aspirational'].map((key) => (_jsxs(Paper, { elevation: 0, sx: {
                        flex: 1,
                        minWidth: 130,
                        p: 1.5,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                    }, children: [_jsx(Typography, { variant: "caption", sx: {
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'block',
                                mb: 0.5,
                            }, children: key.charAt(0).toUpperCase() + key.slice(1) }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: targets[key] }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["Target ", targets.label] })] }, key))) })) : null, _jsx(Paper, { elevation: 0, sx: {
                    p: 2,
                    bgcolor: '#1a1a22',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    mb: 1,
                }, children: _jsx(FinancialChart, { kpi: kpi, labels: labels, actual: actualSeries, forecast: forecastSeries, scenarioForecasts: scenarioForecasts, variant: variant, height: height, selectedIndex: selectedIndex, onMonthClick: handleMonthClick, isLoading: isLoading, isError: isError }) }), _jsxs(Box, { sx: {
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    fontSize: '0.72rem',
                    color: 'text.secondary',
                    alignItems: 'center',
                }, children: [_jsx(LegendDot, { color: "#22c55e", label: "Actual" }), _jsx(LegendDot, { color: "#f59e0b", label: "Forecast" }), _jsx(LegendDot, { color: "#3b82f6", label: "Cumulative" }), _jsx(LegendDot, { color: "rgba(255,255,255,0.08)", label: "Current month" }), selectedMonthLabel ? (_jsxs(Typography, { component: "span", variant: "caption", sx: { ml: 'auto', color: 'primary.main' }, children: ["\u25B6 ", selectedMonthLabel] })) : null] })] }));
}
function LegendDot({ color, label }) {
    return (_jsxs(Box, { component: "span", sx: { display: 'inline-flex', alignItems: 'center', gap: 0.5 }, children: [_jsx(Box, { component: "span", sx: { width: 10, height: 10, borderRadius: 0.5, bgcolor: color, display: 'inline-block' } }), label] }));
}
