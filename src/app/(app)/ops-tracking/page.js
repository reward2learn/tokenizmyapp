'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { KpiCardsBlock } from '@/components/blocks/kpi-cards-block';
import { ChartFinancialBlock } from '@/components/blocks/chart-financial-block';
import { ReportsRollupBlock } from '@/components/blocks/reports-rollup-block';
import { PnlTableBlock } from '@/components/blocks/pnl-table-block';
function TabPanel({ children, value, index }) {
    if (value !== index)
        return null;
    return _jsx(Box, { sx: { pt: 2 }, children: children });
}
export default function OpsTrackingPage() {
    const [tab, setTab] = useState(0);
    return (_jsx(AuthGate, { requiredTier: "google", fallback: _jsx(SignInPanelGate, { requiredTier: "google" }), children: _jsxs(Box, { sx: { mx: 'auto', px: 3, py: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 2 }, children: "Financial Tracking" }), _jsx(Paper, { variant: "outlined", sx: { p: 2 }, children: _jsxs(Tabs, { value: tab, onChange: (_e, v) => setTab(v), variant: "scrollable", scrollButtons: "auto", children: [_jsx(Tab, { label: "Z-Report" }), _jsx(Tab, { label: "Projections" }), _jsx(Tab, { label: "Breakdown" })] }) }), _jsxs(TabPanel, { value: tab, index: 0, children: [_jsx(KpiCardsBlock, { config: { variant: 'ops' } }), _jsx(ReportsRollupBlock, { config: {} })] }), _jsx(TabPanel, { value: tab, index: 1, children: _jsx(ChartFinancialBlock, { config: { variant: 'ops' } }) }), _jsx(TabPanel, { value: tab, index: 2, children: _jsx(PnlTableBlock, { config: {} }) })] }) }));
}
