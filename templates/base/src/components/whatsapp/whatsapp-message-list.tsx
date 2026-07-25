'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

interface WhatsAppMessageListProps {
  messages: Array<{ id: string; from: string; to: string; body: string; direction: string; status: string; createdAt: string }>;
}

export function WhatsAppMessageList({ messages }: WhatsAppMessageListProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {messages.map((m) => (
        <Box key={m.id} sx={{ display: 'flex', justifyContent: m.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
          <Paper sx={{ p: 1.5, maxWidth: '70%', bgcolor: m.direction === 'outbound' ? 'primary.light' : 'background.paper', color: m.direction === 'outbound' ? 'white' : 'text.primary' }}>
            <Typography variant="body2">{m.body}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>{new Date(m.createdAt).toLocaleTimeString()}</Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
}
