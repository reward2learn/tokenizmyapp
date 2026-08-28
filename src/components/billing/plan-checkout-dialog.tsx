'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { CryptoPlanCheckoutPanel } from '@/components/billing/crypto-plan-checkout-panel';
import {
  EmbeddedPlanCheckout,
  type EmbeddedPlanCheckoutTarget,
} from '@/components/billing/embedded-plan-checkout';
import {
  getPlan,
  planAiCreditsPerMonth,
  prepaidPlanPriceCents,
  type PlanId,
} from '@/lib/billing/plans';
import {
  CRYPTO_PLAN_PREPAID_MONTHS,
  isCryptoPaymentsEnabledClient,
  type CryptoPlanPrepaidMonths,
} from '@/lib/web3/crypto-billing-config';
import { useAppSelector } from '@/store/hooks';
import { cryptoWalletPaymentBlockReason } from '@/store/wallet-slice';

export type PlanCheckoutRail = 'stripe' | 'crypto';

export interface PlanCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  planId: PlanId;
  publishableKey: string | null;
  /** When true, crypto prepaid is hidden (org has Stripe subscription). */
  hasStripeSubscription?: boolean;
  onComplete: () => void;
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/**
 * Dual-rail plan checkout — Stripe recurring monthly or USDC prepaid packs.
 */
export function PlanCheckoutDialog({
  open,
  onClose,
  orgId,
  planId,
  publishableKey,
  hasStripeSubscription = false,
  onComplete,
}: PlanCheckoutDialogProps) {
  const auth = useAppSelector((state) => state.auth);
  const wallet = useAppSelector((state) => state.wallet);
  const [rail, setRail] = useState<PlanCheckoutRail>('stripe');
  const [step, setStep] = useState<'summary' | 'pay'>('summary');
  const [prepaidMonths, setPrepaidMonths] = useState<CryptoPlanPrepaidMonths>(1);

  const cryptoEnabled =
    !hasStripeSubscription && isCryptoPaymentsEnabledClient() && prepaidPlanPriceCents(planId, 1) != null;
  const cryptoWalletBlockReason =
    rail === 'crypto' && cryptoEnabled ? cryptoWalletPaymentBlockReason(auth, wallet) : null;

  const plan = getPlan(planId);
  const monthlyCredits = planAiCreditsPerMonth(plan, 'monthly');
  const stripeTarget: EmbeddedPlanCheckoutTarget = { planId, interval: 'monthly' };

  const resetAndClose = () => {
    setStep('summary');
    setRail('stripe');
    setPrepaidMonths(1);
    onClose();
  };

  const finish = () => {
    setStep('summary');
    setRail('stripe');
    setPrepaidMonths(1);
    onComplete();
    onClose();
  };

  const prepaidPriceCents = prepaidPlanPriceCents(planId, prepaidMonths);

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="md" fullWidth>
      <DialogTitle>Subscribe to {plan.label}</DialogTitle>

      {step === 'summary' && (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {plan.tagline} — <strong>{monthlyCredits}</strong> AI credits / month on this plan.
              </Typography>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Payment method</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={rail}
                  onChange={(_, value: PlanCheckoutRail | null) => {
                    if (value) setRail(value);
                  }}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="stripe" disabled={!publishableKey}>
                    Card — monthly (Stripe)
                  </ToggleButton>
                  <ToggleButton value="crypto" disabled={!cryptoEnabled}>
                    Crypto — prepaid USDC
                  </ToggleButton>
                </ToggleButtonGroup>
                {!publishableKey && rail === 'stripe' ? (
                  <Typography variant="caption" color="text.secondary">
                    Stripe publishable key is required for card checkout.
                  </Typography>
                ) : null}
                {hasStripeSubscription ? (
                  <Typography variant="caption" color="text.secondary">
                    This org has a Stripe subscription — use Change plan for card billing.
                  </Typography>
                ) : null}
              </Stack>

              {rail === 'crypto' && cryptoEnabled ? (
                <FormControl size="small" fullWidth>
                  <InputLabel id="prepaid-months-label">Prepaid term</InputLabel>
                  <Select
                    labelId="prepaid-months-label"
                    label="Prepaid term"
                    value={prepaidMonths}
                    onChange={(e) =>
                      setPrepaidMonths(Number(e.target.value) as CryptoPlanPrepaidMonths)
                    }
                  >
                    {CRYPTO_PLAN_PREPAID_MONTHS.map((months) => (
                      <MenuItem key={months} value={months}>
                        {months} month{months === 1 ? '' : 's'}
                        {prepaidPlanPriceCents(planId, months) != null
                          ? ` — ${formatMoney(prepaidPlanPriceCents(planId, months)!)}`
                          : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}

              {rail === 'crypto' && prepaidPriceCents != null ? (
                <Alert severity="info" variant="outlined">
                  Pay {formatMoney(prepaidPriceCents)} USDC once for {prepaidMonths} month
                  {prepaidMonths === 1 ? '' : 's'} of {plan.label}. No auto-renewal — top up again
                  before the period ends.
                </Alert>
              ) : null}

              {cryptoWalletBlockReason ? (
                <Alert severity="warning" variant="outlined">
                  {cryptoWalletBlockReason}
                </Alert>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetAndClose}>Cancel</Button>
            <Button
              onClick={() => setStep('pay')}
              variant="contained"
              disabled={
                (rail === 'stripe' && !publishableKey) || Boolean(cryptoWalletBlockReason)
              }
            >
              Continue to payment
            </Button>
          </DialogActions>
        </>
      )}

      {step === 'pay' && rail === 'stripe' && publishableKey ? (
        <DialogContent>
          <EmbeddedPlanCheckout
            orgId={orgId}
            target={stripeTarget}
            publishableKey={publishableKey}
            onBack={() => setStep('summary')}
            onComplete={finish}
          />
        </DialogContent>
      ) : null}

      {step === 'pay' && rail === 'crypto' && cryptoEnabled ? (
        <CryptoPlanCheckoutPanel
          orgId={orgId}
          planId={planId}
          prepaidMonths={prepaidMonths}
          onDone={finish}
          onCancel={resetAndClose}
        />
      ) : null}
    </Dialog>
  );
}
