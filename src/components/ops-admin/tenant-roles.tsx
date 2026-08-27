'use client';

/**
 * TenantRoles — Functional Roles management scoped to a specific tenant.
 *
 * Roles are a display-name + PIN catalog (not capability grants — those live
 * on Security Groups). Platform admins get a ⋮ menu on both Tenant and
 * Platform roles: Edit details, Set PIN, Delete (non–platform-admin only).
 */

import { useState, type MouseEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/Key';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  useListRoleConfigsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useSetRolePinMutation,
} from '@/store/apis/admin-api';
import type { RoleConfigView } from '@/app/api/admin/roles/route';

interface TenantRolesProps {
  tenantSlug: string;
  tenantName?: string;
  appId?: string | null;
}

const PLATFORM_FALLBACK: RoleConfigView[] = [
  { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true, pinConfigured: false, tenantSlug: null, appId: null },
  { code: 'admin', name: 'Admin', isPlatformAdmin: true, pinConfigured: false, tenantSlug: null, appId: null },
];

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

function PinStatusChip({ configured }: { configured: boolean | undefined }) {
  if (configured === undefined) {
    return <Chip label="—" size="small" variant="outlined" />;
  }
  return configured ? (
    <Chip label="Configured" size="small" color="success" variant="outlined" />
  ) : (
    <Chip label="Not Set" size="small" color="warning" variant="outlined" />
  );
}

