/**
 * Plan catalog — static plan metadata and the feature/entitlement vocabulary.
 *
 * Deliberately has NO server-only imports (no Prisma, no db, no secrets), so it
 * is safe to import from client components — the pricing table, the upgrade
 * dialog and the paywall all need it before any subscription exists. Mirrors
 * the `ai-providers-catalog.ts` split: `entitlement-service.ts` re-exports these
 * alongside the DB-backed functions.
 *
 * ⚠️ `priceMonthly` / `priceYearly` are DISPLAY ONLY. Stripe charges whatever
 * the price object behind STRIPE_PRICE_<PLAN>_<INTERVAL> says, so editing a
 * number here changes the pricing card and nothing else. The two drifting
 * apart bills a customer an amount the page never showed them — the billing
 * panel now compares them on every read and refuses to sell a plan whose
 * Stripe price disagrees. Update the Stripe price object first, then this.
 *
 * Changing `aiCreditsPerMonth` is not display-only: it is the monthly-billing amount
 * `grantMonthlyAllowanceIfDue` mints at the start of each period. Yearly subscribers
 * receive an extra YEARLY_DISCOUNT (15%) via `planAiCreditsPerMonth(plan, 'yearly')`.
 * Changes apply to existing organizations from their next grant or mid-period sync.
 *
 * AI credit sizing (plans + top-ups) targets ~30% markup on OpenAI gpt-4o list
 * COGS while keeping the gpt-4o-class RATE_CARD (0.4 / 1.6 cr per 1K). Cheaper
 * Vercel Gateway models then yield additional margin at the same burn.
 */

export type PlanId = 'free' | 'pro' | 'business' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

/**
 * Entitlement keys.
 *
 * Each maps to functionality that already exists in the product — these are the
 * natural paywall boundaries, not invented gates.
 */
export type Feature =
  /** Attach a custom domain to a deployed app (apps/[appId]/domains). */
  | 'custom-domains'
  /** Invite additional users to a tenant (admin/tenants/[slug]/users). */
  | 'teammates'
  /** Security groups and role-based access control. */
  | 'rbac'
  /** Remove the platform badge from the deployed app footer. */
  | 'remove-badge'
  /** Provision more than one app inside a tenant (suite mode). */
  | 'multi-app'
  /** Supply your own AI provider key instead of using the platform key. */
  | 'byo-ai-key'
  /** Priority (non-community) support. */
  | 'priority-support';

export interface PlanDef {
  id: PlanId;
  label: string;
  /** One line, shown under the plan name on the pricing table. */
  tagline: string;
  /** USD cents, per month, billed monthly. `null` = talk to sales. */
  priceMonthly: number | null;
  /** USD cents, per month, when billed yearly. `null` = talk to sales. */
  priceYearly: number | null;
  /** AI credits granted at the start of each billing period. */
  aiCreditsPerMonth: number;
  /** Multiplier applied to metered cloud usage. */
  cloudMultiplier: number;
  /** Maximum tenants this plan may own. `null` = unlimited. */
  maxTenants: number | null;
  /** Maximum apps per tenant. `null` = unlimited. */
  maxAppsPerTenant: number | null;
  features: Feature[];
}

/** Yearly billing discount. Applied as monthly × 12 × (1 − DISCOUNT). */
export const YEARLY_DISCOUNT = 0.15;

/**
 * When false, self-serve purchase is monthly-only (UI + checkout API).
 *
 * Yearly Stripe prices, webhook reverse-lookup, and credit math stay in place
 * so existing yearly subscribers and a future re-enable keep working. Flip to
 * `true` to restore the monthly/yearly toggle and yearly Checkout.
 *
 * Temporarily off: Adaptive Pricing can present USD yearly totals in IDR and
 * exceed Stripe’s ~Rp10M amount cap on plan changes.
 */
export const YEARLY_SELF_SERVE_ENABLED = false;

