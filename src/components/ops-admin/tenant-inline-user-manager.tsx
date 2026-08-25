'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';


import RefreshIcon from '@mui/icons-material/Refresh';

import {
  useListAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useCreateAdminUsersMutation,
  useListAdminGroupsQuery,
  useListRoleConfigsQuery,
} from '@/store/apis/admin-api';
import type { AdminUserView } from '@/app/api/admin/users/route';
import { DEFAULT_PLATFORM_ADMIN_EMAIL, roleOptionsFromApi } from '@/domain/security/functional-roles';

interface Props {
  tenantSlug: string;
  tenantName?: string;
  appId?: string | null;
}

/** The platform's own default admin account — deleting it would lock
 *  everyone out of this console. Matches the guard in the DELETE route. */
function isProtectedDefaultAdmin(u: AdminUserView): boolean {
  return (
    u.roleCode === 'platform-admin' &&
    u.tenantSlug === null &&
    (u.email ?? '').toLowerCase() === DEFAULT_PLATFORM_ADMIN_EMAIL.toLowerCase()
  );
}

export function TenantInlineUserManager({ tenantSlug, tenantName, appId }: Props) {
  const { data, isLoading, isError, refetch } = useListAdminUsersQuery({ tenantSlug, appId: appId ?? undefined });
  const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();
  const [createUsers, { isLoading: isCreating }] = useCreateAdminUsersMutation();
  const { data: groupsData } = useListAdminGroupsQuery();
  const { data: roleConfigData } = useListRoleConfigsQuery({ tenantSlug, appId: appId ?? undefined });
  const roleOptions = roleOptionsFromApi(roleConfigData?.data?.roles);

  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    isActive: true,
    roleCode: '',
    groupCodes: [] as string[],
    pin: '',
  });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    roleCode: '',
    pin: '',
    isActive: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const users = data?.data?.users ?? [];
  const groups = groupsData?.data?.groups ?? [];
  const pinStatus: Record<string, boolean> = {};
  if (roleConfigData?.success && roleConfigData.data?.roles) {
    for (const r of roleConfigData.data.roles) {
      pinStatus[r.code] = !!r.pinConfigured;
    }
  }

  const handleSave = async () => {
    if (!editing) return;
    const user = users.find((u) => u.id === editing);
    if (!user) return;
    await updateUser({
      id: editing,
      email: addForm.email || undefined,
      isActive: editForm.isActive,
      roleCode: editForm.roleCode || undefined,
      groupCodes: editForm.groupCodes,
      pin: editForm.pin || undefined,
      tenantSlug,
      ...(appId ? { appId } : {}),
    }).unwrap();
    setEditing(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const user = users.find((u) => u.id === deleteConfirm);
    if (!user) return;
    await deleteUser({ id: deleteConfirm, sub: user.sub, tenantSlug, ...(appId ? { appId } : {}) }).unwrap();
    setDeleteConfirm(null);
    refetch();
  };

  const handleAdd = async () => {
    if (!addForm.email.trim()) return;
    await createUsers({
      users: [{
        name: addForm.name.trim() || undefined,
        email: addForm.email.trim(),
        roleCode: addForm.roleCode || undefined,
        pin: addForm.pin.trim() || undefined,
        isActive: addForm.isActive,
      }],
      tenantSlug,
      ...(appId ? { appId } : {}),
    }).unwrap();
    setAddOpen(false);
    setAddForm({ name: '', email: '', roleCode: '', pin: '', isActive: true });
    refetch();
  };

  const openEdit = (user: AdminUserView) => {
    setEditing(user.id);
    setEditForm({
      isActive: user.isActive,
      roleCode: user.roleCode || '',
      groupCodes: user.groups || [],
      pin: '',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 0, wordBreak: 'break-word' }}>
          User Accounts — {tenantName || tenantSlug}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Add User
          </Button>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {isError ? (
        <Alert severity="error">Failed to load users for tenant {tenantSlug}.</Alert>
      ) : (
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Person</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>PIN</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const hasPin = u.roleCode ? (pinStatus[u.roleCode] ?? false) : false;
                  const protectedAdmin = isProtectedDefaultAdmin(u);
                  return (
                    <TableRow key={u.id}>
                      <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                        {u.name || u.sub}
                        {!u.isActive && <Chip label="disabled" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />}
                        {protectedAdmin && <Chip label="protected" size="small" color="info" variant="outlined" sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>{roleOptions.find((r) => r.code === u.roleCode)?.name || u.roleCode || '—'}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{u.email || '—'}</TableCell>
                      <TableCell>
                        <Chip label={hasPin ? 'configured' : 'not set'} size="small" color={hasPin ? 'success' : 'warning'} variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} useFlexGap sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Button size="small" variant="outlined" onClick={() => openEdit(u)}>Edit</Button>
                          <Tooltip title={protectedAdmin ? "This is the platform administrator's own default account and can't be deleted." : ''}>
                            <span>
                              <Button size="small" color="error" variant="text" onClick={() => setDeleteConfirm(u.id)} disabled={isDeleting || protectedAdmin}>Delete</Button>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.isActive ? 'active' : 'disabled'}
                label="Status"
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Functional role</InputLabel>
              <Select
                value={editForm.roleCode}
                label="Functional role"
                onChange={(e) => setEditForm((f) => ({ ...f, roleCode: e.target.value }))}
              >
                <MenuItem value="">— none —</MenuItem>
                {roleOptions.map((r) => (
                  <MenuItem key={r.code} value={r.code}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Security groups</InputLabel>
              <Select
                multiple
                value={editForm.groupCodes}
                label="Security groups"
                onChange={(e) => setEditForm((f) => ({ ...f, groupCodes: e.target.value as string[] }))}
              >
                {groups.map((g) => (
                  <MenuItem key={g.code} value={g.code}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label="Email" placeholder="user@example.com" fullWidth />
            <TextField size="small" type="password" label="Set / rotate PIN" placeholder="min 3 chars" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" disabled={isUpdating || !editing} onClick={handleSave}>
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="Name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField size="small" label="Email" type="email" required placeholder="user@example.com" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} fullWidth />
            <FormControl fullWidth size="small">
              <InputLabel>Functional role</InputLabel>
              <Select value={addForm.roleCode} label="Functional role" onChange={(e) => setAddForm((f) => ({ ...f, roleCode: e.target.value }))}>
                <MenuItem value="">— none —</MenuItem>
                {roleOptions.map((r) => (
                  <MenuItem key={r.code} value={r.code}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" type="password" label="PIN (optional)" placeholder="min 3 chars" value={addForm.pin} onChange={(e) => setAddForm((f) => ({ ...f, pin: e.target.value }))} slotProps={{ htmlInput: { maxLength: 12 } }} fullWidth />
            <Checkbox checked={addForm.isActive} onChange={(e) => setAddForm((f) => ({ ...f, isActive: e.target.checked }))} />
            <Typography variant="caption">Active</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={isCreating || !addForm.email.trim()} onClick={handleAdd}>
            {isCreating ? 'Adding...' : 'Add user'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? 'Deleting...' : 'Confirm delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TenantInlineUserManager;
