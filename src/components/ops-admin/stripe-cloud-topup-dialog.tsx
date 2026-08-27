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
  useCreateCloudTopUpIntentMutation,
  useConfirmCloudTopUpPaymentMutation,
  organizationApi,
} from '@/store/apis/organization-api';
import { useAppDispatch } from '@/store/hooks';

const stripeCache = new Map<string, Promise<Stripe | null>>();

function stripeFor(publishableKey: string): Promise<Stripe | null> {
  let promise = stripeCache.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripeCache.set(publishableKey, promise);
  }
  return promise;
}

function PaymentForm({
  orgId,
  checkoutSessionId,
  amountCents,
  onDone,
  onCancel,
}: {
  orgId: string;
  checkoutSessionId: string;
  amountCents: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const checkoutState = useCheckoutElements();
  const [confirmTopUp] = useConfirmCloudTopUpPaymentMutation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [credited, setCredited] = useState(false);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (checkoutState.type !== 'success') return;
    setSubmitting(true);
    setError(null);

    const confirmResult = await checkoutState.checkout.confirm({
      redirect: 'if_required',
    });

    if (confirmResult && 'error' in confirmResult && confirmResult.error) {
      const err = confirmResult.error as { message?: string };
      setError(err.message ?? 'The payment could not be completed.');
      setSubmitting(false);
      return;
    }

    try {
      const confirmed = await confirmTopUp({ orgId, checkoutSessionId }).unwrap();
      setBalanceCents(confirmed.data.balanceCents);
      setCredited(true);
    } catch (err) {
      console.warn('[billing] cloud top-up confirm failed after payment:', err);
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
            {credited ? 'Payment received — cloud balance updated.' : 'Payment received.'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {credited && balanceCents != null
              ? `$${(amountCents / 100).toFixed(2)} added (balance now $${(balanceCents / 100).toFixed(2)}).`
              : `$${(amountCents / 100).toFixed(2)} will appear once confirmation finishes — refresh if the balance looks unchanged.`}
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
          Cloud Credits — ${(amountCents / 100).toFixed(2)}
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

export function StripeCloudTopUpDialog({
  open,
  orgId,
  amountCents,
  onClose,
}: {
  open: boolean;
  orgId: string;
  amountCents: number;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [createIntent, { data, isLoading, error, reset }] = useCreateCloudTopUpIntentMutation();
  const [started, setStarted] = useState(false);

  const session = data?.data ?? null;

  const begin = async () => {
    setStarted(true);
    await createIntent({ orgId, amountCents }).unwrap().catch(() => null);
  };

  const finish = () => {
    dispatch(organizationApi.util.invalidateTags(['CloudUsage']));
    setStarted(false);
    reset();
    onClose();
  };

  const cancel = () => {
    setStarted(false);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={cancel} maxWidth="sm" fullWidth>
      <DialogTitle>Add ${(amountCents / 100).toFixed(0)} cloud balance</DialogTitle>

      {!started && (
        <>
          <DialogContent>
            <Typography variant="body2">
              Adds <strong>${(amountCents / 100).toFixed(2)}</strong> to this organization&apos;s
              Cloud Credits balance. Used for Vercel/Neon overage past the plan-included pool.
            </Typography>
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
            <BrandedLoadingIndicator />
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
            amountCents={amountCents}
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
