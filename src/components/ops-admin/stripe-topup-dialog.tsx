'use client';

import { useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import {
  ContactDetailsElement,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  useConfirmTopUpPaymentMutation,
} from '@/store/apis/organization-api';

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
export const stripeFor = stripeForImpl;
const stripeCache = new Map<string, Promise<Stripe | null>>();

function stripeForImpl(publishableKey: string): Promise<Stripe | null> {
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

export function StripePaymentForm({
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
    const result = await checkoutState.checkout.confirm({
      redirect: 'if_required',
    });
    const confirmError = 'error' in result ? result.error : null;

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
