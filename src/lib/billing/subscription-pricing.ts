import type { BillingInterval, PlanId } from '@/lib/billing/plans';
import { PLANS } from '@/lib/billing/plans';

/** Self-serve subscription tiers (not free / enterprise). */
export const PURCHASABLE_PLAN_IDS: PlanId[] = ['pro', 'business'];

export type SubscriptionPriceShortKey =
  | 'PRO_MONTHLY'
  | 'PRO_YEARLY'
  | 'BUSINESS_MONTHLY'
  | 'BUSINESS_YEARLY';

export const SUBSCRIPTION_PRICE_SHORT_KEYS: SubscriptionPriceShortKey[] = [
  'PRO_MONTHLY',
  'PRO_YEARLY',
  'BUSINESS_MONTHLY',
  'BUSINESS_YEARLY',
];

export function shortKeyFor(planId: PlanId, interval: BillingInterval): SubscriptionPriceShortKey {
  return `${planId.toUpperCase()}_${interval.toUpperCase()}` as SubscriptionPriceShortKey;
}

export function planIntervalFromShortKey(key: SubscriptionPriceShortKey): {
  planId: PlanId;
  interval: BillingInterval;
} {
  const [plan, interval] = key.split('_') as [string, BillingInterval];
  return { planId: plan.toLowerCase() as PlanId, interval };
}

/** Default catalog amounts (USD cents). Yearly keys = effective $/month when billed annually. */
export function defaultSubscriptionAmounts(): Record<SubscriptionPriceShortKey, number> {
  const pro = PLANS.find((p) => p.id === 'pro')!;
  const business = PLANS.find((p) => p.id === 'business')!;
  return {
    PRO_MONTHLY: pro.priceMonthly ?? 0,
    PRO_YEARLY: pro.priceYearly ?? 0,
    BUSINESS_MONTHLY: business.priceMonthly ?? 0,
    BUSINESS_YEARLY: business.priceYearly ?? 0,
  };
}

/** Stripe yearly price charges once per year — unit_amount is annual total in cents. */
export function stripeYearlyUnitAmount(monthlyWhenYearlyCents: number): number {
  return monthlyWhenYearlyCents * 12;
}

export function priceEnvVarName(shortKey: SubscriptionPriceShortKey): string {
  return `STRIPE_PRICE_${shortKey}`;
}

export function formatUsdPerMonth(cents: number): string {
  return `$${(cents / 100).toFixed(2)}/mo`;
}

export function formatUsdAnnualFromMonthlyRate(monthlyWhenYearlyCents: number): string {
  return `$${(stripeYearlyUnitAmount(monthlyWhenYearlyCents) / 100).toFixed(2)}/yr`;
}
