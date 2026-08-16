/**
 * Entitlement Service — the single chokepoint for "is this org allowed to X?".
 *
 * Every paywall in the product must call `hasFeature()` (or `requireFeature()`
 * in a route). Nothing should read `subscription.planId` and compare strings at
 * the call site; when plans change, only this file and `plans.ts` should move.
 *
 * Lives in the platform root DB — see the placement rule in organization-service.ts.
 */
import type { createRawClient } from '@/lib/db';
import type { NextResponse } from 'next/server';
import {
  DEFAULT_PLAN_ID,
  getPlan,
  isPlanId,
  lowestPlanWithFeature,
  planHasFeature,
  type BillingInterval,
  type Feature,
  type PlanDef,
  type PlanId,
} from '@/lib/billing/plans';

export * from '@/lib/billing/plans';

type RawDb = ReturnType<typeof createRawClient>;

/**
 * Lazily create the raw DB client.
 *
 * Dynamic import on purpose: the Prisma runtime (`src/generated/prisma`) does
 * CJS `require("node:fs")` calls that cannot execute inside the ESM
 * `@workflow/vitest` step bundle, so it must never be statically reachable
 * from workflow steps. Runtime behavior is identical to the old
 * `db: RawDb = createRawClient()` default — the client is created on first use.
 */
async function getDb(db?: RawDb): Promise<RawDb> {
  if (db) return db;
  const { createRawClient } = await import('@/lib/db');
  return createRawClient();
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  orgId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  /**
   * The day-of-cycle billing is anchored to. Held separately from
   * currentPeriodStart because an upgrade mid-cycle must NOT reset the cycle —
   * without this the customer silently gets a free extension on every upgrade.
   */
  anchorDate: string;
  createdAt: string;
  updatedAt: string;
}

const SUBSCRIPTIONS_DDL = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  interval TEXT NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_period_end TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  anchor_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

export async function ensureBillingTables(db: RawDb): Promise<void> {
  const { ensureOrganizationTables } = await import('@/domain/billing/organization-service');
  await ensureOrganizationTables(db);
  await db.$executeRawUnsafe(SUBSCRIPTIONS_DDL);
}

function mapSubscription(row: Record<string, unknown>): Subscription {
  const planId = isPlanId(row.plan_id) ? row.plan_id : DEFAULT_PLAN_ID;
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    planId,
    status: String(row.status) as SubscriptionStatus,
    interval: String(row.interval) as BillingInterval,
    currentPeriodStart: new Date(row.current_period_start as string).toISOString(),
    currentPeriodEnd: new Date(row.current_period_end as string).toISOString(),
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    anchorDate: new Date(row.anchor_date as string).toISOString(),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

/**
 * Read an org's subscription, creating a Free one if absent.
 *
 * Free-by-default is what makes Phase 2 safe to roll out: every pre-existing org
 * lands on Free automatically and nothing 500s for want of a billing row.
 */
export async function getSubscription(
  orgId: string,
  db?: RawDb,
): Promise<Subscription> {
  db ??= await getDb();
  await ensureBillingTables(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM subscriptions WHERE org_id = $1 LIMIT 1;`,
    orgId,
  )) as Record<string, unknown>[];
  if (rows.length > 0) return mapSubscription(rows[0]);

  await db.$executeRawUnsafe(
    `INSERT INTO subscriptions (id, org_id, plan_id)
     VALUES (gen_random_uuid()::TEXT, $1, $2)
     ON CONFLICT (org_id) DO NOTHING;`,
    orgId,
    DEFAULT_PLAN_ID,
  );

  const reread = (await db.$queryRawUnsafe(
    `SELECT * FROM subscriptions WHERE org_id = $1 LIMIT 1;`,
    orgId,
  )) as Record<string, unknown>[];
  if (reread.length === 0) throw new Error(`Failed to create subscription for org ${orgId}`);
  return mapSubscription(reread[0]);
}

export interface SetPlanInput {
  planId: PlanId;
  interval?: BillingInterval;
  status?: SubscriptionStatus;
}

/**
 * Set an org's plan.
 *
 * `anchor_date` is intentionally left untouched — the billing cycle must not
 * reset when a plan changes. Phase 4 (Stripe) drives period boundaries from
 * webhooks; until then this is the admin-side override.
 */
export async function setPlan(
  orgId: string,
  input: SetPlanInput,
  db?: RawDb,
): Promise<Subscription> {
  db ??= await getDb();
  await getSubscription(orgId, db); // ensures the row exists

  await db.$executeRawUnsafe(
    `UPDATE subscriptions
        SET plan_id = $1,
            interval = COALESCE($2, interval),
            status = COALESCE($3, status),
            updated_at = CURRENT_TIMESTAMP
      WHERE org_id = $4;`,
    input.planId,
    input.interval ?? null,
    input.status ?? null,
    orgId,
  );

  return getSubscription(orgId, db);
}

/** The plan an org is currently on. */
export async function getPlanForOrg(orgId: string, db?: RawDb): Promise<PlanDef> {
  const sub = await getSubscription(orgId, db);
  // A past-due or canceled subscription falls back to Free entitlements without
  // rewriting plan_id, so the original plan survives for a successful recovery.
  if (sub.status === 'canceled' || sub.status === 'past_due') return getPlan(DEFAULT_PLAN_ID);
  return getPlan(sub.planId);
}

/** Entitlement check by organization. */
export async function hasFeature(orgId: string, feature: Feature, db?: RawDb): Promise<boolean> {
  const plan = await getPlanForOrg(orgId, db);
  return planHasFeature(plan.id, feature);
}

/** Entitlement check by tenant slug — resolves the owning org first. */
export async function tenantHasFeature(
  tenantSlug: string,
  feature: Feature,
  db?: RawDb,
): Promise<boolean> {
  db ??= await getDb();
  const { resolveOrgForTenant } = await import('@/domain/billing/organization-service');
  const org = await resolveOrgForTenant(tenantSlug, db);
  if (!org) return false;
  return hasFeature(org.id, feature, db);
}

export interface EntitlementGuardResult {
  ok: boolean;
  response?: NextResponse;
}

/**
 * Route guard. Returns a 402 with an actionable upgrade target when blocked.
 *
 * 402 rather than 403 on purpose: this is "payment required", and the existing
 * client already special-cases 402 for the AI no-credits path, so the upsell
 * surface is shared.
 */
export async function requireFeatureForTenant(
  tenantSlug: string,
  feature: Feature,
  db?: RawDb,
): Promise<EntitlementGuardResult> {
  db ??= await getDb();
  if (await tenantHasFeature(tenantSlug, feature, db)) return { ok: true };

  const upgrade = lowestPlanWithFeature(feature);
  const target = upgrade ? upgrade.label : 'a paid plan';
  return {
    ok: false,
    response: (await import('@/lib/api/response')).jsonError(
      `This tenant's plan does not include ${feature}. Upgrade to ${target} to enable it.`,
      402,
    ),
  };
}