export function TenantRoles({ tenantSlug, tenantName, appId }: TenantRolesProps) {
  const listScope = { tenantSlug, ...(appId ? { appId } : {}) };
  const { data, isLoading, isError, refetch } = useListRoleConfigsQuery(listScope);
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [setRolePin, { isLoading: isSettingPin }] = useSetRolePinMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ code: '', name: '' });
  const [editing, setEditing] = useState<{
    code: string;
    name: string;
    isPlatformAdmin: boolean;
    tenantSlug: string | null;
  } | null>(null);
  const [pinDialog, setPinDialog] = useState<{ code: string; name: string } | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [deletingRole, setDeletingRole] = useState<RoleConfigView | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRole, setMenuRole] = useState<RoleConfigView | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator />
      </Box>
    );
  }

  const dbRoles = data?.data?.roles ?? [];
  const allRoles = dbRoles.length > 0 ? dbRoles : PLATFORM_FALLBACK;
  const tenantRoles = allRoles.filter((r) => r.tenantSlug === tenantSlug && (!appId || r.appId === appId));
  const globalRoles = allRoles.filter((r) => !r.tenantSlug);

  const openMenu = (event: MouseEvent<HTMLElement>, role: RoleConfigView) => {
    setMenuAnchor(event.currentTarget);
    setMenuRole(role);
    setActionError(null);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRole(null);
  };

  const handleCreate = async () => {
    if (!newRole.code.trim() || !newRole.name.trim()) return;
    setActionError(null);
    const scopedCode = `${tenantSlug}:${newRole.code.trim().toLowerCase()}`;
    try {
      await createRole({
        code: scopedCode,
        name: `[${tenantName || tenantSlug}] ${newRole.name.trim()}`,
        isPlatformAdmin: false,
        tenantSlug,
        ...(appId ? { appId } : {}),
      }).unwrap();
      setNewRole({ code: '', name: '' });
      setCreateDialogOpen(false);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to create role'));
    }
  };

  const openDetailsEditor = (r: RoleConfigView) => {
    closeMenu();
    setEditing({
      code: r.code,
      name: r.name,
      isPlatformAdmin: r.isPlatformAdmin,
      tenantSlug: r.tenantSlug,
    });
  };

  const openPinDialog = (r: RoleConfigView) => {
    closeMenu();
    setPinDialog({ code: r.code, name: r.name });
    setPinValue('');
  };

  const openDeleteConfirm = (r: RoleConfigView) => {
    closeMenu();
    setDeletingRole(r);
  };

  const handleSaveDetails = async () => {
    if (!editing || !editing.name.trim()) return;
    setActionError(null);
    try {
      await updateRole({
        code: editing.code,
        name: editing.name.trim(),
        isPlatformAdmin: editing.isPlatformAdmin,
        ...(editing.tenantSlug ? { tenantSlug: editing.tenantSlug } : { tenantSlug }),
        ...(appId ? { appId } : {}),
      }).unwrap();
      setEditing(null);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to update role'));
    }
  };

  const handleSetPin = async () => {
    if (!pinDialog || !pinValue.trim()) return;
    setActionError(null);
    try {
      await setRolePin({ code: pinDialog.code, pin: pinValue.trim() }).unwrap();
      setPinDialog(null);
      setPinValue('');
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to set PIN'));
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    setActionError(null);
    try {
      await deleteRole(deletingRole.code).unwrap();
      setDeletingRole(null);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to delete role'));
    }
  };

  const renderRoleRow = (r: RoleConfigView, { muted }: { muted?: boolean } = {}) => (
    <TableRow key={r.code} sx={muted ? { opacity: 0.85 } : undefined}>
      <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{r.name}</TableCell>
      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {r.code}
      </TableCell>
      <TableCell>
        <PinStatusChip configured={'pinConfigured' in r ? r.pinConfigured : undefined} />
      </TableCell>
      <TableCell>
        {r.isPlatformAdmin ? (
          <Chip label="Platform Admin" size="small" color="primary" variant="outlined" />
        ) : (
          <Chip label="Standard" size="small" variant="outlined" />
        )}
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" aria-label={`Actions for ${r.code}`} onClick={(e) => openMenu(e, r)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper variant="outlined" sx={{ p: 3, overflow: 'hidden', maxWidth: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        useFlexGap
        sx={{
          mb: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          width: '100%',
          minWidth: 0,
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 200px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
            Functional Roles — {tenantName || tenantSlug}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roles are a name + PIN catalog for functional sign-in. API read/write access is granted
            via Security Groups, not roles. Use ⋮ on any row to edit, set PIN, or delete.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            New Role
          </Button>
        </Stack>
      </Stack>

      {isError ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Could not load roles from database. Showing platform defaults.
        </Alert>
      ) : null}

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
        Tenant Roles ({tenantRoles.length})
      </Typography>
      <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>PIN Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenantRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No tenant-specific roles. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tenantRoles.map((r) => renderRoleRow(r))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {globalRoles.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 4, mb: 1 }}>
            Platform Roles ({globalRoles.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Shared catalog roles. Set PIN here for PIN-tier sign-in; rename as needed. Platform-admin
            flagged roles cannot be deleted.
          </Typography>
          <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>PIN Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{globalRoles.map((r) => renderRoleRow(r, { muted: true }))}</TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor) && Boolean(menuRole)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => menuRole && openDetailsEditor(menuRole)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit details" secondary="Name and admin flag" />
        </MenuItem>
        <MenuItem onClick={() => menuRole && openPinDialog(menuRole)}>
          <ListItemIcon>
            <KeyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Set PIN" secondary="PIN-tier sign-in" />
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={menuRole?.isPlatformAdmin}
          onClick={() => menuRole && openDeleteConfirm(menuRole)}
          sx={{ color: menuRole?.isPlatformAdmin ? undefined : 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color={menuRole?.isPlatformAdmin ? 'inherit' : 'error'} />
          </ListItemIcon>
          <ListItemText
            primary="Delete role"
            secondary={menuRole?.isPlatformAdmin ? 'Platform admin roles cannot be deleted' : undefined}
          />
        </MenuItem>
      </Menu>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Code"
              value={newRole.code}
              onChange={(e) => setNewRole((prev) => ({ ...prev, code: e.target.value }))}
              helperText={`Will be stored as: ${tenantSlug}:<code>`}
              fullWidth
            />
            <TextField
              label="Role Name"
              value={newRole.name}
              onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <Alert severity="info">
              After create, use <strong>Set PIN</strong> on the row for PIN login. Assign Security
              Groups on the Accounts tab for API access.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => void handleCreate()}
            variant="contained"
            disabled={isCreating || !newRole.code.trim() || !newRole.name.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Role — {editing?.code}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Name"
              value={editing?.name ?? ''}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              fullWidth
            />
            {/*
              LEARNING HOOK — platform-admin flag.
              Toggling this grants shared ADMIN_PIN semantics and blocks delete.
              Only enable when you intentionally promote a role to platform admin.
            */}
            <FormControlLabel
              control={
                <Switch
                  checked={editing?.isPlatformAdmin ?? false}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, isPlatformAdmin: e.target.checked } : prev,
                    )
                  }
                />
              }
              label="Platform admin role"
            />
            <Typography variant="caption" color="text.secondary">
              Platform admin roles share the ADMIN_PIN secret and cannot be deleted.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button
            onClick={() => void handleSaveDetails()}
            variant="contained"
            disabled={isUpdating || !editing?.name.trim()}
          >
            {isUpdating ? 'Saving...' : 'Save Details'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!pinDialog} onClose={() => setPinDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Set PIN — {pinDialog?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="PIN"
            type="password"
            value={pinValue}
            onChange={(e) => setPinValue(e.target.value)}
            helperText="Enter a 4–6 digit PIN for this role"
            fullWidth
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPinDialog(null)}>Cancel</Button>
          <Button
            onClick={() => void handleSetPin()}
            variant="contained"
            disabled={isSettingPin || pinValue.trim().length < 3}
          >
            {isSettingPin ? 'Setting...' : 'Set PIN'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deletingRole} onClose={() => setDeletingRole(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete role?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{deletingRole?.code}</strong>? User accounts still assigned this role will
            need re-assignment.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingRole(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TenantRoles;
