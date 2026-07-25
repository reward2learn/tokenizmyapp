'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useRouter } from 'next/navigation';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    priceCents: number;
    currency: string;
    category?: string | null;
    type?: string | null;
    imageUrl?: string | null;
    images?: string[] | null;
    active?: boolean;
  };
  onAddToCart?: (productId: string, qty: number) => void;
}

export function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [showBooking, setShowBooking] = useState(false);
  const price = (product.priceCents / 100).toLocaleString('en-IDR', { style: 'currency', currency: product.currency || 'IDR' });

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {product.imageUrl ? (
            <Box
              component="img"
              src={product.imageUrl}
              alt={product.name}
              sx={{ width: '100%', borderRadius: 2, maxHeight: 400, objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: 300, bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No image</Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          {product.category && <Chip label={product.category} sx={{ mb: 2 }} />}
          <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
            {price}
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description ?? 'No description available.'}
          </Typography>

          <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              size="small"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 99 }}
              sx={{ width: 100 }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => onAddToCart?.(product.id, qty)}
            >
              Add to Cart
            </Button>
          </Stack>

          {product.type === 'service' && (
            <Button variant="outlined" size="large" onClick={() => setShowBooking(true)}>
              Book Service
            </Button>
          )}
        </Grid>
      </Grid>

      <Dialog open={showBooking} onClose={() => setShowBooking(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Book {product.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Service booking form would be rendered here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBooking(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setShowBooking(false); router.push('/booking'); }}>
            Go to Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
