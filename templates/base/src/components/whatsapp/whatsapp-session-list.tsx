'use client';
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface WhatsAppSessionListProps {
  sessions: Array<{ id: string; contactPhone: string; contactName?: string | null; status: string; lastMessageAt: string }>;
}

export function WhatsAppSessionList({ sessions }: WhatsAppSessionListProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Chat Sessions</Typography>
      <List>
        {sessions.map((s) => (
          <ListItem key={s.id} divider>
            <ListItemAvatar><Avatar>{(s.contactName ?? s.contactPhone)[0]}</Avatar></ListItemAvatar>
            <ListItemText
              primary={s.contactName ?? s.contactPhone}
              secondary={s.contactPhone}
            />
            <Chip label={s.status} size="small" color={s.status === 'active' ? 'success' : 'default'} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
