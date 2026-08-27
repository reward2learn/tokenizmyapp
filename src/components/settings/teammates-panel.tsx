'use client';

import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  useAddOrgMemberMutation,
  useGetOrganizationQuery,
  useInviteOrgTeammateMutation,
  useListOrgMemberCandidatesQuery,
  type OrgMemberCandidate,
  type OrgMemberRole,
} from '@/store/apis/organization-api';
import { NoOrganization } from '@/components/settings/settings-panel';
import { TenantManagedOrgAlert } from '@/components/settings/tenant-managed-message';

/** Organization billing-seat roles (not tenant app access). */
const SEAT_ROLES: { id: OrgMemberRole; help: string }[] = [
  { id: 'owner', help: 'Full control of plan, credits, seats, and tenants.' },
  { id: 'admin', help: 'Manages tenants and apps. Cannot change billing.' },
  { id: 'billing', help: 'Plan, credits, and invoices only.' },
  { id: 'member', help: 'Org visibility only. No plan or seat changes.' },
];

type PeopleTab = 'seats' | 'app-users';

function candidateLabel(c: OrgMemberCandidate): string {
  const who = c.name || c.email || c.sub;
  const email = c.email && c.name ? ` (${c.email})` : '';
  const where = c.tenantSlug ? ` · ${c.tenantSlug}` : '';
  return `${who}${email}${where}`;
}

/**
 * Settings → Organization → People.
 *
 * Billing seats = org_members (plan / credits).
 * App users = tenant user_accounts (PIN viewers). Invites never grant a seat.
 */
