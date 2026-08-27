'use client';

/**
 * TenantSecurityGroups — Security Groups management scoped to a specific tenant.
 *
 * Platform admins can CRUD both Tenant Groups and Global Groups (reference
 * catalog in the resolved DB), including read/write capability toggles via a
 * per-row three-dot menu.
 */

import { useState, type MouseEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';

import {
  useListAdminGroupsQuery,
  useCreateAdminGroupMutation,
  useUpdateAdminGroupMutation,
  useDeleteAdminGroupMutation,
} from '@/store/apis/admin-api';
import type { AdminGroupView } from '@/app/api/admin/groups/route';
import { CAPABILITY_AREAS, capability } from '@/domain/security/capabilities';

interface TenantSecurityGroupsProps {
  tenantSlug: string;
  tenantName?: string;
  appId?: string | null;
}

type EditingPermissions = {
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  tenantSlug: string | null;
};

type EditingDetails = {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  tenantSlug: string | null;
};

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

function CapabilityChips({ permissions }: { permissions: string[] }) {
  if (permissions.includes('*')) {
    return <Chip label="all (*)" size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem' }} />;
  }
  if (!permissions.length) {
    return (
      <Typography variant="caption" color="text.secondary">
        none
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {permissions.slice(0, 3).map((p) => (
        <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', maxWidth: 160 }} />
      ))}
      {permissions.length > 3 && (
        <Chip label={`+${permissions.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
      )}
    </Stack>
  );
}

export function TenantSecurityGroups({ tenantSlug, tenantName, appId }: TenantSecurityGroupsProps) {
  // Scope the query so resolveGroupsDb hits this tenant's dedicated DB (when
  // configured). Inclusive server filter returns globals + this tenant's rows.
  const listScope = { tenantSlug, ...(appId ? { appId } : {}) };
  const { data, isLoading, isError, refetch } = useListAdminGroupsQuery(listScope);
  const [createGroup, { isLoading: isCreating }] = useCreateAdminGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateAdminGroupMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteAdminGroupMutation();

  const [newGroup, setNewGroup] = useState<{ code: string; name: string; description: string }>({
    code: '',
    name: '',
    description: '',
  });
  /** Initial capability codes applied on create. Empty = no access until Edit permissions. */
  const [createPermissions, setCreatePermissions] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPerms, setEditingPerms] = useState<EditingPermissions | null>(null);
  const [editingDetails, setEditingDetails] = useState<EditingDetails | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<AdminGroupView | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuGroup, setMenuGroup] = useState<AdminGroupView | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const mutationScopeFor = (groupTenantSlug: string | null) => ({
    // Prefer the group's own tenant scope; fall back to the panel tenant so
    // global rows still resolve to this tenant's dedicated DB when present.
    tenantSlug: groupTenantSlug ?? tenantSlug,
    ...(appId ? { appId } : {}),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator />
      </Box>
    );
  }

  if (isError || !data?.success) {
    return <Alert severity="error">Failed to load security groups for tenant {tenantSlug}.</Alert>;
  }

  const groups = data.data.groups ?? [];
  const tenantGroups = groups.filter((g) => g.tenantSlug === tenantSlug && (!appId || g.appId === appId));
  const globalGroups = groups.filter((g) => !g.tenantSlug);

  const openMenu = (event: MouseEvent<HTMLElement>, group: AdminGroupView) => {
    setMenuAnchor(event.currentTarget);
    setMenuGroup(group);
    setActionError(null);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuGroup(null);
  };

  const handleCreate = async () => {
    if (!newGroup.code.trim() || !newGroup.name.trim()) return;
    setActionError(null);
    const scopedCode = `${tenantSlug}:${newGroup.code.trim().toLowerCase()}`;
    try {
      await createGroup({
        code: scopedCode,
        name: `[${tenantName || tenantSlug}] ${newGroup.name.trim()}`,
        description: newGroup.description.trim(),
        permissions: createPermissions,
        tenantSlug,
        ...(appId ? { appId } : {}),
      }).unwrap();
      setNewGroup({ code: '', name: '', description: '' });
      setCreatePermissions([]);
      setCreateDialogOpen(false);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to create group'));
    }
  };

  const openPermissionsEditor = (g: AdminGroupView) => {
    closeMenu();
    setEditingPerms({
      code: g.code,
      name: g.name,
      description: g.description,
      permissions: [...g.permissions],
      isSystem: g.isSystem,
      tenantSlug: g.tenantSlug,
    });
  };

  const openDetailsEditor = (g: AdminGroupView) => {
    closeMenu();
    setEditingDetails({
      code: g.code,
      name: g.name,
      description: g.description ?? '',
      isSystem: g.isSystem,
      tenantSlug: g.tenantSlug,
    });
  };

  const openDeleteConfirm = (g: AdminGroupView) => {
    closeMenu();
    setDeletingGroup(g);
  };

  const toggleCap = (cap: string) => {
    setEditingPerms((prev) => {
      if (!prev) return prev;
      // Selecting any concrete capability clears the wildcard so the matrix is the source of truth.
      const withoutWildcard = prev.permissions.filter((c) => c !== '*');
      const has = withoutWildcard.includes(cap);
      return {
        ...prev,
        permissions: has ? withoutWildcard.filter((c) => c !== cap) : [...withoutWildcard, cap],
      };
    });
  };

  const handleSavePerms = async () => {
    if (!editingPerms) return;
    setActionError(null);
    try {
      await updateGroup({
        code: editingPerms.code,
        permissions: editingPerms.permissions,
        ...mutationScopeFor(editingPerms.tenantSlug),
      }).unwrap();
      setEditingPerms(null);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to save permissions'));
    }
  };

  const handleSaveDetails = async () => {
    if (!editingDetails) return;
    setActionError(null);
    try {
      await updateGroup({
        code: editingDetails.code,
        name: editingDetails.name.trim(),
        description: editingDetails.description.trim(),
        // Preserve existing permissions — PATCH replaces the array when sent.
        permissions: groups.find((g) => g.code === editingDetails.code)?.permissions ?? [],
        ...mutationScopeFor(editingDetails.tenantSlug),
      }).unwrap();
      setEditingDetails(null);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to update group'));
    }
  };

  const handleDelete = async () => {
    if (!deletingGroup) return;
    setActionError(null);
    try {
      await deleteGroup({
        code: deletingGroup.code,
        ...mutationScopeFor(deletingGroup.tenantSlug),
      }).unwrap();
      setDeletingGroup(null);
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Failed to delete group'));
    }
  };

  const renderGroupRow = (g: AdminGroupView, { muted }: { muted?: boolean } = {}) => (
    <TableRow key={g.code} sx={muted ? { opacity: 0.85 } : undefined}>
      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {g.code}
      </TableCell>
      <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{g.name}</span>
          {g.isSystem ? <Chip label="system" size="small" color="info" variant="outlined" sx={{ fontSize: '0.65rem' }} /> : null}
        </Stack>
      </TableCell>
      <TableCell sx={{ wordBreak: 'break-word' }}>{g.description || '—'}</TableCell>
      <TableCell>
        <CapabilityChips permissions={g.permissions} />
      </TableCell>
      <TableCell align="right">{g.memberCount ?? 0}</TableCell>
      <TableCell align="right">
        <IconButton
          size="small"
          aria-label={`Actions for ${g.code}`}
          onClick={(e) => openMenu(e, g)}
        >
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
            Security Groups — {tenantName || tenantSlug}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Groups gate API calls and routes by membership. Use the ⋮ menu on any row to edit
            details, set read/write capabilities, or delete (non-system) groups.
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

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

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
              tenantGroups.map((g) => renderGroupRow(g))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Global groups — editable for platform admins */}
      {globalGroups.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 4, mb: 1 }}>
            Global Groups ({globalGroups.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Shared catalog in this tenant&apos;s database. Capability changes apply to members of
            these groups in this environment.
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
              <TableBody>{globalGroups.map((g) => renderGroupRow(g, { muted: true }))}</TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Per-row three-dot menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor) && Boolean(menuGroup)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => menuGroup && openPermissionsEditor(menuGroup)}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit permissions" secondary="Read / write capabilities" />
        </MenuItem>
        <MenuItem onClick={() => menuGroup && openDetailsEditor(menuGroup)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit details" secondary="Name and description" />
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={menuGroup?.isSystem}
          onClick={() => menuGroup && openDeleteConfirm(menuGroup)}
          sx={{ color: menuGroup?.isSystem ? undefined : 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color={menuGroup?.isSystem ? 'inherit' : 'error'} />
          </ListItemIcon>
          <ListItemText
            primary="Delete group"
            secondary={menuGroup?.isSystem ? 'System groups cannot be deleted' : undefined}
          />
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Security Group</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Group Code"
              value={newGroup.code}
              onChange={(e) => setNewGroup((prev) => ({ ...prev, code: e.target.value }))}
              helperText={`Will be stored as: ${tenantSlug}:<code>`}
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
            {/*
              LEARNING HOOK — initial permissions on create.
              Wire checkboxes here that toggle entries in `createPermissions`
              (same CAPABILITY_AREAS / capability() pattern as Edit Permissions).
              Trade-off: pick access at create time (faster) vs leave empty and
              force an explicit Edit permissions step (safer / more deliberate).
            */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Initial permissions ({createPermissions.length} selected)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                TODO: add Read/Write checkboxes per capability area (see Edit Permissions dialog).
                Leaving this empty means the group grants no API access until you edit permissions.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => void handleCreate()}
            variant="contained"
            disabled={isCreating || !newGroup.code.trim() || !newGroup.name.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog open={!!editingDetails} onClose={() => setEditingDetails(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Group — {editingDetails?.code}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editingDetails?.name ?? ''}
              onChange={(e) =>
                setEditingDetails((prev) => (prev ? { ...prev, name: e.target.value } : prev))
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={editingDetails?.description ?? ''}
              onChange={(e) =>
                setEditingDetails((prev) => (prev ? { ...prev, description: e.target.value } : prev))
              }
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingDetails(null)}>Cancel</Button>
          <Button
            onClick={() => void handleSaveDetails()}
            variant="contained"
            disabled={isUpdating || !editingDetails?.name.trim()}
          >
            {isUpdating ? 'Saving...' : 'Save Details'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!editingPerms} onClose={() => setEditingPerms(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Permissions — {editingPerms?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the capabilities this group grants to its members. Read vs write is enforced per
            area by API guards.
          </Typography>
          {editingPerms?.permissions.includes('*') ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This group currently has the <code>*</code> wildcard (all capabilities). Toggling any
              checkbox below replaces the wildcard with an explicit set.
            </Alert>
          ) : null}
          <Stack spacing={2}>
            {CAPABILITY_AREAS.map((area) => (
              <Box key={area.area}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {area.label}
                </Typography>
                <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {area.accesses.map((acc) => {
                    const cap = capability(area.area, acc);
                    const checked =
                      (editingPerms?.permissions.includes('*') ?? false) ||
                      (editingPerms?.permissions.includes(cap) ?? false);
                    return (
                      <FormControlLabel
                        key={cap}
                        control={<Checkbox checked={checked} onChange={() => toggleCap(cap)} />}
                        label={
                          <Box>
                            <Typography variant="body2">
                              {acc === 'use' ? 'Use' : acc === 'read' ? 'Read' : 'Write'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: 'monospace' }}
                            >
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
          <Button onClick={() => setEditingPerms(null)}>Cancel</Button>
          <Button onClick={() => void handleSavePerms()} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deletingGroup} onClose={() => setDeletingGroup(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete group?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{deletingGroup?.code}</strong>
            {deletingGroup?.memberCount
              ? ` (${deletingGroup.memberCount} member${deletingGroup.memberCount === 1 ? '' : 's'})`
              : ''}
            ? Memberships for this group will be removed. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingGroup(null)}>Cancel</Button>
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

export default TenantSecurityGroups;
