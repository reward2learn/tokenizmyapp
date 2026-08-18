'use client';

import { useState } from 'react';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBillingTab, type BillingTab } from '@/store/ui-slice';
import {
  useGetOrganizationQuery,
  useGetOrganizationCreditsQuery,
  useGetBillingCheckoutQuery,
  useGetOrganizationInvoicesQuery,
  useStartCheckoutMutation,
} from '@/store/apis/organization-api';
import { PLANS, CREDIT_PACKS, YEARLY_DISCOUNT, type PlanId } from '@/lib/billing/plans';
import { CreditGrantsTable } from '@/components/billing/credit-grants-table';
import { CreditUsageTable } from '@/components/billing/credit-usage-table';
import { BillingDetailsTab } from '@/components/billing/billing-details-tab';
import { CloudCreditsTab } from '@/components/billing/cloud-credits-tab';
import { PaymentMethodsTab } from '@/components/billing/payment-methods-tab';
import { StripeTopUpDialog } from '@/components/ops-admin/stripe-topup-dialog';

/**
 * Settings → Billing.
 *
 * Four tabs mirroring the IA in the roadmap: Plan, AI Credits, Cloud Credits,
 * Invoices. Cloud Credits is deliberately an honest "not built yet" panel
 * rather than a mocked table — Phase 5 has no metering, and a UI that implies
 * otherwise would be worse than an absent one.
 *
 * Tab selection lives in the ui slice, not component state, so returning from
 * a hosted-Checkout redirect lands the admin back where they were instead of
 * on the first tab.
 */