export function TeammatesPanel({
  orgId,
  readOnly = false,
}: {
  orgId: string | null;
  readOnly?: boolean;
}) {
  const { data, isLoading } = useGetOrganizationQuery(orgId ?? '', { skip: !orgId });
  const { data: candidatesData, isLoading: candidatesLoading } = useListOrgMemberCandidatesQuery(
    orgId ?? '',
    { skip: !orgId || readOnly },
  );
  const [addMember, { isLoading: isAdding }] = useAddOrgMemberMutation();
  const [inviteAppUser, { isLoading: isInviting }] = useInviteOrgTeammateMutation();

  const [tab, setTab] = useState<PeopleTab>('seats');
  const [selected, setSelected] = useState<OrgMemberCandidate | null>(null);
  const [role, setRole] = useState<OrgMemberRole>('member');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const members = data?.data?.members ?? [];
  const candidates = candidatesData?.data?.candidates ?? [];
  const tenants = candidatesData?.data?.tenants ?? [];
  const seatCandidates = useMemo(
    () => candidates.filter((c) => !c.alreadyMember),
    [candidates],
  );
  const effectiveTenantSlug = tenantSlug || tenants[0]?.slug || '';

  const memberLabelBySub = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of candidates) {
      map.set(c.sub, candidateLabel(c));
    }
    return map;
  }, [candidates]);

  if (!orgId) return <NoOrganization what="People" />;

  const clearFeedback = () => {
    setError(null);
    setInfo(null);
  };

  const addSeat = async () => {
    if (!selected) return;
    clearFeedback();
    try {
      await addMember({ orgId, userId: selected.sub, role }).unwrap();
      setSelected(null);
      setInfo('Billing seat added. This does not change their app sign-in.');
    } catch {
      setError('Could not add that billing seat.');
    }
  };

  const sendAppInvite = async () => {
    clearFeedback();
    if (!inviteEmail.trim() || !effectiveTenantSlug) {
      setError('Email and tenant are required to invite an app user.');
      return;
    }
    try {
      const result = await inviteAppUser({
        orgId,
        email: inviteEmail.trim(),
        tenantSlug: effectiveTenantSlug,
        name: inviteName.trim() || null,
        appBaseUrl: typeof window !== 'undefined' ? window.location.origin : null,
      }).unwrap();
      setInviteEmail('');
      setInviteName('');
      const warning = result.data?.warning;
      setInfo(
        warning ??
          `Invite sent for ${effectiveTenantSlug}. ${
            result.data?.createdUser ? 'New viewer account created' : 'Existing account updated'
          } with a one-time PIN. No billing seat was granted.`,
      );
    } catch {
      setError('Could not invite that app user.');
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Typography variant="h6">People</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {readOnly
            ? 'Billing seats and app access for your organization. Managed by your administrator.'
            : 'Billing seats share the organization plan and credits. App users sign into a tenant app (PIN viewer) without a billing seat.'}
        </Typography>
      </Box>

      {readOnly && <TenantManagedOrgAlert />}

      <Tabs
        value={tab}
        onChange={(_, next: PeopleTab) => {
          setTab(next);
          clearFeedback();
        }}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="seats" label="Billing seats" />
        <Tab value="app-users" label="App users" />
      </Tabs>

      {error && <Alert severity="error">{error}</Alert>}
      {info && <Alert severity="success">{info}</Alert>}

      {tab === 'seats' ? (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Who can act on this organization&apos;s plan and credit balance. Adding a seat is a
            billing decision — it does not create app sign-in.
          </Typography>

          {isLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : members.length === 0 ? (
            <Alert severity="info">
              No billing seats yet. The organization owner is recorded separately and does not need
              a membership row to be billed.
            </Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Person</TableCell>
                  <TableCell>Seat role</TableCell>
                  <TableCell>Added</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {memberLabelBySub.get(m.userId) ?? m.userId}
                      </Typography>
                      {memberLabelBySub.has(m.userId) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: 'monospace', display: 'block' }}
                        >
                          {m.userId}
                        </Typography>
                      )}
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

          {!readOnly && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Autocomplete
                size="small"
                sx={{ flexGrow: 1, minWidth: 220 }}
                options={seatCandidates}
                loading={candidatesLoading}
                value={selected}
                onChange={(_, value) => setSelected(value)}
                getOptionLabel={candidateLabel}
                isOptionEqualToValue={(a, b) => a.sub === b.sub}
                noOptionsText={
                  candidatesLoading
                    ? 'Loading app users…'
                    : tenants.length === 0
                      ? 'No tenants on this organization yet'
                      : 'No app users available to add as a seat'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Existing app user"
                    helperText="Someone already on a tenant app. Grants a billing seat only."
                  />
                )}
              />
              <TextField
                select
                size="small"
                label="Seat role"
                value={role}
                onChange={(e) => setRole(e.target.value as OrgMemberRole)}
                sx={{ minWidth: 140 }}
                helperText={SEAT_ROLES.find((r) => r.id === role)?.help}
              >
                {SEAT_ROLES.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.id}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                onClick={addSeat}
                disabled={isAdding || !selected}
                sx={{ mt: 0.25 }}
              >
                {isAdding ? 'Adding…' : 'Add seat'}
              </Button>
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Who can sign into a tenant app. Invites create a PIN-tier viewer on the chosen tenant.
            They do not receive a billing seat.
          </Typography>

          {readOnly ? (
            <Alert severity="info">
              App users are managed from the platform console for this organization.
            </Alert>
          ) : candidatesLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : candidates.length === 0 ? (
            <Alert severity="info">
              No app users yet. Invite someone below to create a PIN viewer on a tenant.
            </Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Person</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Auth</TableCell>
                  <TableCell>Billing seat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={`${c.tenantSlug}:${c.sub}`}>
                    <TableCell>
                      <Typography variant="body2">{c.name || c.email || c.sub}</Typography>
                      {c.email && c.name ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {c.email}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{c.tenantSlug}</TableCell>
                    <TableCell>
                      <Chip label={c.tier} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.alreadyMember ? 'Yes' : 'No'}
                        size="small"
                        color={c.alreadyMember ? 'primary' : 'default'}
                        variant={c.alreadyMember ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!readOnly && (
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Invite app user</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'flex-start' }}>
                <TextField
                  size="small"
                  label="Email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  sx={{ flexGrow: 1 }}
                  helperText="Receives a one-time PIN and signs in as a viewer."
                />
                <TextField
                  size="small"
                  label="Display name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  sx={{ minWidth: 160 }}
                  helperText="Shown on the PIN sign-in picker."
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'flex-start' }}>
                <TextField
                  select
                  size="small"
                  label="Tenant app"
                  value={effectiveTenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  sx={{ minWidth: 180, flexGrow: 1 }}
                  helperText="Where the viewer account and PIN are created."
                  disabled={tenants.length === 0}
                >
                  {tenants.map((t) => (
                    <MenuItem key={t.slug} value={t.slug}>
                      {t.displayName} ({t.slug})
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  onClick={sendAppInvite}
                  disabled={isInviting || !inviteEmail.trim() || !effectiveTenantSlug}
                  sx={{ mt: 0.25 }}
                >
                  {isInviting ? 'Inviting…' : 'Send invite'}
                </Button>
              </Stack>
              {tenants.length === 0 && (
                <Alert severity="warning">
                  Assign a tenant to this organization before inviting app users.
                </Alert>
              )}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}
