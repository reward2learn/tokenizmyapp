'use client';

/**
 * TenantAppRowMenu — three-dot menu for the "Apps" panel row of a
 * single-template (non-suite) tenant in tenant-admin-panel.tsx.
 *
 * That row is a synthetic stand-in for the tenant's own app (see
 * tenant-admin-panel.tsx's `tenantApps` memo) — it has no real per-app
 * appId in the appPack sense, so it can't use AppActionsMenu (which calls
 * the apps/[slug]/[appId] routes; those 400 with "Tenant is not in suite
 * mode" for a tenant with no appPack). This menu calls the TENANT-level
 * Seed/Sync/Delete-Seeded-Data/Delete mutations instead — the same ones
 * tenant-dashboard.tsx uses for the "All Tenants" view.
 *
 * Hidden entirely for the platform's own tenant (DEFAULT_TENANT) — it's
 * the admin console itself, not a seeded content app, so Seed/Sync/Delete
 * Seeded Data don't apply, and Delete is already blocked for it elsewhere.
 */
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { DEFAULT_TENANT } from '@shared/lib/config/tenant';
import { useSeedTenantMutation, useMigrateTenantMutation, useDeleteTenantMutation } from '@/store/apis/tenant-api';
import { useClearSeedMutation } from '@/store/apis/admin-api';

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

export interface TenantAppRowMenuProps {
  tenantSlug: string;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

export function TenantAppRowMenu({ tenantSlug, onSnackbar }: TenantAppRowMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [clearDataOpen, setClearDataOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');

  const [seedTenant, { isLoading: seeding }] = useSeedTenantMutation();
  const [migrateTenant, { isLoading: migrating }] = useMigrateTenantMutation();
  const [deleteTenant, { isLoading: deleting }] = useDeleteTenantMutation();
  const [clearSeed, { isLoading: clearing }] = useClearSeedMutation();

  const busy = seeding || migrating || deleting;
  const close = () => setAnchorEl(null);

  const handleSeed = async () => {
    close();
    try {
      const result = await seedTenant(tenantSlug).unwrap();
      onSnackbar({ message: `✅ Seeded — ${result.data?.pages ?? 0} pages`, severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to seed tenant'), severity: 'error' });
    }
  };

  const handleMigrate = async () => {
    close();
    try {
      await migrateTenant(tenantSlug).unwrap();
      onSnackbar({ message: '✅ Schema synced', severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to sync schema'), severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTenant(tenantSlug).unwrap();
      setConfirmDeleteOpen(false);
      onSnackbar({ message: '🗑️ Tenant deleted', severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to delete tenant'), severity: 'error' });
    }
  };

  const handleClearData = async () => {
    try {
      const result = await clearSeed({ mode: 'all', confirm: 'CLEAR ALL SEEDED DATA', tenantSlug }).unwrap();
      setClearDataOpen(false);
      setClearConfirmText('');
      const rows = Object.values(result.data?.deleted ?? {}).reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
      onSnackbar({ message: `🗑️ Cleared seeded data — ${rows} rows deleted`, severity: 'success' });
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to clear seeded data'), severity: 'error' });
    }
  };

  // The platform's own tenant is the admin console, not a seeded content
  // app — none of these lifecycle actions apply to it. Checked after all
  // hooks above so hook call order stays unconditional across renders.
  if (tenantSlug === DEFAULT_TENANT.slug) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
        aria-label={`Actions for ${tenantSlug}`}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={(e) => { e.stopPropagation(); void handleSeed(); }} disabled={busy}>
          <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{seeding ? 'Seeding…' : 'Seed'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={(e) => { e.stopPropagation(); void handleMigrate(); }} disabled={busy}>
          <ListItemIcon><BuildIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{migrating ? 'Syncing…' : 'Sync DB Schema'}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={(e) => { e.stopPropagation(); close(); setClearDataOpen(true); }} disabled={busy}>
          <ListItemIcon><DeleteSweepIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete Seeded Data</ListItemText>
        </MenuItem>
        <MenuItem onClick={(e) => { e.stopPropagation(); close(); setConfirmDeleteOpen(true); }} disabled={busy}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Delete Tenant?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete tenant <strong>{tenantSlug}</strong>? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={() => void handleDelete()} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clearDataOpen} onClose={() => { setClearDataOpen(false); setClearConfirmText(''); }} onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Delete Seeded Data?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This deletes all seeded content for tenant &quot;{tenantSlug}&quot; — App Pages, Business Review
            Parts, Knowledge Snippets, Tasks, Roles, Monthly Targets, Levers, Action Items, Financial
            Projections, and Z-Reports.
          </Alert>
          <DialogContentText sx={{ mb: 1 }}>
            Type <strong>CLEAR ALL SEEDED DATA</strong> below to confirm:
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            value={clearConfirmText}
            onChange={(e) => setClearConfirmText(e.target.value)}
            placeholder="CLEAR ALL SEEDED DATA"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setClearDataOpen(false); setClearConfirmText(''); }} disabled={clearing}>Cancel</Button>
          <Button
            onClick={() => void handleClearData()}
            color="error"
            variant="contained"
            disabled={clearing || clearConfirmText !== 'CLEAR ALL SEEDED DATA'}
          >
            {clearing ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
