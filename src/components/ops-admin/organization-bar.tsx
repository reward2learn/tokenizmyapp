'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAdminSelectedOrg } from '@/store/ui-slice';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useAssignTenantOrganizationMutation,
  useCreateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetTenantOrganizationQuery,
  useListOrganizationsQuery,
} from '@/store/apis/organization-api';
import { ADMIN_SELECT_MENU_PROPS } from '@/components/ops-admin/admin-select-menu-props';

/**
 * Organization context bar — sits above the tenant selector.
 *
 * Plans are purchased at the tenant / app billing surface (Settings → Billing),
 * not here. This bar only scopes which organization is in view and who pays
 * for the selected tenant.
 */
export function OrganizationBar({ tenantSlug }: { tenantSlug?: string | null }) {
  const { data: orgList, isLoading } = useListOrganizationsQuery();
  const organizations = orgList?.data?.organizations ?? [];

  const { data: tenantOrg } = useGetTenantOrganizationQuery(tenantSlug ?? '', {
    skip: !tenantSlug,
  });

  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();
  const [assignTenant, { isLoading: isAssigning }] = useAssignTenantOrganizationMutation();
  const [deleteOrg, { isLoading: isDeleting }] = useDeleteOrganizationMutation();

  const dispatch = useAppDispatch();
  const selectedOrgId = useAppSelector((state) => state.ui.adminSelectedOrgId) ?? '';

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmDeleteOrg, setConfirmDeleteOrg] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  // The picker drives the panel, not the other way round.
  //
  // It used to derive from the selected tenant's owning org, which made sense
  // while this bar only displayed billing context. Now that the tenant list
  // below filters on it, that direction is inverted: choosing an organization
  // scopes the panel, and '' means "all organizations".
  const activeOrgId =
    selectedOrgId || tenantOrg?.data?.organization.id || organizations[0]?.id || '';
  const activeOrg = organizations.find((o) => o.id === activeOrgId) ?? null;
  const subscription = tenantOrg?.data?.subscription ?? null;

  const handleCreate = async () => {
    const displayName = newName.trim();
    if (!displayName) return;
    const result = await createOrganization({ displayName }).unwrap().catch(() => null);
    // Jump straight to the new organization — it has no tenants yet, so the
    // filtered list below is empty and the next action is obviously to add one.
    if (result?.data?.organization) dispatch(setAdminSelectedOrg(result.data.organization.id));
    setNewName('');
    setCreateOpen(false);
  };

  const handleDeleteOrg = async (orgId: string) => {
    setConfirmDeleteOrg(orgId);
  };

  // Filtering only. Moving a tenant is an explicit action below.
  const handleOrgChange = (orgId: string) => {
    dispatch(setAdminSelectedOrg(orgId || null));
  };

  /** Move the selected tenant into the organization currently being viewed. */
  const handleMoveTenant = async () => {
    if (!tenantSlug || !activeOrgId) return;
    await assignTenant({ tenantSlug, orgId: activeOrgId }).unwrap().catch(() => null);
  };

  const tenantOrgId = tenantOrg?.data?.organization.id ?? null;
  const canMoveTenant = Boolean(tenantSlug && activeOrgId && tenantOrgId && tenantOrgId !== activeOrgId);

  const busy = isLoading || isCreating || isAssigning;

  return (
    <>
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'visible', maxWidth: '100%' }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: 0, md: 260 },
              width: { xs: '100%', md: 'auto' },
              maxWidth: '100%',
              flex: { xs: 'none', md: '1 1 260px' },
            }}
          >
            <InputLabel id="org-selector-label" shrink>
              Organization
            </InputLabel>
            <Select
              labelId="org-selector-label"
              label="Organization"
              value={selectedOrgId}
              onChange={(e) => handleOrgChange(e.target.value)}
              disabled={busy}
              displayEmpty
              notched
              MenuProps={ADMIN_SELECT_MENU_PROPS}
            >
              <MenuItem value="">
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CorporateFareIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    All organizations
                  </Typography>
                </Stack>
              </MenuItem>
              {organizations.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CorporateFareIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {o.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(o.tenants?.length ?? 0) === 1
                        ? '1 tenant'
                        : `${o.tenants?.length ?? 0} tenants`}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack
            direction="row"
            spacing={0.5}
            useFlexGap
            sx={{
              alignItems: 'center',
              // Full width in the column layout (<900px) so chips/actions wrap on their own row.
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
              maxWidth: '100%',
              flexWrap: 'wrap',
              rowGap: 0.5,
              flex: { md: '0 1 auto' },
              flexShrink: { md: 0 },
            }}
          >
            {activeOrg ? (
              <>
                <Tooltip title="Copy organization ID">
                  <Chip
                    label={activeOrg.id}
                    size="small"
                    variant="outlined"
                    onDelete={() => navigator.clipboard?.writeText(activeOrg.id)}
                    deleteIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      fontSize: '0.7rem',
                      maxWidth: '100%',
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-all',
                      },
                    }}
                  />
                </Tooltip>

                {canMoveTenant ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleMoveTenant}
                    disabled={isAssigning}
                    sx={{ maxWidth: '100%', wordBreak: 'break-word' }}
                  >
                    {isAssigning ? 'Moving…' : `Move ${tenantSlug} here`}
                  </Button>
                ) : null}

                {subscription && subscription.status !== 'active' ? (
                  <Chip label={subscription.status} size="small" color="warning" />
                ) : null}
              </>
            ) : null}

            <Tooltip title="New organization">
              <IconButton size="small" onClick={() => setCreateOpen(true)} aria-label="New organization">
                <AddIcon />
              </IconButton>
            </Tooltip>
            {activeOrg ? (
              <Tooltip title="Delete organization">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteOrg(activeOrg.id)}
                  aria-label="Delete organization"
                  disabled={busy || isDeleting}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            helperText="The billing owner for one or more tenants."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim() || isCreating}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmDeleteOrg)} onClose={() => setConfirmDeleteOrg(null)} fullWidth maxWidth="sm">
        <DialogTitle>Delete organization</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this organization?</p>
          <p style={{ color: 'error', marginBottom: 2 }}>
            This will reassign all tenants to the default organization and cannot be undone.
          </p>
          <p>Organization: <strong>{confirmDeleteOrg}</strong></p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOrg(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              deleteOrg({ orgId: confirmDeleteOrg! }).unwrap()
                .then(() => {
                  setSnackbar({ message: 'Organization deleted successfully', severity: 'success' });
                  setConfirmDeleteOrg(null);
                })
                .catch((err: unknown) => {
                  const message =
                    err && typeof err === 'object' && 'data' in err
                      ? String((err as { data?: { error?: string } }).data?.error ?? 'Failed to delete organization')
                      : 'Failed to delete organization';
                  setSnackbar({
                    message,
                    severity: 'error',
                  });
                });
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={5000} onClose={() => setSnackbar(null)}>
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} sx={{ maxWidth: 480 }}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
