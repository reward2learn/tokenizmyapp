'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

interface CampaignDetailProps {
  campaign: {
    id: string;
    name: string;
    type: string;
    status: string;
    subject: string;
    body: string;
    audience: string;
    abTest: boolean;
    createdAt: string;
    startedAt?: string | null;
    sentAt?: string | null;
  };
  stats?: { sent: number; opened: number; clicked: number; converted: number; openRate: number; clickRate: number; conversionRate: number };
}

export function CampaignDetail({ campaign, stats }: CampaignDetailProps) {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{campaign.name}</Typography>
          <Chip label={campaign.status} color={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'default'} />
          <Chip label={campaign.type} size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary">Subject: {campaign.subject}</Typography>
        <Typography variant="body2" color="text.secondary">Audience: {campaign.audience}</Typography>
        {campaign.abTest && <Chip label="A/B Test" size="small" sx={{ mt: 1 }} />}
      </Paper>

      {stats && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Performance</Typography>
          <Stack direction="row" sx={{ gap: 3, mb: 2 }}>
            <Box><Typography variant="body2" color="text.secondary">Sent</Typography><Typography variant="h6">{stats.sent}</Typography></Box>
            <Box><Typography variant="body2" color="text.secondary">Opened</Typography><Typography variant="h6">{stats.opened} ({stats.openRate.toFixed(1)}%)</Typography></Box>
            <Box><Typography variant="body2" color="text.secondary">Clicked</Typography><Typography variant="h6">{stats.clicked} ({stats.clickRate.toFixed(1)}%)</Typography></Box>
            <Box><Typography variant="body2" color="text.secondary">Converted</Typography><Typography variant="h6">{stats.converted} ({stats.conversionRate.toFixed(1)}%)</Typography></Box>
          </Stack>
          <LinearProgress variant="determinate" value={stats.openRate} sx={{ mb: 1 }} />
          <Typography variant="caption">Open Rate</Typography>
        </Paper>
      )}
    </Box>
  );
}
