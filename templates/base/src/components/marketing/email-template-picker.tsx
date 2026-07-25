'use client';

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';

interface EmailTemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: string) => void;
  templates?: string[];
}

const defaultTemplates = ['Welcome', 'Password Reset', 'Order Confirmation', 'Newsletter', 'Promotional'];

export function EmailTemplatePicker({ open, onClose, onSelect, templates = defaultTemplates }: EmailTemplatePickerProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Email Template</DialogTitle>
      <DialogContent>
        <List>
          {templates.map((t) => (
            <ListItem key={t} disablePadding>
              <ListItemButton onClick={() => { onSelect(t); onClose(); }}>
                <ListItemText primary={t} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
