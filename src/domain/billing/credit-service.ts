/**
 * Credit Service — the build-time currency: AI generation metering and gating.
 *
 * Credits are granted (monthly plan allowance, top-ups, volume deals, promos)
 * and consumed (oldest-expiring-first) against the Organization, exactly like
 * the subscription. The ledger is the audit trail: balance is always derived
 * as SUM(remaining) over unexpired grants, never mutated directly.
 *
 * ⚠️ Placement rule: every table here lives in the **platform root DB**, never
 * in a tenant's dedicated database — same rule as organization-service.ts and
 * entitlement-service.ts. A tenant DB is a customer-controlled data plane;
 * credit balances are control-plane state.
 *
 * Expiry decision (roadmap §3.2): grants expire exactly **30 days** after
 * issue. Hercules uses 28–31 days; we pick 30 and document it. Consumption is
 * oldest-expiring-first so nothing expires while newer credits are being spent.
 *
 * BYOK policy (roadmap §5.1): when a tenant supplies their own provider key
 * (`keySource === 'db'`), metering does NOT charge credits — they pay the
 * provider directly. Only platform-key usage is metered.
 */
import type { createRawClient } from '@/lib/db';
import { getPlan } from '@/lib/billing/plans';
import { creditsForUsage } from '@/lib/billing/credit-rates';
import { jsonErrorLite } from '@/lib/api/response-lite';

/** Grants expire 30 days after issue (roadmap §3.2 — documented decision). */
export const CREDIT_EXPIRY_DAYS = 30;

export type CreditSource = 'plan' | 'addon' | 'onetime' | 'promo';

export interface CreditGrant {
  id: string;
  orgId: string;
  source: CreditSource;
  amount: number;
  remaining: number;
  grantedAt: string;
  expiresAt: string;
  planId: string | null;
  metadata: Record<string, unknown> | null;
}

export interface CreditLedgerEntry {
  id: string;
  orgId: string;
  grantId: string | null;
  /** Positive for grants, negative for consumption. Never zero. */
  delta: number;
  reason: string;
  refType: string | null;
  refId: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

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

const CREDIT_GRANTS_DDL = `
CREATE TABLE IF NOT EXISTS credit_grants (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  source TEXT NOT NULL,
  amount INT NOT NULL,
  remaining INT NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  plan_id TEXT,
  metadata JSONB
);`;

const CREDIT_LEDGER_DDL = `
CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  grant_id TEXT,
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);`;

const CREDIT_GRANTS_ORG_EXPIRES_IDX = `
CREATE INDEX IF NOT EXISTS idx_credit_grants_org_expires ON credit_grants (org_id, expires_at);`;

const CREDIT_LEDGER_ORG_CREATED_IDX = `
CREATE INDEX IF NOT EXISTS idx_credit_ledger_org_created ON credit_ledger (org_id, created_at);`;

/** Idempotent DDL for the credit layer. Safe to call on every request. */
export async function ensureCreditTables(db: RawDb): Promise<void> {
  // Subscriptions must exist first — the monthly allowance logic reads them.
  const { ensureBillingTables } = await import('@/domain/billing/entitlement-service');
  await ensureBillingTables(db);
  await db.$executeRawUnsafe(CREDIT_GRANTS_DDL);
  await db.$executeRawUnsafe(CREDIT_LEDGER_DDL);
  await db.$executeRawUnsafe(CREDIT_GRANTS_ORG_EXPIRES_IDX);
  await db.$executeRawUnsafe(CREDIT_LEDGER_ORG_CREATED_IDX);
}

function mapMetadata(value: unknown): Record<string, unknown> | null {
  if (value == null) return null;
  // Prisma raw queries return JSONB already parsed; tolerate a string in case
  // a future driver or a hand-written migration stores it serialized.
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return value as Record<string, unknown>;
}

export function mapCreditGrant(row: Record<string, unknown>): CreditGrant {
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    source: String(row.source) as CreditSource,
    amount: Number(row.amount),
    remaining: Number(row.remaining),
    grantedAt: new Date(row.granted_at as string).toISOString(),
    expiresAt: new Date(row.expires_at as string).toISOString(),
    planId: row.plan_id == null ? null : String(row.plan_id),
    metadata: mapMetadata(row.metadata),
  };
}

