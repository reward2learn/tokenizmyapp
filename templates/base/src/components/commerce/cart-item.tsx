'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    productName: string;
    productImage?: string | null;
    priceCents: number;
    quantity: number;
  };
  onUpdateQty?: (orderId: string, qty: number) => void;
  onRemove?: (orderId: string) => void;
}

export function CartItem({ item, onUpdateQty, onRemove }: CartItemProps) {
  const price = (item.priceCents / 100).toLocaleString('en-IDR', { style: 'currency', currency: 'IDR' });

  return (
    <Box sx={{ display: 'flex', gap: 2, py: 2, alignItems: 'center' }}>
      {item.productImage && (
        <Box
          component="img"
          src={item.productImage}
          alt={item.productName}
          sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
        />
      )}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" fontWeight="medium">{item.productName}</Typography>
        <Typography variant="body2" color="text.secondary">{price}</Typography>
      </Box>
      <TextField
        type="number"
        size="small"
        value={item.quantity}
        onChange={(e) => onUpdateQty?.(item.id, Math.max(1, parseInt(e.target.value) || 1))}
        inputProps={{ min: 1, max: 99, 'aria-label': 'Quantity' }}
        sx={{ width: 70 }}
      />
      <IconButton onClick={() => onRemove?.(item.id)} aria-label="Remove item">
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}
