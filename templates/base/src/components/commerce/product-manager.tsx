'use client';

import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

interface ProductManagerProps {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    currency: string;
    category?: string | null;
    type?: string | null;
    active?: boolean;
  }>;
  onEdit?: (product: Record<string, unknown>) => void;
  onDelete?: (productId: string) => void;
}

export function ProductManager({ products, onEdit, onDelete }: ProductManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const handleEdit = (product: Record<string, unknown>) => {
    setEditing(product);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleEdit({})}>
        New Product
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category ?? '—'}</TableCell>
                <TableCell><Chip label={product.type ?? 'product'} size="small" /></TableCell>
                <TableCell>{(product.priceCents / 100).toLocaleString('en-IDR', { style: 'currency', currency: product.currency || 'IDR' })}</TableCell>
                <TableCell><Chip label={product.active ? 'Yes' : 'No'} size="small" color={product.active ? 'success' : 'default'} /></TableCell>
                <TableCell>
                  <Stack direction="row" sx={{ gap: 1 }}>
                    <IconButton size="small" onClick={() => handleEdit(product as Record<string, unknown>)}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => onDelete?.(product.id)}><DeleteIcon /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?.id ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">Product form fields would be rendered here.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
