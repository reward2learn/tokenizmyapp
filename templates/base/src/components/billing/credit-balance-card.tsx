'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CreditBalanceCardProps {
  balance: number;
}

export function CreditBalanceCard({ balance }: CreditBalanceCardProps) {
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">Credit Balance</Typography>
        <Typography variant="h3" color="primary">{balance.toLocaleString()}</Typography>
      </CardContent>
    </Card>
  );
}
