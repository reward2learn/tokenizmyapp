'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { useBillingOrgId, useSelfServeBillingEnabled } from '@/components/billing/use-billing-org';
import { useAppDispatch } from '@/store/hooks';
import { setBillingTab, setSettingsSection, type BillingTab, type SettingsSection } from '@/store/ui-slice';
import { useGetBillingLockStatusQuery } from '@/store/apis/organization-api';

const SETTINGS_SECTIONS: SettingsSection[] = [
  'general',
  'billing',
  'topup',
  'teammates',
  'branding',
  'profile',
  'security',
];

const BILLING_TABS: BillingTab[] = [
  'plan',
  'credit-history',
  'cloud-credits',
  'billing-details',
  'payment-methods',
  'invoices',
];

/**
 * Supplies Settings with the organization + deep-links from
 * `/settings?section=billing&tab=invoices` (dunning unlock path).
 */
export function SettingsGate({ variant = 'page' }: { variant?: 'dialog' | 'page' }) {
  const orgId = useBillingOrgId();
  const selfServeBilling = useSelfServeBillingEnabled();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { data: lockData } = useGetBillingLockStatusQuery(orgId ?? '', { skip: !orgId });

  useEffect(() => {
    const section = searchParams.get('section');
    const tab = searchParams.get('tab');
    if (section && SETTINGS_SECTIONS.includes(section as SettingsSection)) {
      dispatch(setSettingsSection(section as SettingsSection));
    }
    if (tab && BILLING_TABS.includes(tab as BillingTab)) {
      dispatch(setBillingTab(tab as BillingTab));
    }
  }, [searchParams, dispatch]);

  // Locked orgs always land on Billing → Invoices so the owner can pay.
  useEffect(() => {
    if (lockData?.data?.locked) {
      dispatch(setSettingsSection('billing'));
      dispatch(setBillingTab('invoices'));
    }
  }, [lockData?.data?.locked, dispatch]);

  const lock = lockData?.data;

  return (
    <Stack spacing={2}>
      {lock?.locked ? (
        <Alert severity="error">
          <AlertTitle>Account restricted — unpaid invoices</AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Access is restricted until pending invoices are settled.
            {lock.canUnlock
              ? ' As the billing owner, please pay the outstanding invoices below to restore access.'
              : ' Only the billing owner associated with this organization’s payment registration may unlock the account.'}
          </Typography>
          {!lock.canUnlock ? (
            <Typography variant="caption" color="text.secondary">
              Please ask the billing contact on file to sign in and open Settings → Billing → Invoices.
            </Typography>
          ) : null}
        </Alert>
      ) : lock && !lock.locked && (lock.attemptCount > 0 || lock.noticeCount > 0) ? (
        <Alert severity="warning">
          <AlertTitle>Payment past due</AlertTitle>
          Failed collection attempts {lock.attemptCount}/3 · Notices {lock.noticeCount}/3
          {lock.countdown ? ` · Time remaining until restriction: ${lock.countdown}` : null}.
          Please update your payment method or settle open invoices to avoid restriction of service.
        </Alert>
      ) : null}

      <SettingsPanel orgId={orgId} selfServeBilling={selfServeBilling} variant={variant} />

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          href={process.env.NEXT_PUBLIC_SUPPORT_URL || 'mailto:support@tokenizmyapp.com'}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact support
        </Button>
      </Stack>
    </Stack>
  );
}
