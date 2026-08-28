/**
 * Crypto prepaid plan fulfillment — apply N-month USDC plan packs.
 *
 * Stripe owns recurring monthly billing; crypto grants a fixed prepaid window
 * (1/3/6/12 months) with plan entitlements and upfront AI credits.
 */
import type { createRawClient } from '@/lib/db';
import {
  CRYPTO_PLAN_PREPAID_MONTHS,
  type CryptoPlanPrepaidMonths,
} from '@/lib/web3/crypto-billing-config';
import {
  getPlan,
  isPlanId,
  prepaidPlanPriceCents,
  type PlanId,
} from '@/lib/billing/plans';
import type { Subscription } from '@/domain/billing/entitlement-service';

type RawDb = ReturnType<typeof createRawClient>;

/** Prepaid periods use 30-day months (matches credit expiry decision). */
export const PREPAID_MONTH_DAYS = 30;

export interface ReconcileCryptoPrepaidResult {
  changed: boolean;
  reason?: string;
}

/** True when the org is on a paid plan via crypto prepaid (no Stripe subscription). */
export function isCryptoPrepaidSubscription(input: {
  planId: string;
  hasStripeSubscription: boolean;
}): boolean {
  return !input.hasStripeSubscription && input.planId !== 'free';
}

/** Entitlements should lapse after the prepaid window even if plan_id was not reconciled yet. */
export function isCryptoPrepaidPeriodActive(
  currentPeriodEnd: string,
  nowMs: number = Date.now(),
): boolean {
  return new Date(currentPeriodEnd).getTime() > nowMs;
}

export interface ApplyCryptoPrepaidPlanResult {
  subscription: Subscription;
  creditsGranted: number;
  alreadyApplied: boolean;
  periodEnd: string;
}

function isPrepaidMonths(value: number): value is CryptoPlanPrepaidMonths {
  return (CRYPTO_PLAN_PREPAID_MONTHS as readonly number[]).includes(value);
}

/**
 * Activate or extend a prepaid plan after on-chain payment confirms.
 *
 * Idempotent on paymentRef in credit_grants metadata. Stacks prepaid time onto
 * an unexpired period; upgrades plan immediately when moving from Free.
 */
