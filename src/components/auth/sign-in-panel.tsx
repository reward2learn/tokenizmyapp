'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AuthTier } from '@/lib/page-catalog';
import { useGetSessionQuery, useVerifyPinMutation, useListPinUsersQuery } from '@/store/apis/auth-api';

export interface SignInPanelProps {
  requiredTier: AuthTier;
}

/** 
 * User list now comes entirely from user_accounts + roles via listConfiguredPinUsers
 * (replaces static PERSONS fallback). The RTK Query returns only PIN-configured
 * accounts; lastUsedName drives server-side pre-selection from last_seen_at.
 */
function usePinUsers(): {
  options: { value: string; sub: string }[];
  lastUsedName: string | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useListPinUsersQuery();

  if (isLoading || !data?.success) {
    return {
      options: [],
      lastUsedName: null,
      isLoading,
    };
  }

  if (Array.isArray(data.data?.users)) {
    const active = data.data.users
      .filter((u) => (u as { pinConfigured?: boolean }).pinConfigured)
      .map((u) => ({ value: u.name, sub: u.sub }));
    return {
      options: active,
      lastUsedName: data.data.lastUsedName ?? null,
      isLoading: false,
    };
  }

  return {
    options: [],
    lastUsedName: null,
    isLoading: false,
  };
}

export function SignInPanel({ requiredTier }: SignInPanelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState('');
  const { options: personOptions, lastUsedName, isLoading: usersLoading } = usePinUsers();
  const [personName, setPersonName] = useState('');

  // Prefer the last PIN user persisted in Neon (user_accounts.last_seen_at).
  useEffect(() => {
    if (personOptions.length === 0) return;
    if (lastUsedName && personOptions.some((o) => o.value === lastUsedName)) {
      setPersonName((prev) => (prev === lastUsedName ? prev : lastUsedName));
      return;
    }
    setPersonName((prev) =>
      prev && personOptions.some((o) => o.value === prev) ? prev : personOptions[0].value,
    );
  }, [personOptions, lastUsedName]);

  const [verifyPin, { isLoading, isError, error }] = useVerifyPinMutation();
  const { refetch: refetchSession } = useGetSessionQuery();

  const oauthError = searchParams.get('auth') === 'error';
  const showPin = requiredTier !== 'google';
  const googleHref = googleAuthHref(pathname || '/');

  const handlePinSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pin.trim()) return;
    // Send the person's name so the endpoint can resolve the sub from user_accounts.
    // Successful verify-pin upserts user_accounts.last_seen_at in Neon.
    const result = await verifyPin({ name: personName, pin: pin.trim() });
    if ('data' in result && result.data?.ok) {
      // Cookie is set on the verify-pin response; force a session refetch so
      // AuthProvider updates Redux state and the gate reveals admin content.
      await refetchSession();
    }
  };


  return (
    <Box
      component="section"
      sx={{ textAlign: 'center', py: 6, px: 3 }}
      data-testid="sign-in-panel"
    >
      <Box sx={{ maxWidth: 420, mx: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {requiredTier === 'google' ? 'Sign in to Access' : 'Ops Sign-In'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {requiredTier === 'google'
            ? 'Sign in with Google to view the full business review, AI chat, and operations tracking.'
            : 'Enter the ops PIN or sign in with Google for full access.'}
        </Typography>

        {oauthError ? (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
            Google sign-in failed. Try again or use the ops PIN.
          </Alert>
        ) : null}

        {isError ? (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
            {'data' in (error as object) && error && typeof error === 'object'
              ? String((error as { data?: { error?: string } }).data?.error ?? 'Incorrect PIN')
              : 'Incorrect PIN'}
          </Alert>
        ) : null}

        <Button
          component="a"
          href={googleHref}
          variant="contained"
          color="inherit"
          fullWidth
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            fontWeight: 600,
            mb: showPin ? 2 : 0,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          Sign in with Google
        </Button>

        {showPin ? (
          <>
            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                or
              </Typography>
            </Divider>
            {usersLoading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            ) : personOptions.length === 0 ? (
              <Alert severity="warning" sx={{ textAlign: 'left' }}>
                No PIN-configured user accounts found. PIN users are managed via
                user_accounts + roles (listConfiguredPinUsers). Use Google sign-in or
                configure in admin settings.
              </Alert>
            ) : (
              <Stack
                component="form"
                direction="column"
                spacing={1.5}
                onSubmit={handlePinSubmit}
              >
                <FormControl size="small" fullWidth>
                  <InputLabel id="pin-role-label">User Account</InputLabel>
                  <Select
                    labelId="pin-role-label"
                    label="User Account"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    data-testid="pin-role-select"
                  >
                    {personOptions.map((opt) => (
                      <MenuItem key={opt.sub} value={opt.value}>
                        {opt.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <TextField
                    type="password"
                    placeholder="PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    size="small"
                    fullWidth
                    autoComplete="off"
                    slotProps={{
                      htmlInput: { 'data-testid': 'pin-input', maxLength: 12 },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!pin.trim() || isLoading}
                    data-testid="pin-submit"
                  >
                    {isLoading ? '…' : 'Unlock'}
                  </Button>
                </Stack>
              </Stack>
            )}
          </>
        ) : null}
      </Box>
    </Box>
  );
}

function googleAuthHref(redirectPath: string): string {
  return `/api/auth?action=google&redirect=${encodeURIComponent(redirectPath)}`;
}

export function SignInPanelGate(props: SignInPanelProps) {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">Loading sign-in…</Typography>
        </Box>
      }
    >
      <SignInPanel {...props} />
    </Suspense>
  );
}
