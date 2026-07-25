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
import Typography from '@mui/material/Typography';

interface SyncLogTableProps {
  logs: Array<{ id: string; status: string; details: string; createdAt: string }>;
}

export function SyncLogTable({ logs }: SyncLogTableProps) {
  if (logs.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No sync logs.</Typography>;
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow><TableCell>Status</TableCell><TableCell>Details</TableCell><TableCell>Time</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id}>
              <TableCell><Chip label={l.status} size="small" color={l.status === 'success' ? 'success' : l.status === 'failed' ? 'error' : 'default'} /></TableCell>
              <TableCell>{l.details}</TableCell>
              <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
