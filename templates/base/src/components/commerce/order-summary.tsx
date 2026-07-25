'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

interface OrderSummaryProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalCents: number;
    currency: string;
    items: Array<{ productName: string; quantity: number; priceCents: number }>;
    createdAt: string;
  };
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const total = order.totalCents;

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Order #{order.orderNumber}</Typography>
        <Chip label={order.status} color={order.status === 'completed' ? 'success' : 'default'} size="small" />
        <Chip label={order.paymentStatus} size="small" />
      </Stack>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Placed on {new Date(order.createdAt).toLocaleDateString()}
      </Typography>

      <Box sx={{ my: 2 }}>
        {order.items.map((item, i) => (
          <Stack key={i} direction="row" sx={{ gap: 2, justifyContent: 'space-between', py: 0.5 }}>
            <Typography variant="body2">{item.productName} × {item.quantity}</Typography>
            <Typography variant="body2">
              {((item.priceCents * item.quantity) / 100).toLocaleString('en-IDR', { style: 'currency', currency: order.currency || 'IDR' })}
            </Typography>
          </Stack>
        ))}
      </Box>

      <Divider />
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="subtitle1">Total</Typography>
        <Typography variant="h6">
          {(total / 100).toLocaleString('en-IDR', { style: 'currency', currency: order.currency || 'IDR' })}
        </Typography>
      </Stack>
    </Paper>
  );
}
