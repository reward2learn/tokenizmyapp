'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';

interface ActivityTimelineProps {
  activities: Array<{ id: string; type: string; description: string; createdAt: string }>;
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No recent activity.</Typography>;
  }
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Recent Activity</Typography>
      <List>
        {activities.map((a) => (
          <ListItem key={a.id} divider>
            <ListItemText
              primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><Chip label={a.type} size="small" />{a.description}</Box>}
              secondary={new Date(a.createdAt).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
