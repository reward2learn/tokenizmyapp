'use client';

import { useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import type { PlanId } from '@/lib/billing/plans';

export type EmbeddedPlanCheckoutTarget = {
  planId: PlanId;
  interval: 'monthly' | 'yearly';
};

export interface EmbeddedPlanCheckoutProps {
  orgId: string;
  target: EmbeddedPlanCheckoutTarget;
  publishableKey: string;
  onBack?: () => void;
  onComplete: () => void;
  title?: string;
}

async function fetchEmbeddedClientSecret(
  orgId: string,
  target: EmbeddedPlanCheckoutTarget,
): Promise<string> {
  const res = await fetch(`/api/admin/organizations/${orgId}/checkout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: target.planId,
      interval: target.interval,
      embedded: true,
    }),
  });
  const json = (await res.json()) as {
    success?: boolean;
    error?: string;
    data?: { mode?: string; clientSecret?: string };
  };
  if (!json.success || !json.data?.clientSecret) {
    throw new Error(json.error ?? 'Could not start embedded checkout');
  }
  return json.data.clientSecret;
}

/**
 * Stripe Embedded Checkout for a subscription plan (Vercel × Stripe guide pattern).
 *
 * Shared by Settings → Billing and the factory Choose Plan dialog.
 */
export function EmbeddedPlanCheckout({
  orgId,
  target,
  publishableKey,
  onBack,
  onComplete,
  title,
}: EmbeddedPlanCheckoutProps) {
  const stripePromise = useMemo(
    () => loadStripe(publishableKey),
    [publishableKey],
  );

  const fetchClientSecret = useCallback(
    () => fetchEmbeddedClientSecret(orgId, target),
    [orgId, target.planId, target.interval],
  );

  const options = useMemo(
    () => ({ fetchClientSecret, onComplete }),
    [fetchClientSecret, onComplete],
  );

  const heading =
    title ?? `Checkout — ${target.planId} (${target.interval})`;

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        {onBack ? (
          <IconButton size="small" onClick={onBack} aria-label="Back to plans">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        ) : null}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {heading}
        </Typography>
      </Stack>
      <Box
        sx={{
          minHeight: 420,
          '& iframe': { width: '100% !important' },
        }}
      >
        <EmbeddedCheckoutProvider stripe={stripePromise as Promise<Stripe | null>} options={options}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </Box>
    </Stack>
  );
}

export interface EmbeddedPlanCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  target: EmbeddedPlanCheckoutTarget | null;
  publishableKey: string | null;
  onComplete: () => void;
}

/** Modal wrapper for embedded plan checkout (Settings → Billing). */
export function EmbeddedPlanCheckoutDialog({
  open,
  onClose,
  orgId,
  target,
  publishableKey,
  onComplete,
}: EmbeddedPlanCheckoutDialogProps) {
  const handleComplete = useCallback(() => {
    onComplete();
    onClose();
  }, [onComplete, onClose]);

  if (!target || !publishableKey) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Subscribe to {target.planId}</DialogTitle>
      <DialogContent>
        <EmbeddedPlanCheckout
          orgId={orgId}
          target={target}
          publishableKey={publishableKey}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
