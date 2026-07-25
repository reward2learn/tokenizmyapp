'use client';
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

interface IntegrationConnectDialogProps {
  open: boolean;
  onClose: () => void;
  onConnect: (provider: string, config: Record<string, string>) => void;
}

export function IntegrationConnectDialog({ open, onClose, onConnect }: IntegrationConnectDialogProps) {
  const [provider, setProvider] = useState('slack');
  const [apiKey, setApiKey] = useState('');
  const [url, setUrl] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect Integration</DialogTitle>
      <DialogContent>
        <Stack direction="row" sx={{ gap: 2, mt: 1 }}>
          <TextField select label="Provider" fullWidth value={provider} onChange={(e) => setProvider(e.target.value)}>
            <MenuItem value="slack">Slack</MenuItem>
            <MenuItem value="google-sheets">Google Sheets</MenuItem>
            <MenuItem value="stripe">Stripe</MenuItem>
            <MenuItem value="resend">Resend</MenuItem>
          </TextField>
        </Stack>
        <TextField label="API Key" fullWidth value={apiKey} onChange={(e) => setApiKey(e.target.value)} sx={{ mt: 2 }} />
        <TextField label="Webhook URL (optional)" fullWidth value={url} onChange={(e) => setUrl(e.target.value)} sx={{ mt: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => { onConnect(provider, { apiKey, url }); onClose(); }}>Connect</Button>
      </DialogActions>
    </Dialog>
  );
}
