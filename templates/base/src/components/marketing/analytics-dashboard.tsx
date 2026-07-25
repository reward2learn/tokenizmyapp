'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';

interface DashboardStats {
  totalPageViews: number;
  totalTrafficSources: number;
  totalConversions: number;
  totalEvents: number;
  topPages: Array<[string, number]>;
  topSources: Array<[string, number]>;
  conversionRate: number;
}

interface AnalyticsDashboardProps {
  stats?: DashboardStats;
  loading?: boolean;
}

export function AnalyticsDashboard({ stats, loading }: AnalyticsDashboardProps) {
  if (loading) {
    return <LinearProgress />;
  }

  if (!stats) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No data available.</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" sx={{ gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}>
          <Typography variant="body2" color="text.secondary">Page Views</Typography>
          <Typography variant="h4">{stats.totalPageViews}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}>
          <Typography variant="body2" color="text.secondary">Traffic Sources</Typography>
          <Typography variant="h4">{stats.totalTrafficSources}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}>
          <Typography variant="body2" color="text.secondary">Conversions</Typography>
          <Typography variant="h4">{stats.totalConversions}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 120 }}>
          <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
          <Typography variant="h4">{stats.conversionRate.toFixed(1)}%</Typography>
        </Paper>
      </Stack>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Top Pages</Typography>
        <Table>
          <TableHead>
            <TableRow><TableCell>Page</TableCell><TableCell>Views</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {stats.topPages.map(([page, views]) => (
              <TableRow key={page}>
                <TableCell>{page}</TableCell>
                <TableCell>{views}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Traffic Sources</Typography>
        <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
          {stats.topSources.map(([source, count]) => (
            <Paper key={source} sx={{ p: 2, minWidth: 100, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">{source}</Typography>
              <Typography variant="h6">{count}</Typography>
              <LinearProgress variant="determinate" value={stats.totalTrafficSources > 0 ? (count / stats.totalTrafficSources) * 100 : 0} />
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
