'use client';

import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface SubscriberListProps {
  subscribers: Array<{
    id: string;
    email: string;
    name?: string | null;
    status: string;
    tags: string[];
    createdAt: string;
  }>;
  onUnsubscribe?: (subscriberId: string) => void;
  onDelete?: (subscriberId: string) => void;
}

export function SubscriberList({ subscribers, onUnsubscribe, onDelete }: SubscriberListProps) {
  if (subscribers.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No subscribers yet.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subscribers.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.name ?? '—'}</TableCell>
              <TableCell>{sub.email}</TableCell>
              <TableCell><Chip label={sub.status} size="small" color={sub.status === 'active' ? 'success' : 'default'} /></TableCell>
              <TableCell>{sub.tags.map((t) => <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />)}</TableCell>
              <TableCell>{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Stack direction="row" sx={{ gap: 1 }}>
                  {onUnsubscribe && sub.status === 'active' && <Button size="small" onClick={() => onUnsubscribe(sub.id)}>Unsubscribe</Button>}
                  {onDelete && <Button size="small" color="error" onClick={() => onDelete(sub.id)}>Delete</Button>}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
