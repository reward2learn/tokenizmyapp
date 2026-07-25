'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

interface BookingFormProps {
  productName: string;
  productId: string;
  onSubmit: (data: { date: string; time: string; partySize: number; notes: string; contactName: string; contactEmail: string; contactPhone: string }) => void;
  onCancel: () => void;
}

export function BookingForm({ productName, productId, onSubmit, onCancel }: BookingFormProps) {
  const [form, setForm] = useState({
    date: '',
    time: '',
    partySize: 1,
    notes: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Book {productName}</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
          <TextField label="Date" type="date" fullWidth required value={form.date} onChange={(e) => handleChange('date', e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Time" type="time" fullWidth required value={form.time} onChange={(e) => handleChange('time', e.target.value)} InputLabelProps={{ shrink: true }} />
        </Stack>
        <TextField label="Party Size" type="number" fullWidth required value={form.partySize} onChange={(e) => handleChange('partySize', parseInt(e.target.value) || 1)} inputProps={{ min: 1, max: 50 }} sx={{ mb: 2 }} />
        <TextField label="Contact Name" fullWidth required value={form.contactName} onChange={(e) => handleChange('contactName', e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Contact Email" type="email" fullWidth required value={form.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Contact Phone" fullWidth value={form.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Notes" fullWidth multiline rows={3} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} sx={{ mb: 2 }} />
        <Stack direction="row" sx={{ gap: 2 }}>
          <Button variant="outlined" onClick={onCancel} sx={{ flex: 1 }}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ flex: 2 }}>Confirm Booking</Button>
        </Stack>
      </Box>
    </Paper>
  );
}
