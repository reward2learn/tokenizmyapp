'use client';

import { useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { StoredPaymentMethod } from '@/store/apis/organization-api';
import { RADIUS } from '@/theme/design-tokens';

/**
 * Shared card list + SetupIntent UI for org and personal payment methods.
 *
 * ⚠️ No card data reaches this component or our servers. PaymentElement renders
 * inside a Stripe-hosted iframe and we hold only a client secret.
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

function SetupForm({
  onDone,
  onCancel,
}: {
  /** paymentMethodId from the succeeded SetupIntent — null if Stripe omitted it. */
  onDone: (paymentMethodId: string | null) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    // `redirect: 'if_required'` keeps cards inline and navigates away only for
    // methods that genuinely need it (3DS). return_url is still required by
    // Stripe.js for those redirect cases.
    const result = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: typeof window !== 'undefined' ? window.location.href : '/',
      },
    });

    if (result.error) {
      setError(result.error.message ?? 'The card could not be saved.');
      setSubmitting(false);
      return;
    }

    const pm = result.setupIntent?.payment_method;
    const paymentMethodId = typeof pm === 'string' ? pm : (pm?.id ?? null);
    setSubmitting(false);
    onDone(paymentMethodId);
  };

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Saved for future charges. Nothing is charged now.
          </Typography>
          <PaymentElement />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={!stripe || submitting}>
          {submitting ? 'Saving…' : 'Save card'}
        </Button>
      </DialogActions>
    </>
  );
}

export interface PaymentMethodsPanelProps {
  title: string;
  description: string;
  emptyHint: string;
  methods: StoredPaymentMethod[];
  paymentsConfigured: boolean;
  isLoading: boolean;
  isStarting: boolean;
  onStartSetup: () => Promise<{ clientSecret: string; publishableKey: string } | null>;
  onSetDefault: (paymentMethodId: string) => Promise<void>;
  onRemove: (paymentMethodId: string) => Promise<void>;
  /** Called after a successful SetupIntent when the list should be refreshed
   * without a separate set-default call (or after set-default already ran). */
  onInvalidate?: () => void;
}

export function PaymentMethodsPanel({
  title,
  description,
  emptyHint,
  methods,
  paymentsConfigured,
  isLoading,
  isStarting,
  onStartSetup,
  onSetDefault,
  onRemove,
  onInvalidate,
}: PaymentMethodsPanelProps) {
  const [setup, setSetup] = useState<{ clientSecret: string; publishableKey: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSetup = async () => {
    setError(null);
    try {
      const next = await onStartSetup();
      if (!next) {
        setError('Payments are not fully configured — no publishable key is set.');
        return;
      }
      setSetup(next);
    } catch {
      setError('Could not start card setup.');
    }
  };

  const finishSetup = async (paymentMethodId: string | null) => {
    setSetup(null);

    // SetupIntent attaches the card to the customer but does NOT set
    // invoice_settings.default_payment_method — without this PATCH the tab
    // either shows no "Default" chip or renewals still have nothing to charge.
    if (paymentMethodId) {
      try {
        await onSetDefault(paymentMethodId);
        return;
      } catch {
        setError('Card saved, but it could not be set as the default.');
      }
    }

    onInvalidate?.();
  };

  if (isLoading) return <Skeleton variant="rounded" height={280} />;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>

      {!paymentsConfigured && (
        <Alert severity="warning">
          <AlertTitle>Payments are not configured</AlertTitle>
          This deployment has no Stripe secret key, so no card can be saved. Set{' '}
          <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code> and{' '}
          <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> — see docs/STRIPE-SETUP.md.
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {methods.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 5,
            textAlign: 'center',
            borderStyle: 'dashed',
            borderRadius: `${RADIUS.card}px`,
          }}
        >
          <CreditCardIcon color="disabled" sx={{ fontSize: 36 }} />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            No payment methods
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {emptyHint}
          </Typography>
          <Button variant="contained" onClick={startSetup} disabled={!paymentsConfigured || isStarting}>
            {isStarting ? 'Starting…' : 'Add Payment Method'}
          </Button>
        </Paper>
      ) : (
        <>
          <Stack spacing={1}>
            {methods.map((pm) => (
              <Paper
                key={pm.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: `${RADIUS.card}px`,
                }}
              >
                <CreditCardIcon color="action" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {pm.brand} •••• {pm.last4}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Expires {String(pm.expMonth).padStart(2, '0')}/{pm.expYear}
                  </Typography>
                </Box>
                {pm.isDefault ? (
                  <Chip label="Default" size="small" color="primary" />
                ) : (
                  <Button
                    size="small"
                    onClick={() =>
                      onSetDefault(pm.id).catch(() => setError('Could not change the default card.'))
                    }
                  >
                    Make default
                  </Button>
                )}
                <Tooltip
                  title={
                    pm.isDefault
                      ? 'Add another card and make it the default before removing this one'
                      : 'Remove card'
                  }
                >
                  {/* Wrapped: a disabled button fires no events, so the tooltip
                      explaining *why* it is disabled would never show. */}
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Remove card ending ${pm.last4}`}
                      // Removing the default leaves renewals with nothing to
                      // charge, which surfaces as a failed invoice weeks later.
                      disabled={pm.isDefault && methods.length > 1}
                      onClick={() =>
                        onRemove(pm.id).catch(() => setError('Could not remove that card.'))
                      }
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Paper>
            ))}
          </Stack>
          <Box>
            <Button variant="outlined" onClick={startSetup} disabled={!paymentsConfigured || isStarting}>
              Add another card
            </Button>
          </Box>
        </>
      )}

      <Dialog open={Boolean(setup)} onClose={() => setSetup(null)} fullWidth maxWidth="xs">
        <DialogTitle>Add a card</DialogTitle>
        {setup ? (
          <Elements
            stripe={stripeFor(setup.publishableKey)}
            options={{ clientSecret: setup.clientSecret }}
          >
            <SetupForm onDone={finishSetup} onCancel={() => setSetup(null)} />
          </Elements>
        ) : (
          <DialogContent>
            <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
              <BrandedLoadingIndicator size={24} />
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Stack>
  );
}
