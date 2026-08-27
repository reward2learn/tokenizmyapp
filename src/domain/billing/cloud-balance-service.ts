/**
 * Cloud balance — credit / debit / auto top-up for run-time Cloud Credits.
 *
 * Mirrors AI credit pack redemption for Stripe `cloud_topup` payments, and
 * fires off-session PaymentIntents when balance falls below a configured
 * threshold and a default payment method is on file.
 */
import type Stripe from 'stripe';
import { createRawClient } from '@/lib/db';
import { CREDIT_PACK_MIN_PRICE_CENTS } from '@/lib/billing/plans';

type RawDb = ReturnType<typeof createRawClient>;

async function getDb(db?: RawDb): Promise<RawDb> {
  return db ?? createRawClient();
}

export interface CloudBalanceRow {
  orgId: string;
  balanceCents: number;
  autoTopUpThreshold: number | null;
  autoTopUpAmount: number | null;
}

export async function getCloudBalance(orgId: string, db?: RawDb): Promise<CloudBalanceRow> {
  db = await getDb(db);
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT org_id, balance_cents, auto_top_up_threshold, auto_top_up_amount
         FROM cloud_balances WHERE org_id = $1 LIMIT 1;`,
      orgId,
    )) as Record<string, unknown>[];
    if (rows[0]) {
      return {
        orgId,
        balanceCents: Number(rows[0].balance_cents) || 0,
        autoTopUpThreshold:
          rows[0].auto_top_up_threshold == null
            ? null
            : Number(rows[0].auto_top_up_threshold),
        autoTopUpAmount:
          rows[0].auto_top_up_amount == null ? null : Number(rows[0].auto_top_up_amount),
      };
    }
  } catch {
    // Table may be absent on a pre-Phase-5 database.
  }
  return {
    orgId,
    balanceCents: 0,
    autoTopUpThreshold: null,
    autoTopUpAmount: null,
  };
}

/**
 * Credit cloud balance after a successful Stripe `cloud_topup` payment.
 * Idempotent on `paymentRef` (Checkout Session id or PaymentIntent id).
 */
export async function creditCloudBalance(
  orgId: string,
  cents: number,
  paymentRef: string,
  db?: RawDb,
): Promise<{ balanceCents: number; alreadyCredited: boolean }> {
  if (!Number.isFinite(cents) || cents <= 0) {
    throw new Error(`cloud top-up amount must be a positive integer (got ${cents})`);
  }
  db = await getDb(db);
  const ref = paymentRef.trim();
  if (!ref) throw new Error('paymentRef is required for cloud top-up idempotency');

  // Reuse usage_records-adjacent ledger via a lightweight payments log on the
  // balance row metadata is unavailable — track via cloud_topup_refs table
  // created lazily (CREATE IF NOT EXISTS) so db push is not required mid-flight.
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cloud_topup_refs (
      payment_ref TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      credited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

  const prior = (await db.$queryRawUnsafe(
    `SELECT payment_ref FROM cloud_topup_refs WHERE payment_ref = $1 LIMIT 1;`,
    ref,
  )) as { payment_ref: string }[];
  if (prior.length > 0) {
    const bal = await getCloudBalance(orgId, db);
    return { balanceCents: bal.balanceCents, alreadyCredited: true };
  }

  await db.$executeRawUnsafe(
    `INSERT INTO cloud_topup_refs (payment_ref, org_id, amount_cents)
     VALUES ($1, $2, $3);`,
    ref,
    orgId,
    Math.round(cents),
  );

  await db.$executeRawUnsafe(
    `INSERT INTO cloud_balances (id, org_id, balance_cents, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (org_id)
     DO UPDATE SET balance_cents = cloud_balances.balance_cents + $3, updated_at = NOW();`,
    `cb_${orgId}`,
    orgId,
    Math.round(cents),
  );

  const bal = await getCloudBalance(orgId, db);
  return { balanceCents: bal.balanceCents, alreadyCredited: false };
}

export async function updateCloudAutoTopUp(
  orgId: string,
  settings: { autoTopUpThreshold: number | null; autoTopUpAmount: number | null },
  db?: RawDb,
): Promise<CloudBalanceRow> {
  db = await getDb(db);
  const threshold = settings.autoTopUpThreshold;
  const amount = settings.autoTopUpAmount;

  if (threshold != null && threshold < 0) {
    throw new Error('autoTopUpThreshold must be >= 0 or null');
  }
  if (amount != null && amount < CREDIT_PACK_MIN_PRICE_CENTS) {
    throw new Error(
      `autoTopUpAmount must be at least $${CREDIT_PACK_MIN_PRICE_CENTS / 100} or null`,
    );
  }

  await db.$executeRawUnsafe(
    `INSERT INTO cloud_balances (id, org_id, balance_cents, auto_top_up_threshold, auto_top_up_amount, updated_at)
     VALUES ($1, $2, 0, $3, $4, NOW())
     ON CONFLICT (org_id)
     DO UPDATE SET
       auto_top_up_threshold = EXCLUDED.auto_top_up_threshold,
       auto_top_up_amount = EXCLUDED.auto_top_up_amount,
       updated_at = NOW();`,
    `cb_${orgId}`,
    orgId,
    threshold,
    amount,
  );

  return getCloudBalance(orgId, db);
}

/**
 * For each org below its auto top-up threshold with a default PM, create an
 * off-session PaymentIntent (`kind: cloud_topup`, `source: auto`). Credits land
 * via `payment_intent.succeeded` webhook → `creditCloudBalance`.
 */
export async function maybeAutoTopUpCloudBalances(
  db: RawDb,
  orgIds: string[],
  stripeFactory?: () => Stripe,
): Promise<{ attempted: number; created: number }> {
  let attempted = 0;
  let created = 0;

  const { ensureStripeCustomer } = await import('@/domain/billing/stripe-service');
  const { requireStripe } = await import('@/lib/billing/stripe-client');

  for (const orgId of orgIds) {
    const bal = await getCloudBalance(orgId, db);
    if (
      bal.autoTopUpThreshold == null ||
      bal.autoTopUpAmount == null ||
      bal.autoTopUpAmount < CREDIT_PACK_MIN_PRICE_CENTS
    ) {
      continue;
    }
    if (bal.balanceCents >= bal.autoTopUpThreshold) continue;

    attempted += 1;
    try {
      const stripe = stripeFactory ? stripeFactory() : requireStripe();
      const customerId = await ensureStripeCustomer(orgId, db, stripe);
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) continue;
      const pm =
        typeof customer.invoice_settings?.default_payment_method === 'string'
          ? customer.invoice_settings.default_payment_method
          : customer.invoice_settings?.default_payment_method?.id;
      if (!pm) continue;

      await stripe.paymentIntents.create({
        amount: bal.autoTopUpAmount,
        currency: 'usd',
        customer: customerId,
        payment_method: pm,
        off_session: true,
        confirm: true,
        metadata: {
          orgId,
          kind: 'cloud_topup',
          source: 'auto',
          amountCents: String(bal.autoTopUpAmount),
        },
      });
      created += 1;
    } catch (err) {
      console.warn(
        `[cloud-credits] auto top-up failed for ${orgId}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  return { attempted, created };
}
