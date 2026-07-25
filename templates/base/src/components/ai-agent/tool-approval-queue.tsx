'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';

interface ToolApprovalQueueProps {
  tools: Array<{ id: string; tool: string; params: Record<string, unknown>; status: string; createdAt: string }>;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ToolApprovalQueue({ tools, onApprove, onReject }: ToolApprovalQueueProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Tool Approval Queue</Typography>
      {tools.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No pending tools.</Typography>
      ) : (
        <List>
          {tools.map((t) => (
            <ListItem key={t.id} divider secondaryAction={
              <Stack direction="row" sx={{ gap: 1 }}>
                <Button size="small" variant="contained" color="success" onClick={() => onApprove?.(t.id)}>Approve</Button>
                <Button size="small" color="error" onClick={() => onReject?.(t.id)}>Reject</Button>
              </Stack>
            }>
              <ListItemText
                primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><Chip label={t.tool} size="small" color="primary" />{t.status}</Box>}
                secondary={JSON.stringify(t.params)}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
