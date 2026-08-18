'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} from '@/store/apis/organization-api';
import { NoOrganization } from '@/components/settings/settings-panel';
import { RADIUS } from '@/theme/design-tokens';

/**
 * Settings → Organization → General.
 *
 * Name, slug and logo are the three fields `updateOrganization` accepts; there
 * is deliberately nothing here it cannot persist.
 */
export function OrganizationGeneralPanel({ orgId }: { orgId: string | null }) {
  const { data, isLoading } = useGetOrganizationQuery(orgId ?? '', { skip: !orgId });
  const [update, { isLoading: isSaving }] = useUpdateOrganizationMutation();

  const organization = data?.data?.organization ?? null;

  // Seeded from the server value and only diverging once someone types. Held
  // as null rather than '' so "untouched" is distinguishable from "cleared" —
  // otherwise a save would send an empty name the moment the query resolved.
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [slugDraft, setSlugDraft] = useState<string | null>(null);
  const [logoDraft, setLogoDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!orgId) return <NoOrganization what="General settings" />;
  if (isLoading || !organization) return <Skeleton variant="rounded" height={360} />;

  const name = nameDraft ?? organization.displayName;
  const slug = slugDraft ?? organization.slug;
  const logoUrl = logoDraft ?? organization.logoUrl ?? '';

  const dirty =
    name !== organization.displayName ||
    slug !== organization.slug ||
    logoUrl !== (organization.logoUrl ?? '');

  const save = async () => {
    setError(null);
    setSaved(false);
    try {
      await update({
        orgId,
        displayName: name.trim(),
        slug: slug.trim(),
        logoUrl: logoUrl.trim() === '' ? null : logoUrl.trim(),
      }).unwrap();
      // Drop the drafts so the fields track the server again — otherwise a
      // slug the server rewrote (it slugifies) would keep showing what was
      // typed rather than what was stored.
      setNameDraft(null);
      setSlugDraft(null);
      setLogoDraft(null);
      setSaved(true);
    } catch {
      setError('Could not save. The slug may already be taken by another organization.');
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h6">General Settings</Typography>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar
          src={logoUrl || undefined}
          variant="rounded"
          sx={{ width: 64, height: 64, borderRadius: `${RADIUS.card}px`, bgcolor: 'action.hover' }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Organization Logo
          </Typography>
          {/*
            A URL, not a file picker. There is no blob store wired up, so an
            upload button would have nowhere to put the bytes — and a control
            that cannot complete its own action is worse than a plainer one
            that works.
          */}
          <TextField
            fullWidth
            size="small"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoDraft(e.target.value)}
            helperText="Public image URL"
          />
        </Box>
      </Stack>

      <TextField
        fullWidth
        label="Organization Name"
        value={name}
        onChange={(e) => setNameDraft(e.target.value)}
      />

      <TextField
        fullWidth
        label="Organization slug"
        value={slug}
        onChange={(e) => setSlugDraft(e.target.value)}
        helperText="Lowercase and URL-safe. The server normalises what you type."
      />

      {error && <Alert severity="error">{error}</Alert>}
      {saved && !dirty && <Alert severity="success">Saved.</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={save}
          disabled={!dirty || isSaving || name.trim() === '' || slug.trim() === ''}
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Organization ID"
        value={organization.id}
        slotProps={{
          input: {
            readOnly: true,
            sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Copy organization ID">
                  <IconButton
                    size="small"
                    aria-label="Copy organization ID"
                    onClick={() => navigator.clipboard?.writeText(organization.id)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
        helperText="Support asks for this. It is not secret."
      />
    </Stack>
  );
}
