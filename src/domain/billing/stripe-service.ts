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
  getPriceId,
  getStripeFor,
  requireStripe,
  requireStripeFor,
  listConfiguredPrices,
  planForPriceId,
  getPriceId as resolvePriceId,
  stripeConfigError,
  isLiveKey,
  getStripeWebhookSecret,
  type StripeEnvConfig,
} from '@/lib/billing/stripe-client';
import type { PlanId, BillingInterval } from '@/lib/billing/plans';
import { CREDIT_PACKS, PLANS } from '@/lib/billing/plans';

type RawDb = ReturnType<typeof createRawClient>;

async function getDb(db?: RawDb): Promise<RawDb> {
  if (db) return db;
  const { createBillingRawClient } = await import('@/lib/db');
  return createBillingRawClient();
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
  config?: StripeEnvConfig,
): Promise<{ url: string; sessionId: string }> {
  db = await getDb(db);
  const stripe = requireStripeFor(config);

  const priceId = getPriceId(input.planId, input.interval, config);
  if (!priceId) {
    throw new Error(
      `Plan "${input.planId}" (${input.interval}) is not purchasable. ` +
        `Free needs no payment and Enterprise is negotiated; anything else means the ` +
        `price id env var is missing.`,
    );
  }

  const customerId = await ensureStripeCustomer(input.orgId, db, stripe);

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

export interface EmbeddedCheckoutSessionInput {
  orgId: string;
  planId: PlanId;
  interval: BillingInterval;
}

/**
 * Embedded Checkout for a new subscription — used in the factory Choose Plan modal.
 *
 * Same subscription + webhook path as hosted Checkout; only the UI surface differs.
 */
export async function createEmbeddedSubscriptionCheckoutSession(
  input: EmbeddedCheckoutSessionInput,
  db?: RawDb,
  config?: StripeEnvConfig,
): Promise<{ clientSecret: string; sessionId: string }> {
  db = await getDb(db);
  const stripe = requireStripeFor(config);

  const priceId = getPriceId(input.planId, input.interval, config);
  if (!priceId) {
    throw new Error(
      `Plan "${input.planId}" (${input.interval}) is not purchasable. ` +
        `Free needs no payment and Enterprise is negotiated; anything else means the ` +
        `price id env var is missing.`,
    );
  }

  const customerId = await ensureStripeCustomer(input.orgId, db, stripe);

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    redirect_on_completion: 'never',
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: input.orgId,
    subscription_data: { metadata: { orgId: input.orgId, planId: input.planId } },
    metadata: { orgId: input.orgId, planId: input.planId, interval: input.interval },
  });

  if (!session.client_secret) {
    throw new Error('Stripe returned an embedded checkout session with no client_secret.');
  }
  return { clientSecret: session.client_secret, sessionId: session.id };
}

/**
 * One-time embedded Checkout probe (Vercel × Stripe guide pattern).
 *
 * Flight Check only — creates a $40 T-shirt-style session and verifies
 * client_secret is returned. No payment is taken and no catalog SKU is needed.
 */
