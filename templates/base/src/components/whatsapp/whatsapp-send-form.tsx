'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface WhatsAppSendFormProps {
  onSend?: (to: string, body: string) => void;
}

export function WhatsAppSendForm({ onSend }: WhatsAppSendFormProps) {
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');
  return (
    <Box>
      <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
        <TextField label="To (phone)" size="small" value={to} onChange={(e) => setTo(e.target.value)} sx={{ flex: 1 }} />
      </Stack>
      <TextField label="Message" fullWidth multiline rows={3} value={body} onChange={(e) => setBody(e.target.value)} sx={{ mb: 1 }} />
      <Button variant="contained" onClick={() => { onSend?.(to, body); setBody(''); }}>Send</Button>
    </Box>
  );
}
