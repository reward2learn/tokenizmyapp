'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { AuthTier } from '@/lib/page-catalog';
import { tierAllowsAccess } from '@/lib/auth/tier-access';
import { useAppSelector } from '@/store/hooks';

export interface AuthGateProps {
  requiredTier: AuthTier;
  requiredGroups?: string[];
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function AuthGate({
  requiredTier,
  requiredGroups,
  children,
  fallback = <p>Sign in required to view this page.</p>,
  loadingFallback = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  ),
}: AuthGateProps) {
  const { tier, bootstrapped, groups, platformAdmin } = useAppSelector((state) => state.auth);

  if (!bootstrapped) {
    return loadingFallback;
  }

  if (!tierAllowsAccess(tier, requiredTier)) {
    return fallback;
  }

  if (requiredGroups && requiredGroups.length > 0) {
    const isAdmin =
      Boolean(platformAdmin) || (groups ?? []).includes('platform-admin');
    if (!isAdmin) {
      const hasGroup = (groups ?? []).some((g) => requiredGroups.includes(g));
      if (!hasGroup) {
        return fallback ?? <p>You don&apos;t have access to this section.</p>;
      }
    }
  }

  return children;
}
