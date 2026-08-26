'use client';

import { useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import {
  CheckoutElementsProvider,
  ContactDetailsElement,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  useCreateTopUpIntentMutation,
  useConfirmTopUpPaymentMutation,
  organizationApi,
} from '@/store/apis/organization-api';
import { useAppDispatch } from '@/store/hooks';
import { CREDIT_PACKS } from '@/lib/billing/plans';

/**
 * Paid credit top-up with inline Stripe Checkout Elements.
 *
 * Inline rather than hosted Checkout (roadmap §4.6): a top-up happens
 * mid-task, usually because a generation was just blocked, and bouncing the
 * admin out to a hosted page loses the context they were working in. Plan
 * changes take the opposite trade and use hosted Checkout.
 *
 * ⚠️ No card data ever reaches this component or our servers. PaymentElement
 * renders inside a Stripe-hosted iframe; we only ever hold a client secret,
 * which authorizes confirming one specific Checkout Session and nothing else.
 */

/** Memoized per publishable key — loadStripe injects a script tag on each call. */
const stripeCache = new Map<string, Promise<Stripe | null>>();

function stripeFor(publishableKey: string): Promise<Stripe | null> {
  let promise = stripeCache.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripeCache.set(publishableKey, promise);
  }
  return promise;
}

interface PaymentFormProps {
  orgId: string;
  checkoutSessionId: string;
  packLabel: string;
  totalCredits: number;
  onDone: () => void;
  onCancel: () => void;
}

function PaymentForm({
  orgId,
  checkoutSessionId,
  packLabel,
  totalCredits,
  onDone,
  onCancel,
}: PaymentFormProps) {
  const checkoutState = useCheckoutElements();
  const [confirmTopUp] = useConfirmTopUpPaymentMutation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [credited, setCredited] = useState(false);
  const [balanceAvailable, setBalanceAvailable] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (checkoutState.type !== 'success') return;
    setSubmitting(true);
    setError(null);

    // `redirect: 'if_required'` keeps cards inline and only navigates away for
    // methods that genuinely need it (3DS, bank redirects).
    const { error: confirmError } = await checkoutState.checkout.confirm({
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'The payment could not be completed.');
      setSubmitting(false);
      return;
    }

    try {
      const confirmed = await confirmTopUp({
        orgId,
        checkoutSessionId,
      }).unwrap();
      setBalanceAvailable(confirmed.data.balance.available);
      setCredited(true);
    } catch (err) {
      // Payment succeeded at Stripe; grant may still land via webhook/reconcile.
      console.warn('[billing] top-up confirm failed after payment:', err);
      setCredited(false);
    }

    setSucceeded(true);
    setSubmitting(false);
  };

  if (succeeded) {
    return (
      <>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            {credited ? 'Payment received — credits added.' : 'Payment received.'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {credited && balanceAvailable != null
              ? `${totalCredits} credits from ${packLabel} are on your balance (now ${balanceAvailable} available).`
              : `${totalCredits} credits from ${packLabel} will appear on the balance once confirmation finishes — refresh Billing if the total looks unchanged.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDone} variant="contained">
            Done
          </Button>
        </DialogActions>
      </>
    );
  }

  const checkoutReady = checkoutState.type === 'success';

  return (
    <>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {packLabel} — {totalCredits} credits
        </Typography>
        <Stack spacing={2}>
          <ContactDetailsElement />
          <PaymentElement />
        </Stack>
        {checkoutState.type === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {checkoutState.error.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!checkoutReady || submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : undefined}
        >
          {submitting ? 'Processing…' : 'Pay'}
        </Button>
      </DialogActions>
    </>
  );
}

export interface StripeTopUpDialogProps {
  open: boolean;
  orgId: string;
  packId: string;
  onClose: () => void;
}

export function StripeTopUpDialog({ open, orgId, packId, onClose }: StripeTopUpDialogProps) {
  const dispatch = useAppDispatch();
  const [createIntent, { data, isLoading, error, reset }] = useCreateTopUpIntentMutation();
  const [started, setStarted] = useState(false);

  const pack = CREDIT_PACKS.find((p) => p.id === packId) ?? null;
  const session = data?.data ?? null;

  // Kicked off by the click that opens the dialog rather than by an effect on
  // `open`: creating a Checkout Session is a side effect with a cost (it shows
  // up in the Stripe dashboard), so it should follow an explicit user action,
  // not a render.
  const begin = async () => {
    setStarted(true);
    await createIntent({ orgId, packId }).unwrap().catch(() => null);
  };

  const finish = () => {
    dispatch(organizationApi.util.invalidateTags(['Credits']));
    setStarted(false);
    reset();
    onClose();
  };

  const cancel = () => {
    setStarted(false);
    reset();
    onClose();
  };

  if (!pack) return null;
  const totalCredits = pack.baseCredits + pack.bonusCredits;

  return (
    <Dialog open={open} onClose={cancel} maxWidth="sm" fullWidth>
      <DialogTitle>Buy {pack.label} of credits</DialogTitle>

      {!started && (
        <>
          <DialogContent>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={cancel}>Cancel</Button>
            <Button onClick={begin} variant="contained">
              Continue to payment
            </Button>
          </DialogActions>
        </>
      )}

      {started && isLoading && (
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <BrandedLoadingIndicator  />
          </Box>
        </DialogContent>
      )}

      {started && error && (
        <>
          <DialogContent>
            <Alert severity="error">
              Could not start the payment. Payments may not be configured on this deployment.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancel}>Close</Button>
          </DialogActions>
        </>
      )}

      {started && session?.clientSecret && session.publishableKey && session.checkoutSessionId && (
        <CheckoutElementsProvider
          stripe={stripeFor(session.publishableKey)}
          options={{ clientSecret: session.clientSecret }}
        >
          <PaymentForm
            orgId={orgId}
            checkoutSessionId={session.checkoutSessionId}
            packLabel={pack.label}
            totalCredits={totalCredits}
            onDone={finish}
            onCancel={cancel}
          />
        </CheckoutElementsProvider>
      )}

      {started && session && !session.publishableKey && (
        <>
          <DialogContent>
            <Alert severity="error">
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set, so the payment form cannot load.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancel}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
