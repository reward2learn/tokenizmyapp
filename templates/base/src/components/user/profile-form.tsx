'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ProfileFormProps {
  profile?: { name?: string; email?: string; phone?: string; avatarUrl?: string; bio?: string };
  onSave?: (data: Record<string, string>) => void;
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
    bio: profile?.bio ?? '',
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Profile</Typography>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); onSave?.(form); }}>
        <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
          <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <TextField label="Email" type="email" fullWidth value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </Stack>
        <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
          <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <TextField label="Avatar URL" fullWidth value={form.avatarUrl} onChange={(e) => setForm((p) => ({ ...p, avatarUrl: e.target.value }))} />
        </Stack>
        <TextField label="Bio" fullWidth multiline rows={3} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} sx={{ mb: 2 }} />
        <Button type="submit" variant="contained">Save Profile</Button>
      </Box>
    </Paper>
  );
}
