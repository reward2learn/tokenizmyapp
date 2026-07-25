'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { AiTaskCard } from './ai-task-card';

interface AiTaskManagerProps {
  tasks: Array<{ id: string; agentType: string; action: string; status: string; createdAt: string; durationMs?: number }>;
  onRetry?: (id: string) => void;
}

export function AiTaskManager({ tasks, onRetry }: AiTaskManagerProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>AI Task Manager</Typography>
      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No AI tasks.</Typography>
      ) : (
        <Box>{tasks.map((t) => <AiTaskCard key={t.id} task={t} onRetry={onRetry} />)}</Box>
      )}
    </Paper>
  );
}
