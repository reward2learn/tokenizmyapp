'use client';

import { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBillingTab, setSettingsSection, type BillingTab } from '@/store/ui-slice';
import {
  useGetOrganizationQuery,
  useGetOrganizationCreditsQuery,
  useGetBillingCheckoutQuery,
  useGetOrganizationInvoicesQuery,
  useStartCheckoutMutation,
  organizationApi,
} from '@/store/apis/organization-api';
import {
  PLANS,
  CREDIT_PACKS,
  YEARLY_DISCOUNT,
  canPurchaseCreditPacks,
  type PlanId,
} from '@/lib/billing/plans';
import {
  EmbeddedPlanCheckoutDialog,
  type EmbeddedPlanCheckoutTarget,
} from '@/components/billing/embedded-plan-checkout';
import { CreditGrantsTable } from '@/components/billing/credit-grants-table';
import { CreditUsageTable } from '@/components/billing/credit-usage-table';
import { CreditAdminAnalyticsPanels } from '@/components/billing/credit-admin-analytics';
import { BillingDetailsTab } from '@/components/billing/billing-details-tab';
import { CloudCreditsTab } from '@/components/billing/cloud-credits-tab';
import { PaymentMethodsTab } from '@/components/billing/payment-methods-tab';
import { StripeTopUpDialog } from '@/components/ops-admin/stripe-topup-dialog';
import { TenantManagedOrgAlert } from '@/components/settings/tenant-managed-message';
import {
  ResponsiveTabPanels,
  type ResponsiveTabItem,
} from '@/components/shared/responsive-tab-panels';
import type { CreditAdminAnalytics } from '@/store/apis/organization-api';

/**
 * Settings → Billing / Usage.
 *
 * Plan, credit history (ledger/grants), cloud credits, invoices, and payment
 * details. Spendable balance and pack purchase live under Settings → Topup
 * (`AiCreditsPanel`) so the sidebar can open them in one click — the same
 * surface the header credit chip uses.
 *
 * Tab selection lives in the ui slice, not component state, so returning from
 * embedded Checkout keeps the admin on the Plan tab instead of resetting.
 */

