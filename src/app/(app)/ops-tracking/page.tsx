'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { KpiCardsBlock } from '@/components/blocks/kpi-cards-block';
import { ChartFinancialBlock } from '@/components/blocks/chart-financial-block';
import { ReportsRollupBlock } from '@/components/blocks/reports-rollup-block';
import { PnlTableBlock } from '@/components/blocks/pnl-table-block';
import { MonthSelect } from '@/components/ui/month-select';
import { ResponsiveTabPanels } from '@/components/shared/responsive-tab-panels';

export default function OpsTrackingPage() {
  const [tab, setTab] = useState('z-report');

  const tabItems = useMemo(
    () => [
      {
        id: 'z-report',
        label: 'Z-Report',
        content: (
          <>
            <KpiCardsBlock config={{ variant: 'ops', showMonthSelect: false }} />
            <ReportsRollupBlock config={{}} />
          </>
        ),
      },
      {
        id: 'projections',
        label: 'Projections',
        content: <ChartFinancialBlock config={{ variant: 'ops' }} />,
      },
      {
        id: 'breakdown',
        label: 'Breakdown',
        content: <PnlTableBlock config={{ showMonthSelect: false }} />,
      },
    ],
    [],
  );

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

        <Paper variant="outlined">
          <ResponsiveTabPanels
            ariaLabel="Financial tracking sections"
            breakpoint="md"
            value={tab}
            onChange={setTab}
            items={tabItems}
          />
        </Paper>
      </Box>
    </AuthGate>
  );
}