export async function probeEmbeddedCheckoutHealth(
  config?: StripeEnvConfig,
): Promise<{ ok: boolean; status: 'pass' | 'fail' | 'warn'; message: string; sessionId?: string }> {
  const stripe = getStripeFor(config);
  if (!stripe) {
    return { ok: false, status: 'fail', message: 'STRIPE_SECRET_KEY is not set for this tenant.' };
  }

  const publishableKey = (config?.publishableKey ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)?.trim();
  if (!publishableKey) {
    return {
      ok: false,
      status: 'fail',
      message:
        'Publishable key missing — embedded Checkout needs tenant publishableKey or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      redirect_on_completion: 'never',
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Flight Check — Stripe embedded probe (do not pay)' },
            unit_amount: 4000,
          },
          quantity: 1,
        },
      ],
    });

    if (!session.client_secret) {
      return {
        ok: false,
        status: 'fail',
        message: 'Stripe returned an embedded session without client_secret.',
      };
    }

    return {
      ok: true,
      status: 'pass',
      message: `Embedded Checkout API OK — probe session ${session.id} (no charge).`,
      sessionId: session.id,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'fail',
      message: `Embedded Checkout probe failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
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
  config?: StripeEnvConfig,
): Promise<{ applied: 'immediate' | 'scheduled' }> {
  db = await getDb(db);
  const stripe = requireStripeFor(config);

  const { getSubscription } = await import('@/domain/billing/entitlement-service');
  const { classifyPlanChange } = await import('@/lib/billing/stripe-client');

  const current = await getSubscription(orgId, db);
  const linkage = await getStripeLinkage(orgId, db);
  if (!linkage.subscriptionId) {
    throw new Error(
      `Organization ${orgId} has no Stripe subscription to change. Start with checkout instead.`,
    );
  }

  const priceId = getPriceId(planId, interval, config);
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
 * mid-flow, where bouncing to hosted Checkout costs conversions. Credits are
 * granted by `payment_intent.succeeded` (webhook) and/or
 * `confirmTopUpPaymentIntent` (client confirm after Elements succeeds). The
 * confirm path matters when top-ups charge a **tenant** Stripe account whose
 * webhooks never reach this app with a matching signing secret.
 */
export async function createTopUpIntent(
  orgId: string,
  packId: string,
  db?: RawDb,
  stripe?: Stripe,
  options: { purchaserUserId?: string | null } = {},
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
    // The webhook / confirm path reads these to know what to grant and to whom.
    metadata: {
      orgId,
      packId: pack.id,
      kind: 'credit_topup',
      ...(options.purchaserUserId ? { purchaserUserId: options.purchaserUserId } : {}),
    },
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

export interface ConfirmTopUpResult {
  orgId: string;
  packId: string;
  paymentIntentId: string;
  alreadyGranted: boolean;
  balance: {
    available: number;
    expiringSoon: number;
    debt: number;
    net: number;
  };
  baseCredits: number;
  bonusCredits: number;
}

/**
 * After Elements `confirmPayment` succeeds, grant the pack against the billing
 * DB. Idempotent on PaymentIntent id (same as the webhook).
 */
export async function confirmTopUpPaymentIntent(
  orgId: string,
  paymentIntentId: string,
  db?: RawDb,
  stripe?: Stripe,
): Promise<ConfirmTopUpResult> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== 'succeeded') {
    throw new Error(
      `PaymentIntent ${paymentIntentId} is "${intent.status}", not succeeded.`,
    );
  }
  if (intent.metadata?.kind !== 'credit_topup') {
    throw new Error('PaymentIntent is not a credit top-up.');
  }
  const intentOrgId = intent.metadata.orgId?.trim();
  const packId = intent.metadata.packId?.trim();
  if (!intentOrgId || !packId) {
    throw new Error('Top-up PaymentIntent is missing orgId or packId metadata.');
  }
  if (intentOrgId !== orgId) {
    throw new Error('PaymentIntent does not belong to this organization.');
  }

  const { redeemCreditPack, ensureCreditTables } = await import(
    '@/domain/billing/credit-service'
  );
  await ensureCreditTables(db);

  const prior = (await db.$queryRawUnsafe(
    `SELECT id FROM credit_grants
      WHERE org_id = $1 AND metadata->>'paymentRef' = $2
      LIMIT 1;`,
    orgId,
    intent.id,
  )) as { id: string }[];
  const alreadyGranted = prior.length > 0;

  const ownerUserId = intent.metadata?.purchaserUserId?.trim() || null;

  const result = await redeemCreditPack(
    orgId,
    packId,
    { paymentRef: intent.id, ownerUserId },
    db,
  );

  return {
    orgId,
    packId,
    paymentIntentId: intent.id,
    alreadyGranted,
    balance: result.balance,
    baseCredits: result.pack.baseCredits,
    bonusCredits: result.pack.bonusCredits,
  };
}

/**
 * Heal stuck top-ups: list recent succeeded credit_topup PaymentIntents for the
 * org's Stripe customer and redeem any that never minted grants (webhook miss).
 */
export async function reconcileRecentTopUpPayments(
  orgId: string,
  db?: RawDb,
  stripe?: Stripe,
): Promise<{ scanned: number; granted: number }> {
  db = await getDb(db);
  stripe = stripe ?? requireStripe();

  const linkage = await getStripeLinkage(orgId, db);
  if (!linkage.customerId) return { scanned: 0, granted: 0 };

  const listed = await stripe.paymentIntents.list({
    customer: linkage.customerId,
    limit: 25,
  });

  const { redeemCreditPack, ensureCreditTables } = await import(
    '@/domain/billing/credit-service'
  );
  await ensureCreditTables(db);
  let scanned = 0;
  let granted = 0;

  for (const intent of listed.data) {
    if (intent.status !== 'succeeded') continue;
    if (intent.metadata?.kind !== 'credit_topup') continue;
    if (intent.metadata?.orgId !== orgId) continue;
    const packId = intent.metadata.packId?.trim();
    if (!packId) continue;

    scanned += 1;
    const prior = (await db.$queryRawUnsafe(
      `SELECT id FROM credit_grants
        WHERE org_id = $1 AND metadata->>'paymentRef' = $2
        LIMIT 1;`,
      orgId,
      intent.id,
    )) as { id: string }[];
    if (prior.length > 0) continue;

    await redeemCreditPack(orgId, packId, {
      paymentRef: intent.id,
      ownerUserId: intent.metadata?.purchaserUserId?.trim() || null,
    }, db);
    granted += 1;
  }

  return { scanned, granted };
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
  const hasWebhookSecret = Boolean(
    override?.webhookSecret?.trim()?.startsWith('whsec_') || getStripeWebhookSecret(),
  );
  const hasPublishableKey = Boolean((override?.publishableKey ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)?.trim());
  const configuredPrices = listConfiguredPrices(override).length;
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

/**
 * Why a reconcile ended where it did.
 *
 * A code rather than only prose because exactly one outcome is worth showing a
 * customer: `price_unknown` means Stripe holds a subscription this deployment
 * cannot name, which is a misconfiguration that looks from their side like the
 * payment did nothing. The rest are ordinary — an unconfigured Stripe, a Free
 * org with no customer, or simple agreement — and surfacing those as a banner
 * would put a permanent warning on every healthy account.
 */
export type ReconcileCode =
  | 'not_configured'
  | 'no_customer'
  | 'no_subscription'
  | 'price_unknown'
  | 'in_sync'
  | 'repaired';

export interface ReconcileResult {
  code: ReconcileCode;
  /** True when the stored plan or status did not match Stripe and was rewritten. */
  changed: boolean;
  planId: PlanId | null;
  status: 'active' | 'past_due' | 'canceled' | null;
  reason: string;
}

/**
 * Pull the live subscription from Stripe and make the database agree with it.
 *
 * The exception to this module's "webhooks own the write path" rule, and a
 * deliberate one. Webhooks are the *fast* path, not the only one: if
 * STRIPE_WEBHOOK_SECRET is unset, the endpoint is not registered in the Stripe
 * dashboard, or a delivery is dropped, then a customer who has genuinely paid
 * sits on Free forever and nothing in the product ever notices. That is the
 * failure this repairs — it was reported as "the plan I paid for is not
 * reflected in Settings".
 *
 * Safe to run on a read because it is a convergence, not a decision: Stripe is
 * asked what the subscription is and the answer is written down. It grants no
 * credits and charges nothing. `getBalance` mints the monthly allowance for
 * whatever plan it finds, so a repaired plan produces its allowance on the
 * next balance read without this function touching the ledger.
 *
 * A no-op when the org has no Stripe customer, when Stripe is not configured,
 * or when the stored state already matches.
 */
export async function reconcileSubscriptionFromStripe(
  orgId: string,
  db?: RawDb,
  config?: StripeEnvConfig,
): Promise<ReconcileResult> {
  db = await getDb(db);

  const stripe = getStripeFor(config);
  if (!stripe) {
    return {
      code: 'not_configured',
      changed: false,
      planId: null,
      status: null,
      reason: 'Stripe is not configured.',
    };
  }

  const linkage = await getStripeLinkage(orgId, db);
  if (!linkage.customerId) {
    return {
      code: 'no_customer',
      changed: false,
      planId: null,
      status: null,
      reason: 'No Stripe customer for this org.',
    };
  }

  // `status: 'all'` because a canceled subscription is just as much a fact to
  // converge on as an active one — an org whose subscription ended should not
  // keep its paid plan because the deletion webhook was the one that went
  // missing.
  const list = await stripe.subscriptions.list({
    customer: linkage.customerId,
    status: 'all',
    limit: 10,
  });

  // Newest live subscription wins. Stripe keeps canceled ones around forever,
  // so picking `data[0]` blind would resurrect an old plan on an org that has
  // since resubscribed.
  const LIVE: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due', 'unpaid'];
  const subscription =
    list.data.filter((s) => LIVE.includes(s.status)).sort((a, b) => b.created - a.created)[0] ??
    list.data.sort((a, b) => b.created - a.created)[0] ??
    null;

  const { setPlan, getSubscription } = await import('@/domain/billing/entitlement-service');
  const stored = await getSubscription(orgId, db);

  if (!subscription) {
    return {
      code: 'no_subscription',
      changed: false,
      planId: stored.planId as PlanId,
      status: null,
      reason: 'Stripe has no subscription for this customer.',
    };
  }

  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const mapped = priceId ? planForPriceId(priceId, config) : null;
  if (!mapped) {
    // Never guess. An unrecognised price means the STRIPE_PRICE_* variables do
    // not describe the Stripe account being read, and writing *some* plan on
    // that basis would hand out entitlements nobody bought.
    return {
      code: 'price_unknown',
      changed: false,
      planId: stored.planId as PlanId,
      status: null,
      reason:
        `Stripe price ${priceId} is not in the price catalog for this organization — ` +
        `plan left unchanged. Check the STRIPE_PRICE_* values against this Stripe account.`,
    };
  }

  const status: 'active' | 'past_due' | 'canceled' =
    subscription.status === 'active' || subscription.status === 'trialing'
      ? 'active'
      : subscription.status === 'past_due' || subscription.status === 'unpaid'
        ? 'past_due'
        : 'canceled';

  // A canceled subscription falls back to Free, matching what the deletion
  // webhook does — otherwise convergence would only ever work upward.
  const planId: PlanId = status === 'canceled' ? 'free' : mapped.planId;

  const alreadyCorrect =
    stored.planId === planId &&
    stored.status === status &&
    linkage.subscriptionId === subscription.id &&
    linkage.priceId === priceId;

  if (alreadyCorrect) {
    return { code: 'in_sync', changed: false, planId, status, reason: 'Already in sync with Stripe.' };
  }

  await setPlan(orgId, { planId, interval: mapped.interval, status }, db);
  await saveStripeLinkage(
    orgId,
    {
      subscriptionId: subscription.id,
      priceId,
      ...(status === 'past_due' ? {} : { gracePeriodEndsAt: null }),
    },
    db,
  );

  return {
    code: 'repaired',
    changed: true,
    planId,
    status,
    reason: `Repaired from Stripe: ${planId} (${mapped.interval}), status ${status}.`,
  };
}

export interface PriceMismatch {
  planId: PlanId;
  interval: BillingInterval;
  /** What the pricing card shows, in cents. */
  catalogCents: number;
  /** What Stripe will actually charge, in cents. Null when the price is unreadable. */
  stripeCents: number | null;
  currency: string | null;
  message: string;
}

/**
 * Compare every purchasable plan's advertised price against the Stripe price
 * object that would actually be charged.
 *
 * `PlanDef.priceMonthly` is display text. Stripe bills from the price id in
 * STRIPE_PRICE_<PLAN>_<INTERVAL>, and nothing keeps the two in step — so
 * editing the catalog to $199 while the Stripe price is still $99 produces a
 * card that advertises one amount and a checkout that charges another. The
 * customer sees the discrepancy on their statement, not in the product.
 *
 * Returns one entry per disagreement, empty when everything lines up. Callers
 * treat a mismatched plan as unsellable rather than merely warning: showing
 * "Choose" on a plan we know is mispriced is the failure this exists to stop.
 *
 * Recurring prices only. A `unit_amount` of null (tiered or metered pricing)
 * is reported as unreadable rather than assumed correct.
 */
export async function findPriceMismatches(
  config?: StripeEnvConfig,
): Promise<PriceMismatch[]> {
  const stripe = getStripeFor(config);
  if (!stripe) return [];

  const out: PriceMismatch[] = [];

  for (const plan of PLANS) {
    for (const interval of ['monthly', 'yearly'] as const) {
      const priceId = resolvePriceId(plan.id, interval, config);
      if (!priceId) continue;

      const catalogCents = interval === 'yearly' ? plan.priceYearly : plan.priceMonthly;
      if (catalogCents === null) continue;

      let price: Stripe.Price;
      try {
        price = await stripe.prices.retrieve(priceId);
      } catch (err) {
        out.push({
          planId: plan.id,
          interval,
          catalogCents,
          stripeCents: null,
          currency: null,
          message:
            `${plan.label} (${interval}): Stripe price ${priceId} could not be read — ` +
            `${(err as Error).message}`,
        });
        continue;
      }

      // Stripe states a yearly price as the whole-year total; the catalog
      // states it per month. Comparing them raw would flag every yearly plan.
      const perMonth =
        price.unit_amount === null
          ? null
          : price.recurring?.interval === 'year'
            ? Math.round(price.unit_amount / 12)
            : price.unit_amount;

      if (perMonth === null) {
        out.push({
          planId: plan.id,
          interval,
          catalogCents,
          stripeCents: null,
          currency: price.currency ?? null,
          message:
            `${plan.label} (${interval}): Stripe price ${priceId} has no flat unit amount ` +
            `(tiered or metered), so the advertised price cannot be verified.`,
        });
        continue;
      }

      // A cent of slack: yearly is derived by rounding, so an exact match is
      // not always achievable even when the two are in agreement.
      if (Math.abs(perMonth - catalogCents) > 1) {
        out.push({
          planId: plan.id,
          interval,
          catalogCents,
          stripeCents: perMonth,
          currency: price.currency,
          message:
            `${plan.label} (${interval}): the pricing card shows ` +
            `$${(catalogCents / 100).toFixed(2)}/mo but Stripe would charge ` +
            `$${(perMonth / 100).toFixed(2)}/mo. Update the Stripe price object or the plan catalog.`,
        });
      }
    }
  }

  return out;
}
