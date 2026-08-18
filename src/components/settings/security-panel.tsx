'use client';

import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/store/hooks';

/**
 * Settings → Personal → Security.
 *
 * What this session can actually do, rather than switches to change it. Groups
 * and permissions are assigned per tenant in Admin → Security groups; showing
 * them here answers the question people bring to a Security page ("why can I
 * not see X?") without creating a second place to grant access, which would
 * immediately disagree with the first.
 *
 * Password and MFA are absent because there is no password: sign-in is Google
 * or a tenant PIN, both owned elsewhere.
 */
export function SecurityPanel() {
  const { tier, groups, permissions, platformAdmin } = useAppSelector((s) => s.auth);

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h6">Security</Typography>

      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          Sign-in method
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={tier} size="small" color={tier === 'google' ? 'primary' : 'default'} />
          {platformAdmin && <Chip label="Platform admin" size="small" color="primary" />}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {tier === 'google'
            ? 'Your Google account owns this identity, including password and two-factor settings.'
            : 'PIN sign-in. Rotate the PIN from the tenant’s settings in Admin.'}
        </Typography>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          Groups
        </Typography>
        {groups.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No group memberships on this session.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {groups.map((g) => (
              <Chip key={g} label={g} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          Permissions
        </Typography>
        {permissions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No explicit capabilities. Access follows the tier above.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {permissions.map((p) => (
              <Chip key={p} label={p} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </Stack>

      <Alert severity="info">
        Groups and permissions are granted per tenant in Admin → Security groups. This page
        reports them; it does not change them.
      </Alert>
    </Stack>
  );
}
