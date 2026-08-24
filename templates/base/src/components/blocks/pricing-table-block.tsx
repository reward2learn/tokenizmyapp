'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import Link from 'next/link';
import {
  PLANS,
  YEARLY_DISCOUNT,
  yearlyMonthlyPrice,
  type Feature,
  type PlanDef,
} from '@/lib/billing/plans';
import { RADIUS, SHADOWS } from '@/theme/design-tokens';
import { BlockAnimateContainer, BlockAnimateRoot } from '@/components/blocks/block-scroll-animate';

/**
 * Pricing table, generated from the plan catalog.
 *
 * Deliberately NOT hand-written copy. `src/lib/billing/plans.ts` is what
 * actually decides the Stripe price, the monthly credit grant and every
 * entitlement check — a pricing page maintained separately from it starts
 * lying the first time either side changes, and the failure is silent and
 * customer-facing. Everything below is derived: prices, credit allowances,
 * app limits and the feature list.
 *
 * To change what is advertised, change the plan. That is the point.
 */

/** Customer-facing wording for each entitlement flag. */
const FEATURE_LABELS: Record<Feature, string> = {
  'custom-domains': 'Publish to custom domains',
  'remove-badge': 'Remove the platform badge',
  'multi-app': 'Multiple apps per workspace',
  'byo-ai-key': 'Bring your own AI provider key',
  teammates: 'Add teammates',
  rbac: 'Roles and access control',
  'priority-support': 'Priority support',
};

/** Perks that are not entitlement flags, so they cannot be derived. */
const EXTRA_LINES: Record<string, string[]> = {
  free: ['Publish on a free subdomain', 'Community support'],
  pro: ['Purchase AI credit top-ups', 'Email support'],
  business: ['Daily data backups', 'Advanced privacy controls'],
  enterprise: [
    'SSO / SAML',
    'Volume-based AI credit discount',
    'Dedicated technical support',
    'Custom integrations',
    'Onboarding services',
    'Data processing agreement',
    'Audit logs',
    'SCIM user provisioning',
  ],
};

function formatPrice(cents: number | null): string {
  if (cents === null) return 'Custom';
  if (cents === 0) return '$0';
  return `$${Math.round(cents / 100)}`;
}

function appLimit(plan: PlanDef): string {
  if (plan.maxAppsPerTenant === null) return 'Unlimited apps';
  const apps = plan.maxAppsPerTenant === 1 ? '1 app' : `${plan.maxAppsPerTenant} apps`;
  const spaces =
    plan.maxTenants === null
      ? 'unlimited workspaces'
      : plan.maxTenants === 1
        ? '1 workspace'
        : `${plan.maxTenants} workspaces`;
  return `${apps} per workspace, ${spaces}`;
}

/** What this plan adds over the one before it, so the ladder reads as a ladder. */
function incrementalFeatures(plan: PlanDef, previous: PlanDef | null): string[] {
  const inherited = new Set(previous?.features ?? []);
  const added = plan.features
    .filter((f) => !inherited.has(f))
    .map((f) => FEATURE_LABELS[f])
    .filter(Boolean);
  return [...added, ...(EXTRA_LINES[plan.id] ?? [])];
}

function PlanCard({
  plan,
  previous,
  interval,
  highlighted,
  ctaHref,
}: {
  plan: PlanDef;
  previous: PlanDef | null;
  interval: 'monthly' | 'yearly';
  highlighted: boolean;
  ctaHref: string;
}) {
  const monthlyCents =
    plan.priceMonthly === null
      ? null
      : interval === 'yearly'
        ? yearlyMonthlyPrice(plan.priceMonthly)
        : plan.priceMonthly;

  const lines = incrementalFeatures(plan, previous);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `${RADIUS.card}px`,
        border: '1px solid',
        borderColor: highlighted ? 'primary.main' : 'divider',
        boxShadow: highlighted ? SHADOWS.card : 'none',
        position: 'relative',
      }}
    >
      {highlighted && (
        <Chip
          label="Most popular"
          size="small"
          color="primary"
          sx={{ position: 'absolute', top: -12, right: 16 }}
        />
      )}

      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {plan.label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ minHeight: 32 }}>
        {plan.tagline}
      </Typography>

      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', mt: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {formatPrice(monthlyCents)}
        </Typography>
        {monthlyCents !== null && monthlyCents > 0 && (
          <Typography variant="caption" color="text.secondary">
            per month, billed {interval}
          </Typography>
        )}
      </Stack>

      <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600 }}>
        {plan.aiCreditsPerMonth > 0
          ? `${plan.aiCreditsPerMonth} AI credits / month`
          : 'Negotiated AI credit allowance'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {appLimit(plan)}
        {plan.cloudMultiplier > 1 ? ` · ${plan.cloudMultiplier}× cloud usage included` : ''}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2.5, fontWeight: 600 }}>
        {previous ? `Everything in ${previous.label}, plus:` : 'You get:'}
      </Typography>
      <Stack spacing={0.75} sx={{ mt: 1, flexGrow: 1 }}>
        {lines.map((line) => (
          <Stack key={line} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <CheckIcon sx={{ fontSize: 16, color: 'primary.main', mt: '2px' }} />
            <Typography variant="body2" color="text.secondary">
              {line}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Button
        component={Link}
        href={ctaHref as never}
        variant={highlighted ? 'contained' : 'outlined'}
        fullWidth
        sx={{ mt: 3 }}
      >
        {plan.priceMonthly === null ? 'Contact sales' : plan.priceMonthly === 0 ? 'Start free' : `Choose ${plan.label}`}
      </Button>
    </Paper>
  );
}

export function PricingTableBlock({ config }: { config: Record<string, unknown> }) {
  const heading = typeof config.heading === 'string' ? config.heading : 'Pricing';
  const subheading =
    typeof config.subheading === 'string'
      ? config.subheading
      : 'Start for free and upgrade as you grow.';
  const ctaHref = typeof config.ctaHref === 'string' ? config.ctaHref : '/admin';
  const highlightPlanId =
    typeof config.highlightPlanId === 'string' ? config.highlightPlanId : 'business';

  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, px: 3 }}>
      <BlockAnimateRoot>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {heading}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {subheading}
          </Typography>

          <ToggleButtonGroup
            value={interval}
            exclusive
            size="small"
            onChange={(_, next) => next && setInterval(next)}
            sx={{ mt: 3 }}
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">
              Yearly
              <Chip
                label={`Save ${Math.round(YEARLY_DISCOUNT * 100)}%`}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', alignItems: 'stretch' }}>
          {PLANS.map((plan, i) => (
            <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <BlockAnimateContainer index={1 + i}>
                <PlanCard
                  plan={plan}
                  previous={i > 0 ? PLANS[i - 1] : null}
                  interval={interval}
                  highlighted={plan.id === highlightPlanId}
                  ctaHref={ctaHref}
                />
              </BlockAnimateContainer>
            </Grid>
          ))}
        </Grid>
      </BlockAnimateRoot>
    </Box>
  );
}
