'use client';

import { useCallback, useState } from 'react';
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
import { setBillingTab, type BillingTab } from '@/store/ui-slice';
import {
  useGetOrganizationQuery,
  useGetOrganizationCreditsQuery,
  useGetBillingCheckoutQuery,
  useGetOrganizationInvoicesQuery,
  useStartCheckoutMutation,
  organizationApi,
} from '@/store/apis/organization-api';
import { PLANS, CREDIT_PACKS, YEARLY_DISCOUNT, type PlanId } from '@/lib/billing/plans';
import {
  EmbeddedPlanCheckoutDialog,
  type EmbeddedPlanCheckoutTarget,
} from '@/components/billing/embedded-plan-checkout';
import { CreditGrantsTable } from '@/components/billing/credit-grants-table';
import { CreditUsageTable } from '@/components/billing/credit-usage-table';
import { BillingDetailsTab } from '@/components/billing/billing-details-tab';
import { CloudCreditsTab } from '@/components/billing/cloud-credits-tab';
import { PaymentMethodsTab } from '@/components/billing/payment-methods-tab';
import { StripeTopUpDialog } from '@/components/ops-admin/stripe-topup-dialog';
import { TenantManagedOrgAlert } from '@/components/settings/tenant-managed-message';

/**
 * Settings → Billing.
 *
 * Four tabs mirroring the IA in the roadmap: Plan, AI Credits, Cloud Credits,
 * Invoices. Cloud Credits is deliberately an honest "not built yet" panel
 * rather than a mocked table — Phase 5 has no metering, and a UI that implies
 * otherwise would be worse than an absent one.
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
  const balance = creditsData?.data?.balance ?? null;
  const grants = creditsData?.data?.grants ?? [];
  const ledger = creditsData?.data?.ledger ?? [];
  const readiness = checkoutData?.data?.readiness ?? null;
  const creditsPaymentsReady = creditsData?.data?.paymentsReady;
  const effectiveReadiness =
    readOnly && selfServeBilling
      ? { ready: creditsPaymentsReady === true }
      : readiness;
  const linkage = checkoutData?.data?.linkage ?? null;
  const reconcileNote = checkoutData?.data?.reconcileNote ?? null;
  const priceMismatches = checkoutData?.data?.priceMismatches ?? [];

  const visibleTabs: BillingTab[] = readOnly
    ? ['plan', 'ai-credits']
    : ['plan', 'ai-credits', 'cloud-credits', 'billing-details', 'payment-methods', 'invoices'];

  const activeTab = visibleTabs.includes(tab) ? tab : visibleTabs[0];

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={(_, next: BillingTab) => dispatch(setBillingTab(next))}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
      >
        <Tab label="Plan" value="plan" />
        <Tab label="AI Credits" value="ai-credits" />
        {!readOnly && <Tab label="Cloud Credits" value="cloud-credits" />}
        {!readOnly && <Tab label="Billing Details" value="billing-details" />}
        {!readOnly && <Tab label="Payment Methods" value="payment-methods" />}
        {!readOnly && <Tab label="Invoices" value="invoices" />}
      </Tabs>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {readOnly && !selfServeBilling && (
          <Box sx={{ mb: 2 }}>
            <TenantManagedOrgAlert />
          </Box>
        )}
        {readOnly && selfServeBilling && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You can purchase AI credit top-ups for this organization. Plan changes and billing
            details are managed by your administrator.
          </Alert>
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

        {activeTab === 'plan' && (
          <PlanTab
            orgId={orgId}
            currentPlanId={subscription?.planId ?? 'free'}
            status={subscription?.status ?? 'active'}
            pendingPlanId={linkage?.pendingPlanId ?? null}
            gracePeriodEndsAt={linkage?.gracePeriodEndsAt ?? null}
            purchasable={checkoutData?.data?.purchasable ?? []}
            paymentsReady={Boolean(effectiveReadiness?.ready)}
            publishableKey={checkoutData?.data?.publishableKey ?? null}
            hasExistingSubscription={Boolean(linkage?.subscriptionId)}
            readOnly={readOnly}
          />
        )}
        {activeTab === 'ai-credits' && (
          <AiCreditsTab
            orgId={orgId}
            balance={balance}
            grants={grants}
            ledger={ledger}
            readiness={effectiveReadiness}
            readOnly={readOnly}
            selfServeTopUp={selfServeBilling}
          />
        )}
        {!readOnly && activeTab === 'cloud-credits' && <CloudCreditsTab orgId={orgId} />}
        {!readOnly && activeTab === 'billing-details' && <BillingDetailsTab orgId={orgId} />}
        {!readOnly && activeTab === 'payment-methods' && <PaymentMethodsTab orgId={orgId} />}
        {!readOnly && activeTab === 'invoices' && <InvoicesTab orgId={orgId} />}
      </Box>
    </Paper>
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

// ── AI Credits ────────────────────────────────────────────────────

function AiCreditsTab({
  orgId,
  balance,
  grants,
  ledger,
  readiness,
  readOnly = false,
  selfServeTopUp = false,
}: {
  orgId: string;
  balance: { available: number; expiringSoon: number; debt: number; net: number } | null;
  grants: React.ComponentProps<typeof CreditGrantsTable>['grants'];
  ledger: React.ComponentProps<typeof CreditUsageTable>['ledger'];
  readiness: { ready: boolean } | null;
  readOnly?: boolean;
  selfServeTopUp?: boolean;
}) {
  const [historyTab, setHistoryTab] = useState<'usage' | 'grants'>('usage');
  const [topUpPackId, setTopUpPackId] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestCopied, setRequestCopied] = useState(false);
  const { user } = useAppSelector((s) => s.auth);

  const byPlan = grants
    .filter((g) => g.source === 'plan')
    .reduce((sum, g) => sum + g.remaining, 0);
  const byPurchase = grants
    .filter((g) => g.source === 'addon' || g.source === 'onetime')
    .reduce((sum, g) => sum + g.remaining, 0);
  const byPromo = grants.filter((g) => g.source === 'promo').reduce((sum, g) => sum + g.remaining, 0);

  const canTopUp = !readOnly || selfServeTopUp;

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
          {readOnly ? 'Organization AI credit balance' : 'AI credit balance'}
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

      {/*
        Auto-reload is NOT built. There is no store behind it: no column, no
        endpoint, nothing that would run a top-up when a balance crosses a
        threshold. The UI that used to sit here was unreachable anyway —
        `autoReload` was initialised false and no control ever set it — so it
        rendered as a permanent "Auto-reload: Disabled" line, promising a
        feature that does not exist and cannot be switched on.

        Building it needs three things this file cannot supply on its own: a
        persisted setting on the organization, a server-side check that fires
        when a balance crosses the threshold, and a stored payment method to
        charge without a human present. Until those exist, the manual top-up
        below is the whole story.
      */}


      {/* Where the balance comes from. Purchased and bonus credits are separate
          lines because they are separate grants — a refund can claw back a
          bonus without touching what the customer paid for. */}
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            From plan
          </Typography>
          <Typography variant="h6">{byPlan}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Purchased
          </Typography>
          <Typography variant="h6">{byPurchase}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Bonus
          </Typography>
          <Typography variant="h6">{byPromo}</Typography>
        </Box>
      </Stack>

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
      {!canTopUp && !readiness?.ready && (
        <Typography variant="caption" color="text.secondary">
          Payments are not configured, so credits can only be granted by a platform admin.
        </Typography>
      )}
      {canTopUp && !readiness?.ready && (
        <Typography variant="caption" color="text.secondary">
          Payments are not configured — top-ups are unavailable until Stripe Flight Check passes.
        </Typography>
      )}

      {/*
        Usage first. "Where did my credits go" is the question people arrive
        with; "when do they expire" is the one they ask second, and only the
        grants table can answer it — which is why both are here rather than one.
      */}
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
          <CreditGrantsTable grants={grants} />
        )}
      </Box>

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

      {/* Usage History */}
      {!readOnly && balance && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Usage History
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Last {Math.min(grants.length, 10)} generation events
            </Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Model</TableCell>
                <TableCell align="right">Prompt</TableCell>
                <TableCell align="right">Completion</TableCell>
                <TableCell align="right">Credits</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Ledger entries would be fetched here */}
              <TableRow>
                <TableCell>—</TableCell>
                <TableCell>No consumption data yet</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}
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
    <Table size="small">
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
            <TableCell>{invoice.number ?? invoice.id}</TableCell>
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
  );
}
