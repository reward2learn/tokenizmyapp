/**
 * Plan catalog — static plan metadata and the feature/entitlement vocabulary.
 *
 * Deliberately has NO server-only imports (no Prisma, no db, no secrets), so it
 * is safe to import from client components — the pricing table, the upgrade
 * dialog and the paywall all need it before any subscription exists. Mirrors
 * the `ai-providers-catalog.ts` split: `entitlement-service.ts` re-exports these
 * alongside the DB-backed functions.
 *
 * Prices and credit allowances below are a CALIBRATION REFERENCE derived from a
 * competitor's public pricing (see docs/MONETIZATION-CREDITS-ROADMAP.md §1.4),
 * not a commercial decision. Our COGS are Vercel's and Neon's. Change these
 * before charging anyone.
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

/** Monthly cents → effective monthly cents when billed yearly. */
export function yearlyMonthlyPrice(priceMonthly: number): number {
  return Math.round(priceMonthly * (1 - YEARLY_DISCOUNT));
}

export const PLANS: PlanDef[] = [
  {
    id: 'free',
    label: 'Free',
    tagline: 'Build and preview one app.',
    priceMonthly: 0,
    priceYearly: 0,
    aiCreditsPerMonth: 15,
    cloudMultiplier: 1,
    maxTenants: 1,
    maxAppsPerTenant: 1,
    features: [],
  },
  {
    id: 'pro',
    label: 'Pro',
    tagline: 'Publish on your own domain.',
    priceMonthly: 2500,
    priceYearly: yearlyMonthlyPrice(2500),
    aiCreditsPerMonth: 50,
    cloudMultiplier: 20,
    maxTenants: 3,
    maxAppsPerTenant: 5,
    features: ['custom-domains', 'remove-badge', 'multi-app', 'byo-ai-key'],
  },
  {
    id: 'business',
    label: 'Business',
    tagline: 'Departments, roles and access control.',
    priceMonthly: 9900,
    priceYearly: yearlyMonthlyPrice(9900),
    aiCreditsPerMonth: 50,
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
