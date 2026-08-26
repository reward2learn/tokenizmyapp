'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import type { PlanId } from '@/lib/billing/plans';
import { PLANS } from '@/lib/billing/plans';
import {
  defaultSubscriptionAmounts,
  formatUsdAnnualFromMonthlyRate,
  formatUsdPerMonth,
  priceEnvVarName,
  PURCHASABLE_PLAN_IDS,
  shortKeyFor,
  SUBSCRIPTION_PRICE_SHORT_KEYS,
  type SubscriptionPriceShortKey,
} from '@/lib/billing/subscription-pricing';

export type SubscriptionTierPricingState = {
  amounts: Record<SubscriptionPriceShortKey, number>;
  prices: {
    PRO_MONTHLY?: string;
    PRO_YEARLY?: string;
    BUSINESS_MONTHLY?: string;
    BUSINESS_YEARLY?: string;
  };
};

type Props = {
  value: SubscriptionTierPricingState;
  onChange: (next: SubscriptionTierPricingState) => void;
  /** Save catalog defaults, create Stripe Prices, push STRIPE_PRICE_* to Vercel. */
  onApplyCatalogDefaultsAndSync?: () => Promise<void>;
  syncing?: boolean;
};

function centsToDollarInput(cents: number): string {
  if (!cents) return '';
  return (cents / 100).toFixed(2);
}

function dollarsToCents(input: string): number {
  const n = Number.parseFloat(input.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

const wrapChipSx = {
  maxWidth: '100%',
  height: 'auto',
  alignSelf: 'flex-start',
  '& .MuiChip-label': {
    display: 'block',
    whiteSpace: 'normal',
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
    py: 0.25,
  },
} as const;

function PriceIdChips({
  monthlyId,
  yearlyId,
}: {
  monthlyId?: string;
  yearlyId?: string;
}) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0, maxWidth: '100%' }}>
      {monthlyId ? (
        <Chip size="small" label={monthlyId} variant="outlined" sx={wrapChipSx} />
      ) : (
        <Typography variant="caption" color="text.secondary">monthly — pending sync</Typography>
      )}
      {yearlyId ? (
        <Chip size="small" label={yearlyId} variant="outlined" sx={wrapChipSx} />
      ) : (
        <Typography variant="caption" color="text.secondary">yearly — pending sync</Typography>
      )}
    </Stack>
  );
}

