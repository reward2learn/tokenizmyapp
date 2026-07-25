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

interface CampaignListProps {
  campaigns: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    subject: string;
    createdAt: string;
    sentCount?: number;
    openedCount?: number;
  }>;
  onEdit?: (campaign: Record<string, unknown>) => void;
  onDelete?: (campaignId: string) => void;
  onStart?: (campaignId: string) => void;
  onPause?: (campaignId: string) => void;
}

export function CampaignList({ campaigns, onEdit, onDelete, onStart, onPause }: CampaignListProps) {
  if (campaigns.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No campaigns yet.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Sent</TableCell>
            <TableCell>Opened</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell><Chip label={c.type} size="small" /></TableCell>
              <TableCell><Chip label={c.status} size="small" color={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warning' : 'default'} /></TableCell>
              <TableCell>{c.subject}</TableCell>
              <TableCell>{c.sentCount ?? 0}</TableCell>
              <TableCell>{c.openedCount ?? 0}</TableCell>
              <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Stack direction="row" sx={{ gap: 1 }}>
                  {onEdit && <Button size="small" onClick={() => onEdit(c as Record<string, unknown>)}>Edit</Button>}
                  {onStart && c.status === 'draft' && <Button size="small" variant="contained" onClick={() => onStart(c.id)}>Start</Button>}
                  {onPause && c.status === 'active' && <Button size="small" onClick={() => onPause(c.id)}>Pause</Button>}
                  {onDelete && <Button size="small" color="error" onClick={() => onDelete(c.id)}>Delete</Button>}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
