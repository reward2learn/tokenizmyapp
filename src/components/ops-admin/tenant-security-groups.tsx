'use client';

/**
 * TenantSecurityGroups — Security Groups management scoped to a specific tenant.
 *
 * Wraps the GroupManager functionality with tenant context awareness.
 */

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
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

import {
  useListAdminGroupsQuery,
  useCreateAdminGroupMutation,
  useUpdateAdminGroupMutation,
} from '@/store/apis/admin-api';
import type { AdminGroupView } from '@/app/api/admin/groups/route';

interface TenantSecurityGroupsProps {
  tenantSlug: string;
  tenantName?: string;
  appId?: string | null;
}

const CAPABILITIES = [
  { code: 'tenant:read', label: 'Tenant Read' },
  { code: 'tenant:write', label: 'Tenant Write' },
  { code: 'users:read', label: 'Users Read' },
  { code: 'users:write', label: 'Users Write' },
  { code: 'content:read', label: 'Content Read' },
  { code: 'content:write', label: 'Content Write' },
  { code: 'analytics:read', label: 'Analytics Read' },
  { code: 'settings:read', label: 'Settings Read' },
  { code: 'settings:write', label: 'Settings Write' },
];

export function TenantSecurityGroups({ tenantSlug, tenantName, appId }: TenantSecurityGroupsProps) {
  // Query is unscoped, matching this deployment's own admin panel behavior —
  // the tenant/global split below uses the real tenant_slug/app_id columns
  // rather than the old code-prefix heuristic, now that the server populates them.
  const { data, isLoading, isError, refetch } = useListAdminGroupsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateAdminGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateAdminGroupMutation();
  const [newGroup, setNewGroup] = useState<{ code: string; name: string; description: string }>({ code: '', name: '', description: '' });
  const [editing, setEditing] = useState<{ code: string; name: string; description: string | null; permissions: string[] } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.success) {
    return <Alert severity="error">Failed to load security groups for tenant {tenantSlug}.</Alert>;
  }

  const groups = data.data.groups ?? [];

  const handleCreate = async () => {
    if (!newGroup.code.trim() || !newGroup.name.trim()) return;
    // Prefix group code with tenant slug for a readable, unique code — actual
    // scoping/filtering is done via the tenant_slug/app_id columns below.
    const scopedCode = `${tenantSlug}:${newGroup.code.trim().toLowerCase()}`;
    await createGroup({
      code: scopedCode,
      name: `[${tenantName || tenantSlug}] ${newGroup.name.trim()}`,
      description: newGroup.description.trim(),
      tenantSlug,
      ...(appId ? { appId } : {}),
    }).unwrap();
    setNewGroup({ code: '', name: '', description: '' });
    setCreateDialogOpen(false);
    refetch();
  };

  const openEditor = (g: AdminGroupView) => {
    setEditing({ code: g.code, name: g.name, description: g.description, permissions: [...g.permissions] });
  };

  const toggleCap = (cap: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const has = prev.permissions.includes(cap);
      return {
        ...prev,
        permissions: has ? prev.permissions.filter((c) => c !== cap) : [...prev.permissions, cap],
      };
    });
  };

  const handleSavePerms = async () => {
    if (!editing) return;
    await updateGroup({ code: editing.code, permissions: editing.permissions }).unwrap();
    setEditing(null);
    refetch();
  };

  // Filter groups for this tenant (and app, when one is selected) via the real columns.
  const tenantGroups = groups.filter((g) => g.tenantSlug === tenantSlug && (!appId || g.appId === appId));
  const globalGroups = groups.filter((g) => !g.tenantSlug);

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Security Groups — {tenantName || tenantSlug}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Groups gate API calls and routes by membership. Tenant-scoped groups are prefixed with the tenant slug.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            New Group
          </Button>
        </Stack>
      </Stack>

      {/* Tenant-scoped groups */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
        Tenant Groups ({tenantGroups.length})
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Capabilities</TableCell>
            <TableCell align="right">Members</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenantGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary">
                  No tenant-specific groups. Create one to get started.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tenantGroups.map((g) => (
              <TableRow key={g.code}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{g.code}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{g.name}</TableCell>
                <TableCell>{g.description || '—'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {g.permissions.slice(0, 3).map((p) => (
                      <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                    ))}
                    {g.permissions.length > 3 && (
                      <Chip label={`+${g.permissions.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">{g.memberCount ?? 0}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEditor(g)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Global groups (read-only reference) */}
      {globalGroups.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 4, mb: 1 }}>
            Global Groups (Reference)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Capabilities</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {globalGroups.map((g) => (
                <TableRow key={g.code} sx={{ opacity: 0.7 }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{g.code}</TableCell>
                  <TableCell>{g.name}</TableCell>
                  <TableCell>{g.description || '—'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                      {g.permissions.slice(0, 3).map((p) => (
                        <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      ))}
                      {g.permissions.length > 3 && (
                        <Chip label={`+${g.permissions.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Security Group</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Group Code"
              value={newGroup.code}
              onChange={(e) => setNewGroup((prev) => ({ ...prev, code: e.target.value }))}
              helperText={`Will be prefixed as: ${tenantSlug}:<code>`}
              fullWidth
            />
            <TextField
              label="Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={newGroup.description}
              onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={isCreating || !newGroup.code.trim() || !newGroup.name.trim()}>
            {isCreating ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Group Permissions — {editing?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the capabilities this group grants to its members.
          </Typography>
          <Stack spacing={1}>
            {CAPABILITIES.map((cap) => (
              <FormControlLabel
                key={cap.code}
                control={
                  <Checkbox
                    checked={editing?.permissions.includes(cap.code) ?? false}
                    onChange={() => toggleCap(cap.code)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{cap.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {cap.code}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={handleSavePerms} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TenantSecurityGroups;
