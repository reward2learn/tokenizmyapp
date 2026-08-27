'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUserDisplayName } from '@/store/auth-slice';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/store/apis/auth-api';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { useUserAvatarUrl } from '@/lib/auth/use-user-avatar-url';
import { useUserDisplayName } from '@/lib/auth/use-user-display-name';
import { isPlatformApp } from '@shared/lib/config/tenant';

/**
 * Settings → Personal → Profile.
 *
 * Display name and avatar are user-managed overrides stored in `user_profiles`.
 * Email, account id and role come from sign-in / tenant assignment and stay
 * read-only here.
 */
export function ProfilePanel() {
  const dispatch = useAppDispatch();
  const { user, tier, roleCode, platformAdmin } = useAppSelector((s) => s.auth);
  const avatarUrl = useUserAvatarUrl();
  const displayName = useUserDisplayName();
  const onPlatform = isPlatformApp();
  const { data: profileData } = useGetUserProfileQuery(undefined, { skip: !user?.email });
  const [updateProfile, { isLoading: isSaving }] = useUpdateUserProfileMutation();

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Profile</Typography>
        <Alert severity="info">Not signed in.</Alert>
      </Stack>
    );
  }

  const savedDisplayName = profileData?.data?.displayName ?? user.name ?? '';
  const name = nameDraft ?? savedDisplayName;
  const dirty = nameDraft !== null && name.trim() !== savedDisplayName.trim();

  const saveDisplayName = async () => {
    setError(null);
    setSaved(false);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Display name cannot be empty.');
      return;
    }
    try {
      await updateProfile({ displayName: trimmed }).unwrap();
      setNameDraft(null);
      dispatch(setUserDisplayName(trimmed));
      setSaved(true);
    } catch {
      setError('Could not save your display name.');
    }
  };

  const handleAvatarUpload = async (url: string) => {
    await updateProfile({ avatarUrl: url }).unwrap().catch(() => null);
  };

  const handleAvatarClear = async () => {
    await updateProfile({ avatarUrl: '' }).unwrap().catch(() => null);
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h6">Profile</Typography>

      {!onPlatform && (
        <Alert severity="info">
          You can update your display name and avatar here. Your account ID and role are assigned
          by your organization administrator for this app.
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar src={avatarUrl} sx={{ width: 64, height: 64 }}>
          {(displayName || user.email || '?').charAt(0).toUpperCase()}
        </Avatar>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{displayName || 'No name on file'}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Signed in with ${user.authMethod ?? tier}`} size="small" />
            {platformAdmin && <Chip label="Platform admin" size="small" color="primary" />}
          </Stack>
        </Stack>
      </Stack>

      <AvatarUpload
        avatarUrl={profileData?.data?.avatarUrl || undefined}
        onUpload={handleAvatarUpload}
        onClear={handleAvatarClear}
      />

      <TextField
        fullWidth
        label="Display name"
        value={name}
        onChange={(e) => setNameDraft(e.target.value)}
        helperText="Shown across this app. Your sign-in provider name is only the starting default."
      />

      {error && <Alert severity="error">{error}</Alert>}
      {saved && !dirty && <Alert severity="success">Saved.</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={saveDisplayName}
          disabled={!dirty || isSaving || name.trim() === ''}
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>

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
        helperText="Account id (session sub). Billing seats and authorization checks key on this."
      />

      {roleCode && (
        <TextField
          fullWidth
          label="Role"
          value={roleCode}
          slotProps={{ input: { readOnly: true } }}
          helperText={
            onPlatform
              ? undefined
              : 'Your role in this app is set by your organization administrator.'
          }
        />
      )}
    </Stack>
  );
}
