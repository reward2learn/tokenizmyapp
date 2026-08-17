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
  // PIN is always offered while signed out.
  //
  // It used to be hidden whenever a page required the `google` tier, which is
  // most of them — so a staff member who only has a PIN reached a panel with
  // Google as the sole option and no way in at all. Their credential existed
  // and the product refused to ask for it.
  //
  // A PIN authenticates at staff level, so on a google-only page it signs the
  // user in without unlocking *that* page. That is a real limitation, and the
  // panel says so below rather than letting the form look like it failed.
  const pinUnlocksThisPage = requiredTier !== 'google';
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
          {requiredTier === 'google' ? 'Sign in' : 'Ops sign-in'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {requiredTier === 'google'
            ? 'Sign in with Google for full access, or use a staff PIN.'
            : 'Enter the ops PIN, or sign in with Google for full access.'}
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
            // Needs its own hairline: on a light background a white button with
            // no border has nothing to separate it from the page.
            border: '1px solid',
            borderColor: 'divider',
            mb: 2,
            '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
          }}
        >
          Sign in with Google
        </Button>

        {/* Hidden only when there is genuinely nothing to offer: no PIN users
            exist AND this page does not depend on PIN access. On a PIN-tier
            page the absence IS the story, so the notice below explains it. */}
        {personOptions.length > 0 || usersLoading || pinUnlocksThisPage ? (
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
              // Public-facing copy. This used to name internal functions and
              // tables, which was tolerable while the panel only appeared on
              // staff pages — it is now shown to every signed-out visitor.
              <Alert severity="info" sx={{ textAlign: 'left' }}>
                No staff PIN accounts have been set up yet. Sign in with Google,
                or ask an administrator to add a PIN user.
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

            {!pinUnlocksThisPage && personOptions.length > 0 ? (
              // Says what a PIN will and will not do here, before it is used.
              // Signing in successfully and still seeing the wall reads as a
              // broken login, and the user has no way to tell it apart.
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5, textAlign: 'left' }}
              >
                A PIN signs you in with staff access. This page needs Google
                sign-in, but you will stay signed in everywhere else.
              </Typography>
            ) : null}
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
