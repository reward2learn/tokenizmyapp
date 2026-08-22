'use client';

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
import { MonthSelect } from '@/components/ui/month-select';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
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
          {/* Self-loading month dropdown — drives KPI / chart / P&L via Redux */}
          <MonthSelect />
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Z-Report" />
            <Tab label="Projections" />
            <Tab label="Breakdown" />
          </Tabs>
        </Paper>

        <TabPanel value={tab} index={0}>
          <KpiCardsBlock config={{ variant: 'ops', showMonthSelect: false }} />
          <ReportsRollupBlock config={{}} />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <ChartFinancialBlock config={{ variant: 'ops' }} />
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <PnlTableBlock config={{ showMonthSelect: false }} />
        </TabPanel>
      </Box>
    </AuthGate>
  );
}
