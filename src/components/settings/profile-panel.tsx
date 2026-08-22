'use client';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/store/apis/auth-api';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { useUserAvatarUrl } from '@/lib/auth/use-user-avatar-url';

/**
 * Settings → Personal → Profile.
 *
 * Read-only, and that is the honest shape rather than a limitation to apologise
 * for: identity comes from the auth provider. Name, email and picture are
 * Google's copy of the truth, and a field here that let someone edit them would
 * either be overwritten on the next sign-in or drift from what every
 * authorization check actually sees.
 *
 * Read from the auth slice, which the app shell populates once at bootstrap —
 * no request, and no effect.
 */
export function ProfilePanel() {
  const { user, tier, roleCode, platformAdmin } = useAppSelector((s) => s.auth);
  const avatarUrl = useUserAvatarUrl();

  if (!user) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Profile</Typography>
        <Alert severity="info">Not signed in.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h6">Profile</Typography>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar src={avatarUrl} sx={{ width: 64, height: 64 }}>
          {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
        </Avatar>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{user.name ?? 'No name on file'}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Signed in with ${user.authMethod ?? tier}`} size="small" />
            {platformAdmin && <Chip label="Platform admin" size="small" color="primary" />}
          </Stack>
        </Stack>
      </Stack>

      <AvatarUploadSection userEmail={user.email} />

      <TextField
        fullWidth
        label="Email"
        value={user.email ?? '—'}
        slotProps={{ input: { readOnly: true } }}
        helperText="Managed by your sign-in provider."
      />

      <TextField
        fullWidth
        label="Account id"
        value={user.id}
        slotProps={{
          input: { readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.85rem' } },
        }}
        helperText="What Teammates and every authorization check key on."
      />

      {roleCode && (
        <TextField
          fullWidth
          label="Role"
          value={roleCode}
          slotProps={{ input: { readOnly: true } }}
        />
      )}
    </Stack>
  );
}

function AvatarUploadSection({ userEmail }: { userEmail: string | undefined }) {
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | undefined>(undefined);
  const { data: profileData } = useGetUserProfileQuery(undefined, { skip: !userEmail });
  const [updateProfile] = useUpdateUserProfileMutation();

  const customUrl = profileData?.data?.avatarUrl || undefined;
  if (customUrl !== customAvatarUrl) {
    setCustomAvatarUrl(customUrl);
  }

  const handleUpload = async (url: string) => {
    try {
      await updateProfile({ avatarUrl: url }).unwrap();
      setCustomAvatarUrl(url);
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleClear = async () => {
    try {
      await updateProfile({ avatarUrl: '' }).unwrap();
      setCustomAvatarUrl(undefined);
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <AvatarUpload
      avatarUrl={customAvatarUrl}
      onUpload={handleUpload}
      onClear={handleClear}
    />
  );
}
