'use client';

import { useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCreateTopUpIntentMutation, organizationApi } from '@/store/apis/organization-api';
import { useAppDispatch } from '@/store/hooks';
import { CREDIT_PACKS } from '@/lib/billing/plans';

/**
 * Paid credit top-up with inline Stripe Elements.
 *
 * Inline rather than hosted Checkout (roadmap §4.6): a top-up happens
 * mid-task, usually because a generation was just blocked, and bouncing the
 * admin out to a hosted page loses the context they were working in. Plan
 * changes take the opposite trade and use hosted Checkout.
 *
 * ⚠️ No card data ever reaches this component or our servers. PaymentElement
 * renders inside a Stripe-hosted iframe; we only ever hold a client secret,
 * which authorizes confirming one specific payment and nothing else.
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
  packLabel: string;
  totalCredits: number;
  onDone: () => void;
  onCancel: () => void;
}

function PaymentForm({ packLabel, totalCredits, onDone, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    // `redirect: 'if_required'` keeps cards inline and only navigates away for
    // methods that genuinely need it (3DS, bank redirects).
    const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });

    if (result.error) {
      setError(result.error.message ?? 'The payment could not be completed.');
      setSubmitting(false);
      return;
    }

    setSucceeded(true);
    setSubmitting(false);
  };

  if (succeeded) {
    return (
      <>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment received.
          </Alert>
          {/* Deliberately not claiming the credits have landed: they are granted
              by the payment_intent.succeeded webhook, which arrives a moment
              later. Saying "credits added" here would be a lie whenever the
              webhook is slow, and the balance would contradict it on screen. */}
          <Typography variant="body2" color="text.secondary">
            {totalCredits} credits from {packLabel} will appear on the balance once Stripe
            confirms the payment — usually within a few seconds.
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
        <PaymentElement />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!stripe || !elements || submitting}
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
  const intent = data?.data ?? null;

  // Kicked off by the click that opens the dialog rather than by an effect on
  // `open`: creating a PaymentIntent is a side effect with a cost (it shows up
  // in the Stripe dashboard), so it should follow an explicit user action, not
  // a render.
  const begin = async () => {
    setStarted(true);
    await createIntent({ orgId, packId }).unwrap().catch(() => null);
  };

  const finish = () => {
    // The webhook grants the credits; invalidating here makes the balance
    // refetch so it converges as soon as Stripe has delivered.
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
            <CircularProgress />
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

      {started && intent?.clientSecret && intent.publishableKey && (
        <Elements
          stripe={stripeFor(intent.publishableKey)}
          options={{ clientSecret: intent.clientSecret }}
        >
          <PaymentForm
            packLabel={pack.label}
            totalCredits={totalCredits}
            onDone={finish}
            onCancel={cancel}
          />
        </Elements>
      )}

      {started && intent && !intent.publishableKey && (
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
