'use client';

import { Suspense } from 'react';
import Box from '@mui/material/Box';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { ConfigSetupWizard } from '@/components/config/config-setup-wizard';
import { getClientTenantConfig } from '@shared/lib/config/tenant';

function ConfigPageInner() {
  const tenant = getClientTenantConfig();

  return (
    <AuthGate requiredTier="pin" fallback={<SignInPanelGate requiredTier="pin" />}>
      <Box sx={{ mx: 'auto', px: 3, py: 3 }}>
        <ConfigSetupWizard tenantSlug={tenant.slug} />
      </Box>
    </AuthGate>
  );
}

export default function ConfigPage() {
  return (
    <Suspense fallback={null}>
      <ConfigPageInner />
    </Suspense>
  );
}
