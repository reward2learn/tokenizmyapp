'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';

interface TaskListProps {
  tasks: Array<{ id: string; title: string; description?: string | null; priority: string; status: string; dueDate?: string | null; createdAt: string }>;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No tasks yet.</Typography>;
  }
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>My Tasks</Typography>
      <List>
        {tasks.map((t) => (
          <ListItem key={t.id} divider secondaryAction={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={t.priority} size="small" color={t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'warning' : 'default'} />
              {onDelete && <IconButton edge="end" onClick={() => onDelete(t.id)}><DeleteIcon /></IconButton>}
            </Box>
          }>
            <ListItemIcon>
              <Checkbox checked={t.status === 'completed'} onChange={() => onToggle?.(t.id)} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>{t.title}</Typography>}
              secondary={t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : undefined}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