export function SubscriptionTierPricingSection({
  value,
  onChange,
  onApplyCatalogDefaultsAndSync,
  syncing = false,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const catalogDefaults = defaultSubscriptionAmounts();

  const applyDefaultsToForm = () => {
    onChange({
      ...value,
      amounts: { ...catalogDefaults },
    });
  };

  const patchAmount = (key: SubscriptionPriceShortKey, dollars: string) => {
    onChange({
      ...value,
      amounts: { ...value.amounts, [key]: dollarsToCents(dollars) },
    });
  };

  const patchPriceId = (key: SubscriptionPriceShortKey, priceId: string) => {
    onChange({
      ...value,
      prices: { ...value.prices, [key]: priceId },
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        Subscription plan prices
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 2, minWidth: 0 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
          Set the monthly rate for each tier. Yearly billing uses the discounted $/month rate
          (15% off × 12 billed once per year). Use the button to load catalog defaults and push{' '}
          {SUBSCRIPTION_PRICE_SHORT_KEYS.map((k) => priceEnvVarName(k)).join(', ')} to Vercel.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
          <Button size="small" variant="outlined" onClick={applyDefaultsToForm} disabled={syncing} fullWidth={isMobile}>
            Reset to catalog defaults
          </Button>
          <Button
            size="small"
            variant="contained"
            fullWidth={isMobile}
            startIcon={
              syncing ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon />
            }
            onClick={() => void onApplyCatalogDefaultsAndSync?.()}
            disabled={syncing || !onApplyCatalogDefaultsAndSync}
          >
            Apply defaults &amp; sync to Stripe
          </Button>
        </Stack>
      </Stack>

      {isMobile ? (
        <Stack spacing={2} sx={{ mb: 2, minWidth: 0 }}>
          {PURCHASABLE_PLAN_IDS.map((planId: PlanId) => {
            const plan = PLANS.find((p) => p.id === planId)!;
            const monthlyKey = shortKeyFor(planId, 'monthly');
            const yearlyKey = shortKeyFor(planId, 'yearly');
            const monthlyCents = value.amounts[monthlyKey];
            const yearlyMonthlyCents = value.amounts[yearlyKey];

            return (
              <Paper key={planId} variant="outlined" sx={{ p: 1.5, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{plan.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {plan.tagline}
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    label="Monthly billing ($/mo)"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={centsToDollarInput(monthlyCents)}
                    onChange={(e) => patchAmount(monthlyKey, e.target.value)}
                    placeholder="99.00"
                    helperText={priceEnvVarName(monthlyKey)}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    label="Yearly billing ($/mo effective)"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={centsToDollarInput(yearlyMonthlyCents)}
                    onChange={(e) => patchAmount(yearlyKey, e.target.value)}
                    placeholder="84.15"
                    helperText={priceEnvVarName(yearlyKey)}
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                      Annual charge
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {yearlyMonthlyCents > 0
                        ? formatUsdAnnualFromMonthlyRate(yearlyMonthlyCents)
                        : '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Stripe price ID
                    </Typography>
                    <PriceIdChips
                      monthlyId={value.prices[monthlyKey]}
                      yearlyId={value.prices[yearlyKey]}
                    />
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto', mb: 2 }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell>Monthly billing ($/mo)</TableCell>
                <TableCell>Yearly billing ($/mo effective)</TableCell>
                <TableCell>Annual charge</TableCell>
                <TableCell>Stripe price ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PURCHASABLE_PLAN_IDS.map((planId: PlanId) => {
                const plan = PLANS.find((p) => p.id === planId)!;
                const monthlyKey = shortKeyFor(planId, 'monthly');
                const yearlyKey = shortKeyFor(planId, 'yearly');
                const monthlyCents = value.amounts[monthlyKey];
                const yearlyMonthlyCents = value.amounts[yearlyKey];

                return (
                  <TableRow key={planId}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{plan.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{plan.tagline}</Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        value={centsToDollarInput(monthlyCents)}
                        onChange={(e) => patchAmount(monthlyKey, e.target.value)}
                        placeholder="99.00"
                        helperText={priceEnvVarName(monthlyKey)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        value={centsToDollarInput(yearlyMonthlyCents)}
                        onChange={(e) => patchAmount(yearlyKey, e.target.value)}
                        placeholder="84.15"
                        helperText={priceEnvVarName(yearlyKey)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {yearlyMonthlyCents > 0
                          ? formatUsdAnnualFromMonthlyRate(yearlyMonthlyCents)
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <PriceIdChips
                        monthlyId={value.prices[monthlyKey]}
                        yearlyId={value.prices[yearlyKey]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      <Alert severity="info" sx={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>
        Catalog defaults: Pro {formatUsdPerMonth(catalogDefaults.PRO_MONTHLY)} monthly,{' '}
        {formatUsdPerMonth(catalogDefaults.PRO_YEARLY)} yearly ({formatUsdAnnualFromMonthlyRate(catalogDefaults.PRO_YEARLY)}); Business{' '}
        {formatUsdPerMonth(catalogDefaults.BUSINESS_MONTHLY)} / {formatUsdPerMonth(catalogDefaults.BUSINESS_YEARLY)}.
        Choose Plan uses the synced price IDs after a successful sync.
      </Alert>

      <Box sx={{ mt: 2, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Optional — paste Stripe price IDs (overrides auto-create on next Save)
        </Typography>
        <Stack spacing={1.5}>
          {(['PRO_MONTHLY', 'PRO_YEARLY', 'BUSINESS_MONTHLY', 'BUSINESS_YEARLY'] as const).map((key) => (
            <TextField
              key={key}
              size="small"
              fullWidth
              label={priceEnvVarName(key)}
              value={value.prices[key] ?? ''}
              onChange={(e) => patchPriceId(key, e.target.value)}
              placeholder="price_…"
            />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}
