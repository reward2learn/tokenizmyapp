'use client';
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface CreditTransactionListProps {
  transactions: Array<{ id: string; amount: number; description: string; type: string; createdAt: string }>;
}

export function CreditTransactionList({ transactions }: CreditTransactionListProps) {
  if (transactions.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No transactions yet.</Typography>;
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow><TableCell>Description</TableCell><TableCell>Type</TableCell><TableCell align="right">Amount</TableCell><TableCell>Date</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.description}</TableCell>
              <TableCell>{t.type}</TableCell>
              <TableCell align="right" sx={{ color: t.amount > 0 ? 'success.main' : 'error.main' }}>{t.amount > 0 ? '+' : ''}{t.amount}</TableCell>
              <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