function formatMoney(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function BillingPanel({ orgId }: { orgId: string }) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.ui.billingTab);

  const { data: orgData } = useGetOrganizationQuery(orgId, { skip: !orgId });
  const { data: creditsData } = useGetOrganizationCreditsQuery(orgId, { skip: !orgId });
  const { data: checkoutData } = useGetBillingCheckoutQuery(orgId, { skip: !orgId });

  // The checkout query reconciles against Stripe before answering, so its copy
  // is the fresher of the two. Falling back to the organization query keeps the
  // panel populated when Stripe is switched off entirely.
  const subscription = checkoutData?.data?.subscription ?? orgData?.data?.subscription ?? null;
  const balance = creditsData?.data?.balance ?? null;
  const grants = creditsData?.data?.grants ?? [];
  const ledger = creditsData?.data?.ledger ?? [];
  const readiness = checkoutData?.data?.readiness ?? null;
  const linkage = checkoutData?.data?.linkage ?? null;
  const reconcileNote = checkoutData?.data?.reconcileNote ?? null;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Tabs
        value={tab}
        onChange={(_, next: BillingTab) => dispatch(setBillingTab(next))}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
      >
        <Tab label="Plan" value="plan" />
        <Tab label="AI Credits" value="ai-credits" />
        <Tab label="Cloud Credits" value="cloud-credits" />
        <Tab label="Billing Details" value="billing-details" />
        <Tab label="Payment Methods" value="payment-methods" />
        <Tab label="Invoices" value="invoices" />
      </Tabs>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {readiness?.configError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Stripe configuration problem</AlertTitle>
            {readiness.configError}
          </Alert>
        )}
        {reconcileNote && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Plan could not be confirmed with Stripe</AlertTitle>
            {reconcileNote}
          </Alert>
        )}
        {readiness?.liveMode && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This deployment is connected to <strong>live</strong> Stripe. Actions here move real
            money.
          </Alert>
        )}

        {tab === 'plan' && (
          <PlanTab
            orgId={orgId}
            currentPlanId={subscription?.planId ?? 'free'}
            status={subscription?.status ?? 'active'}
            pendingPlanId={linkage?.pendingPlanId ?? null}
            gracePeriodEndsAt={linkage?.gracePeriodEndsAt ?? null}
            purchasable={checkoutData?.data?.purchasable ?? []}
            paymentsReady={Boolean(readiness?.ready)}
          />
        )}
        {tab === 'ai-credits' && (
          <AiCreditsTab
            orgId={orgId}
            balance={balance}
            grants={grants}
            ledger={ledger}
            readiness={readiness}
          />
        )}
        {tab === 'cloud-credits' && <CloudCreditsTab orgId={orgId} />}
        {tab === 'billing-details' && <BillingDetailsTab orgId={orgId} />}
        {tab === 'payment-methods' && <PaymentMethodsTab orgId={orgId} />}
        {tab === 'invoices' && <InvoicesTab orgId={orgId} />}
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
}: {
  orgId: string;
  currentPlanId: PlanId;
  status: string;
  pendingPlanId: string | null;
  gracePeriodEndsAt: string | null;
  purchasable: Array<{ planId: string; interval: 'monthly' | 'yearly' }>;
  paymentsReady: boolean;
}) {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [startCheckout, { isLoading }] = useStartCheckoutMutation();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canBuy = (planId: string) =>
    purchasable.some((p) => p.planId === planId && p.interval === interval);

  const choose = async (planId: PlanId) => {
    setError(null);
    setNotice(null);
    try {
      const result = await startCheckout({ orgId, planId, interval }).unwrap();
      const payload = result.data;
      if (payload && 'url' in payload) {
        // Hosted Checkout: a full navigation, not a new tab — returning from
        // Stripe should come back into this same app context.
        window.location.href = payload.url;
        return;
      }
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
  };

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
                  <Typography variant="body2">
                    <strong>{plan.aiCreditsPerMonth}</strong> AI credits / month
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
                  disabled={isCurrent || isLoading || !purchasableNow}
                  onClick={() => choose(plan.id)}
                >
                  {isCurrent
                    ? 'Current plan'
                    : plan.priceMonthly === null
                      ? 'Contact sales'
                      : purchasableNow
                        ? 'Choose'
                        : 'Unavailable'}
                </Button>
              </Box>
            </Card>
          );
        })}
      </Box>
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
}: {
  orgId: string;
  balance: { available: number; expiringSoon: number; debt: number; net: number } | null;
  grants: React.ComponentProps<typeof CreditGrantsTable>['grants'];
  ledger: React.ComponentProps<typeof CreditUsageTable>['ledger'];
  readiness: { ready: boolean } | null;
}) {
  // Which of the two histories is showing. Local, unlike the outer billing tab:
  // it is a view toggle inside one tab rather than a place in the app, and
  // nothing else needs to know about it.
  const [historyTab, setHistoryTab] = useState<'usage' | 'grants'>('usage');
  const [topUpPackId, setTopUpPackId] = useState<string | null>(null);

  const byPlan = grants
    .filter((g) => g.source === 'plan')
    .reduce((sum, g) => sum + g.remaining, 0);
  const byPurchase = grants
    .filter((g) => g.source === 'addon' || g.source === 'onetime')
    .reduce((sum, g) => sum + g.remaining, 0);
  const byPromo = grants.filter((g) => g.source === 'promo').reduce((sum, g) => sum + g.remaining, 0);

  return (
    <Stack spacing={3}>
      {balance && balance.debt > 0 && (
        <Alert severity="error">
          <AlertTitle>Generation is blocked</AlertTitle>
          A previous generation ran past the available balance and this organization owes{' '}
          <strong>{balance.debt}</strong> credits. Adding credits settles the debt automatically
          before anything else is spent.
        </Alert>
      )}

      <Box>
        <Typography variant="overline" color="text.secondary">
          AI credit balance
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
      {!readiness?.ready && (
        <Typography variant="caption" color="text.secondary">
          Payments are not configured, so credits can only be granted by a platform admin.
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

      {topUpPackId && (
        <StripeTopUpDialog
          open
          orgId={orgId}
          packId={topUpPackId}
          onClose={() => setTopUpPackId(null)}
        />
      )}

      {/* Usage History */}
      {balance && (
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
