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

interface AuditLogTableProps {
  logs: Array<{ id: string; agentType: string; action: string; success: boolean; durationMs?: number; createdAt: string }>;
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No audit logs.</Typography>;
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Agent</TableCell><TableCell>Action</TableCell><TableCell>Status</TableCell><TableCell>Duration</TableCell><TableCell>Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.agentType}</TableCell>
              <TableCell>{l.action}</TableCell>
              <TableCell><Chip label={l.success ? 'success' : 'failed'} size="small" color={l.success ? 'success' : 'error'} /></TableCell>
              <TableCell>{l.durationMs ? `${l.durationMs}ms` : '—'}</TableCell>
              <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
