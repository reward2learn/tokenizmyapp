'use client';
import React from 'react';
import Grid from '@mui/material/Grid';
import { IntegrationCard } from './integration-card';

interface IntegrationListProps {
  integrations: Array<{ id: string; provider: string; status: string; lastSyncAt?: string | null }>;
  onDisconnect?: (id: string) => void;
  onTest?: (id: string) => void;
}

export function IntegrationList({ integrations, onDisconnect, onTest }: IntegrationListProps) {
  return (
    <Grid container spacing={2}>
      {integrations.map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i.id}>
          <IntegrationCard integration={i} onDisconnect={onDisconnect} onTest={onTest} />
        </Grid>
      ))}
    </Grid>
  );
}
