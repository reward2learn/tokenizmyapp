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

import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

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
import { CAPABILITY_AREAS, capability } from '@/domain/security/capabilities';

interface TenantSecurityGroupsProps {
  tenantSlug: string;
  tenantName?: string;
  appId?: string | null;
}

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
    // Editing is only ever offered for tenant groups (see the Edit IconButton
    // below) — this tenant's own dedicated database is where the row lives.
    await updateGroup({
      code: editing.code,
      permissions: editing.permissions,
      tenantSlug,
      ...(appId ? { appId } : {}),
    }).unwrap();
    setEditing(null);
    refetch();
  };

  // Filter groups for this tenant (and app, when one is selected) via the real columns.
  const tenantGroups = groups.filter((g) => g.tenantSlug === tenantSlug && (!appId || g.appId === appId));
  const globalGroups = groups.filter((g) => !g.tenantSlug);

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
            Security Groups — {tenantName || tenantSlug}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Groups gate API calls and routes by membership. Tenant-scoped groups are prefixed with the tenant slug.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
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
      <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
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
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{g.code}</TableCell>
                  <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{g.name}</TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{g.description || '—'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {g.permissions.slice(0, 3).map((p) => (
                        <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', maxWidth: 160 }} />
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
      </TableContainer>

      {/* Global groups (read-only reference) */}
      {globalGroups.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 4, mb: 1 }}>
            Global Groups (Reference)
          </Typography>
          <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 560 }}>
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
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{g.code}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{g.name}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{g.description || '—'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                        {g.permissions.slice(0, 3).map((p) => (
                          <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', maxWidth: 160 }} />
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
          </TableContainer>
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
          <Stack spacing={2}>
            {CAPABILITY_AREAS.map((area) => (
              <Box key={area.area}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{area.label}</Typography>
                <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {area.accesses.map((acc) => {
                    const cap = capability(area.area, acc);
                    return (
                      <FormControlLabel
                        key={cap}
                        control={
                          <Checkbox
                            checked={editing?.permissions.includes(cap) ?? false}
                            onChange={() => toggleCap(cap)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {acc === 'use' ? 'Use' : acc === 'read' ? 'Read' : 'Write'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {cap}
                            </Typography>
                          </Box>
                        }
                      />
                    );
                  })}
                </Stack>
              </Box>
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
