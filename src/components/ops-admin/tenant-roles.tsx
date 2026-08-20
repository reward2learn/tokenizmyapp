'use client';

/**
 * TenantRoles — Functional Roles management scoped to a specific tenant.
 *
 * Wraps the RoleManager functionality with tenant context awareness.
 */

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import RefreshIcon from '@mui/icons-material/Refresh';
import KeyIcon from '@mui/icons-material/Key';

import {
  useListRoleConfigsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useSetRolePinMutation,
} from '@/store/apis/admin-api';
import type { RoleConfigView } from '@/app/api/admin/roles/route';

interface TenantRolesProps {
  tenantSlug: string;
  tenantName?: string;
  appId?: string | null;
}

// Default platform roles
const PLATFORM_ROLES: RoleConfigView[] = [
  { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true, pinConfigured: false, tenantSlug: null, appId: null },
  { code: 'admin', name: 'Admin', isPlatformAdmin: true, pinConfigured: false, tenantSlug: null, appId: null },
];

export function TenantRoles({ tenantSlug, tenantName, appId }: TenantRolesProps) {
  // Unscoped fetch — the tenant/global split below uses the real
  // tenant_slug/app_id columns rather than the old code-prefix heuristic.
  const { data, isLoading, isError, refetch } = useListRoleConfigsQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [setRolePin, { isLoading: isSettingPin }] = useSetRolePinMutation();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ code: '', name: '' });
  const [editingRole, setEditingRole] = useState<RoleConfigView | null>(null);
  const [pinDialog, setPinDialog] = useState<{ code: string; name: string } | null>(null);
  const [pinValue, setPinValue] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const dbRoles = data?.data?.roles ?? [];
  const hasDbData = dbRoles.length > 0;
  
  // Combine platform roles with DB roles
  const allRoles = hasDbData ? dbRoles : PLATFORM_ROLES;
  
  // Filter for tenant-specific roles (and app, when one is selected) via the real columns.
  const tenantRoles = allRoles.filter((r) => r.tenantSlug === tenantSlug && (!appId || r.appId === appId));
  const globalRoles = allRoles.filter((r) => !r.tenantSlug);

  const handleCreate = async () => {
    if (!newRole.code.trim() || !newRole.name.trim()) return;
    const scopedCode = `${tenantSlug}:${newRole.code.trim().toLowerCase()}`;
    await createRole({
      code: scopedCode,
      name: `[${tenantName || tenantSlug}] ${newRole.name.trim()}`,
      isPlatformAdmin: false,
      tenantSlug,
      ...(appId ? { appId } : {}),
    }).unwrap();
    setNewRole({ code: '', name: '' });
    setCreateDialogOpen(false);
    refetch();
  };

  const handleSetPin = async () => {
    if (!pinDialog || !pinValue.trim()) return;
    await setRolePin({ code: pinDialog.code, pin: pinValue.trim() }).unwrap();
    setPinDialog(null);
    setPinValue('');
    refetch();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Functional Roles — {tenantName || tenantSlug}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roles define functional responsibilities. Tenant-scoped roles are prefixed with the tenant slug.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            New Role
          </Button>
        </Stack>
      </Stack>

      {isError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Could not load roles from database. Showing platform defaults.
        </Alert>
      )}

      {/* Tenant-scoped roles */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
        Tenant Roles ({tenantRoles.length})
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Role</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>PIN Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenantRoles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">
                  No tenant-specific roles. Create one to get started.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tenantRoles.map((r) => (
              <TableRow key={r.code}>
                <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.code}</TableCell>
                <TableCell>
                  {'pinConfigured' in r ? (
                    (r as { pinConfigured: boolean }).pinConfigured ? (
                      <Chip label="Configured" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="Not Set" size="small" color="warning" variant="outlined" />
                    )
                  ) : (
                    <Chip label="—" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Set PIN">
                    <IconButton size="small" onClick={() => setPinDialog({ code: r.code, name: r.name })}>
                      <KeyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Global roles (read-only reference) */}
      {globalRoles.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 4, mb: 1 }}>
            Platform Roles (Reference)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {globalRoles.map((r) => (
                <TableRow key={r.code} sx={{ opacity: 0.7 }}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.code}</TableCell>
                  <TableCell>
                    {'isPlatformAdmin' in r && r.isPlatformAdmin ? (
                      <Chip label="Platform Admin" size="small" color="primary" variant="outlined" />
                    ) : (
                      <Chip label="Standard" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Code"
              value={newRole.code}
              onChange={(e) => setNewRole((prev) => ({ ...prev, code: e.target.value }))}
              helperText={`Will be prefixed as: ${tenantSlug}:<code>`}
              fullWidth
            />
            <TextField
              label="Role Name"
              value={newRole.name}
              onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={isCreating || !newRole.code.trim() || !newRole.name.trim()}>
            {isCreating ? 'Creating...' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Set PIN Dialog */}
      <Dialog open={!!pinDialog} onClose={() => setPinDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Set PIN — {pinDialog?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="PIN"
            type="password"
            value={pinValue}
            onChange={(e) => setPinValue(e.target.value)}
            helperText="Enter a 4-6 digit PIN for this role"
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPinDialog(null)}>Cancel</Button>
          <Button onClick={handleSetPin} variant="contained" disabled={isSettingPin || !pinValue.trim()}>
            {isSettingPin ? 'Setting...' : 'Set PIN'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TenantRoles;
