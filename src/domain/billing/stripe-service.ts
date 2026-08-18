/**
 * Stripe Service — customers, checkout and top-up payments.
 *
 * The write path INTO Stripe. Everything coming back out of Stripe goes
 * through stripe-webhook-service.ts, and that asymmetry is deliberate: this
 * module never updates a subscription or grants a credit directly, even when
 * the API call it just made returns the new state. Webhooks are the single
 * source of truth, so the "customer paid but their plan never changed" failure
 * cannot happen just because a response was lost in flight.
 *
 * ⚠️ Placement: platform root DB. Billing is control-plane state.
 */
import type Stripe from 'stripe';
import type { createRawClient } from '@/lib/db';
import {
  getStripe,
  getPriceId,
  getStripeFor,
  requireStripe,
  requireStripeFor,
  listConfiguredPrices,
  stripeConfigError,
  isLiveKey,
  type StripeEnvConfig,
} from '@/lib/billing/stripe-client';
import type { PlanId, BillingInterval } from '@/lib/billing/plans';
import { CREDIT_PACKS } from '@/lib/billing/plans';

type RawDb = ReturnType<typeof createRawClient>;

async function getDb(db?: RawDb): Promise<RawDb> {
  if (db) return db;
  const { createRawClient } = await import('@/lib/db');
  return createRawClient();
}

/**
 * Stripe linkage columns.
 *
 * Added by idempotent ALTER rather than living in the CREATE TABLE, because
 * `subscriptions` already exists on deployed databases from Phase 2 — the same
 * pattern the tenant helpers use for multi-tenant columns.
 */
const STRIPE_COLUMNS_DDL = [
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMP;`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS pending_plan_id TEXT;`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions (stripe_customer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions (stripe_subscription_id);`,
];

export async function ensureStripeColumns(db: RawDb): Promise<void> {
  const { ensureBillingTables } = await import('@/domain/billing/entitlement-service');
  await ensureBillingTables(db);
  for (const sql of STRIPE_COLUMNS_DDL) {
    await db.$executeRawUnsafe(sql);
  }
}

export interface StripeLinkage {
  customerId: string | null;
  subscriptionId: string | null;
  priceId: string | null;
  gracePeriodEndsAt: string | null;
  /** Plan the org downgrades to at the next period boundary, if any. */
  pendingPlanId: PlanId | null;
}

export async function getStripeLinkage(orgId: string, db?: RawDb): Promise<StripeLinkage> {
  db = await getDb(db);
  await ensureStripeColumns(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT stripe_customer_id, stripe_subscription_id, stripe_price_id,
            grace_period_ends_at, pending_plan_id
     FROM subscriptions WHERE org_id = $1 LIMIT 1;`,
    orgId,
  )) as Record<string, unknown>[];

  const row = rows[0];
  return {
    customerId: (row?.stripe_customer_id as string) ?? null,
    subscriptionId: (row?.stripe_subscription_id as string) ?? null,
    priceId: (row?.stripe_price_id as string) ?? null,
    gracePeriodEndsAt: row?.grace_period_ends_at
      ? new Date(row.grace_period_ends_at as string).toISOString()
      : null,
    pendingPlanId: (row?.pending_plan_id as PlanId) ?? null,
  };
}

export async function saveStripeLinkage(
  orgId: string,
  patch: Partial<{
    customerId: string | null;
    subscriptionId: string | null;
    priceId: string | null;
    gracePeriodEndsAt: Date | null;
    pendingPlanId: PlanId | null;
  }>,
  db?: RawDb,
): Promise<void> {
  db = await getDb(db);
  await ensureStripeColumns(db);

  const sets: string[] = [];
  const args: unknown[] = [];
  const push = (column: string, value: unknown) => {
    args.push(value);
    sets.push(`${column} = $${args.length}`);
  };

  if ('customerId' in patch) push('stripe_customer_id', patch.customerId);
  if ('subscriptionId' in patch) push('stripe_subscription_id', patch.subscriptionId);
  if ('priceId' in patch) push('stripe_price_id', patch.priceId);
  if ('gracePeriodEndsAt' in patch) push('grace_period_ends_at', patch.gracePeriodEndsAt);
  if ('pendingPlanId' in patch) push('pending_plan_id', patch.pendingPlanId);
  if (sets.length === 0) return;

  args.push(orgId);
  await db.$executeRawUnsafe(
    `UPDATE subscriptions SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE org_id = $${args.length};`,
    ...args,
  );
}

