'use client';

import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: Array<{
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
  }>;
  categories?: string[];
  onAddToCart?: (productId: string, qty: number) => void;
}

export function ProductGrid({ products, categories, onAddToCart }: ProductGridProps) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const matchCategory = category === 'all' || p.category === category;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <Box>
      <Stack direction="row" sx={{ gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search products"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
        />
        {categories && categories.length > 0 && (
          <TextField
            select
            label="Category"
            variant="outlined"
            size="small"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      {filtered.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No products found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
