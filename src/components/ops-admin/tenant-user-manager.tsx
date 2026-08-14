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
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  useListTenantUsersQuery,
  useUpsertTenantUserMutation,
  useDeleteTenantUserMutation,
  type TenantUserView,
} from '@/store/apis/tenant-api';
import { useListAdminGroupsQuery } from '@/store/apis/admin-api';
import { FUNCTIONAL_ROLES, DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/functional-roles';

/** The platform's own default admin account — deleting it would lock
 *  everyone out of this console. Mirrors the guard in the DELETE route. */
function isProtectedDefaultAdmin(u: TenantUserView): boolean {
  return (
    u.roleCode === 'platform-admin' &&
    (u.email ?? '').toLowerCase() === DEFAULT_PLATFORM_ADMIN_EMAIL.toLowerCase()
  );
}

// ── Props ──────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  tenantDisplayName: string;
}

// ── Form state type ────────────────────────────────────

type FormState = {
  sub: string;
  email: string;
  name: string;
  tier: string;
  roleCode: string;
  groupCodes: string[];
  pin: string;
  isActive: boolean;
};

const defaultForm = (): FormState => ({
  sub: '',
  email: '',
  name: '',
  tier: 'pin',
  roleCode: '',
  groupCodes: [],
  pin: '',
  isActive: true,
});

// ── Component ──────────────────────────────────────────