/** Intervals customers may buy through self-serve Checkout / plan change. */
export function selfServeBillingIntervals(): BillingInterval[] {
  return YEARLY_SELF_SERVE_ENABLED ? ['monthly', 'yearly'] : ['monthly'];
}

export function isSelfServeBillingInterval(interval: BillingInterval): boolean {
  return selfServeBillingIntervals().includes(interval);
}

/** Monthly cents → effective monthly cents when billed yearly. */
export function yearlyMonthlyPrice(priceMonthly: number): number {
  return Math.round(priceMonthly * (1 - YEARLY_DISCOUNT));
}

/**
 * Monthly AI credits for a plan at a billing interval.
 *
 * Yearly subscribers receive an extra `YEARLY_DISCOUNT` (15%) on top of the
 * catalog allowance — the same percentage as the price discount, so annual
 * commitment earns both cheaper billing and more credits per month.
 */
export function planAiCreditsPerMonth(
  planId: string | PlanDef,
  interval: BillingInterval,
): number {
  const plan = typeof planId === 'string' ? getPlan(planId) : planId;
  const base = plan.aiCreditsPerMonth;
  // Paid self-serve tiers only — free has no yearly checkout; enterprise is negotiated.
  if (
    interval === 'yearly' &&
    base > 0 &&
    plan.id !== 'free' &&
    plan.id !== 'enterprise'
  ) {
    return Math.round(base * (1 + YEARLY_DISCOUNT));
  }
  return base;
}

/** Apply the yearly credit bonus to a base allowance (e.g. rate-card override). */
export function applyYearlyCreditBonus(
  baseCredits: number,
  interval: BillingInterval,
): number {
  if (interval === 'yearly' && baseCredits > 0) {
    return Math.round(baseCredits * (1 + YEARLY_DISCOUNT));
  }
  return baseCredits;
}

/**
 * Credit economics for a ~30% platform margin on gpt-4o list COGS (catalog default).
 * Per-tenant overrides live in org_billing_rate_cards — see tenant-rate-card.ts.
 */
import {
  AI_CREDIT_RATE_INPUT_PER_1K,
  AI_CREDIT_REF_INPUT_USD_PER_M,
  purchasedCreditsForUsdAtMarkup,
  MARKUP_FLOOR,
} from '@/lib/billing/tenant-rate-card';

/** Catalog default markup floor (30%). Per-org cards may be higher. */
export const AI_CREDIT_TARGET_MARKUP = MARKUP_FLOOR;
export { AI_CREDIT_REF_INPUT_USD_PER_M, AI_CREDIT_RATE_INPUT_PER_1K };

/** Purchased (non-promo) credits granted per USD at the catalog floor markup. */
export function purchasedCreditsForUsd(usd: number, markupPercent: number = MARKUP_FLOOR): number {
  return purchasedCreditsForUsdAtMarkup(usd, markupPercent);
}

export const PLANS: PlanDef[] = [
  {
    id: 'free',
    label: 'Free',
    tagline: 'Build and preview one app.',
    priceMonthly: 0,
    priceYearly: 0,
    // Competitive trial allotment (~$20 of AI at the +30% credit face).
    aiCreditsPerMonth: purchasedCreditsForUsd(20),
    cloudMultiplier: 1,
    maxTenants: 1,
    maxAppsPerTenant: 1,
    features: [],
  },
  {
    id: 'pro',
    label: 'Pro',
    tagline: 'Publish on your own domain.',
    priceMonthly: 9900,
    priceYearly: yearlyMonthlyPrice(9900),
    // Same density as top-ups: ~123 credits per subscription dollar.
    aiCreditsPerMonth: purchasedCreditsForUsd(99),
    cloudMultiplier: 20,
    maxTenants: 3,
    maxAppsPerTenant: 5,
    features: ['custom-domains', 'remove-badge', 'multi-app', 'byo-ai-key'],
  },
  {
    id: 'business',
    label: 'Business',
    tagline: 'Departments, roles and access control.',
    priceMonthly: 19900,
    priceYearly: yearlyMonthlyPrice(19900),
    aiCreditsPerMonth: purchasedCreditsForUsd(199),
    cloudMultiplier: 20,
    maxTenants: 10,
    maxAppsPerTenant: null,
    features: [
      'custom-domains',
      'remove-badge',
      'multi-app',
      'byo-ai-key',
      'teammates',
      'rbac',
      'priority-support',
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    tagline: 'Custom limits, procurement and support.',
    priceMonthly: null,
    priceYearly: null,
    aiCreditsPerMonth: 0,
    cloudMultiplier: 1,
    maxTenants: null,
    maxAppsPerTenant: null,
    features: [
      'custom-domains',
      'remove-badge',
      'multi-app',
      'byo-ai-key',
      'teammates',
      'rbac',
      'priority-support',
    ],
  },
];

export const DEFAULT_PLAN_ID: PlanId = 'free';

export function getPlan(planId: string | null | undefined): PlanDef {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0];
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && PLANS.some((p) => p.id === value);
}

