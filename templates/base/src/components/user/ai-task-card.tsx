'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface AiTaskCardProps {
  task: { id: string; agentType: string; action: string; status: string; createdAt: string; durationMs?: number };
  onRetry?: (id: string) => void;
}

export function AiTaskCard({ task, onRetry }: AiTaskCardProps) {
  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
          <Chip label={task.agentType} size="small" color="primary" />
          <Chip label={task.status} size="small" color={task.status === 'success' ? 'success' : task.status === 'failed' ? 'error' : 'default'} />
        </Stack>
        <Typography variant="body2">{task.action}</Typography>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">{new Date(task.createdAt).toLocaleString()}</Typography>
          {task.durationMs && <Typography variant="caption" color="text.secondary">{task.durationMs}ms</Typography>}
          {task.status === 'failed' && onRetry && <Button size="small" onClick={() => onRetry(task.id)}>Retry</Button>}
        </Stack>
      </CardContent>
    </Card>
  );
}