export function TenantUserManager({ open, onClose, tenantSlug, tenantDisplayName }: Props) {
  // ── Queries ──────────────────────────────────────────
  const { data, isLoading, isError } = useListTenantUsersQuery(tenantSlug);
  const [upsertUser, { isLoading: isSaving }] = useUpsertTenantUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteTenantUserMutation();
  const { data: groupsData } = useListAdminGroupsQuery();

  const allGroups = groupsData?.data?.groups ?? [];
  const users = data?.data?.users ?? [];

  // ── Local state ──────────────────────────────────────
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [form, setForm] = useState<FormState>(defaultForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────

  const startCreate = () => {
    setForm(defaultForm());
    setEditingId(null);
    setMode('form');
    setError(null);
  };

  const startEdit = (user: TenantUserView) => {
    setForm({
      sub: user.sub,
      email: user.email ?? '',
      name: user.name ?? '',
      tier: user.tier,
      roleCode: user.roleCode ?? '',
      groupCodes: user.groups,
      pin: '',
      isActive: user.isActive,
    });
    setEditingId(user.id);
    setMode('form');
    setError(null);
  };

  const handleCancelForm = () => {
    setMode('list');
    setEditingId(null);
    setError(null);
  };

  const handleClose = () => {
    setMode('list');
    setEditingId(null);
    setDeleteConfirm(null);
    setError(null);
    onClose();
  };

  // ── Save ─────────────────────────────────────────────

  const handleSave = async () => {
    setError(null);
    try {
      const result = await upsertUser({
        slug: tenantSlug,
        sub: form.sub,
        email: form.email || null,
        name: form.name || null,
        tier: form.tier,
        roleCode: form.roleCode || null,
        groupCodes: form.groupCodes,
        pin: form.pin || undefined,
        isActive: form.isActive,
      }).unwrap();
      if (result.success) {
        setMode('list');
        setEditingId(null);
      } else {
        setError(result.error ?? 'Failed to save user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // ── Delete ───────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const result = await deleteUser({ slug: tenantSlug, id }).unwrap();
      if (result.success) {
        setDeleteConfirm(null);
      } else {
        setError(result.error ?? 'Failed to delete user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // ── Helpers for display ──────────────────────────────

  const resolveRoleName = (code: string | null): string | null => {
    if (!code) return null;
    return FUNCTIONAL_ROLES.find((r) => r.code === code)?.name ?? code;
  };

  const resolveGroupName = (code: string): string => {
    return allGroups.find((g) => g.code === code)?.name ?? code;
  };

  // ── Render ───────────────────────────────────────────

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === 'form'
          ? editingId
            ? `Edit User — ${form.name || form.sub}`
            : 'Add User'
          : `Users — ${tenantDisplayName} (${tenantSlug})`
        }
      </DialogTitle>

      <DialogContent dividers>
        {/* Error alert */}
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {mode === 'list' ? (
          /* ── List mode ─────────────────────────────── */
          isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">
              Failed to load tenant users. The tenant may not have a user_accounts table migration yet.
            </Alert>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No users found for this tenant.
              </Typography>
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={startCreate}>
                Add User
              </Button>
            </Box>
          ) : (
            <>
              <Stack direction="row" sx={{ mb: 2, justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={startCreate}>
                  Add User
                </Button>
              </Stack>

              <Box sx={{ overflowX: 'auto' }}><Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Person / Sub</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>PIN</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell align="right" sx={{ minWidth: 160 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const roleName = resolveRoleName(user.roleCode);
                    const protectedAdmin = isProtectedDefaultAdmin(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.name ?? '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.sub}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {roleName ? (
                            <Chip label={roleName} size="small" variant="outlined" />
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">••••</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'active' : 'disabled'}
                            size="small"
                            color={user.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {deleteConfirm === user.id ? (
                            /* ── Delete confirmation (inline) ── */
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                              <Typography variant="caption" color="error" sx={{ mr: 0.5, whiteSpace: 'nowrap' }}>
                                Delete {user.name || user.sub}?
                              </Typography>
                              <Button
                                size="small"
                                color="error"
                                variant="contained"
                                disabled={isDeleting}
                                onClick={() => void handleDelete(user.id)}
                                sx={{ minWidth: 80 }}
                              >
                                {isDeleting ? '...' : 'Confirm'}
                              </Button>
                              <Button
                                size="small"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={isDeleting}
                                sx={{ minWidth: 80 }}
                              >
                                No
                              </Button>
                            </Stack>
                          ) : (
                            /* ── Normal action buttons ── */
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                              {user.groups.length > 0 ? (
                                <Tooltip title={`Groups: ${user.groups.map(resolveGroupName).join(', ')}`}>
                                  <Chip
                                    label={`${user.groups.length} group${user.groups.length !== 1 ? 's' : ''}`}
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                    sx={{ height: 20, fontSize: '0.65rem', mr: 0.5 }}
                                  />
                                </Tooltip>
                              ) : null}
                              <Tooltip title="Edit user">
                                <IconButton size="small" onClick={() => startEdit(user)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={protectedAdmin ? "This is the platform administrator's own default account and can't be deleted." : 'Delete user'}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDeleteConfirm(user.id)}
                                    disabled={protectedAdmin}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table></Box>
            </>
          )
        ) : (
          /* ── Form mode ─────────────────────────────── */
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Sub */}
            <TextField
              label="Sub"
              value={form.sub}
              onChange={(e) => setForm((p) => ({ ...p, sub: e.target.value }))}
              disabled={!!editingId}
              required={!editingId}
              fullWidth
              size="small"
              helperText={editingId ? 'Sub cannot be changed after creation' : 'Unique identifier for this user account'}
            />

            {/* Name */}
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              size="small"
              placeholder="Full display name"
            />

            {/* Email */}
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              fullWidth
              size="small"
              placeholder="user@example.com"
            />

            {/* Tier */}
            <FormControl fullWidth size="small">
              <InputLabel id="tier-label">Tier</InputLabel>
              <Select
                labelId="tier-label"
                label="Tier"
                value={form.tier}
                onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}
              >
                <MenuItem value="pin">PIN — Password-based access</MenuItem>
                <MenuItem value="google">Google — OAuth sign-in</MenuItem>
                <MenuItem value="public">Public — No auth required</MenuItem>
              </Select>
            </FormControl>

            {/* Functional Role */}
            <FormControl fullWidth size="small">
              <InputLabel id="role-label">Functional Role</InputLabel>
              <Select
                labelId="role-label"
                label="Functional Role"
                value={form.roleCode}
                onChange={(e) => setForm((p) => ({ ...p, roleCode: e.target.value }))}
              >
                <MenuItem value="">— None —</MenuItem>
                {FUNCTIONAL_ROLES.map((role) => (
                  <MenuItem key={role.code} value={role.code}>
                    {role.name}
                    {role.isPlatformAdmin ? (
                      <Chip label="admin" size="small" color="warning" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                    ) : null}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Security Groups */}
            <FormControl fullWidth size="small">
              <InputLabel id="groups-label">Security Groups</InputLabel>
              <Select
                labelId="groups-label"
                label="Security Groups"
                multiple
                value={form.groupCodes}
                onChange={(e) => setForm((p) => ({ ...p, groupCodes: e.target.value as string[] }))}
                renderValue={(selected) =>
                  (selected as string[]).length === 0
                    ? '— None —'
                    : (selected as string[]).map((c) => resolveGroupName(c)).join(', ')
                }
              >
                {allGroups.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.disabled">
                      No security groups available
                    </Typography>
                  </MenuItem>
                ) : (
                  allGroups.map((g) => (
                    <MenuItem key={g.code} value={g.code}>
                      <Checkbox checked={form.groupCodes.includes(g.code)} size="small" />
                      <ListItemText primary={g.name} secondary={g.code} />
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* PIN */}
            <TextField
              label="PIN"
              type="password"
              value={form.pin}
              onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value }))}
              fullWidth
              size="small"
              placeholder={editingId ? 'Leave blank to keep existing' : 'Required for PIN-tier users'}
              helperText={editingId ? 'Leave empty to keep current PIN unchanged' : '3–12 characters'}
              slotProps={{
                htmlInput: { minLength: 3, maxLength: 12 },
              }}
            />

            {/* Is Active */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
              }
              label="User account is active"
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {mode === 'list' ? (
          <Button onClick={handleClose}>Close</Button>
        ) : (
          <>
            <Button onClick={handleCancelForm} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isSaving || !form.sub.trim()}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