/**
 * Pure entitlement check against a plan.
 *
 * The DB-aware version lives in `entitlement-service.ts`; this one is exported
 * separately so client components can grey out a control without a round-trip.
 */
export function planHasFeature(planId: string | null | undefined, feature: Feature): boolean {
  return getPlan(planId).features.includes(feature);
}

/** Human-readable label for a feature — used in paywall and upsell copy. */
export const FEATURE_LABELS: Record<Feature, string> = {
  'custom-domains': 'Custom domains',
  teammates: 'Teammates',
  rbac: 'Roles and access control',
  'remove-badge': 'Remove platform badge',
  'multi-app': 'Multiple apps per tenant',
  'byo-ai-key': 'Bring your own AI key',
  'priority-support': 'Priority support',
};

/** Cheapest plan that includes `feature` — drives "Upgrade to Pro" copy. */
export function lowestPlanWithFeature(feature: Feature): PlanDef | null {
  return (
    PLANS.filter((p) => p.features.includes(feature))
      .sort((a, b) => (a.priceMonthly ?? Infinity) - (b.priceMonthly ?? Infinity))[0] ?? null
  );
}

/**
 * AI credit top-up packs — purchased credits only (no promo bonus).
 *
 * Bonus credits previously diluted ARPU and broke the +30% COGS floor when burned
 * like paid credits. Size packs with `purchasedCreditsForUsd` so $1 ≈ 123 credits
 * at the gpt-4o binding rate. Reintroduce promo via a separate `source='promo'`
 * campaign if needed — do not bake it into these base amounts.
 */
export interface CreditPack {
  id: string;
  label: string;
  /** USD cents. */
  priceCents: number;
  baseCredits: number;
  bonusCredits: number;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack-25',
    label: '$25',
    priceCents: 2500,
    baseCredits: purchasedCreditsForUsd(25),
    bonusCredits: 0,
  },
  {
    id: 'pack-50',
    label: '$50',
    priceCents: 5000,
    baseCredits: purchasedCreditsForUsd(50),
    bonusCredits: 0,
  },
  {
    id: 'pack-100',
    label: '$100',
    priceCents: 10000,
    baseCredits: purchasedCreditsForUsd(100),
    bonusCredits: 0,
  },
];

/**
 * Top-up floor, pinned to the Pro price — buying credits at all implies Pro
 * (roadmap §1.9: custom amounts below this are rejected with "the minimum is
 * $25/mo — the Pro plan").
 */
export const CREDIT_PACK_MIN_PRICE_CENTS = 2500;

/** Credit pack purchases require a paid plan (Pro or above). */
export function canPurchaseCreditPacks(planId: PlanId): boolean {
  return planId !== 'free';
}

/**
 * Cloud Credits top-up amounts (USD cents). Same floors as AI packs — $25 min.
 * Custom amounts are accepted at/above CREDIT_PACK_MIN_PRICE_CENTS.
 */
export const CLOUD_TOPUP_PRESETS_CENTS = [2500, 5000, 10000] as const;
