'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/store/hooks';
import { hasAdminAccess } from '@/lib/auth/admin-access';

export interface AdminAccessGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children when the session is a platform admin or holds an admin-area
 * capability (e.g. pages:write, config:write). Otherwise shows access denied
 * or the sign-in fallback.
 */
export function AdminAccessGate({ children, fallback }: AdminAccessGateProps) {
  const { platformAdmin, bootstrapped, tier, groups, permissions } = useAppSelector((s) => s.auth);

  if (!bootstrapped) {
    return <p>Checking session…</p>;
  }

  if (hasAdminAccess(platformAdmin, groups, permissions)) {
    return <>{children}</>;
  }

  if (tier !== 'public') {
    return (
      <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Admin access required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You are signed in, but your account does not have admin capabilities.
          Ask a platform administrator to add you to a group with pages:write,
          config:write, or another admin permission.
        </Typography>
      </Box>
    );
  }

  return (
    fallback ?? (
      <p style={{ padding: 24, textAlign: 'center', color: '#888' }}>
        Sign in with PIN or Google to access admin.
      </p>
    )
  );
}
