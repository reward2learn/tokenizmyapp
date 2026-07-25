'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

interface LeadCaptureFormProps {
  source?: string;
  onSubmit?: (data: { name: string; email: string; phone?: string; notes?: string }) => void;
}

export function LeadCaptureForm({ source = 'website', onSubmit }: LeadCaptureFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="success.main">Thank you!</Typography>
        <Typography variant="body2">We'll be in touch soon.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Get in Touch</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
          <TextField label="Name" fullWidth required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <TextField label="Email" type="email" fullWidth required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </Stack>
        <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} sx={{ mb: 2 }} />
        <TextField label="Notes" fullWidth multiline rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} sx={{ mb: 2 }} />
        <Button type="submit" variant="contained" fullWidth>Submit</Button>
      </Box>
    </Paper>
  );
}