/** Find the org a Stripe customer belongs to. Null when the link is unknown. */
export async function orgIdForCustomer(
  customerId: string,
  db?: RawDb,
): Promise<string | null> {
  db = await getDb(db);
  await ensureStripeColumns(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT org_id FROM subscriptions WHERE stripe_customer_id = $1 LIMIT 1;`,
    customerId,
  )) as Record<string, unknown>[];
  return rows.length ? String(rows[0].org_id) : null;
}

/**
 * Get or create the Stripe customer for an org.
 *
 * The org id goes into customer metadata as well as into our own column: it is
 * the only way to recover the mapping if the subscriptions row is ever lost,
 * and webhook payloads carry the customer, not the org.
 */
export async function ensureStripeCustomer(orgId: string, db?: RawDb, stripe?: Stripe): Promise<string> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();

  const existing = await getStripeLinkage(orgId, db);
  if (existing.customerId) return existing.customerId;

  const { getOrganization } = await import('@/domain/billing/organization-service');
  const org = await getOrganization(db, orgId);

  const customer = await stripe.customers.create({
    name: org?.displayName ?? orgId,
    metadata: { orgId },
  });

  await saveStripeLinkage(orgId, { customerId: customer.id }, db);
  return customer.id;
}

export interface CheckoutSessionInput {
  orgId: string;
  planId: PlanId;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Hosted Checkout for a plan change.
 *
 * Hosted rather than inline Elements on purpose (roadmap §4.6): plan changes
 * are initiated from settings, where a context switch is expected and the
 * reduced PCI surface is worth more than the conversion points inline capture
 * would save. The onboarding paywall is the opposite trade and uses Elements.
 */
export async function createCheckoutSession(
  input: CheckoutSessionInput,
  db?: RawDb,
): Promise<{ url: string; sessionId: string }> {
  db = await getDb(db);
  const stripe = requireStripe();

  const priceId = getPriceId(input.planId, input.interval);
  if (!priceId) {
    throw new Error(
      `Plan "${input.planId}" (${input.interval}) is not purchasable. ` +
        `Free needs no payment and Enterprise is negotiated; anything else means the ` +
        `price id env var is missing.`,
    );
  }

  const customerId = await ensureStripeCustomer(input.orgId, db);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    // Echoed back on checkout.session.completed and onto the subscription, so
    // the webhook can resolve the org without a database lookup by customer.
    client_reference_id: input.orgId,
    subscription_data: { metadata: { orgId: input.orgId, planId: input.planId } },
    metadata: { orgId: input.orgId, planId: input.planId, interval: input.interval },
  });

  if (!session.url) throw new Error('Stripe returned a checkout session with no URL.');
  return { url: session.url, sessionId: session.id };
}

/**
 * Change plan on an existing subscription, applying the roadmap's proration
 * rules (§4.3).
 *
 * Upgrade   — immediate, prorated charge, billing anchor unchanged. The
 *             prorated credit grant is issued by the webhook when the invoice
 *             is paid, not here, so credits only ever follow money.
 * Downgrade — scheduled to the period boundary. Recorded locally as
 *             `pending_plan_id` so the UI can say what will happen and when;
 *             Stripe holds the actual schedule.
 */
export async function changePlan(
  orgId: string,
  planId: PlanId,
  interval: BillingInterval,
  db?: RawDb,
): Promise<{ applied: 'immediate' | 'scheduled' }> {
  db = await getDb(db);
  const stripe = requireStripe();

  const { getSubscription } = await import('@/domain/billing/entitlement-service');
  const { classifyPlanChange } = await import('@/lib/billing/stripe-client');

  const current = await getSubscription(orgId, db);
  const linkage = await getStripeLinkage(orgId, db);
  if (!linkage.subscriptionId) {
    throw new Error(
      `Organization ${orgId} has no Stripe subscription to change. Start with checkout instead.`,
    );
  }

  const priceId = getPriceId(planId, interval);
  if (!priceId) throw new Error(`Plan "${planId}" (${interval}) has no Stripe price configured.`);

  const kind = classifyPlanChange(current.planId, planId);
  const subscription = await stripe.subscriptions.retrieve(linkage.subscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error(`Stripe subscription ${linkage.subscriptionId} has no line items.`);

  if (kind === 'downgrade') {
    // `proration_behavior: 'none'` plus the period-end schedule is what makes a
    // downgrade non-refunding: the customer keeps what they paid for until the
    // boundary rather than getting a partial credit now.
    await stripe.subscriptions.update(linkage.subscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: 'none',
      billing_cycle_anchor: 'unchanged',
    });
    await saveStripeLinkage(orgId, { pendingPlanId: planId }, db);
    return { applied: 'scheduled' };
  }

  await stripe.subscriptions.update(linkage.subscriptionId, {
    items: [{ id: itemId, price: priceId }],
    // Charge the difference now, and explicitly hold the anchor: without this
    // an upgrade resets the cycle and hands the customer a free extension.
    proration_behavior: 'create_prorations',
    billing_cycle_anchor: 'unchanged',
  });
  await saveStripeLinkage(orgId, { pendingPlanId: null }, db);
  return { applied: 'immediate' };
}

/**
 * Payment intent for a credit top-up.
 *
 * Returns a client secret for inline Elements (roadmap §4.6) — top-ups happen
 * mid-flow, where bouncing to hosted Checkout costs conversions. The credits
 * are NOT granted here; `payment_intent.succeeded` grants them, so a customer
 * who closes the tab mid-payment still gets what they paid for.
 */
export async function createTopUpIntent(
  orgId: string,
  packId: string,
  db?: RawDb,
  stripe?: Stripe,
): Promise<{ clientSecret: string; paymentIntentId: string; amountCents: number }> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();

  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    throw new Error(
      `Unknown credit pack "${packId}". Available: ${CREDIT_PACKS.map((p) => p.id).join(', ')}`,
    );
  }

  const customerId = await ensureStripeCustomer(orgId, db, stripe);

  const intent = await stripe.paymentIntents.create({
    amount: pack.priceCents,
    currency: 'usd',
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    // The webhook reads these to know what to grant and to whom.
    metadata: { orgId, packId: pack.id, kind: 'credit_topup' },
  });

  if (!intent.client_secret) {
    throw new Error('Stripe returned a payment intent with no client secret.');
  }
  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amountCents: pack.priceCents,
  };
}

/** Whether payments are usable end-to-end (key + webhook secret + a price). */
export function stripeReadiness(override?: StripeEnvConfig): {
  ready: boolean;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  hasPublishableKey: boolean;
  configuredPrices: number;
  /** True when this deployment is pointed at live Stripe. Surfaced so the UI can say so. */
  liveMode: boolean;
  /** Set when the configuration is self-inconsistent — see stripeConfigError(). */
  configError: string | null;
} {
  // The factory control plane passes the tenant's own keys (from
  // metadata.config.stripe) so tenant billing reflects the tenant's Stripe
  // account; every field falls back to this deployment's env.
  const hasSecretKey = Boolean(getStripeFor(override));
  const hasWebhookSecret = Boolean((override?.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET)?.trim());
  const hasPublishableKey = Boolean((override?.publishableKey ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)?.trim());
  const configuredPrices = listConfiguredPrices().length;
  const configError = stripeConfigError(override);

  return {
    ready: hasSecretKey && hasWebhookSecret && configuredPrices > 0 && !configError,
    hasSecretKey,
    hasWebhookSecret,
    hasPublishableKey,
    configuredPrices,
    liveMode: isLiveKey(override?.secretKey ?? process.env.STRIPE_SECRET_KEY),
    configError,
  };
}

// ── Payment methods ─────────────────────────────────────────

export interface StoredPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  /** True for the customer's invoice default. */
  isDefault: boolean;
}

/**
 * Begin attaching a card without charging it.
 *
 * A SetupIntent, not a PaymentIntent: this is the "card on file" flow behind
 * auto-reload and unattended renewal, where the whole point is to authorise a
 * future charge rather than take one now. Stripe still performs 3DS here, so
 * the card is usable later without the customer present — which is exactly what
 * a $0 authorisation on a PaymentIntent would not guarantee.
 *
 * ⚠️ No card data reaches this server. The returned client secret authorises
 * confirming this one setup and nothing else.
 */
export async function createSetupIntent(
  orgId: string,
  db?: RawDb,
  stripe?: Stripe,
): Promise<{ clientSecret: string; customerId: string }> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();
  const customerId = await ensureStripeCustomer(orgId, db, stripe);

  const intent = await stripe.setupIntents.create({
    customer: customerId,
    usage: 'off_session',
    automatic_payment_methods: { enabled: true },
    metadata: { orgId, kind: 'payment_method' },
  });

  if (!intent.client_secret) {
    throw new Error('Stripe returned a setup intent with no client secret.');
  }
  return { clientSecret: intent.client_secret, customerId };
}

/**
 * Cards on file for an organization.
 *
 * Returns an empty list rather than throwing when the org has no Stripe
 * customer yet: "no cards" and "never transacted" look the same to the person
 * reading the page, and an error there would be indistinguishable from a
 * failure to load.
 */
export async function listPaymentMethods(
  orgId: string,
  db?: RawDb,
  stripe?: Stripe,
): Promise<StoredPaymentMethod[]> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();

  const linkage = await getStripeLinkage(orgId, db);
  if (!linkage.customerId) return [];

  const customer = await stripe.customers.retrieve(linkage.customerId);
  const defaultId =
    !customer.deleted && typeof customer.invoice_settings?.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : null;

  const methods = await stripe.paymentMethods.list({
    customer: linkage.customerId,
    type: 'card',
  });

  return methods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? 'card',
    last4: pm.card?.last4 ?? '••••',
    expMonth: pm.card?.exp_month ?? 0,
    expYear: pm.card?.exp_year ?? 0,
    isDefault: pm.id === defaultId,
  }));
}

/**
 * Make a card the one invoices are charged against.
 *
 * Set on the customer rather than tracked in our own tables: Stripe is what
 * actually charges the renewal, so a "default" we stored and Stripe disagreed
 * with would be a lie the customer only discovers when the wrong card is billed.
 */
export async function setDefaultPaymentMethod(
  orgId: string,
  paymentMethodId: string,
  db?: RawDb,
  stripe?: Stripe,
): Promise<void> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();

  const linkage = await getStripeLinkage(orgId, db);
  if (!linkage.customerId) throw new Error('This organization has no Stripe customer.');

  // Ownership check. paymentMethods.list is scoped to the customer, so a card
  // id from another organization simply will not appear — without this, an id
  // guessed or copied from elsewhere would be accepted and set as the default.
  const owned = await stripe.paymentMethods.list({ customer: linkage.customerId, type: 'card' });
  if (!owned.data.some((pm) => pm.id === paymentMethodId)) {
    throw new Error('That payment method does not belong to this organization.');
  }

  await stripe.customers.update(linkage.customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
}

/** Detach a card. Same ownership check as setting the default, for the same reason. */
export async function removePaymentMethod(
  orgId: string,
  paymentMethodId: string,
  db?: RawDb,
  stripe?: Stripe,
): Promise<void> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();

  const linkage = await getStripeLinkage(orgId, db);
  if (!linkage.customerId) throw new Error('This organization has no Stripe customer.');

  const owned = await stripe.paymentMethods.list({ customer: linkage.customerId, type: 'card' });
  if (!owned.data.some((pm) => pm.id === paymentMethodId)) {
    throw new Error('That payment method does not belong to this organization.');
  }

  await stripe.paymentMethods.detach(paymentMethodId);
}