export function mapCreditLedgerEntry(row: Record<string, unknown>): CreditLedgerEntry {
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    grantId: row.grant_id == null ? null : String(row.grant_id),
    delta: Number(row.delta),
    reason: String(row.reason),
    refType: row.ref_type == null ? null : String(row.ref_type),
    refId: row.ref_id == null ? null : String(row.ref_id),
    createdAt: new Date(row.created_at as string).toISOString(),
    metadata: mapMetadata(row.metadata),
  };
}

/** Ledger reason for each grant source — the audit trail's vocabulary. */
const SOURCE_REASONS: Record<CreditSource, string> = {
  plan: 'plan_allowance',
  addon: 'topup_purchase',
  onetime: 'volume_deal',
  promo: 'promo_bonus',
};

/**
 * Current spendable balance for an org.
 *
 * `available` = SUM(remaining) over grants that are not yet expired and not
 * fully consumed; `expiringSoon` is the subset of that expiring within 7 days
 * (drives the "expiring soon" warning in the billing UI).
 *
 * Lazily grants the monthly allowance first — same self-healing pattern as
 * getSubscription(): an org that has never been seen by this code converges
 * on first read instead of 500ing.
 */
export async function getCreditBalance(
  orgId: string,
  db?: RawDb,
): Promise<{ available: number; expiringSoon: number }> {
  db ??= await getDb();
  await grantMonthlyAllowanceIfDue(orgId, db);
  await ensureCreditTables(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT
       COALESCE(SUM(remaining), 0) AS available,
       COALESCE(SUM(CASE WHEN expires_at <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN remaining ELSE 0 END), 0) AS expiring_soon
     FROM credit_grants
     WHERE org_id = $1 AND remaining > 0 AND expires_at > CURRENT_TIMESTAMP;`,
    orgId,
  )) as Record<string, unknown>[];

  return {
    available: Number(rows[0]?.available ?? 0),
    expiringSoon: Number(rows[0]?.expiring_soon ?? 0),
  };
}

export interface GrantCreditsInput {
  source: CreditSource;
  amount: number;
  /** Defaults to now + CREDIT_EXPIRY_DAYS. */
  expiresAt?: Date;
  planId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Issue a grant and append the matching ledger entry.
 *
 * The ledger entry carries `delta = +amount` so the grant and its audit trail
 * are written together — a grant without a ledger row is a bookkeeping bug.
 */
export async function grantCredits(
  orgId: string,
  input: GrantCreditsInput,
  db?: RawDb,
): Promise<CreditGrant> {
  db ??= await getDb();
  await ensureCreditTables(db);

  const expiresAt = input.expiresAt ?? new Date(Date.now() + CREDIT_EXPIRY_DAYS * 86_400_000);

  const inserted = (await db.$queryRawUnsafe(
    `INSERT INTO credit_grants (id, org_id, source, amount, remaining, expires_at, plan_id, metadata)
     VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $3, $4, $5, $6::jsonb)
     RETURNING *;`,
    orgId,
    input.source,
    input.amount,
    expiresAt,
    input.planId ?? null,
    JSON.stringify(input.metadata ?? null),
  )) as Record<string, unknown>[];

  const grant = mapCreditGrant(inserted[0]);

  await db.$executeRawUnsafe(
    `INSERT INTO credit_ledger (id, org_id, grant_id, delta, reason, metadata)
     VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5::jsonb);`,
    orgId,
    grant.id,
    input.amount,
    SOURCE_REASONS[input.source],
    JSON.stringify(input.metadata ?? null),
  );

  return grant;
}

export interface ConsumeCreditsInput {
  amount: number;
  reason: string;
  refType?: string | null;
  refId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Consume credits oldest-expiring-first.
 *
 * Iterates unexpired grants ordered by `expires_at ASC, granted_at ASC`,
 * decrementing `remaining` per grant and appending one ledger entry per
 * touched grant with `delta = -consumedFromGrant`. Never mutates a balance
 * column — the ledger is the audit trail and the balance is always derived.
 *
 * If `amount` exceeds the available balance, everything available is consumed
 * and `consumed < amount` is returned; the caller decides policy (the
 * pre-flight gate `requireCreditsForTenant` should prevent this in practice).
 */
export async function consumeCredits(
  orgId: string,
  input: ConsumeCreditsInput,
  db?: RawDb,
): Promise<{ consumed: number; balance: number }> {
  db ??= await getDb();
  await ensureCreditTables(db);

  const grants = (await db.$queryRawUnsafe(
    `SELECT * FROM credit_grants
     WHERE org_id = $1 AND remaining > 0 AND expires_at > CURRENT_TIMESTAMP
     ORDER BY expires_at ASC, granted_at ASC;`,
    orgId,
  )) as Record<string, unknown>[];

  let toConsume = input.amount;
  const touched: { grantId: string; consumedFromGrant: number }[] = [];

  for (const row of grants) {
    if (toConsume <= 0) break;
    const grantId = String(row.id);
    const take = Math.min(Number(row.remaining), toConsume);
    await db.$executeRawUnsafe(
      `UPDATE credit_grants SET remaining = remaining - $1 WHERE id = $2;`,
      take,
      grantId,
    );
    touched.push({ grantId, consumedFromGrant: take });
    toConsume -= take;
  }

  const consumed = input.amount - toConsume;

  for (const t of touched) {
    await db.$executeRawUnsafe(
      `INSERT INTO credit_ledger (id, org_id, grant_id, delta, reason, ref_type, ref_id, metadata)
       VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5, $6, $7::jsonb);`,
      orgId,
      t.grantId,
      -t.consumedFromGrant,
      input.reason,
      input.refType ?? null,
      input.refId ?? null,
      JSON.stringify(input.metadata ?? null),
    );
  }

  const { available } = await getCreditBalance(orgId, db);
  return { consumed, balance: available };
}

/** Whether an org can afford `amount` credits right now. */
export async function hasSufficientCredits(
  orgId: string,
  amount: number,
  db?: RawDb,
): Promise<boolean> {
  db ??= await getDb();
  const { available } = await getCreditBalance(orgId, db);
  return available >= amount;
}

/**
 * Grant the monthly plan allowance if it is due for the current billing period.
 *
 * Idempotent per billing period: a `source='plan'` grant for the subscription's
 * planId must already exist with `granted_at` inside the subscription's
 * [currentPeriodStart, currentPeriodEnd]. Uses the subscription's ACTUAL
 * planId (not getPlanForOrg) even when past_due — the allowance is for the
 * period the customer paid for, and a successful recovery should not lose it.
 *
 * Expiry is now + 30 days (CREDIT_EXPIRY_DAYS), not tied to the period end:
 * simpler, matches the documented 30-day rule, and a customer who pays late
 * still gets a full 30 days of use. Skipped entirely when the plan grants no
 * credits (enterprise — volume deals are negotiated separately).
 */
export async function grantMonthlyAllowanceIfDue(
  orgId: string,
  db?: RawDb,
): Promise<CreditGrant | null> {
  db ??= await getDb();
  await ensureCreditTables(db);

  const { getSubscription } = await import('@/domain/billing/entitlement-service');
  const sub = await getSubscription(orgId, db);
  const plan = getPlan(sub.planId);
  if (plan.aiCreditsPerMonth <= 0) return null;

  const existing = (await db.$queryRawUnsafe(
    `SELECT * FROM credit_grants
     WHERE org_id = $1 AND source = 'plan' AND plan_id = $2
       AND granted_at >= $3 AND granted_at <= $4
     LIMIT 1;`,
    orgId,
    sub.planId,
    new Date(sub.currentPeriodStart),
    new Date(sub.currentPeriodEnd),
  )) as Record<string, unknown>[];
  if (existing.length > 0) return null;

  return grantCredits(
    orgId,
    {
      source: 'plan',
      amount: plan.aiCreditsPerMonth,
      planId: sub.planId,
      metadata: {
        periodStart: sub.currentPeriodStart,
        periodEnd: sub.currentPeriodEnd,
      },
    },
    db,
  );
}

export interface MeterAiUsageInput {
  tenantSlug: string;
  model: string | null;
  promptTokens: number;
  completionTokens: number;
  /** 'db' = tenant's own BYOK key; 'env' = platform key. */
  keySource: 'db' | 'env';
  refType?: string | null;
  refId?: string | null;
}

/**
 * The single metering integration point for AI generation.
 *
 * Call this after every platform-key AI call with the usage record from the
 * provider response. BYOK calls (`keySource === 'db'`) are NOT charged — the
 * tenant pays the provider directly (roadmap §5.1); only platform-key usage
 * debits credits.
 */
export async function meterAiUsage(
  input: MeterAiUsageInput,
  db?: RawDb,
): Promise<{ charged: boolean; credits: number; balance: number }> {
  db ??= await getDb();
  if (input.keySource === 'db') {
    return { charged: false, credits: 0, balance: 0 };
  }

  const { resolveOrgForTenant, backfillDefaultOrganization, getOrganization } = await import(
    '@/domain/billing/organization-service'
  );
  let org = await resolveOrgForTenant(input.tenantSlug, db);
  if (!org) {
    // Tenant predates the org layer (or is unknown) — converge on the default
    // org so metering never 500s. Same self-healing as resolveOrgForTenant().
    const { orgId } = await backfillDefaultOrganization(db);
    org = await getOrganization(db, orgId);
    if (!org) throw new Error(`Default organization vanished after backfill`);
  }

  await grantMonthlyAllowanceIfDue(org.id, db);

  const credits = creditsForUsage(input.model, input.promptTokens, input.completionTokens);
  const { balance } = await consumeCredits(
    org.id,
    {
      amount: credits,
      reason: 'ai_generation',
      refType: input.refType,
      refId: input.refId,
      metadata: {
        model: input.model,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
      },
    },
    db,
  );

  return { charged: true, credits, balance };
}

export type CreditGateResult =
  | { ok: true; balance: number }
  | { ok: false; balance: number; response: Response };

/**
 * Pre-flight gate: may this tenant start an AI generation?
 *
 * Resolves the org (self-healing), grants the monthly allowance if due, and
 * requires at least 1 credit. On empty balance returns a 402 — on purpose:
 * "payment required", and the existing client already special-cases 402 for
 * the AI no-credits path, so the upsell surface is shared (same rationale as
 * requireFeatureForTenant()).
 */
export async function requireCreditsForTenant(
  tenantSlug: string,
  db?: RawDb,
): Promise<CreditGateResult> {
  db ??= await getDb();
  const { resolveOrgForTenant, backfillDefaultOrganization, getOrganization } = await import(
    '@/domain/billing/organization-service'
  );
  let org = await resolveOrgForTenant(tenantSlug, db);
  if (!org) {
    const { orgId } = await backfillDefaultOrganization(db);
    org = await getOrganization(db, orgId);
    if (!org) throw new Error(`Default organization vanished after backfill`);
  }

  await grantMonthlyAllowanceIfDue(org.id, db);

  const { available } = await getCreditBalance(org.id, db);
  if (available < 1) {
    return {
      ok: false,
      balance: available,
      response: jsonErrorLite(
        'This organization has no AI credits remaining. Upgrade your plan or add credits to continue generating.',
        402,
      ),
    };
  }
  return { ok: true, balance: available };
}