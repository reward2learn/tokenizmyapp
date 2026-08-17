'use client';

/**
 * AddAppButton — "+ Add App" trigger + dialog for adding a new app to an
 * existing suite. Wires the previously-unwired POST /apps endpoint to a UI.
 */
import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';

import { listTemplates } from '@/domain/tenant/template-catalog';
import { useListAllTemplatesQuery } from '@/store/apis/template-api';
import { useAddAppToSuiteMutation } from '@/store/apis/tenant-api';

/** Extracts the API envelope's `error` string off an RTK Query error, without `any`. */
function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

export interface AddAppButtonProps {
  tenantSlug: string;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

export function AddAppButton({ tenantSlug, onSnackbar }: AddAppButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [templateId, setTemplateId] = useState('default');
  const [addApp, { isLoading }] = useAddAppToSuiteMutation();
  // Built-ins come from the compiled catalog; custom (AI-generated) templates
  // only exist in the platform DB, so the merged list has to be fetched. Falls
  // back to the built-ins if the request has not resolved or fails, which keeps
  // template selection working even when the endpoint is unavailable.
  const { data: templateData } = useListAllTemplatesQuery();
  const templates = templateData?.data?.templates ?? listTemplates();

  const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await addApp({
        slug: tenantSlug,
        appId: slugify(name),
        name: name.trim(),
        department: department.trim() || 'General',
        templateId,
      }).unwrap();
      onSnackbar({ message: `✅ Added "${name.trim()}" to the suite`, severity: 'success' });
      setOpen(false);
      setName('');
      setDepartment('');
      setTemplateId('default');
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to add app'), severity: 'error' });
    }
  };

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
        Add App
      </Button>
      <Dialog open={open} onClose={() => !isLoading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add App to Suite</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Name" value={name} onChange={(e) => setName(e.target.value)}
              fullWidth size="small" autoFocus placeholder="e.g. Inventory Management"
              helperText={name ? `App ID: ${slugify(name)}` : 'Used to generate the app ID'}
            />
            <TextField label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} fullWidth size="small" placeholder="e.g. Operations" />
            <FormControl fullWidth size="small">
              <InputLabel>Template</InputLabel>
              <Select value={templateId} label="Template" onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void handleAdd()}
            disabled={isLoading || !name.trim()}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isLoading ? 'Adding…' : 'Add App'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
