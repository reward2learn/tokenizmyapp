'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
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
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import {
  useAssignTenantOrganizationMutation,
  useCreateOrganizationMutation,
  useGetTenantOrganizationQuery,
  useListOrganizationsQuery,
  useUpdateOrganizationMutation,
} from '@/store/apis/organization-api';
import { PLANS, type PlanId } from '@/lib/billing/plans';

function formatPrice(cents: number | null): string {
  if (cents === null) return 'Custom';
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}/mo`;
}

/**
 * Organization context bar — sits above the tenant selector.
 *
 * The Organization is the billing owner (Organization → Tenant → Apps), so this
 * is where plan and entitlements are read and changed. When a tenant is
 * selected it also shows which org pays for that tenant and allows moving it.
 */
export function OrganizationBar({ tenantSlug }: { tenantSlug?: string | null }) {
  const { data: orgList, isLoading } = useListOrganizationsQuery();
  const organizations = orgList?.data?.organizations ?? [];

  const { data: tenantOrg } = useGetTenantOrganizationQuery(tenantSlug ?? '', {
    skip: !tenantSlug,
  });

  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  const [assignTenant, { isLoading: isAssigning }] = useAssignTenantOrganizationMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  // A selected tenant pins the context to its owning org; otherwise the user
  // picks one. Falls back to the first org so the plan controls are never
  // rendered without a target.
  const activeOrgId =
    tenantOrg?.data?.organization.id ?? (selectedOrgId || organizations[0]?.id) ?? '';
  const activeOrg = organizations.find((o) => o.id === activeOrgId) ?? null;
  const plan = tenantOrg?.data?.plan ?? null;
  const subscription = tenantOrg?.data?.subscription ?? null;

  const handleCreate = async () => {
    const displayName = newName.trim();
    if (!displayName) return;
    const result = await createOrganization({ displayName }).unwrap().catch(() => null);
    if (result?.data?.organization) setSelectedOrgId(result.data.organization.id);
    setNewName('');
    setCreateOpen(false);
  };

  const handlePlanChange = async (planId: PlanId) => {
    if (!activeOrgId) return;
    await updateOrganization({ orgId: activeOrgId, planId }).unwrap().catch(() => null);
  };

  const handleOrgChange = async (orgId: string) => {
    setSelectedOrgId(orgId);
    // With a tenant in context, changing the org moves that tenant's billing owner.
    if (tenantSlug && orgId) {
      await assignTenant({ tenantSlug, orgId }).unwrap().catch(() => null);
    }
  };

  const busy = isLoading || isCreating || isUpdating || isAssigning;

  return (
    <>
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <FormControl size="small" sx={{ minWidth: 260, flex: 1 }}>
            <InputLabel id="org-selector-label">Organization</InputLabel>
            <Select
              labelId="org-selector-label"
              label="Organization"
              value={activeOrgId}
              onChange={(e) => handleOrgChange(e.target.value)}
              disabled={busy}
            >
              {organizations.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CorporateFareIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {o.displayName}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {activeOrg && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {/* Support asks users to read this out — keep it copyable. */}
              <Tooltip title="Copy organization ID">
                <Chip
                  label={activeOrg.id}
                  size="small"
                  variant="outlined"
                  onDelete={() => navigator.clipboard?.writeText(activeOrg.id)}
                  deleteIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                  sx={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.7rem' }}
                />
              </Tooltip>

              {plan && (
                <Chip
                  label={`${plan.label} · ${formatPrice(plan.priceMonthly)}`}
                  size="small"
                  color={plan.id === 'free' ? 'default' : 'primary'}
                />
              )}
              {subscription && subscription.status !== 'active' && (
                <Chip label={subscription.status} size="small" color="warning" />
              )}
            </Stack>
          )}

          {tenantSlug && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="plan-selector-label">Plan</InputLabel>
              <Select
                labelId="plan-selector-label"
                label="Plan"
                value={subscription?.planId ?? 'free'}
                onChange={(e) => handlePlanChange(e.target.value as PlanId)}
                disabled={busy || !activeOrgId}
              >
                {PLANS.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.label} — {formatPrice(p.priceMonthly)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Tooltip title="New organization">
            <IconButton size="small" onClick={() => setCreateOpen(true)} aria-label="New organization">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {tenantSlug && plan && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              {plan.features.length > 0
                ? `Includes: ${plan.features.join(', ')}`
                : 'No paid features. Custom domains, teammates and RBAC are blocked on this plan.'}
            </Typography>
          </Box>
        )}
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
    </>
  );
}
