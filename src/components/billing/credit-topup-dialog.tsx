'use client';

import { useState } from 'react';
import {
  CheckoutElementsProvider,
} from '@stripe/react-stripe-js/checkout';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import { CryptoTopUpPanel } from '@/components/billing/crypto-topup-panel';
import {
  StripePaymentForm,
  stripeFor,
} from '@/components/ops-admin/stripe-topup-dialog';
import { CREDIT_PACKS } from '@/lib/billing/plans';
import { isCryptoPaymentsEnabledClient } from '@/lib/web3/crypto-billing-config';
import {
  organizationApi,
  useCreateTopUpIntentMutation,
} from '@/store/apis/organization-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cryptoWalletPaymentBlockReason } from '@/store/wallet-slice';

export type TopUpRail = 'stripe' | 'crypto';

export interface CreditTopUpDialogProps {
  open: boolean;
  orgId: string;
  packId: string;
  /** Dynamic pack for custom amounts — bypasses CREDIT_PACKS lookup. */
  customPack?: {
    id: string;
    label: string;
    priceCents: number;
    baseCredits: number;
    bonusCredits: number;
  } | null;
  onClose: () => void;
}

/**
 * Dual-rail credit top-up — Card (Stripe) or Crypto (USDC).
 *
 * Stripe remains the default rail; crypto is opt-in when factory web3 is enabled.
 */
export function CreditTopUpDialog({ open, orgId, packId, customPack, onClose }: CreditTopUpDialogProps) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const wallet = useAppSelector((state) => state.wallet);
  const cryptoEnabled = isCryptoPaymentsEnabledClient();
  const [rail, setRail] = useState<TopUpRail>('stripe');
  const [step, setStep] = useState<'summary' | 'pay'>('summary');
  const [createIntent, { data, isLoading, error, reset }] = useCreateTopUpIntentMutation();

  const pack = customPack ?? (CREDIT_PACKS.find((p) => p.id === packId) ?? null);
  const session = data?.data ?? null;
  const totalCredits = pack ? pack.baseCredits + pack.bonusCredits : 0;
  const cryptoWalletBlockReason =
    rail === 'crypto' && cryptoEnabled ? cryptoWalletPaymentBlockReason(auth, wallet) : null;

  const resetAndClose = () => {
    setStep('summary');
    setRail('stripe');
    reset();
    onClose();
  };

  const finish = () => {
    dispatch(organizationApi.util.invalidateTags(['Credits']));
    setStep('summary');
    setRail('stripe');
    reset();
    onClose();
  };

  const beginPayment = async () => {
    if (rail === 'stripe') {
      setStep('pay');
      // For custom packs, pass amountCents so the API can price dynamically.
      const payload: { orgId: string; packId: string; amountCents?: number } = { orgId, packId };
      if (customPack) {
        payload.amountCents = customPack.priceCents;
      }
      await createIntent(payload).unwrap().catch(() => null);
      return;
    }
    setStep('pay');
  };

  if (!pack) return null;

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>Buy {pack.label} of credits</DialogTitle>

      {step === 'summary' && (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  {pack.baseCredits} credits
                  {pack.bonusCredits > 0 ? ` + ${pack.bonusCredits} bonus` : ''} —{' '}
                  <strong>{totalCredits} total</strong>.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Credits expire 30 days after purchase and are spent oldest-first.
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Payment method</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={rail}
                  onChange={(_, value: TopUpRail | null) => {
                    if (value) setRail(value);
                  }}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="stripe">Card (Stripe)</ToggleButton>
                  <ToggleButton value="crypto" disabled={!cryptoEnabled}>
                    Crypto (USDC)
                  </ToggleButton>
                </ToggleButtonGroup>
                {!cryptoEnabled ? (
                  <Typography variant="caption" color="text.secondary">
                    USDC payments are not enabled on this deployment.
                  </Typography>
                ) : null}
                {cryptoWalletBlockReason ? (
                  <Alert severity="warning" variant="outlined">
                    {cryptoWalletBlockReason}
                  </Alert>
                ) : null}
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetAndClose}>Cancel</Button>
            <Button
              onClick={beginPayment}
              variant="contained"
              disabled={Boolean(cryptoWalletBlockReason)}
            >
              Continue to payment
            </Button>
          </DialogActions>
        </>
      )}

      {step === 'pay' && rail === 'crypto' && (
        <CryptoTopUpPanel
          orgId={orgId}
          packId={packId}
          pack={pack}
          totalCredits={totalCredits}
          onDone={finish}
          onCancel={resetAndClose}
          amountCents={customPack?.priceCents}
        />
      )}

      {step === 'pay' && rail === 'stripe' && isLoading && (
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <BrandedLoadingIndicator />
          </Box>
        </DialogContent>
      )}

      {step === 'pay' && rail === 'stripe' && error && (
        <>
          <DialogContent>
            <Alert severity="error">
              Could not start the payment. Payments may not be configured on this deployment.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetAndClose}>Close</Button>
          </DialogActions>
        </>
      )}

      {step === 'pay' &&
        rail === 'stripe' &&
        session?.clientSecret &&
        session.publishableKey &&
        session.checkoutSessionId && (
          <CheckoutElementsProvider
            stripe={stripeFor(session.publishableKey)}
            options={{ clientSecret: session.clientSecret }}
          >
            <StripePaymentForm
              orgId={orgId}
              checkoutSessionId={session.checkoutSessionId}
              packLabel={pack.label}
              totalCredits={totalCredits}
              onDone={finish}
              onCancel={resetAndClose}
            />
          </CheckoutElementsProvider>
        )}

      {step === 'pay' && rail === 'stripe' && session && !session.publishableKey && (
        <>
          <DialogContent>
            <Alert severity="error">
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set, so the payment form cannot load.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetAndClose}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

/** @deprecated Use CreditTopUpDialog — kept for gradual migration. */
export const StripeTopUpDialog = CreditTopUpDialog;
