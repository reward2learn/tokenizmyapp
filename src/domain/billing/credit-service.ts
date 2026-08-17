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
import { getPlan, CREDIT_PACKS, type CreditPack } from '@/lib/billing/plans';
import { creditsForUsage } from '@/lib/billing/credit-rates';
import { jsonErrorLite } from '@/lib/api/response-lite';
import { DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/persons';

/** Grants expire 30 days after issue (roadmap §3.2 — documented decision). */
export const CREDIT_EXPIRY_DAYS = 30;

/** Ledger reason for usage by an exempt operator — recorded, never charged. */
const EXEMPT_USAGE_REASON = 'ai_generation_exempt';

/**
 * Operators who are never gated or charged for AI usage.
 *
 * The platform owner runs the console on their own infrastructure and pays the
 * providers directly; billing them in their own currency is circular, and a
 * zero balance locking the owner out of the chat is a support call with nobody
 * to call. `CREDIT_EXEMPT_EMAILS` (comma-separated) adds to the default.
 *
 * This is an *identity* exemption, not a tenant one — it follows the signed-in
 * person, so an exempt operator working inside a customer's tenant does not
 * spend that customer's credits either.
 */
export function creditExemptEmails(): string[] {
  const extra = (process.env.CREDIT_EXEMPT_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return [DEFAULT_PLATFORM_ADMIN_EMAIL.toLowerCase(), ...extra];
}

/**
 * Is this viewer exempt from credit gating and charging?
 *
 * Deliberately keyed on email rather than the platform-admin *role*: every
 * tenant seeds its own admin accounts, so exempting the role would hand a free
 * unmetered AI budget to every customer's administrator.
 */
export function isCreditExemptEmail(email?: string | null): boolean {
  if (!email) return false;
  return creditExemptEmails().includes(email.trim().toLowerCase());
}

/**
 * Balance a generation must have before it is allowed to start.
 *
 * ⚠️ Currently 1, which means the gate only stops a *completely* empty org. A
 * real generation costs many credits, so an org with 1 credit passes the gate,
 * runs, and the platform collects 1 credit for the whole job — the rest is
 * given away (see the `shortfall` field on MeterResult).
 *
 * Raising this to a realistic floor is a pricing decision, not a code one: too
 * low leaks revenue, too high refuses work from customers who could have
 * afforded most of it. Left at the pre-existing behaviour until that number is
 * chosen. `requireCreditsForOrg(orgId, db, n)` overrides it per call site for
 * generations known to be expensive.
 */
export const MIN_CREDITS_TO_START = 1;

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
  /**
   * Positive for grants, negative for consumption. Zero only for exempt usage
   * (`ai_generation_exempt`), which is recorded for visibility but not charged.
   */
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

/** Ledger reason for the two halves of the debt cycle. */
const DEBT_INCURRED_REASON = 'ai_generation_unbilled';
const DEBT_SETTLED_REASON = 'debt_settlement';

/**
 * Outstanding debt for an org, in credits. Zero when the books are clear.
 *
 * Debt is represented as ledger entries with `grant_id IS NULL` — the schema
 * already reserves that for "balance-level" entries. Incurring debt writes a
 * negative marker; settling it writes an offsetting positive one, so the
 * markers net to zero once paid and the outstanding amount is just their
 * negated sum. No separate table, and the audit trail shows both events.
 */
export async function getOutstandingDebt(orgId: string, db?: RawDb): Promise<number> {
  db ??= await getDb();
  await ensureCreditTables(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT COALESCE(SUM(delta), 0) AS total
     FROM credit_ledger
     WHERE org_id = $1 AND grant_id IS NULL AND reason IN ($2, $3);`,
    orgId,
    DEBT_INCURRED_REASON,
    DEBT_SETTLED_REASON,
  )) as Record<string, unknown>[];

  // Markers are negative when owed. Floored at zero so an over-settlement can
  // never read as "negative debt", which would silently inflate the balance.
  return Math.max(0, -Number(rows[0]?.total ?? 0));
}

export interface CreditBalance {
  /** Spendable credits: SUM(remaining) over unexpired grants. Never negative. */
  available: number;
  /** The subset of `available` expiring within 7 days. */
  expiringSoon: number;
  /** Credits consumed beyond the balance and not yet settled. */
  debt: number;
  /** `available - debt`. Negative means the org is in arrears. */
  net: number;
}

/**
 * Current balance for an org.
 *
 * `available` and `debt` are tracked separately rather than netted into one
 * number: they mean different things to the UI (one is spendable, the other is
 * owed) and collapsing them would make an org holding fresh credits *and*
 * carrying debt look solvent when the next generation is about to be blocked.
 *
 * Lazily grants the monthly allowance first — same self-healing pattern as
 * getSubscription(): an org that has never been seen by this code converges
 * on first read instead of 500ing.
 */
export async function getCreditBalance(
  orgId: string,
  db?: RawDb,
): Promise<CreditBalance> {
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

  const available = Number(rows[0]?.available ?? 0);
  const debt = await getOutstandingDebt(orgId, db);

  return {
    available,
    expiringSoon: Number(rows[0]?.expiring_soon ?? 0),
    debt,
    net: available - debt,
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

  // New credits pay off arrears first. Without this an org that ran up debt
  // would top up and immediately spend the top-up on new work while the old
  // debt kept it blocked — the balance would look healthy and every generation
  // would still be refused.
  await settleDebt(orgId, db);

  return grant;
}

export interface RedeemPackResult {
  pack: CreditPack;
  /** The purchased credits (source 'addon'). */
  baseGrant: CreditGrant;
  /** The promotional bonus, when the pack carries one (source 'promo'). */
  bonusGrant: CreditGrant | null;
  balance: { available: number; expiringSoon: number };
}

/**
 * Redeem a top-up pack into credits.
 *
 * Writes the base and bonus as **two separate grants** — purchased credits as
 * `source='addon'`, the promotional bonus as `source='promo'` (roadmap §3.7).
 * One combined grant would be simpler and wrong: promo generosity has to stay
 * measurable, and a refund or a withdrawn promotion must be able to claw back
 * the bonus without touching credits the customer actually paid for.
 *
 * Takes no money. Phase 4 (Stripe) calls this after a successful payment; today
 * it is the admin top-up path, which is why the route behind it is platform-admin
 * only.
 */
export async function redeemCreditPack(
  orgId: string,
  packId: string,
  options: { paymentRef?: string | null } = {},
  db?: RawDb,
): Promise<RedeemPackResult> {
  db ??= await getDb();

  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    throw new Error(
      `Unknown credit pack "${packId}". Available: ${CREDIT_PACKS.map((p) => p.id).join(', ')}`,
    );
  }

  const metadata = {
    packId: pack.id,
    priceCents: pack.priceCents,
    paymentRef: options.paymentRef ?? null,
  };

  const baseGrant = await grantCredits(
    orgId,
    { source: 'addon', amount: pack.baseCredits, metadata },
    db,
  );

  const bonusGrant = pack.bonusCredits > 0
    ? await grantCredits(
        orgId,
        { source: 'promo', amount: pack.bonusCredits, metadata },
        db,
      )
    : null;

  return { pack, baseGrant, bonusGrant, balance: await getCreditBalance(orgId, db) };
}

export interface ConsumeCreditsInput {
  amount: number;
  reason: string;
  refType?: string | null;
  refId?: string | null;
  metadata?: Record<string, unknown> | null;
  /**
   * Record consumption beyond the available balance as debt rather than
   * silently taking only what is there. Defaults to false.
   */
  allowDebt?: boolean;
}

/**
 * Consume credits oldest-expiring-first.
 *
 * Iterates unexpired grants ordered by `expires_at ASC, granted_at ASC`,
 * decrementing `remaining` per grant and appending one ledger entry per
 * touched grant with `delta = -consumedFromGrant`. Never mutates a balance
 * column — the ledger is the audit trail and the balance is always derived.
 *
 * When `amount` exceeds the available balance the behaviour depends on
 * `allowDebt`:
 *
 *   - `false` (default) — consume what is there and return `consumed < amount`.
 *     Right for speculative or pre-flight consumption.
 *   - `true` — record the overage as debt so the full cost is captured. Right
 *     for metering, where the tokens are already spent and refusing to record
 *     them would just give the work away (see meterAiUsageForOrg).
 */
export async function consumeCredits(
  orgId: string,
  input: ConsumeCreditsInput,
  db?: RawDb,
): Promise<{ consumed: number; debtIncurred: number; balance: number }> {
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

  // The overage. Written as a single balance-level ledger entry (grant_id NULL)
  // rather than pushing a grant negative — grants model money that was issued,
  // and a negative one would corrupt both the balance sum and expiry handling.
  const debtIncurred = input.allowDebt ? input.amount - consumed : 0;
  if (debtIncurred > 0) {
    await db.$executeRawUnsafe(
      `INSERT INTO credit_ledger (id, org_id, grant_id, delta, reason, ref_type, ref_id, metadata)
       VALUES (gen_random_uuid()::TEXT, $1, NULL, $2, $3, $4, $5, $6::jsonb);`,
      orgId,
      -debtIncurred,
      DEBT_INCURRED_REASON,
      input.refType ?? null,
      input.refId ?? null,
      JSON.stringify({ ...(input.metadata ?? {}), originalReason: input.reason }),
    );
  }

  const { available } = await getCreditBalance(orgId, db);
  return { consumed, debtIncurred, balance: available };
}

/**
 * Pay off outstanding debt from the org's current grants.
 *
 * Called after every grant, so credits arriving by any route — plan allowance,
 * top-up, promo, admin adjustment — clear arrears before they can be spent on
 * new work. That is the whole point of allowing debt: the org is unblocked the
 * moment it is funded, without anyone having to remember to settle.
 *
 * Deliberately does NOT go through consumeCredits(): that ends by reading the
 * balance, which lazily grants the monthly allowance, which grants credits,
 * which would re-enter here. Direct SQL keeps the cycle impossible rather than
 * merely unlikely.
 */
export async function settleDebt(
  orgId: string,
  db?: RawDb,
): Promise<{ settled: number; remainingDebt: number }> {
  db ??= await getDb();
  await ensureCreditTables(db);

  const debt = await getOutstandingDebt(orgId, db);
  if (debt <= 0) return { settled: 0, remainingDebt: 0 };

  const grants = (await db.$queryRawUnsafe(
    `SELECT * FROM credit_grants
     WHERE org_id = $1 AND remaining > 0 AND expires_at > CURRENT_TIMESTAMP
     ORDER BY expires_at ASC, granted_at ASC;`,
    orgId,
  )) as Record<string, unknown>[];

  let toSettle = debt;
  let settled = 0;

  for (const row of grants) {
    if (toSettle <= 0) break;
    const grantId = String(row.id);
    const take = Math.min(Number(row.remaining), toSettle);

    await db.$executeRawUnsafe(
      `UPDATE credit_grants SET remaining = remaining - $1 WHERE id = $2;`,
      take,
      grantId,
    );
    await db.$executeRawUnsafe(
      `INSERT INTO credit_ledger (id, org_id, grant_id, delta, reason, metadata)
       VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, $5::jsonb);`,
      orgId,
      grantId,
      -take,
      DEBT_SETTLED_REASON,
      JSON.stringify({ settledAgainstDebt: take }),
    );

    toSettle -= take;
    settled += take;
  }

  if (settled > 0) {
    // The offsetting marker. Debt markers net to zero once paid, so the
    // outstanding amount stays derivable from the ledger alone.
    await db.$executeRawUnsafe(
      `INSERT INTO credit_ledger (id, org_id, grant_id, delta, reason, metadata)
       VALUES (gen_random_uuid()::TEXT, $1, NULL, $2, $3, $4::jsonb);`,
      orgId,
      settled,
      DEBT_SETTLED_REASON,
      JSON.stringify({ debtBefore: debt, debtAfter: debt - settled }),
    );
  }

  return { settled, remainingDebt: debt - settled };
}

export interface CreditReconciliation {
  /** SUM(delta) over the whole ledger — every grant and every consumption. */
  ledgerTotal: number;
  /** SUM(remaining) over ALL grants, expired ones included. */
  grantsRemaining: number;
  /** Credits consumed beyond the balance and not yet settled. */
  debt: number;
  /** ledgerTotal − (grantsRemaining − debt). Zero when the books balance. */
  drift: number;
  balanced: boolean;
}

/**
 * Check the ledger against the grants — Phase 3's exit criterion.
 *
 * The invariant, with debt:
 *
 *     SUM(ledger.delta) === SUM(grants.remaining) − outstandingDebt
 *
 * Debt is the only ledger movement with no matching change to a grant (the
 * credits were never issued), so it is exactly the gap between the two sums.
 * When nothing is owed this reduces to the simple `ledger === grants` form.
 *
 * Expired grants are deliberately included: expiry makes credits unspendable,
 * it does not un-grant them, so excluding them would report drift on every org
 * with an expired grant.
 *
 * A non-zero drift means a grant or a consumption was written without its
 * ledger entry — a bookkeeping bug, not a customer-visible one, which is
 * exactly why it needs a check rather than waiting to be noticed.
 */
export async function reconcileCredits(
  orgId: string,
  db?: RawDb,
): Promise<CreditReconciliation> {
  db ??= await getDb();
  await ensureCreditTables(db);

  const [ledgerRows, grantRows] = await Promise.all([
    db.$queryRawUnsafe(
      `SELECT COALESCE(SUM(delta), 0) AS total FROM credit_ledger WHERE org_id = $1;`,
      orgId,
    ) as Promise<Record<string, unknown>[]>,
    db.$queryRawUnsafe(
      `SELECT COALESCE(SUM(remaining), 0) AS total FROM credit_grants WHERE org_id = $1;`,
      orgId,
    ) as Promise<Record<string, unknown>[]>,
  ]);

  const ledgerTotal = Number(ledgerRows[0]?.total ?? 0);
  const grantsRemaining = Number(grantRows[0]?.total ?? 0);
  const debt = await getOutstandingDebt(orgId, db);
  const drift = ledgerTotal - (grantsRemaining - debt);

  return { ledgerTotal, grantsRemaining, debt, drift, balanced: drift === 0 };
}

/**
 * Whether an org can afford `amount` credits right now.
 *
 * Measured against `net`, not `available`: an org carrying debt cannot afford
 * anything until it is settled, however many fresh credits it is holding.
 */
export async function hasSufficientCredits(
  orgId: string,
  amount: number,
  db?: RawDb,
): Promise<boolean> {
  db ??= await getDb();
  const { net } = await getCreditBalance(orgId, db);
  return net >= amount;
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

/**
 * Resolve the org that pays for a tenant's AI usage, creating the default org
 * if the tenant predates the org layer.
 *
 * Extracted because metering and the pre-flight gate must agree on the payer —
 * a gate that checks one org while metering debits another would let a tenant
 * generate forever against a balance nobody is watching.
 */
async function resolvePayingOrgId(tenantSlug: string, db: RawDb): Promise<string> {
  const { resolveOrgForTenant, backfillDefaultOrganization } = await import(
    '@/domain/billing/organization-service'
  );
  const org = await resolveOrgForTenant(tenantSlug, db);
  if (org) return org.id;

  // Tenant predates the org layer (or is unknown) — converge on the default
  // org so metering never 500s. Same self-healing as resolveOrgForTenant().
  const { orgId } = await backfillDefaultOrganization(db);
  return orgId;
}

/**
 * The org that pays for platform-level AI work — generation an administrator
 * runs that is not on behalf of any one tenant, such as building a reusable
 * custom template.
 *
 * Charged to the default organization rather than left free: the token cost is
 * real, and an unmetered path is exactly the unbounded spend this phase exists
 * to close. When the platform is split into multiple orgs, this is the seam
 * where the acting admin's own org should be resolved instead.
 */
export async function resolvePlatformOrgId(db?: RawDb): Promise<string> {
  db ??= await getDb();
  const { backfillDefaultOrganization } = await import('@/domain/billing/organization-service');
  const { orgId } = await backfillDefaultOrganization(db);
  return orgId;
}

/** What metering actually did — `consumed` is authoritative, `credits` is the price. */
export interface MeterResult {
  /** False for BYOK, where the tenant pays the provider directly. */
  charged: boolean;
  /** What the usage cost at the rate card. */
  credits: number;
  /** What was actually taken from the balance — may be less than `credits`. */
  consumed: number;
  /** `credits - consumed`. Non-zero means work was delivered unbilled. */
  shortfall: number;
  /** Remaining spendable balance after this call. */
  balance: number;
}

export interface MeterAiUsageForOrgInput {
  orgId: string;
  model: string | null;
  promptTokens: number;
  completionTokens: number;
  /** 'db' = tenant's own BYOK key; 'env' = platform key. */
  keySource: 'db' | 'env';
  refType?: string | null;
  refId?: string | null;
  /**
   * Email of the person the work is running for. When it matches
   * `isCreditExemptEmail()` the usage is recorded but not charged.
   */
  viewerEmail?: string | null;
}

/**
 * Record usage that is exempt from charging.
 *
 * Writes one ledger entry with `delta = 0` rather than writing nothing. The
 * cost is real even when nobody is billed for it, and a silent path is exactly
 * the unmetered spend this phase exists to make visible — the waived amount is
 * in the metadata, so exempt usage can be reported on without ever touching a
 * grant or the balance.
 *
 * `delta = 0` keeps every invariant intact: the balance sum is unchanged, and
 * `getOutstandingDebt()` counts only the two debt reasons, so this can never
 * create arrears.
 */
async function recordExemptUsage(
  input: MeterAiUsageForOrgInput,
  db: RawDb,
): Promise<MeterResult> {
  const credits = creditsForUsage(input.model, input.promptTokens, input.completionTokens);
  await ensureCreditTables(db);

  await db.$executeRawUnsafe(
    `INSERT INTO credit_ledger (id, org_id, grant_id, delta, reason, ref_type, ref_id, metadata)
     VALUES (gen_random_uuid()::TEXT, $1, NULL, 0, $2, $3, $4, $5::jsonb);`,
    input.orgId,
    EXEMPT_USAGE_REASON,
    input.refType ?? null,
    input.refId ?? null,
    JSON.stringify({
      waivedCredits: credits,
      model: input.model,
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
      viewerEmail: input.viewerEmail ?? null,
    }),
  );

  const { available } = await getCreditBalance(input.orgId, db);
  return { charged: false, credits, consumed: 0, shortfall: 0, balance: available };
}

/**
 * Meter usage against a known org.
 *
 * The org-level primitive; `meterAiUsage()` is the tenant-scoped wrapper. Use
 * this directly for platform-level generation that has no tenant.
 */
export async function meterAiUsageForOrg(
  input: MeterAiUsageForOrgInput,
  db?: RawDb,
): Promise<MeterResult> {
  db ??= await getDb();
  if (input.keySource === 'db') {
    return { charged: false, credits: 0, consumed: 0, shortfall: 0, balance: 0 };
  }

  if (isCreditExemptEmail(input.viewerEmail)) {
    return recordExemptUsage(input, db);
  }

  await grantMonthlyAllowanceIfDue(input.orgId, db);

  const credits = creditsForUsage(input.model, input.promptTokens, input.completionTokens);
  const { consumed, debtIncurred, balance } = await consumeCredits(
    input.orgId,
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
      // The tokens are already spent by the time metering runs. Recording only
      // what the balance could cover would hand the rest of the work over for
      // free; the overage becomes debt and blocks the NEXT generation instead.
      allowDebt: true,
    },
    db,
  );

  if (debtIncurred > 0) {
    console.warn(
      `[credits] Org ${input.orgId} went into debt: usage cost ${credits}, ` +
        `${consumed} collected, ${debtIncurred} owed. Further generation is blocked until settled.`,
    );
  }

  return { charged: true, credits, consumed, shortfall: debtIncurred, balance };
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
  /** See MeterAiUsageForOrgInput.viewerEmail. */
  viewerEmail?: string | null;
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
): Promise<MeterResult> {
  db ??= await getDb();
  if (input.keySource === 'db') {
    return { charged: false, credits: 0, consumed: 0, shortfall: 0, balance: 0 };
  }

  const orgId = await resolvePayingOrgId(input.tenantSlug, db);
  return meterAiUsageForOrg({ ...input, orgId }, db);
}

export type CreditGateResult =
  /**
   * `exempt` viewers pass without any balance being read, so `balance` is
   * `Infinity` — "no limit applies", not a real figure. Do not serialize it
   * without checking `exempt` first; JSON.stringify turns Infinity into null.
   */
  | { ok: true; balance: number; exempt?: boolean }
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
  viewerEmail?: string | null,
): Promise<CreditGateResult> {
  if (isCreditExemptEmail(viewerEmail)) return { ok: true, balance: Infinity, exempt: true };
  db ??= await getDb();
  const orgId = await resolvePayingOrgId(tenantSlug, db);
  return requireCreditsForOrg(orgId, db, MIN_CREDITS_TO_START, viewerEmail);
}

/**
 * Pre-flight gate against a known org — the primitive behind
 * requireCreditsForTenant(), and what platform-level generation uses.
 */
export async function requireCreditsForOrg(
  orgId: string,
  db?: RawDb,
  minimum: number = MIN_CREDITS_TO_START,
  viewerEmail?: string | null,
): Promise<CreditGateResult> {
  // Checked before any org resolution or balance read: the exemption follows
  // the person, not the org, so there is nothing here worth looking up.
  if (isCreditExemptEmail(viewerEmail)) return { ok: true, balance: Infinity, exempt: true };

  db ??= await getDb();
  await grantMonthlyAllowanceIfDue(orgId, db);

  const { available, debt, net } = await getCreditBalance(orgId, db);

  // Arrears block first and say so plainly. Reporting "no credits remaining"
  // to an org that is actually carrying debt would send them to top up by the
  // wrong amount — they need to clear the debt AND fund the next run.
  if (debt > 0) {
    return {
      ok: false,
      balance: net,
      response: jsonErrorLite(
        `This organization owes ${debt} AI credit(s) from a previous generation that ran past ` +
          `its balance. Add at least ${debt + minimum} credits to settle and continue.`,
        402,
      ),
    };
  }

  if (available < minimum) {
    return {
      ok: false,
      balance: available,
      response: jsonErrorLite(
        minimum > 1
          ? `This organization has ${available} AI credit(s) but a generation needs at least ` +
            `${minimum}. Upgrade your plan or add credits to continue.`
          : 'This organization has no AI credits remaining. Upgrade your plan or add credits to continue generating.',
        402,
      ),
    };
  }
  return { ok: true, balance: available };
}