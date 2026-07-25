'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface IntegrationCardProps {
  integration: { id: string; provider: string; status: string; lastSyncAt?: string | null };
  onDisconnect?: (id: string) => void;
  onTest?: (id: string) => void;
}

export function IntegrationCard({ integration, onDisconnect, onTest }: IntegrationCardProps) {
  return (
    <Card sx={{ minWidth: 240 }}>
      <CardContent>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">{integration.provider}</Typography>
          <Chip label={integration.status} size="small" color={integration.status === 'connected' ? 'success' : 'default'} />
        </Stack>
        {integration.lastSyncAt && <Typography variant="caption" color="text.secondary">Last sync: {new Date(integration.lastSyncAt).toLocaleString()}</Typography>}
        <Stack direction="row" sx={{ gap: 1, mt: 2 }}>
          {onTest && <Button size="small" variant="outlined" onClick={() => onTest(integration.id)}>Test</Button>}
          {onDisconnect && <Button size="small" color="error" onClick={() => onDisconnect(integration.id)}>Disconnect</Button>}
        </Stack>
      </CardContent>
    </Card>
  );
}
