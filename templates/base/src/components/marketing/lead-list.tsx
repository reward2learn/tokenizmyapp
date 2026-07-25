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

interface LeadListProps {
  leads: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    source: string;
    status: string;
    createdAt: string;
  }>;
  onConvert?: (leadId: string) => void;
  onDelete?: (leadId: string) => void;
}

export function LeadList({ leads, onConvert, onDelete }: LeadListProps) {
  if (leads.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No leads yet.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.phone ?? '—'}</TableCell>
              <TableCell>{lead.source}</TableCell>
              <TableCell><Chip label={lead.status} size="small" color={lead.status === 'converted' ? 'success' : lead.status === 'lost' ? 'error' : 'default'} /></TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Stack direction="row" sx={{ gap: 1 }}>
                  {onConvert && lead.status !== 'converted' && <Button size="small" variant="contained" onClick={() => onConvert(lead.id)}>Convert</Button>}
                  {onDelete && <Button size="small" color="error" onClick={() => onDelete(lead.id)}>Delete</Button>}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
