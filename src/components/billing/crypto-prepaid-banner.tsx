'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import type { PlanId } from '@/lib/billing/plans';
import {
  cryptoPrepaidUiStatus,
  formatPaidThroughDate,
} from '@/lib/billing/crypto-prepaid-ui';

export interface CryptoPrepaidBannerProps {
  planId: PlanId | string;
  currentPeriodEnd: string | null | undefined;
  hasStripeSubscription: boolean;
}

/**
 * Plan tab cue for USDC prepaid subscriptions (no Stripe subscription id).
 */
export function CryptoPrepaidBanner({
  planId,
  currentPeriodEnd,
  hasStripeSubscription,
}: CryptoPrepaidBannerProps) {
  const status = cryptoPrepaidUiStatus({
    planId,
    currentPeriodEnd,
    hasStripeSubscription,
  });

  if (status === 'none' || !currentPeriodEnd) return null;

  const paidThrough = formatPaidThroughDate(currentPeriodEnd);

  if (status === 'expired') {
    return (
      <Alert severity="warning">
        <AlertTitle>Prepaid plan expired</AlertTitle>
        Your USDC prepaid period ended on {paidThrough}. Renew with a prepaid pack or switch to
        monthly Stripe billing to restore paid features.
      </Alert>
    );
  }

  if (status === 'expiring_soon') {
    return (
      <Alert severity="warning" variant="outlined">
        <AlertTitle>Prepaid plan ending soon</AlertTitle>
        Paid through {paidThrough}. Top up with another USDC prepaid pack or subscribe via Stripe
        before entitlements lapse.
      </Alert>
    );
  }

  return (
    <Alert severity="info" variant="outlined">
      <AlertTitle>USDC prepaid plan</AlertTitle>
      Paid through {paidThrough}. This plan does not auto-renew — purchase another prepaid pack or
      switch to Stripe for monthly billing.
    </Alert>
  );
}
