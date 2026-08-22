'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { PlanId } from '@/lib/billing/plans';
import { PLANS } from '@/lib/billing/plans';
import {
  formatUsdAnnualFromMonthlyRate,
  formatUsdPerMonth,
  priceEnvVarName,
  PURCHASABLE_PLAN_IDS,
  shortKeyFor,
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

export function SubscriptionTierPricingSection({ value, onChange }: Props) {
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
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        Subscription plan prices
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Set the monthly rate for each tier. Yearly billing uses the discounted $/month rate
        (15% off × 12 billed once per year). On <strong>Save Changes</strong>, Stripe Price
        objects are created and <code>STRIPE_PRICE_*</code> env vars are pushed to every linked
        Vercel project.
      </Typography>

      <Table size="small" sx={{ mb: 2 }}>
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
                <TableCell>
                  <Stack spacing={0.5}>
                    {value.prices[monthlyKey] ? (
                      <Chip size="small" label={value.prices[monthlyKey]} variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">monthly — pending sync</Typography>
                    )}
                    {value.prices[yearlyKey] ? (
                      <Chip size="small" label={value.prices[yearlyKey]} variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">yearly — pending sync</Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
        Display amounts ({formatUsdPerMonth(value.amounts.PRO_MONTHLY)} Pro monthly, etc.) appear on
        Choose Plan after sync. You can paste existing Stripe price IDs below to skip auto-creation.
      </Alert>

      <Box sx={{ mt: 2 }}>
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
