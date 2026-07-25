'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

interface AuditStatsDashboardProps {
  stats?: { total: number; success: number; successRate: number; avgDuration: number };
}

export function AuditStatsDashboard({ stats }: AuditStatsDashboardProps) {
  if (!stats) return <Typography variant="body2" color="text.secondary">No stats available.</Typography>;
  return (
    <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
      <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}><Typography variant="body2" color="text.secondary">Total Runs</Typography><Typography variant="h4">{stats.total}</Typography></Paper>
      <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}><Typography variant="body2" color="text.secondary">Successes</Typography><Typography variant="h4">{stats.success}</Typography></Paper>
      <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}><Typography variant="body2" color="text.secondary">Success Rate</Typography><Typography variant="h4">{stats.successRate.toFixed(1)}%</Typography></Paper>
      <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}><Typography variant="body2" color="text.secondary">Avg Duration</Typography><Typography variant="h4">{stats.avgDuration.toFixed(0)}ms</Typography></Paper>
    </Stack>
  );
}