export async function applyCryptoPrepaidPlan(
  orgId: string,
  input: {
    planId: PlanId;
    months: number;
    paymentRef: string;
  },
  db?: RawDb,
): Promise<ApplyCryptoPrepaidPlanResult> {
  if (!isPlanId(input.planId)) {
    throw new Error(`Unknown plan "${input.planId}".`);
  }
  if (!isPrepaidMonths(input.months)) {
    throw new Error(
      `Invalid prepaid months ${input.months}. Choose ${CRYPTO_PLAN_PREPAID_MONTHS.join(', ')}.`,
    );
  }
  if (prepaidPlanPriceCents(input.planId, input.months) == null) {
    throw new Error(`Plan "${input.planId}" is not available for crypto prepaid purchase.`);
  }

  db ??= (await import('@/lib/db')).createBillingRawClient();
  const plan = getPlan(input.planId);

  const { ensureCreditTables, grantCredits } = await import('@/domain/billing/credit-service');
  await ensureCreditTables(db);

  const prior = (await db.$queryRawUnsafe(
    `SELECT id FROM credit_grants
      WHERE org_id = $1 AND metadata->>'paymentRef' = $2
      LIMIT 1;`,
    orgId,
    input.paymentRef,
  )) as { id: string }[];

  const { getSubscription, ensureBillingTables } = await import(
    '@/domain/billing/entitlement-service'
  );
  await ensureBillingTables(db);

  if (prior.length > 0) {
    const subscription = await getSubscription(orgId, db);
    return {
      subscription,
      creditsGranted: 0,
      alreadyApplied: true,
      periodEnd: subscription.currentPeriodEnd,
    };
  }

  const sub = await getSubscription(orgId, db);
  const nowMs = Date.now();
  const currentEndMs = new Date(sub.currentPeriodEnd).getTime();
  const stackFromMs = Math.max(nowMs, currentEndMs);
  const newPeriodEnd = new Date(stackFromMs + input.months * PREPAID_MONTH_DAYS * 86_400_000);
  const newPeriodStart =
    sub.planId === input.planId && currentEndMs > nowMs
      ? new Date(sub.currentPeriodStart)
      : new Date(nowMs);

  await db.$executeRawUnsafe(
    `UPDATE subscriptions
        SET plan_id = $1,
            status = 'active',
            interval = 'monthly',
            current_period_start = $2,
            current_period_end = $3,
            cancel_at_period_end = false,
            updated_at = CURRENT_TIMESTAMP
      WHERE org_id = $4;`,
    input.planId,
    newPeriodStart,
    newPeriodEnd,
    orgId,
  );

  const { resolvePlanAiCredits } = await import('@/domain/billing/org-rate-card-service');
  const monthlyCredits = await resolvePlanAiCredits(
    orgId,
    input.planId,
    plan.aiCreditsPerMonth,
    db,
    'monthly',
  );
  const totalCredits = monthlyCredits * input.months;

  if (totalCredits > 0) {
    await grantCredits(
      orgId,
      {
        source: 'plan',
        amount: totalCredits,
        planId: input.planId,
        metadata: {
          paymentRef: input.paymentRef,
          cryptoPrepaid: true,
          prepaidMonths: input.months,
          periodStart: newPeriodStart.toISOString(),
          periodEnd: newPeriodEnd.toISOString(),
        },
      },
      db,
    );
  }

  const subscription = await getSubscription(orgId, db);
  return {
    subscription,
    creditsGranted: totalCredits,
    alreadyApplied: false,
    periodEnd: subscription.currentPeriodEnd,
  };
}

/**
 * Downgrade an org whose crypto prepaid window ended (no Stripe anchor).
 *
 * Called from billing reads and the nightly cron so expired prepaid plans do
 * not keep paid entitlements indefinitely.
 */
export async function reconcileCryptoPrepaidSubscription(
  orgId: string,
  db?: RawDb,
): Promise<ReconcileCryptoPrepaidResult> {
  db ??= (await import('@/lib/db')).createBillingRawClient();

  const { getSubscription, setPlan, ensureBillingTables } = await import(
    '@/domain/billing/entitlement-service'
  );
  const { getStripeLinkage } = await import('@/domain/billing/stripe-service');

  await ensureBillingTables(db);

  const sub = await getSubscription(orgId, db);
  const linkage = await getStripeLinkage(orgId, db);

  if (linkage.subscriptionId) return { changed: false };
  if (sub.planId === 'free') return { changed: false };
  if (isCryptoPrepaidPeriodActive(sub.currentPeriodEnd)) return { changed: false };

  await setPlan(orgId, { planId: 'free', status: 'active' }, db);
  return {
    changed: true,
    reason: `Crypto prepaid period ended — downgraded org ${orgId} to Free.`,
  };
}

/**
 * Nightly batch: downgrade all crypto-only orgs whose prepaid period lapsed.
 */
export async function enforceCryptoPrepaidDowngrades(
  db?: RawDb,
): Promise<{ downgraded: string[] }> {
  db ??= (await import('@/lib/db')).createBillingRawClient();
  const { ensureStripeColumns } = await import('@/domain/billing/stripe-service');
  await ensureStripeColumns(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT org_id FROM subscriptions
      WHERE plan_id <> 'free'
        AND (stripe_subscription_id IS NULL OR stripe_subscription_id = '')
        AND current_period_end <= CURRENT_TIMESTAMP;`,
  )) as { org_id: string }[];

  const downgraded: string[] = [];
  for (const row of rows) {
    const result = await reconcileCryptoPrepaidSubscription(String(row.org_id), db);
    if (result.changed) downgraded.push(String(row.org_id));
  }
  return { downgraded };
}
