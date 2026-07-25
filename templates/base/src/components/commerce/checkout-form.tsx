'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Paper from '@mui/material/Paper';

interface CheckoutFormProps {
  cartItems: Array<{ id: string; productName: string; priceCents: number; quantity: number }>;
  subtotalCents: number;
  onSubmit: (data: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    city: string;
    postalCode: string;
    paymentMethod: string;
  }) => void;
  onCancel: () => void;
}

export function CheckoutForm({ cartItems, subtotalCents, onSubmit, onCancel }: CheckoutFormProps) {
  const [form, setForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const total = subtotalCents;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Contact Information</Typography>
      <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
        <TextField label="Full Name" fullWidth required value={form.contactName} onChange={(e) => handleChange('contactName', e.target.value)} />
        <TextField label="Email" type="email" fullWidth required value={form.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} />
      </Stack>
      <TextField label="Phone" fullWidth sx={{ mb: 2 }} value={form.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} />

      <Typography variant="h6" gutterBottom>Shipping Address</Typography>
      <TextField label="Address" fullRequired value={form.address} onChange={(e) => handleChange('address', e.target.value)} sx={{ mb: 2 }} />
      <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
        <TextField label="City" fullWidth required value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
        <TextField label="Postal Code" fullWidth required value={form.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} />
      </Stack>

      <Typography variant="h6" gutterBottom>Payment Method</Typography>
      <FormControl>
        <RadioGroup value={form.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)}>
          <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
          <FormControlLabel value="stripe" control={<Radio />} label="Stripe" />
          <FormControlLabel value="crypto" control={<Radio />} label="Crypto" />
        </RadioGroup>
      </FormControl>

      <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="h6">
            {(total / 100).toLocaleString('en-IDR', { style: 'currency', currency: 'IDR' })}
          </Typography>
        </Stack>
      </Paper>

      <Stack direction="row" sx={{ gap: 2 }}>
        <Button variant="outlined" onClick={onCancel} sx={{ flex: 1 }}>Cancel</Button>
        <Button type="submit" variant="contained" sx={{ flex: 2 }}>Place Order</Button>
      </Stack>
    </Box>
  );
}
