'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';

interface CampaignFormProps {
  initial?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

export function CampaignForm({ initial, onSubmit, onCancel }: CampaignFormProps) {
  const [form, setForm] = useState({
    name: (initial?.name as string) ?? '',
    type: (initial?.type as string) ?? 'email',
    audience: (initial?.audience as string) ?? 'all',
    subject: (initial?.subject as string) ?? '',
    body: (initial?.body as string) ?? '',
    scheduledAt: (initial?.scheduledAt as string) ?? '',
    abTest: (initial?.abTest as boolean) ?? false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>{initial?.id ? 'Edit Campaign' : 'New Campaign'}</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField label="Campaign Name" fullWidth required value={form.name} onChange={(e) => handleChange('name', e.target.value)} sx={{ mb: 2 }} />
        <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
          <TextField select label="Type" fullWidth value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="push">Push</MenuItem>
            <MenuItem value="in-app">In-App</MenuItem>
          </TextField>
          <TextField select label="Audience" fullWidth value={form.audience} onChange={(e) => handleChange('audience', e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="subscribers">Subscribers</MenuItem>
            <MenuItem value="leads">Leads</MenuItem>
          </TextField>
        </Stack>
        <TextField label="Subject" fullWidth value={form.subject} onChange={(e) => handleChange('subject', e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Content" fullWidth multiline rows={6} value={form.body} onChange={(e) => handleChange('body', e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Schedule (ISO date)" type="datetime-local" fullWidth value={form.scheduledAt} onChange={(e) => handleChange('scheduledAt', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
        <FormControlLabel control={<Switch checked={form.abTest} onChange={(e) => handleChange('abTest', e.target.checked)} />} label="A/B Test" sx={{ mb: 2 }} />
        <Stack direction="row" sx={{ gap: 2 }}>
          <Button variant="outlined" onClick={onCancel} sx={{ flex: 1 }}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ flex: 2 }}>{initial?.id ? 'Update' : 'Create'} Campaign</Button>
        </Stack>
      </Box>
    </Paper>
  );
}