function formatMoney(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function BillingPanel({
  orgId,
  readOnly = false,
  selfServeBilling = false,
}: {
  orgId: string;
  readOnly?: boolean;
  selfServeBilling?: boolean;
}) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.ui.billingTab);

  const { data: orgData } = useGetOrganizationQuery(orgId, { skip: !orgId });
  const { data: creditsData } = useGetOrganizationCreditsQuery(orgId, { skip: !orgId });
  const { data: checkoutData } = useGetBillingCheckoutQuery(orgId, {
    skip: !orgId || (readOnly && selfServeBilling),
  });

  // The checkout query reconciles against Stripe before answering, so its copy
  // is the fresher of the two. Falling back to the organization query keeps the
  // panel populated when Stripe is switched off entirely.
  const subscription = checkoutData?.data?.subscription ?? orgData?.data?.subscription ?? null;
  const grants = creditsData?.data?.grants ?? [];
  const ledger = creditsData?.data?.ledger ?? [];
  const analytics = creditsData?.data?.analytics ?? null;
  const readiness = checkoutData?.data?.readiness ?? null;
  const linkage = checkoutData?.data?.linkage ?? null;
  const reconcileNote = checkoutData?.data?.reconcileNote ?? null;
  const priceMismatches = checkoutData?.data?.priceMismatches ?? [];

  const visibleTabs: BillingTab[] = readOnly
    ? ['plan', 'credit-history']
    : ['plan', 'credit-history', 'cloud-credits', 'billing-details', 'payment-methods', 'invoices'];

  const activeTab = visibleTabs.includes(tab) ? tab : visibleTabs[0];

  const tabItems: ResponsiveTabItem[] = useMemo(() => {
    const items: ResponsiveTabItem[] = [
      {
        id: 'plan',
        label: 'Plan',
        content: (
          <PlanTab
            orgId={orgId}
            currentPlanId={subscription?.planId ?? 'free'}
            status={subscription?.status ?? 'active'}
            pendingPlanId={linkage?.pendingPlanId ?? null}
            gracePeriodEndsAt={linkage?.gracePeriodEndsAt ?? null}
            purchasable={checkoutData?.data?.purchasable ?? []}
            paymentsReady={Boolean(readiness?.ready)}
            publishableKey={checkoutData?.data?.publishableKey ?? null}
            hasExistingSubscription={Boolean(linkage?.subscriptionId)}
            readOnly={readOnly}
          />
        ),
      },
      {
        id: 'credit-history',
        label: 'History',
        content: (
          <AiCreditsHistory
            grants={grants}
            ledger={ledger}
            analytics={analytics}
            readOnly={readOnly}
            selfServeTopUp={selfServeBilling}
          />
        ),
      },
    ];

    if (!readOnly) {
      items.push(
        { id: 'cloud-credits', label: 'Cloud Credits', content: <CloudCreditsTab orgId={orgId} /> },
        { id: 'billing-details', label: 'Billing Details', content: <BillingDetailsTab orgId={orgId} /> },
        { id: 'payment-methods', label: 'Payment Methods', content: <PaymentMethodsTab orgId={orgId} /> },
        { id: 'invoices', label: 'Invoices', content: <InvoicesTab orgId={orgId} /> },
      );
    }

    return items;
  }, [
    orgId,
    readOnly,
    selfServeBilling,
    subscription?.planId,
    subscription?.status,
    linkage?.pendingPlanId,
    linkage?.gracePeriodEndsAt,
    linkage?.subscriptionId,
    checkoutData?.data?.purchasable,
    checkoutData?.data?.publishableKey,
    readiness?.ready,
    grants,
    ledger,
    analytics,
  ]);

  const sharedAlerts = (
    <>
      {readOnly && !selfServeBilling && (
        <Box sx={{ mb: 2 }}>
          <TenantManagedOrgAlert />
        </Box>
      )}

      {!readOnly && readiness?.configError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Stripe configuration problem</AlertTitle>
          {readiness.configError}
        </Alert>
      )}
      {!readOnly && priceMismatches.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Advertised price does not match Stripe</AlertTitle>
          {priceMismatches.map((message) => (
            <Typography key={message} variant="body2">
              {message}
            </Typography>
          ))}
        </Alert>
      )}
      {!readOnly && reconcileNote && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Plan could not be confirmed with Stripe</AlertTitle>
          {reconcileNote}
        </Alert>
      )}
      {!readOnly && readiness?.liveMode && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This deployment is connected to <strong>live</strong> Stripe. Actions here move real
          money.
        </Alert>
      )}
    </>
  );

  const hasSharedAlerts =
    (readOnly && !selfServeBilling) ||
    Boolean(!readOnly && readiness?.configError) ||
    (!readOnly && priceMismatches.length > 0) ||
    Boolean(!readOnly && reconcileNote) ||
    Boolean(!readOnly && readiness?.liveMode);

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      {hasSharedAlerts ? (
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 0 }}>{sharedAlerts}</Box>
      ) : null}

      <ResponsiveTabPanels
        ariaLabel="Billing sections"
        breakpoint="md"
        value={activeTab}
        onChange={(id) => dispatch(setBillingTab(id as BillingTab))}
        items={tabItems}
      />
    </Paper>
  );
}

/**
 * Settings → Topup — spendable balance and pack purchase only.
 *
 * Usage / grant history lives under Settings → Usage → History so this
 * surface stays purchase-focused. The header credit chip deep-links here.
 */
