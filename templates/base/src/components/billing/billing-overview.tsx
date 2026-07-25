'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { CreditBalanceCard } from './credit-balance-card';

interface BillingOverviewProps {
  balance: number;
  usageThisMonth?: number;
  transactionCount?: number;
}

export function BillingOverview({ balance, usageThisMonth = 0, transactionCount = 0 }: BillingOverviewProps) {
  return (
    <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
      <CreditBalanceCard balance={balance} />
      <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
        <Typography variant="body2" color="text.secondary">Usage This Month</Typography>
        <Typography variant="h4">{usageThisMonth.toLocaleString()}</Typography>
      </Paper>
      <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
        <Typography variant="body2" color="text.secondary">Transactions</Typography>
        <Typography variant="h4">{transactionCount}</Typography>
      </Paper>
    </Stack>
  );
}
