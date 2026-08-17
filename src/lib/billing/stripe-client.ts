/**
 * Stripe client and price catalog — the boundary between our plan ids and
 * Stripe's.
 *
 * Server-only: never import from a client component. The publishable key has
 * its own accessor (`getStripePublishableKey`) because that one IS safe in the
 * browser and the funnel needs it for Elements.
 *
 * Price ids live in the environment, not in code. They differ between test and
 * live mode and between Stripe accounts, so hardcoding them would make a
 * deploy to the wrong mode silently charge the wrong amounts — the one failure
 * here that is genuinely expensive to unwind.
 */
import Stripe from 'stripe';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/billing/plans';

/**
 * API version is pinned deliberately.
 *
 * Stripe ships breaking changes behind account-level version upgrades; letting
 * the SDK default means a dashboard change can alter webhook payload shapes
 * without a deploy. Bump this only alongside testing the webhook handlers.
 */
const STRIPE_API_VERSION = '2026-07-29.dahlia';

let cached: Stripe | null = null;

/** True when the platform has Stripe configured at all. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Whether a key string is a live-mode key. Works for both sk_ and pk_. */
export function isLiveKey(key: string | null | undefined): boolean {
  return Boolean(key?.trim().startsWith('sk_live_') || key?.trim().startsWith('pk_live_'));
}

/**
 * Is this deployment allowed to talk to live Stripe?
 *
 * Only a real production deployment. Everywhere else — local dev, preview
 * branches, CI — a live key is a mistake, and the cost of that mistake is
 * charging real customers real money while someone thinks they are testing.
 */
function liveKeysPermitted(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

/**
 * Configuration problems worth refusing to start on.
 *
 * Returns a reason string, or null when the configuration is coherent. These
 * are all mistakes that fail late and expensively: a live key in a dev
 * environment bills real cards, and a webhook secret that is not a webhook
 * secret makes every event fail verification and puts Stripe into a retry loop
 * that looks like an outage.
 */
export function stripeConfigError(): string | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null; // Unconfigured is fine — payments are optional.

  if (!secretKey.startsWith('sk_')) {
    return 'STRIPE_SECRET_KEY does not look like a Stripe secret key (expected an "sk_" prefix).';
  }

  if (isLiveKey(secretKey) && !liveKeysPermitted()) {
    return (
      'STRIPE_SECRET_KEY is a LIVE key but this is not a production deployment. ' +
      'Live keys charge real cards. Use an sk_test_ key for local development, ' +
      'previews and CI.'
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
    return (
      'STRIPE_WEBHOOK_SECRET must be the webhook signing secret (it starts with "whsec_"), ' +
      'not an API key. As configured, every webhook will fail signature verification.'
    );
  }

  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (publishable && !publishable.startsWith('pk_')) {
    return 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY does not look like a publishable key (expected a "pk_" prefix).';
  }
  if (publishable && isLiveKey(secretKey) !== isLiveKey(publishable)) {
    // Mixing modes fails at payment confirmation with an opaque error, long
    // after the point where it could be understood.
    return 'STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY are in different modes (one live, one test).';
  }

  return null;
}

/**
 * The Stripe client, or null when unconfigured or misconfigured.
 *
 * Returns null rather than throwing so the billing surfaces degrade to
 * "payments not enabled" instead of 500ing — the platform has to keep working
 * for self-hosted and pre-launch deployments that never set a key. A
 * misconfiguration is treated the same way, loudly: refusing to construct the
 * client is what stops a live key from being used by accident.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;

  const configError = stripeConfigError();
  if (configError) {
    console.error(`[stripe] Refusing to initialize: ${configError}`);
    return null;
  }

  if (!cached) {
    cached = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  }
  return cached;
}

/** Throwing variant for paths that have already checked configuration. */
export function requireStripe(): Stripe {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY (and STRIPE_WEBHOOK_SECRET) to enable payments.',
    );
  }
  return stripe;
}

/** Publishable key for Stripe.js / Elements. Safe to expose to the browser. */
export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null;
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

/**
 * Environment variable holding the Stripe price id for a plan × interval.
 *
 * Convention: `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_BUSINESS_YEARLY`, …
 */
export function priceEnvKey(planId: PlanId, interval: BillingInterval): string {
  return `STRIPE_PRICE_${planId.toUpperCase()}_${interval.toUpperCase()}`;
}

/**
 * Resolve the Stripe price id for a plan × interval.
 *
 * Null for plans that are not self-serve purchasable: `free` costs nothing and
 * `enterprise` is negotiated, so neither has a price in Stripe.
 */
export function getPriceId(planId: PlanId, interval: BillingInterval): string | null {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return null;
  // A null price on the plan means "not self-serve" — free or talk-to-sales.
  if (plan.priceMonthly === null || plan.priceMonthly === 0) return null;
  return process.env[priceEnvKey(planId, interval)]?.trim() || null;
}

/** Every plan × interval that is purchasable and actually configured. */
export function listConfiguredPrices(): Array<{
  planId: PlanId;
  interval: BillingInterval;
  priceId: string;
}> {
  const out: Array<{ planId: PlanId; interval: BillingInterval; priceId: string }> = [];
  for (const plan of PLANS) {
    for (const interval of ['monthly', 'yearly'] as const) {
      const priceId = getPriceId(plan.id, interval);
      if (priceId) out.push({ planId: plan.id, interval, priceId });
    }
  }
  return out;
}

/**
 * Reverse lookup: Stripe price id → our plan and interval.
 *
 * Needed on every subscription webhook — Stripe tells us the price, and the
 * plan is what the rest of the system understands. An unrecognised price means
 * the environment does not match the Stripe account that sent the event, which
 * is a misconfiguration worth surfacing rather than defaulting past.
 */
export function planForPriceId(
  priceId: string,
): { planId: PlanId; interval: BillingInterval; priceId: string } | null {
  return listConfiguredPrices().find((entry) => entry.priceId === priceId) ?? null;
}

/**
 * Rank plans by what they cost per month.
 *
 * Ordering by price rather than by position in the catalog implements the
 * roadmap's "cheaper-but-higher-tier counts as a downgrade" rule: what decides
 * proration is whether the customer is about to pay more or less, not where
 * marketing places the tier. `enterprise` has no list price, so it sorts above
 * everything — moving to it is always an upgrade.
 */
export function planRank(planId: PlanId): number {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return 0;
  return plan.priceMonthly === null ? Number.MAX_SAFE_INTEGER : plan.priceMonthly;
}

export type PlanChangeKind = 'upgrade' | 'downgrade' | 'unchanged';

/** Which proration path a plan change takes. */
export function classifyPlanChange(from: PlanId, to: PlanId): PlanChangeKind {
  const a = planRank(from);
  const b = planRank(to);
  if (a === b) return 'unchanged';
  return b > a ? 'upgrade' : 'downgrade';
}
