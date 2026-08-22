'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  useAddOrgMemberMutation,
  useGetOrganizationQuery,
  type OrgMemberRole,
} from '@/store/apis/organization-api';
import { NoOrganization } from '@/components/settings/settings-panel';
import { TenantManagedOrgAlert } from '@/components/settings/tenant-managed-message';

const ROLES: { id: OrgMemberRole; help: string }[] = [
  { id: 'owner', help: 'Full control, including billing and membership.' },
  { id: 'admin', help: 'Manages tenants and apps. No billing.' },
  { id: 'billing', help: 'Plan, credits and invoices only.' },
  { id: 'member', help: 'Uses the apps. Changes nothing.' },
];

/**
 * Settings → Organization → Teammates.
 *
 * Membership is by account id (`sub`), which is what the session carries and
 * what every other authorization check keys on. Invitations by email would be
 * the friendlier surface, but there is no mail transport in this platform and
 * an invite that never arrives is worse than an explicit id.
 */
export function TeammatesPanel({
  orgId,
  readOnly = false,
}: {
  orgId: string | null;
  readOnly?: boolean;
}) {
  // Members ride along with the organization read rather than a query of their
  // own — one cache entry, so the list cannot disagree with the org it belongs
  // to after an invalidation lands on only one of them.
  const { data, isLoading } = useGetOrganizationQuery(orgId ?? '', { skip: !orgId });
  const [addMember, { isLoading: isAdding }] = useAddOrgMemberMutation();

  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<OrgMemberRole>('member');
  const [error, setError] = useState<string | null>(null);

  if (!orgId) return <NoOrganization what="Teammates" />;

  const members = data?.data?.members ?? [];

  const add = async () => {
    setError(null);
    try {
      await addMember({ orgId, userId: userId.trim(), role }).unwrap();
      setUserId('');
    } catch {
      setError('Could not add that teammate.');
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h6">{readOnly ? 'Team' : 'Teammates'}</Typography>
      <Typography variant="body2" color="text.secondary">
        {readOnly
          ? 'Who belongs to your organization. Membership and roles are managed by your administrator.'
          : 'Who can act on this organization. Membership reaches its plan and credit balance, so adding someone here is a billing decision.'}
      </Typography>

      {readOnly && <TenantManagedOrgAlert />}

      {isLoading ? (
        <Skeleton variant="rounded" height={160} />
      ) : members.length === 0 ? (
        <Alert severity="info">
          No teammates yet. The organization owner is recorded separately and does not need a
          membership row to be billed.
        </Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Added</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {m.userId}
                </TableCell>
                <TableCell>
                  <Chip
                    label={m.role}
                    size="small"
                    color={m.role === 'owner' ? 'primary' : 'default'}
                    variant={m.role === 'member' ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!readOnly && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            size="small"
            label="Account id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ flexGrow: 1 }}
            helperText="The account's sub, as it appears in the session."
          />
          <TextField
            select
            size="small"
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as OrgMemberRole)}
            sx={{ minWidth: 140 }}
            helperText={ROLES.find((r) => r.id === role)?.help}
          >
            {ROLES.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.id}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={add}
            disabled={isAdding || userId.trim() === ''}
            sx={{ mt: 0.25 }}
          >
            {isAdding ? 'Adding…' : 'Add'}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
