'use client';

import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import {
  EmbeddedPlanCheckout,
  type EmbeddedPlanCheckoutTarget,
} from '@/components/billing/embedded-plan-checkout';
import {
  organizationApi,
  useGetBillingCheckoutQuery,
  useGetTenantOrganizationQuery,
  useStartCheckoutMutation,
} from '@/store/apis/organization-api';
import { useAppDispatch } from '@/store/hooks';
import { PLANS, YEARLY_DISCOUNT, YEARLY_SELF_SERVE_ENABLED, planAiCreditsPerMonth, type PlanId, type BillingInterval } from '@/lib/billing/plans';

function formatMoney(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

type CheckoutTarget = EmbeddedPlanCheckoutTarget;

function stripeReadinessMessage(readiness: {
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  hasPublishableKey: boolean;
  configuredPrices: number;
  configError: string | null;
} | null): string {
  if (!readiness) return 'Could not load Stripe readiness.';
  if (readiness.configError) return readiness.configError;
  const missing: string[] = [];
  if (!readiness.hasSecretKey) missing.push('STRIPE_SECRET_KEY');
  if (!readiness.hasWebhookSecret) missing.push('STRIPE_WEBHOOK_SECRET');
  if (!readiness.hasPublishableKey) missing.push('publishable key (pk_…)');
  if (readiness.configuredPrices === 0) {
    missing.push('at least one STRIPE_PRICE_* (Pro/Business monthly or yearly)');
  }
  if (missing.length === 0) {
    return 'Stripe readiness check failed — run Flight Check in Edit Tenant.';
  }
  return `Missing: ${missing.join(', ')}. Add them in Edit Tenant → Organization & Billing, Save Changes, then re-run Flight Check.`;
}

export interface ChoosePlanDialogProps {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  tenantDisplayName: string;
}

/**
 * Subscription plan picker for a tenant's billing organization.
 *
 * New subscriptions open embedded Stripe Checkout inside this modal (Vercel guide
 * pattern). Plan changes on an existing subscription still apply in place via the
 * API. Flight Check uses a separate one-time embedded probe — not this flow.
 */
export function ChoosePlanDialog({
  open,
  onClose,
  tenantSlug,
  tenantDisplayName,
}: ChoosePlanDialogProps) {
  const dispatch = useAppDispatch();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [step, setStep] = useState<'pick' | 'checkout'>('pick');
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: tenantOrg, isLoading: orgLoading } = useGetTenantOrganizationQuery(tenantSlug, {
    skip: !open || !tenantSlug,
  });
  const orgId = tenantOrg?.data?.organization.id ?? '';
  const orgName = tenantOrg?.data?.organization.displayName ?? tenantDisplayName;

  const { data: checkoutData, isLoading: checkoutLoading } = useGetBillingCheckoutQuery(orgId, {
    skip: !open || !orgId,
  });

  const [startCheckout, { isLoading: checkoutStarting }] = useStartCheckoutMutation();

  const subscription = checkoutData?.data?.subscription ?? null;
  const readiness = checkoutData?.data?.readiness ?? null;
  const purchasable = checkoutData?.data?.purchasable ?? [];
  const priceMismatches = checkoutData?.data?.priceMismatches ?? [];
  const publishableKey = checkoutData?.data?.publishableKey ?? null;
  const currentPlanId = (subscription?.planId ?? 'free') as PlanId;
  const currentInterval = (subscription?.interval ?? 'monthly') as BillingInterval;
  const paymentsReady = readiness?.ready === true;
  const embeddedReady = paymentsReady && Boolean(publishableKey);
  const hasExistingSubscription = Boolean(checkoutData?.data?.linkage?.subscriptionId);

  useEffect(() => {
    if (!open) return;
    setInterval(YEARLY_SELF_SERVE_ENABLED ? currentInterval : 'monthly');
  }, [open, currentInterval]);

  const canBuy = (planId: string) =>
    purchasable.some((p) => p.planId === planId && p.interval === interval);

  const resetCheckoutStep = () => {
    setStep('pick');
    setCheckoutTarget(null);
  };

  const handleClose = () => {
    resetCheckoutStep();
    setError(null);
    setNotice(null);
    onClose();
  };

  const handleCheckoutComplete = useCallback(() => {
    dispatch(organizationApi.util.invalidateTags(['Subscription']));
    setNotice('Payment submitted — plan and credits activate when Stripe confirms via webhook.');
    resetCheckoutStep();
  }, [dispatch]);

  const choose = async (planId: PlanId) => {
    if (!orgId) return;
    setError(null);
    setNotice(null);

    // Existing subscription → in-place plan change (no embedded checkout).
    if (hasExistingSubscription) {
      try {
        const result = await startCheckout({ orgId, planId, interval }).unwrap();
        const payload = result.data;
        if (payload && payload.mode === 'plan_change') {
          const intervalLabel = interval === 'yearly' ? 'yearly' : 'monthly';
          setNotice(
            payload.applied === 'immediate'
              ? planId === currentPlanId
                ? `Switched to ${intervalLabel} billing. Credits arrive when Stripe confirms the invoice.`
                : `Upgraded to ${planId}. Credits arrive when Stripe confirms the invoice.`
              : planId === currentPlanId
                ? `Switch to ${intervalLabel} billing scheduled for period end.`
                : `Downgrade to ${planId} scheduled for period end.`,
          );
        }
      } catch {
        setError('Could not change plan. Confirm Stripe keys and price IDs on this tenant.');
      }
      return;
    }

    if (!embeddedReady || !publishableKey) {
      setError('Embedded Checkout is not ready — complete Stripe Flight Check (keys + publishable key + prices).');
      return;
    }

    setCheckoutTarget({ planId, interval });
    setStep('checkout');
  };

  const loading = orgLoading || checkoutLoading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Choose a plan — {tenantDisplayName}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pb: 1 }}>
          {step === 'pick' && (
            <Typography variant="body2" color="text.secondary">
              Billing organization: <strong>{orgName}</strong>
              {orgId ? (
                <> · <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace' }}>{orgId}</Typography></>
              ) : null}
            </Typography>
          )}

          {!orgId && !orgLoading && step === 'pick' && (
            <Alert severity="warning">
              This tenant has no billing organization assigned. Open Edit → Organization &amp; Billing
              and link an organization before purchasing a plan.
            </Alert>
          )}

          {loading && step === 'pick' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <BrandedLoadingIndicator  />
            </Box>
          )}

          {!loading && orgId && step === 'pick' && (
            <>
              {subscription?.status === 'past_due' && (
                <Alert severity="error">
                  <AlertTitle>Payment failed</AlertTitle>
                  Update the payment method in Settings → Billing to restore AI credits.
                </Alert>
              )}

              {!paymentsReady && (
                <Alert severity="info">
                  <AlertTitle>Stripe not ready for plan checkout</AlertTitle>
                  {stripeReadinessMessage(readiness)}
                </Alert>
              )}

              {paymentsReady && !publishableKey && (
                <Alert severity="warning">
                  Publishable key missing — add tenant Stripe publishable key in Organization &amp; Billing
                  for embedded Checkout.
                </Alert>
              )}

              {priceMismatches.length > 0 && (
                <Alert severity="warning">
                  {priceMismatches[0]}
                </Alert>
              )}

              {error && <Alert severity="error">{error}</Alert>}
              {notice && <Alert severity="success">{notice}</Alert>}

              {YEARLY_SELF_SERVE_ENABLED && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ToggleButtonGroup
                    value={interval}
                    exclusive
                    size="small"
                    onChange={(_, next) => next && setInterval(next)}
                  >
                    <ToggleButton value="monthly">Monthly</ToggleButton>
                    <ToggleButton value="yearly">
                      Yearly
                      <Chip
                        label={`Save ${Math.round(YEARLY_DISCOUNT * 100)}%`}
                        size="small"
                        color="success"
                        sx={{ ml: 1, height: 18, fontSize: 11 }}
                      />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                }}
              >
                {PLANS.map((plan) => {
                  const isCurrentPlanAndInterval =
                    plan.id === currentPlanId && interval === currentInterval;
                  const isSamePlanDifferentInterval =
                    plan.id === currentPlanId && interval !== currentInterval;
                  const price = interval === 'yearly' ? plan.priceYearly : plan.priceMonthly;
                  const credits = planAiCreditsPerMonth(plan, interval);
                  const purchasableNow = canBuy(plan.id);

                  return (
                    <Card
                      key={plan.id}
                      variant="outlined"
                      sx={{
                        borderColor: isCurrentPlanAndInterval ? 'primary.main' : 'divider',
                        borderWidth: isCurrentPlanAndInterval ? 2 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {plan.label}
                          </Typography>
                          {isCurrentPlanAndInterval && (
                            <Chip label="Current" size="small" color="primary" />
                          )}
                        </Stack>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {price === null ? 'Custom' : price === 0 ? 'Free' : formatMoney(price)}
                          {price !== null && price > 0 && (
                            <Typography component="span" variant="body2" color="text.secondary">
                              {' '}
                              /mo
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {plan.tagline}
                        </Typography>
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {credits > 0 ? (
                            <>
                              <strong>{credits}</strong> AI credits / month
                              {interval === 'yearly' && (
                                <Typography component="span" variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                                  (+{Math.round(YEARLY_DISCOUNT * 100)}% yearly bonus)
                                </Typography>
                              )}
                            </>
                          ) : (
                            'Negotiated AI credit allowance'
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {plan.maxTenants === null ? 'Unlimited' : plan.maxTenants} tenant
                          {plan.maxTenants === 1 ? '' : 's'}
                        </Typography>
                        {plan.features.slice(0, 4).map((feature) => (
                          <Stack key={feature} direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                            <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
                            <Typography variant="caption">{feature}</Typography>
                          </Stack>
                        ))}
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant={isCurrentPlanAndInterval ? 'outlined' : 'contained'}
                          disabled={
                            isCurrentPlanAndInterval ||
                            checkoutStarting ||
                            !purchasableNow ||
                            (!hasExistingSubscription && !embeddedReady)
                          }
                          onClick={() => choose(plan.id)}
                        >
                          {isCurrentPlanAndInterval
                            ? 'Current plan'
                            : isSamePlanDifferentInterval
                              ? interval === 'yearly'
                                ? 'Switch to yearly'
                                : 'Switch to monthly'
                              : plan.priceMonthly === null
                                ? 'Contact sales'
                                : purchasableNow
                                  ? hasExistingSubscription
                                    ? 'Change plan'
                                    : 'Choose'
                                  : 'Unavailable'}
                        </Button>
                      </Box>
                    </Card>
                  );
                })}
              </Box>

              <Typography variant="caption" color="text.secondary">
                {hasExistingSubscription
                  ? 'Existing subscriptions are changed in place (proration rules apply).'
                  : 'Checkout opens embedded Stripe inside this dialog. After payment, webhooks grant the plan and monthly AI credits.'}
              </Typography>
            </>
          )}

          {step === 'checkout' && checkoutTarget && publishableKey && (
            <EmbeddedPlanCheckout
              orgId={orgId}
              target={checkoutTarget}
              publishableKey={publishableKey}
              onBack={resetCheckoutStep}
              onComplete={handleCheckoutComplete}
            />
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
