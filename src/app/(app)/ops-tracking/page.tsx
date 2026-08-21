'use client';

import { Suspense, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
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
import { MonthSelect } from '@/components/ui/month-select';
import { useChartMonthSync } from '@/hooks/use-chart-month-sync';
import { useGetChartOverviewQuery } from '@/store/apis/financial-api';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

function OpsTrackingMonthBar() {
  const { data, isLoading } = useGetChartOverviewQuery('conservative');
  const overview = data?.data;
  const labels = overview?.labels ?? [];

  useChartMonthSync(overview, true);

  return <MonthSelect labels={labels} disabled={isLoading || labels.length === 0} />;
}

export default function OpsTrackingPage() {
  const [tab, setTab] = useState(0);

  return (
    <AuthGate requiredTier="google" fallback={<SignInPanelGate requiredTier="google" />}>
      <Box sx={{ mx: 'auto', px: 3, py: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            mb: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Financial Tracking
          </Typography>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 160 }}>
                <CircularProgress size={20} />
              </Box>
            }
          >
            <OpsTrackingMonthBar />
          </Suspense>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Z-Report" />
            <Tab label="Projections" />
            <Tab label="Breakdown" />
          </Tabs>
        </Paper>

        {/* Z-Report tab: KPI cards + reports rollup — month from page header */}
        <TabPanel value={tab} index={0}>
          <KpiCardsBlock config={{ variant: 'ops', showMonthSelect: false }} />
          <ReportsRollupBlock config={{}} />
        </TabPanel>

        {/* Projections tab: financial chart (shares Redux month selection) */}
        <TabPanel value={tab} index={1}>
          <ChartFinancialBlock config={{ variant: 'ops' }} />
        </TabPanel>

        {/* Breakdown tab: P&L table for the selected month */}
        <TabPanel value={tab} index={2}>
          <PnlTableBlock config={{ showMonthSelect: false }} />
        </TabPanel>
      </Box>
    </AuthGate>
  );
}
