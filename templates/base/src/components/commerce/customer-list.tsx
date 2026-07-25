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
import Chip from '@mui/material/Chip';

interface CustomerListProps {
  customers: Array<{
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    orders?: Array<{ id: string; totalCents: number; paymentStatus: string; createdAt: string }>;
  }>;
}

export function CustomerList({ customers }: CustomerListProps) {
  if (customers.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No customers found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Orders</TableCell>
            <TableCell>Total Spent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => {
            const totalSpent = customer.orders?.reduce((sum, o) => sum + o.totalCents, 0) ?? 0;
            return (
              <TableRow key={customer.id}>
                <TableCell>{customer.name ?? '—'}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone ?? '—'}</TableCell>
                <TableCell>{customer.orders?.length ?? 0}</TableCell>
                <TableCell>{(totalSpent / 100).toLocaleString('en-IDR', { style: 'currency', currency: 'IDR' })}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
