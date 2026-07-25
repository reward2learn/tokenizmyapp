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
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

interface OrderManagerProps {
  orders: Array<{
    id: string;
    orderNumber: string;
    userId: string;
    totalCents: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
  }>;
  onStatusChange?: (orderId: string, status: string) => void;
}

const statusOptions = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

export function OrderManager({ orders, onStatusChange }: OrderManagerProps) {
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <Box>
      <Stack direction="row" sx={{ gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Filter by status"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All</MenuItem>
          {statusOptions.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} orders
        </Typography>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell>{(order.totalCents / 100).toLocaleString('en-IDR', { style: 'currency', currency: 'IDR' })}</TableCell>
                <TableCell>
                  <Chip label={order.status} size="small" color={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'default'} />
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {onStatusChange && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const next = statusOptions[(statusOptions.indexOf(order.status) + 1) % statusOptions.length];
                        onStatusChange(order.id, next);
                      }}
                    >
                      Advance → {statusOptions[(statusOptions.indexOf(order.status) + 1) % statusOptions.length]}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
