'use client';

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
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
    active?: boolean;
  };
  onAddToCart?: (productId: string, qty: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const price = (product.priceCents / 100).toLocaleString('en-IDR', { style: 'currency', currency: product.currency || 'IDR' });

  return (
    <Card sx={{ maxWidth: 340, borderRadius: 2, boxShadow: 1 }}>
      {product.imageUrl && (
        <CardMedia
          component="img"
          height="180"
          image={product.imageUrl}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {product.name}
        </Typography>
        {product.category && (
          <Chip label={product.category} size="small" sx={{ mb: 1 }} />
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description?.slice(0, 100)}
        </Typography>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" color="primary">
            {price}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => onAddToCart?.(product.id, 1)}
          >
            Add to Cart
          </Button>
        </Stack>
        {product.type === 'service' && (
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => router.push(`/booking?product=${product.id}`)}
          >
            Book Service
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
