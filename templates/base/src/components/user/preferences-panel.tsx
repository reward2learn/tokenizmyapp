'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface PreferencesPanelProps {
  preferences?: { emailNotifications?: boolean; pushNotifications?: boolean; theme?: string; locale?: string };
  onSave?: (prefs: Record<string, unknown>) => void;
}

export function PreferencesPanel({ preferences, onSave }: PreferencesPanelProps) {
  const [prefs, setPrefs] = useState({
    emailNotifications: preferences?.emailNotifications ?? true,
    pushNotifications: preferences?.pushNotifications ?? false,
    theme: preferences?.theme ?? 'light',
    locale: preferences?.locale ?? 'en',
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Preferences</Typography>
      <Box>
        <FormControlLabel control={<Switch checked={prefs.emailNotifications} onChange={(e) => setPrefs((p) => ({ ...p, emailNotifications: e.target.checked }))} />} label="Email Notifications" />
        <br />
        <FormControlLabel control={<Switch checked={prefs.pushNotifications} onChange={(e) => setPrefs((p) => ({ ...p, pushNotifications: e.target.checked }))} />} label="Push Notifications" />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <TextField select label="Theme" size="small" value={prefs.theme} onChange={(e) => setPrefs((p) => ({ ...p, theme: e.target.value }))} sx={{ minWidth: 120 }}>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </TextField>
          <TextField select label="Locale" size="small" value={prefs.locale} onChange={(e) => setPrefs((p) => ({ ...p, locale: e.target.value }))} sx={{ minWidth: 120 }}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="id">Bahasa Indonesia</MenuItem>
          </TextField>
        </Box>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => onSave?.(prefs)}>Save Preferences</Button>
      </Box>
    </Paper>
  );
}
