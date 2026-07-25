'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface CreditPackCardProps {
  pack: { id: string; name: string; description?: string | null; creditAmount: number; priceCents: number; currency: string };
  onBuy?: (packId: string) => void;
}

export function CreditPackCard({ pack, onBuy }: CreditPackCardProps) {
  const price = (pack.priceCents / 100).toLocaleString('en-US', { style: 'currency', currency: pack.currency });
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        <Typography variant="h6">{pack.name}</Typography>
        {pack.description && <Typography variant="body2" color="text.secondary">{pack.description}</Typography>}
        <Typography variant="h4" color="primary" sx={{ mt: 1 }}>{pack.creditAmount.toLocaleString()} credits</Typography>
        <Typography variant="h6">{price}</Typography>
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => onBuy?.(pack.id)}>Buy Now</Button>
      </CardContent>
    </Card>
  );
}
