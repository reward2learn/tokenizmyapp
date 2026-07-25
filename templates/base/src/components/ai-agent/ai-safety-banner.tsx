'use client';
import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

interface AiSafetyBannerProps {
  flags?: string[];
}

export function AiSafetyBanner({ flags }: AiSafetyBannerProps) {
  if (!flags || flags.length === 0) return null;
  return (
    <Alert severity="warning">
      <AlertTitle>Safety Flags Triggered</AlertTitle>
      {flags.join(', ')}
    </Alert>
  );
}
