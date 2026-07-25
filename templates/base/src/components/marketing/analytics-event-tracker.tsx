'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

interface AnalyticsEventTrackerProps {
  onTrack?: (event: { sessionId: string; eventType: string; page?: string; properties?: Record<string, unknown> }) => void;
}

export function AnalyticsEventTracker({ onTrack }: AnalyticsEventTrackerProps) {
  const [sessionId] = useState(crypto.randomUUID());
  const [eventType, setEventType] = useState('page_view');
  const [page, setPage] = useState('');
  const [properties, setProperties] = useState('{}');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleTrack = async () => {
    try {
      const props = JSON.parse(properties);
      await fetch('/api/marketing/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, eventType, page: page || null, properties: props }),
      });
      setLastResult(`Tracked: ${eventType} on ${page || '(no page)'}`);
      onTrack?.({ sessionId, eventType, page: page || undefined, properties: props });
    } catch (err) {
      setLastResult(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Analytics Event Tracker (Dev)</Typography>
      <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
        <TextField label="Event Type" value={eventType} onChange={(e) => setEventType(e.target.value)} sx={{ flex: 1 }} />
        <TextField label="Page" value={page} onChange={(e) => setPage(e.target.value)} sx={{ flex: 1 }} />
      </Stack>
      <TextField label="Properties (JSON)" fullWidth multiline rows={3} value={properties} onChange={(e) => setProperties(e.target.value)} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleTrack}>Track Event</Button>
      {lastResult && <Typography variant="body2" sx={{ mt: 2 }}>{lastResult}</Typography>}
    </Paper>
  );
}
