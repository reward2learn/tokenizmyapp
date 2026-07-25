'use client';

import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { CartItem } from './cart-item';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage?: string | null;
    priceCents: number;
    quantity: number;
  }>;
  onUpdateQty?: (orderId: string, qty: number) => void;
  onRemove?: (orderId: string) => void;
  onCheckout?: () => void;
}

export function CartDrawer({ open, onClose, items, onUpdateQty, onRemove, onCheckout }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Cart ({itemCount})</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', mt: 2 }}>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Your cart is empty.
            </Typography>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQty={onUpdateQty}
                onRemove={onRemove}
              />
            ))
          )}
        </Box>

        {items.length > 0 && (
          <>
            <Divider />
            <Box sx={{ py: 2 }}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Subtotal</Typography>
                <Typography variant="h6">
                  {(subtotal / 100).toLocaleString('en-IDR', { style: 'currency', currency: 'IDR' })}
                </Typography>
              </Stack>
              <Button variant="contained" fullWidth size="large" onClick={onCheckout}>
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
