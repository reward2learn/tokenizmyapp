'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import { CreditUsageAnalyticsTabs } from '@/components/billing/credit-admin-analytics';
import { useGetOrganizationCreditsQuery } from '@/store/apis/organization-api';

/**
 * Settings → Personal → Usage — credit analytics breakdowns only.
 *
 * Org ledger (Usage history + Grants) stays under Organization → Billing →
 * History. That audit trail is tenant/org-scoped; Personal Usage surfaces
 * purchaser and spend breakdowns (users / provider / model) instead.
 */
export function PersonalUsagePanel({ orgId }: { orgId: string }) {
  const { data, isLoading, isError } = useGetOrganizationCreditsQuery(orgId, {
    skip: !orgId,
  });

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 4 }}>
        <BrandedLoadingIndicator />
      </Stack>
    );
  }

  if (isError) {
    return <Alert severity="error">Could not load usage analytics.</Alert>;
  }

  const analytics = data?.data?.analytics;

  if (!analytics) {
    return (
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Usage breakdowns (users, providers, models) are available when your account can read
          organization credit analytics.
        </Typography>
        <Alert severity="info">
          The organization ledger — Usage history and Grants — remains under Billing → History.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        How credits are spent across users, providers, and models. For the raw ledger and grant
        inventory, open Billing → History.
      </Typography>
      <CreditUsageAnalyticsTabs
        users={analytics.users}
        byProvider={analytics.byProvider}
        byModel={analytics.byModel}
      />
    </Stack>
  );
}
