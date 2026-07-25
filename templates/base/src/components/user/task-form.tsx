'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; priority: string; dueDate?: string }) => void;
}

export function TaskForm({ open, onClose, onSubmit }: TaskFormProps) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Task</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField label="Title" fullWidth required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} sx={{ mb: 2 }} />
          <TextField label="Description" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} sx={{ mb: 2 }} />
          <Stack direction="row" sx={{ gap: 2 }}>
            <TextField select label="Priority" fullWidth value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <TextField label="Due Date" type="date" fullWidth value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => { onSubmit(form); onClose(); }}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}