export function AiCreditsPanel({
  orgId,
  readOnly = false,
  selfServeBilling = false,
}: {
  orgId: string;
  readOnly?: boolean;
  selfServeBilling?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { data: orgData } = useGetOrganizationQuery(orgId, { skip: !orgId });
  const { data: creditsData } = useGetOrganizationCreditsQuery(orgId, { skip: !orgId });
  const { data: checkoutData } = useGetBillingCheckoutQuery(orgId, {
    skip: !orgId || (readOnly && selfServeBilling),
  });

  const subscription = checkoutData?.data?.subscription ?? orgData?.data?.subscription ?? null;
  const balance = creditsData?.data?.balance ?? null;
  const grants = creditsData?.data?.grants ?? [];
  const readiness = checkoutData?.data?.readiness ?? null;
  const creditsPaymentsReady = creditsData?.data?.paymentsReady;
  const effectiveReadiness =
    readOnly && selfServeBilling
      ? { ready: creditsPaymentsReady === true }
      : readiness;

  return (
    <Stack spacing={2}>
      {readOnly && selfServeBilling && (
        <Alert severity="info">
          You can purchase AI credit top-ups for this organization. Plan changes and billing
          details are managed by your administrator.
        </Alert>
      )}
      <AiCreditsPurchase
        orgId={orgId}
        planId={(subscription?.planId ?? 'free') as PlanId}
        balance={balance}
        grants={grants}
        readiness={effectiveReadiness}
        readOnly={readOnly}
        selfServeTopUp={selfServeBilling}
        onOpenPlanTab={() => {
          dispatch(setSettingsSection('billing'));
          dispatch(setBillingTab('plan'));
        }}
      />
    </Stack>
  );
}

// ── Plan ──────────────────────────────────────────────────────────

function PlanTab({
  orgId,
  currentPlanId,
  status,
  pendingPlanId,
  gracePeriodEndsAt,
  purchasable,
  paymentsReady,
  publishableKey,
  hasExistingSubscription,
  readOnly = false,
}: {
  orgId: string;
  currentPlanId: PlanId;
  status: string;
  pendingPlanId: string | null;
  gracePeriodEndsAt: string | null;
  purchasable: Array<{ planId: string; interval: 'monthly' | 'yearly' }>;
  paymentsReady: boolean;
  publishableKey: string | null;
  hasExistingSubscription: boolean;
  readOnly?: boolean;
}) {
  const dispatch = useAppDispatch();
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutTarget, setCheckoutTarget] = useState<EmbeddedPlanCheckoutTarget | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [startCheckout, { isLoading }] = useStartCheckoutMutation();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const embeddedReady = paymentsReady && Boolean(publishableKey);

  const canBuy = (planId: string) =>
    purchasable.some((p) => p.planId === planId && p.interval === interval);

  const handleCheckoutComplete = useCallback(() => {
    dispatch(organizationApi.util.invalidateTags(['Subscription']));
    setNotice('Payment submitted — plan and credits activate when Stripe confirms via webhook.');
  }, [dispatch]);

  const choose = async (planId: PlanId) => {
    if (readOnly) return;
    setError(null);
    setNotice(null);

    if (hasExistingSubscription) {
      try {
        const result = await startCheckout({ orgId, planId, interval }).unwrap();
        const payload = result.data;
        if (payload && payload.mode === 'plan_change') {
          setNotice(
            payload.applied === 'immediate'
              ? `Upgraded to ${planId}. The prorated charge is on its way and credits arrive when the invoice is paid.`
              : `Downgrade to ${planId} scheduled for the end of the current period. Nothing changes until then.`,
          );
        }
      } catch {
        setError('Could not start the plan change.');
      }
      return;
    }

    if (!embeddedReady || !publishableKey) {
      setError('Embedded Checkout is not ready — confirm Stripe keys and publishable key are configured.');
      return;
    }

    setCheckoutTarget({ planId, interval });
    setCheckoutOpen(true);
  };

  const currentPlan = PLANS.find((plan) => plan.id === currentPlanId) ?? PLANS[0];

  if (readOnly) {
    const price = currentPlan.priceMonthly;
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          This is your organization&apos;s current plan. Upgrades and billing changes are handled
          by your administrator.
        </Typography>
        <Card
          variant="outlined"
          sx={{
            maxWidth: 360,
            borderColor: 'primary.main',
            borderWidth: 2,
          }}
        >
          <CardContent>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {currentPlan.label}
              </Typography>
              <Chip label="Current" size="small" color="primary" />
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
              {currentPlan.tagline}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="body2">
              {currentPlan.aiCreditsPerMonth > 0 ? (
                <>
                  <strong>{currentPlan.aiCreditsPerMonth}</strong> AI credits / month
                </>
              ) : (
                'Negotiated AI credit allowance'
              )}
            </Typography>
          </CardContent>
        </Card>
        <TextField
          fullWidth
          label="Organization ID"
          value={orgId}
          slotProps={{
            input: {
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Copy organization ID">
                    <IconButton
                      size="small"
                      aria-label="Copy organization ID"
                      onClick={() => navigator.clipboard?.writeText(orgId)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
          helperText="Share this with your administrator when requesting plan or credit changes."
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {status === 'past_due' && (
        <Alert severity="error">
          <AlertTitle>Payment failed</AlertTitle>
          {gracePeriodEndsAt
            ? `The plan stays active until ${new Date(gracePeriodEndsAt).toLocaleDateString()}, then drops to Free and custom domains are disconnected.`
            : 'Update the payment method to keep this plan.'}
        </Alert>
      )}
      {pendingPlanId && (
        <Alert severity="info">
          Scheduled to change to <strong>{pendingPlanId}</strong> at the end of the current
          billing period.
        </Alert>
      )}
      {!paymentsReady && (
        <Alert severity="info">
          Payments are not configured on this deployment, so plans can be viewed but not
          purchased.
        </Alert>
      )}
      {paymentsReady && !publishableKey && (
        <Alert severity="warning">
          Publishable key missing — add Stripe publishable key in Organization &amp; Billing
          for embedded Checkout.
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}

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

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const price = interval === 'yearly' ? plan.priceYearly : plan.priceMonthly;
          const purchasableNow = canBuy(plan.id);

          return (
            <Card
              key={plan.id}
              variant="outlined"
              sx={{
                borderColor: isCurrent ? 'primary.main' : 'divider',
                borderWidth: isCurrent ? 2 : 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {plan.label}
                  </Typography>
                  {isCurrent && <Chip label="Current" size="small" color="primary" />}
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
                <Stack spacing={0.5}>
                  {/*
                    Enterprise has no published allowance, and rendering its
                    zero as "0 AI credits / month" reads as "this plan includes
                    none" — the opposite of "yours is negotiated". The public
                    pricing table already says "Negotiated"; this card said 0.
                  */}
                  <Typography variant="body2">
                    {plan.aiCreditsPerMonth > 0 ? (
                      <>
                        <strong>{plan.aiCreditsPerMonth}</strong> AI credits / month
                      </>
                    ) : (
                      'Negotiated AI credit allowance'
                    )}
                  </Typography>
                  <Typography variant="body2">
                    {plan.maxTenants === null ? 'Unlimited' : plan.maxTenants} tenant
                    {plan.maxTenants === 1 ? '' : 's'}
                  </Typography>
                  {plan.features.slice(0, 4).map((feature) => (
                    <Stack key={feature} direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                      <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="caption">{feature}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant={isCurrent ? 'outlined' : 'contained'}
                  disabled={
                    isCurrent ||
                    isLoading ||
                    !purchasableNow ||
                    (!hasExistingSubscription && !embeddedReady)
                  }
                  onClick={() => choose(plan.id)}
                >
                  {isCurrent
                    ? 'Current plan'
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

      <EmbeddedPlanCheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        orgId={orgId}
        target={checkoutTarget}
        publishableKey={publishableKey}
        onComplete={handleCheckoutComplete}
      />
    </Stack>
  );
}

// ── AI Credits (Topup purchase + Usage history) ───────────────────

function AiCreditsPurchase({
  orgId,
  planId,
  balance,
  grants,
  readiness,
  readOnly = false,
  selfServeTopUp = false,
  onOpenPlanTab,
}: {
  orgId: string;
  planId: PlanId;
  balance: {
    available: number;
    expiringSoon: number;
    debt: number;
    net: number;
    shared?: number;
    personal?: number;
  } | null;
  grants: React.ComponentProps<typeof CreditGrantsTable>['grants'];
  readiness: { ready: boolean } | null;
  readOnly?: boolean;
  selfServeTopUp?: boolean;
  onOpenPlanTab?: () => void;
}) {
  const [topUpPackId, setTopUpPackId] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestCopied, setRequestCopied] = useState(false);
  const { user } = useAppSelector((s) => s.auth);

  const byPlan =
    selfServeTopUp && balance?.shared !== undefined
      ? balance.shared
      : grants
          .filter((g) => g.source === 'plan' && !g.ownerUserId)
          .reduce((sum, g) => sum + g.remaining, 0);
  const byPurchase =
    selfServeTopUp && user?.id
      ? grants
          .filter(
            (g) =>
              (g.source === 'addon' || g.source === 'onetime') && g.ownerUserId === user.id,
          )
          .reduce((sum, g) => sum + g.remaining, 0)
      : grants
          .filter((g) => g.source === 'addon' || g.source === 'onetime')
          .reduce((sum, g) => sum + g.remaining, 0);
  const byPromo =
    selfServeTopUp && user?.id
      ? grants
          .filter((g) => g.source === 'promo' && g.ownerUserId === user.id)
          .reduce((sum, g) => sum + g.remaining, 0)
      : grants.filter((g) => g.source === 'promo').reduce((sum, g) => sum + g.remaining, 0);

  const mayPurchase = !readOnly || selfServeTopUp;
  const planAllowsTopUp = canPurchaseCreditPacks(planId);
  const canTopUp = mayPurchase && planAllowsTopUp;

  const requestMessage = [
    'Hi,',
    '',
    'I would like to request an increase to our AI credit limit.',
    '',
    `Organization ID: ${orgId}`,
    `Current balance: ${balance?.available ?? 0} credits`,
    user?.email ? `Requested by: ${user.email}` : null,
    user?.id ? `Account ID: ${user.id}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const copyRequest = async () => {
    await navigator.clipboard?.writeText(requestMessage);
    setRequestCopied(true);
  };

  return (
    <Stack spacing={3}>
      {balance && balance.debt > 0 && canTopUp && (
        <Alert severity="error">
          <AlertTitle>Generation is blocked</AlertTitle>
          A previous generation ran past the available balance and this organization owes{' '}
          <strong>{balance.debt}</strong> credits. Adding credits settles the debt automatically
          before anything else is spent.
        </Alert>
      )}

      <Box>
        <Typography variant="overline" color="text.secondary">
          {readOnly ? 'Your spendable AI credits' : 'AI credit balance'}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {balance?.available ?? 0}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            credits
          </Typography>
          {balance && balance.expiringSoon > 0 && (
            <Chip
              label={`${balance.expiringSoon} expiring within 7 days`}
              size="small"
              color="warning"
              sx={{ ml: 1 }}
            />
          )}
        </Stack>
      </Box>

      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {selfServeTopUp ? 'Shared (plan)' : 'From plan'}
          </Typography>
          <Typography variant="h6">{byPlan}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {selfServeTopUp ? 'Your purchases' : 'Purchased'}
          </Typography>
          <Typography variant="h6">{byPurchase}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {selfServeTopUp ? 'Your bonus' : 'Bonus'}
          </Typography>
          <Typography variant="h6">{byPromo}</Typography>
        </Box>
      </Stack>

      {selfServeTopUp && (
        <Typography variant="body2" color="text.secondary">
          Plan credits are shared with everyone on this organization. Credits you buy are for your
          account only and are spent before shared plan credits.
        </Typography>
      )}

      {canTopUp ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add credits
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {CREDIT_PACKS.map((pack) => (
              <Button
                key={pack.id}
                variant="outlined"
                startIcon={<BoltIcon />}
                disabled={!readiness?.ready}
                onClick={() => setTopUpPackId(pack.id)}
              >
                {pack.label} — {pack.baseCredits + pack.bonusCredits} credits
              </Button>
            ))}
          </Stack>
        </Box>
      ) : mayPurchase && !planAllowsTopUp ? (
        <Box>
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Credit packs require a Pro plan or higher. This organization is on the{' '}
            <strong>{planId}</strong> plan.
          </Alert>
          <Button variant="contained" onClick={() => onOpenPlanTab?.()}>
            Upgrade plan
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Need more credits?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Your organization administrator manages AI credit purchases and limits. You can copy a
            request message and send it to them.
          </Typography>
          <Button variant="outlined" startIcon={<BoltIcon />} onClick={() => setRequestOpen(true)}>
            Request more AI credits
          </Button>
        </Box>
      )}

      {topUpPackId && canTopUp && (
        <StripeTopUpDialog
          open
          orgId={orgId}
          packId={topUpPackId}
          onClose={() => setTopUpPackId(null)}
        />
      )}

      <Dialog open={requestOpen} onClose={() => setRequestOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request more AI credits</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Copy this message and send it to your organization administrator. They can add
              credits or upgrade the plan from the platform console.
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={6}
              value={requestMessage}
              slotProps={{ input: { readOnly: true } }}
            />
            {requestCopied && <Alert severity="success">Request copied to clipboard.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => void copyRequest()}
          >
            Copy request
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

/** Settings → Usage / Billing → History — ledger, grants, and admin analytics. */
function AiCreditsHistory({
  grants,
  ledger,
  analytics,
  readOnly = false,
  selfServeTopUp = false,
}: {
  grants: React.ComponentProps<typeof CreditGrantsTable>['grants'];
  ledger: React.ComponentProps<typeof CreditUsageTable>['ledger'];
  analytics?: CreditAdminAnalytics | null;
  readOnly?: boolean;
  selfServeTopUp?: boolean;
}) {
  const [historyTab, setHistoryTab] = useState<'usage' | 'grants'>('usage');
  const { user } = useAppSelector((s) => s.auth);

  const visibleGrants =
    selfServeTopUp && user?.id
      ? grants.filter((g) => !g.ownerUserId || g.ownerUserId === user.id)
      : grants;

  const showAdminAnalytics = !readOnly && Boolean(analytics);

  return (
    <Stack spacing={3}>
      {showAdminAnalytics && analytics && (
        <CreditAdminAnalyticsPanels
          users={analytics.users}
          byProvider={analytics.byProvider}
          byModel={analytics.byModel}
        />
      )}

      <Box>
        <Tabs
          value={historyTab}
          onChange={(_, next: 'usage' | 'grants') => setHistoryTab(next)}
          sx={{ mb: 2, minHeight: 36 }}
        >
          <Tab label="Usage history" value="usage" sx={{ minHeight: 36 }} />
          <Tab label="Grants" value="grants" sx={{ minHeight: 36 }} />
        </Tabs>
        {historyTab === 'usage' ? (
          <CreditUsageTable ledger={ledger} />
        ) : (
          <CreditGrantsTable grants={visibleGrants} />
        )}
      </Box>
    </Stack>
  );
}


// ── Invoices ──────────────────────────────────────────────────────

function InvoicesTab({ orgId }: { orgId: string }) {
  const { data, isLoading } = useGetOrganizationInvoicesQuery(orgId, { skip: !orgId });
  const invoices = data?.data?.invoices ?? [];

  if (isLoading) {
    return <Typography variant="body2" color="text.secondary">Loading…</Typography>;
  }

  if (invoices.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
        {data?.data?.stripeConfigured
          ? 'No invoices yet.'
          : 'Payments are not configured on this deployment.'}
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow>
            <TableCell>Invoice</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Period</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{invoice.number ?? invoice.id}</TableCell>
              <TableCell>{new Date(invoice.created).toLocaleDateString()}</TableCell>
              <TableCell>
                {new Date(invoice.periodStart).toLocaleDateString()} –{' '}
                {new Date(invoice.periodEnd).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={invoice.status ?? 'unknown'}
                  size="small"
                  color={invoice.status === 'paid' ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(invoice.amountPaid || invoice.amountDue, invoice.currency)}
              </TableCell>
              <TableCell align="right">
                {invoice.hostedInvoiceUrl && (
                  <Link
                    href={invoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    View <OpenInNewIcon sx={{ fontSize: 14 }} />
                  </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
