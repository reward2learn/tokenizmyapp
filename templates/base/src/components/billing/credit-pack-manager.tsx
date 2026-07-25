'use client';
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

interface CreditPackManagerProps {
  packs: Array<{ id: string; name: string; creditAmount: number; priceCents: number; currency: string; active: boolean }>;
  onEdit?: (pack: Record<string, unknown>) => void;
  onDelete?: (id: string) => void;
}

export function CreditPackManager({ packs, onEdit, onDelete }: CreditPackManagerProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow><TableCell>Name</TableCell><TableCell>Credits</TableCell><TableCell>Price</TableCell><TableCell>Active</TableCell><TableCell>Actions</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {packs.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.creditAmount.toLocaleString()}</TableCell>
              <TableCell>{(p.priceCents / 100).toLocaleString('en-US', { style: 'currency', currency: p.currency })}</TableCell>
              <TableCell><Chip label={p.active ? 'Yes' : 'No'} size="small" color={p.active ? 'success' : 'default'} /></TableCell>
              <TableCell>
                {onEdit && <IconButton size="small" onClick={() => onEdit(p as Record<string, unknown>)}><EditIcon /></IconButton>}
                {onDelete && <IconButton size="small" onClick={() => onDelete(p.id)}><DeleteIcon /></IconButton>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
