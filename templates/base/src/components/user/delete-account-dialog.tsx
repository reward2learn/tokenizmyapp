'use client';
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountDialog({ open, onClose, onConfirm }: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Account</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>This action is permanent and cannot be undone.</Alert>
        <Typography variant="body2" sx={{ mb: 2 }}>Type DELETE to confirm:</Typography>
        <TextField fullWidth value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" disabled={confirmText !== 'DELETE'} onClick={() => { onConfirm(); onClose(); }}>Delete Forever</Button>
      </DialogActions>
    </Dialog>
  );
}
