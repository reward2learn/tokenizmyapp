'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

interface IntegrationDetailProps {
  integration: { id: string; provider: string; status: string; config: Record<string, unknown>; lastSyncAt?: string | null };
}

export function IntegrationDetail({ integration }: IntegrationDetailProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{integration.provider}</Typography>
        <Chip label={integration.status} color={integration.status === 'connected' ? 'success' : 'default'} />
      </Stack>
      <Typography variant="subtitle2">Configuration:</Typography>
      <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, overflow: 'auto' }}>{JSON.stringify(integration.config, null, 2)}</Box>
      {integration.lastSyncAt && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Last sync: {new Date(integration.lastSyncAt).toLocaleString()}</Typography>}
    </Paper>
  );
}
