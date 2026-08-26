/**
 * Stripe Webhook Service — the ONLY writer of billing state from Stripe.
 *
 * Nothing else changes a plan, grants a subscription credit, or starts dunning.
 * The write path into Stripe (stripe-service.ts) deliberately does not apply
 * the change it just requested, even though the API response contains it: if a
 * response is lost, the customer has still paid, and only a webhook-driven
 * design converges on the right state.
 *
 * Idempotency is mandatory, not defensive. Stripe retries on any non-2xx and
 * can deliver the same event more than once even on success. Every handler
 * here is claim-then-process: the event id is inserted first, and a duplicate
 * loses the insert and returns without doing the work. Granting credits twice
 * for one payment is the failure this prevents.
 *
 * ⚠️ Placement: platform root DB.
 */
import type Stripe from 'stripe';
import type { createRawClient } from '@/lib/db';
import { planForPriceId } from '@/lib/billing/stripe-client';
import { getPlan, type PlanId } from '@/lib/billing/plans';

type RawDb = ReturnType<typeof createRawClient>;

async function getDb(db?: RawDb): Promise<RawDb> {
  if (db) return db;
  // Must write to the control-plane billing DB (PLATFORM_POSTGRES_URL on
  // tenant apps). Top-ups are charged on the tenant Stripe account but the
  // balance UI reads the platform DB — granting into the tenant data-plane
  // DB left paid credits invisible.
  const { createBillingRawClient } = await import('@/lib/db');
  return createBillingRawClient();
}

/** Days a past_due subscription keeps its plan before auto-downgrade (§4.4). */
export const DUNNING_GRACE_DAYS = 7;

const STRIPE_EVENTS_DDL = `
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  org_id TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);`;

const STRIPE_EVENTS_TYPE_IDX = `
CREATE INDEX IF NOT EXISTS idx_stripe_events_type_received ON stripe_events (type, received_at);`;

export async function ensureStripeEventTables(db: RawDb): Promise<void> {
  const { ensureStripeColumns } = await import('@/domain/billing/stripe-service');
  await ensureStripeColumns(db);
  await db.$executeRawUnsafe(STRIPE_EVENTS_DDL);
  await db.$executeRawUnsafe(STRIPE_EVENTS_TYPE_IDX);
}

/**
 * Claim an event for processing.
 *
 * Returns false when the row already exists, meaning another delivery of the
 * same event got here first. The insert is the lock — checking for existence
 * and then inserting would leave a window where two concurrent retries both
 * see "not processed" and both grant credits.
 */
async function claimEvent(db: RawDb, event: Stripe.Event): Promise<boolean> {
  const inserted = await db.$executeRawUnsafe(
    `INSERT INTO stripe_events (id, type) VALUES ($1, $2)
     ON CONFLICT (id) DO NOTHING;`,
    event.id,
    event.type,
  );
  return Number(inserted ?? 0) > 0;
}

async function finishEvent(
  db: RawDb,
  eventId: string,
  status: 'processed' | 'failed' | 'ignored',
  orgId: string | null,
  errorMessage?: string,
): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE stripe_events
     SET status = $1, org_id = $2, error_message = $3, processed_at = CURRENT_TIMESTAMP
     WHERE id = $4;`,
    status,
    orgId,
    errorMessage ?? null,
    eventId,
  );
}

/**
 * Release a claimed event so Stripe's retry can pick it up again.
 *
 * Only for genuine transient failures. A permanently-failing event must stay
 * claimed, or every retry re-runs a handler that will never succeed.
 */
async function releaseEvent(db: RawDb, eventId: string): Promise<void> {
  await db.$executeRawUnsafe(`DELETE FROM stripe_events WHERE id = $1;`, eventId);
}

export interface WebhookResult {
  handled: boolean;
  duplicate: boolean;
  eventType: string;
  orgId: string | null;
  message: string;
}

/** Resolve the org for an event, preferring metadata over a customer lookup. */
async function resolveOrgId(
  db: RawDb,
  metadata: Stripe.Metadata | null | undefined,
  customerId: string | null,
): Promise<string | null> {
  const fromMetadata = metadata?.orgId;
  if (typeof fromMetadata === 'string' && fromMetadata) return fromMetadata;
  if (!customerId) return null;
  const { orgIdForCustomer } = await import('@/domain/billing/stripe-service');
  return orgIdForCustomer(customerId, db);
}

function customerIdOf(value: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

/**
 * Process one verified Stripe event.
 *
 * Never throws for "I do not handle this type" — an unhandled event is ACKed
 * and recorded as ignored, because a non-2xx would put Stripe into a retry loop
 * over an event we will never care about.
 */
export async function processStripeEvent(
  event: Stripe.Event,
  db?: RawDb,
): Promise<WebhookResult> {
  db = await getDb(db);
  await ensureStripeEventTables(db);

  const claimed = await claimEvent(db, event);
  if (!claimed) {
    return {
      handled: false,
      duplicate: true,
      eventType: event.type,
      orgId: null,
      message: `Event ${event.id} already processed — ignoring duplicate delivery.`,
    };
  }

  try {
    const result = await route(event, db);
    await finishEvent(db, event.id, result.handled ? 'processed' : 'ignored', result.orgId);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Un-claim so Stripe's retry gets a real second attempt. The event is
    // re-recorded from scratch next time round.
    await releaseEvent(db, event.id);
    throw new Error(`Stripe event ${event.id} (${event.type}) failed: ${message}`);
  }
}

async function route(event: Stripe.Event, db: RawDb): Promise<WebhookResult> {
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutCompleted(event.data.object, db);
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event.data.object, db);
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event.data.object, db);
    case 'invoice.paid':
      return handleInvoicePaid(event.data.object, db);
    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(event.data.object, db);
    case 'payment_intent.succeeded':
      return handlePaymentIntentSucceeded(event.data.object, db);
    case 'v2.commerce.product_catalog.import.succeeded':
    case 'v2.commerce.product_catalog.import.completed':
      return handleCatalogImportSucceeded(event, db);
    case 'v2.commerce.product_catalog.import.failed':
      return handleCatalogImportFailed(event, db);
    default:
      return {
        handled: false,
        duplicate: false,
        eventType: event.type,
        orgId: null,
        message: `No handler for ${event.type}.`,
      };
  }
}

/**
 * Checkout finished. Records the linkage only.
 *
 * The plan itself is applied by customer.subscription.created/updated, which
 * Stripe also sends. Applying it here as well would mean two code paths writing
 * the same state with no ordering guarantee between them.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  db: RawDb,
): Promise<WebhookResult> {
  const customerId = customerIdOf(session.customer);
  const orgId =
    session.client_reference_id ?? (await resolveOrgId(db, session.metadata, customerId));

  if (!orgId) {
    return {
      handled: false,
      duplicate: false,
      eventType: 'checkout.session.completed',
      orgId: null,
      message: 'Checkout completed but no org could be resolved — linkage not recorded.',
    };
  }

  // One-time credit top-up (PaymentElement fallback or agentic checkout).
  if (session.mode === 'payment' && session.metadata?.kind === 'credit_topup') {
    const packId = session.metadata.packId;
    if (packId) {
      const { redeemCreditPack } = await import('@/domain/billing/credit-service');
      const ownerUserId = session.metadata?.purchaserUserId?.trim() || null;
      const result = await redeemCreditPack(orgId, packId, {
        paymentRef: session.id,
        ownerUserId,
      }, db);
      return {
        handled: true,
        duplicate: false,
        eventType: 'checkout.session.completed',
        orgId,
        message:
          `Redeemed ${packId} via checkout for org ${orgId}: ${result.baseGrant.amount} purchased` +
          `${result.bonusGrant ? ` + ${result.bonusGrant.amount} bonus` : ''}.`,
      };
    }
  }

  // Agentic checkout may identify the pack by SKU on line items.
  if (session.mode === 'payment') {
    const { resolveTenantAgenticCommerce, resolvePackIdFromCheckoutMetadata } = await import(
      '@/domain/billing/agentic-catalog-service'
    );
    const agentic = await resolveTenantAgenticCommerce(orgId, db);
    const lineSkus: string[] = [];
    if (session.metadata?.sku) lineSkus.push(session.metadata.sku);
    const packId = resolvePackIdFromCheckoutMetadata(
      session.metadata as Record<string, string> | undefined,
      lineSkus,
      agentic.config?.skuByPackId,
    );
    if (packId) {
      const { redeemCreditPack } = await import('@/domain/billing/credit-service');
      const ownerUserId = session.metadata?.purchaserUserId?.trim() || null;
      const result = await redeemCreditPack(orgId, packId, {
        paymentRef: session.id,
        ownerUserId,
      }, db);
      return {
        handled: true,
        duplicate: false,
        eventType: 'checkout.session.completed',
        orgId,
        message:
          `Redeemed ${packId} (SKU checkout) for org ${orgId}: ${result.baseGrant.amount} purchased` +
          `${result.bonusGrant ? ` + ${result.bonusGrant.amount} bonus` : ''}.`,
      };
    }
  }

  if (session.mode !== 'subscription') {
    return {
      handled: true,
      duplicate: false,
      eventType: 'checkout.session.completed',
      orgId,
      message: `Checkout session ${session.id} completed (mode ${session.mode}) — no subscription linkage.`,
    };
  }

  const { saveStripeLinkage } = await import('@/domain/billing/stripe-service');
  await saveStripeLinkage(
    orgId,
    {
      customerId,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
    },
    db,
  );

  return {
    handled: true,
    duplicate: false,
    eventType: 'checkout.session.completed',
    orgId,
    message: `Linked org ${orgId} to Stripe customer ${customerId}.`,
  };
}

/**
 * The subscription changed — apply the plan.
 *
 * This is the authoritative plan-change handler for upgrades, downgrades taking
 * effect at the boundary, and status transitions. The plan is read from the
 * price on the subscription rather than from metadata: metadata is what we
 * asked for, the price is what Stripe is actually billing.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  db: RawDb,
): Promise<WebhookResult> {
  const customerId = customerIdOf(subscription.customer);
  const orgId = await resolveOrgId(db, subscription.metadata, customerId);
  if (!orgId) {
    return {
      handled: false,
      duplicate: false,
      eventType: 'customer.subscription.updated',
      orgId: null,
      message: `No org for Stripe customer ${customerId}.`,
    };
  }

  const item = subscription.items.data[0];
  const priceId = item?.price?.id ?? null;
  const mapped = priceId ? planForPriceId(priceId) : null;

  if (!mapped) {
    return {
      handled: false,
      duplicate: false,
      eventType: 'customer.subscription.updated',
      orgId,
      message:
        `Price ${priceId} is not in this deployment's price catalog — plan left unchanged. ` +
        `This usually means the STRIPE_PRICE_* env vars do not match the Stripe account.`,
    };
  }

  const status = mapSubscriptionStatus(subscription.status);
  const { setPlan, getSubscription: getSub } = await import('@/domain/billing/entitlement-service');
  const { saveStripeLinkage } = await import('@/domain/billing/stripe-service');
  const subBefore = await getSub(orgId, db);
  await setPlan(orgId, { planId: mapped.planId, interval: mapped.interval, status }, db);
  await saveStripeLinkage(
    orgId,
    {
      customerId,
      subscriptionId: subscription.id,
      priceId,
      // Reaching the boundary applies the pending downgrade, so the marker has
      // done its job and must be cleared or the UI keeps promising a change
      // that already happened.
      pendingPlanId: null,
      // Any non-past_due update means billing recovered.
      ...(status === 'past_due' ? {} : { gracePeriodEndsAt: null }),
    },
    db,
  );

  let syncNote = '';
  const planOrIntervalChanged =
    subBefore.planId !== mapped.planId || subBefore.interval !== mapped.interval;
  if (planOrIntervalChanged && status !== 'canceled') {
    const { syncCurrentPeriodPlanAllowance } = await import('@/domain/billing/credit-service');
    const sync = await syncCurrentPeriodPlanAllowance(orgId, db);
    if (sync.action === 'topped_up' || sync.action === 'granted') {
      syncNote = ` Allowance sync: +${sync.delta} credits (${sync.action}).`;
    }
  }

  return {
    handled: true,
    duplicate: false,
    eventType: 'customer.subscription.updated',
    orgId,
    message: `Org ${orgId} set to ${mapped.planId} (${mapped.interval}), status ${status}.${syncNote}`,
  };
}

/** Subscription ended — fall back to Free and drop paid-plan surfaces. */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  db: RawDb,
): Promise<WebhookResult> {
  const customerId = customerIdOf(subscription.customer);
  const orgId = await resolveOrgId(db, subscription.metadata, customerId);
  if (!orgId) {
    return {
      handled: false,
      duplicate: false,
      eventType: 'customer.subscription.deleted',
      orgId: null,
      message: `No org for Stripe customer ${customerId}.`,
    };
  }

  await downgradeToFree(orgId, db, 'subscription_deleted');

  return {
    handled: true,
    duplicate: false,
    eventType: 'customer.subscription.deleted',
    orgId,
    message: `Org ${orgId} downgraded to Free after subscription deletion.`,
  };
}

/**
 * An invoice was paid — issue the period's AI credits.
 *
 * Credits follow money, never the other way round: this is the only place a
 * subscription credit grant is created, so a failed or disputed payment cannot
 * leave the customer holding credits they did not buy.
 *
 * The grant is idempotent through the event claim above, not through the
 * allowance check — `grantMonthlyAllowanceIfDue` guards the period, but a
 * proration invoice inside the same period must still grant.
 */
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  db: RawDb,
): Promise<WebhookResult> {
  const customerId = customerIdOf(invoice.customer);
  const orgId = await resolveOrgId(db, invoice.metadata, customerId);
  if (!orgId) {
    return {
      handled: false,
      duplicate: false,
      eventType: 'invoice.paid',
      orgId: null,
      message: `No org for Stripe customer ${customerId}.`,
    };
  }

  const priceId = invoice.lines?.data?.[0]?.pricing?.price_details?.price ?? null;
  const mapped = typeof priceId === 'string' ? planForPriceId(priceId) : null;
  const { getSubscription } = await import('@/domain/billing/entitlement-service');
  const current = await getSubscription(orgId, db);
  const planId: PlanId = mapped?.planId ?? current.planId;
  const interval = mapped?.interval ?? current.interval;
  const plan = getPlan(planId);
  const { resolvePlanAiCredits } = await import('@/domain/billing/org-rate-card-service');
  const creditAllowance = await resolvePlanAiCredits(
    orgId,
    planId,
    plan.aiCreditsPerMonth,
    db,
    interval,
  );

  const { saveStripeLinkage } = await import('@/domain/billing/stripe-service');
  await saveStripeLinkage(orgId, { gracePeriodEndsAt: null }, db);

  const { clearDunningOnPaid } = await import('@/domain/billing/dunning-service');
  await clearDunningOnPaid(orgId, db);

  const { setPlan, getSubscription: getSub } = await import('@/domain/billing/entitlement-service');
  if (current.status === 'past_due') {
    await setPlan(orgId, { planId: current.planId, status: 'active' }, db);
  }

  if (creditAllowance <= 0) {
    return {
      handled: true,
      duplicate: false,
      eventType: 'invoice.paid',
      orgId,
      message: `Invoice paid for ${planId}, which carries no credit allowance.`,
    };
  }

  const { grantMonthlyAllowanceIfDue, syncCurrentPeriodPlanAllowance } = await import(
    '@/domain/billing/credit-service',
  );

  // Proration invoices (plan/interval changes mid-period) top up the existing
  // grant to the new target — they must not mint a second full allowance.
  if (invoice.billing_reason === 'subscription_update') {
    const sync = await syncCurrentPeriodPlanAllowance(orgId, db);
    return {
      handled: true,
      duplicate: false,
      eventType: 'invoice.paid',
      orgId,
      message: `Synced plan allowance after proration invoice ${invoice.id}: ${sync.action}, delta ${sync.delta}.`,
    };
  }

  const grant = await grantMonthlyAllowanceIfDue(orgId, db);
  if (!grant) {
    return {
      handled: true,
      duplicate: false,
      eventType: 'invoice.paid',
      orgId,
      message: `Invoice ${invoice.id} paid; plan allowance already issued for this period.`,
    };
  }

  return {
    handled: true,
    duplicate: false,
    eventType: 'invoice.paid',
    orgId,
    message: `Granted ${grant.amount} credits to org ${orgId} for a paid ${planId} (${interval}) invoice.`,
  };
}

/**
 * Payment failed — start the 7-day grace window (§4.4).
 *
 * The plan is deliberately NOT dropped here. Cutting a paying customer off on
 * the first failed charge punishes an expired card; the grace period is what
 * makes recovery the normal outcome. Expiry is enforced by
 * `enforceDunningDowngrades()`, not by this handler.
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  db: RawDb,
): Promise<WebhookResult> {
  const customerId = customerIdOf(invoice.customer);
  const orgId = await resolveOrgId(db, invoice.metadata, customerId);
  if (!orgId) {
    return {
      handled: false,
      duplicate: false,
      eventType: 'invoice.payment_failed',
      orgId: null,
      message: `No org for Stripe customer ${customerId}.`,
    };
  }

  const { getStripeLinkage, saveStripeLinkage } = await import('@/domain/billing/stripe-service');
  const linkage = await getStripeLinkage(orgId, db);

  // Do not restart the clock on a repeat failure — Stripe retries a failing
  // invoice several times, and each retry would otherwise buy another 7 days.
  const graceEnds =
    linkage.gracePeriodEndsAt ??
    new Date(Date.now() + DUNNING_GRACE_DAYS * 86_400_000).toISOString();

  const { setPlan } = await import('@/domain/billing/entitlement-service');
  const { getSubscription } = await import('@/domain/billing/entitlement-service');
  const current = await getSubscription(orgId, db);
  await setPlan(orgId, { planId: current.planId, status: 'past_due' }, db);
  await saveStripeLinkage(orgId, { gracePeriodEndsAt: new Date(graceEnds) }, db);

  const { recordPaymentFailure } = await import('@/domain/billing/dunning-service');
  const dunning = await recordPaymentFailure(
    orgId,
    { stripeInvoiceId: typeof invoice.id === 'string' ? invoice.id : null },
    db,
  );

  if (dunning.shouldDisableDefaultPm) {
    try {
      const { getStripe } = await import('@/lib/billing/stripe-client');
      const stripe = getStripe();
      if (stripe && customerId) {
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: '' },
        });
      }
    } catch (err) {
      console.error(`[dunning] Failed to clear default payment method for org ${orgId}:`, err);
    }
  }

  return {
    handled: true,
    duplicate: false,
    eventType: 'invoice.payment_failed',
    orgId,
    message:
      `Org ${orgId} marked past_due; grace period ends ${graceEnds}; ` +
      `attempts ${dunning.state.attemptCount}; notices ${dunning.state.noticeCount}` +
      (dunning.shouldDisableDefaultPm ? '; default PM disabled' : ''),
  };
}

/** A one-off payment succeeded — grant legacy PaymentIntent top-up packs. */
async function handlePaymentIntentSucceeded(
  intent: Stripe.PaymentIntent,
  db: RawDb,
): Promise<WebhookResult> {
  if (intent.metadata?.kind !== 'credit_topup') {
    return {
      handled: false,
      duplicate: false,
      eventType: 'payment_intent.succeeded',
      orgId: null,
      message: 'Payment intent is not a credit top-up.',
    };
  }

  const orgId = intent.metadata.orgId;
  const packId = intent.metadata.packId;
  if (!orgId || !packId) {
    return {
      handled: false,
      duplicate: false,
      eventType: 'payment_intent.succeeded',
      orgId: null,
      message: 'Top-up intent is missing orgId or packId metadata.',
    };
  }

  const { redeemCreditPack } = await import('@/domain/billing/credit-service');
  const ownerUserId = intent.metadata?.purchaserUserId?.trim() || null;
  const result = await redeemCreditPack(orgId, packId, {
    paymentRef: intent.id,
    ownerUserId,
  }, db);

  return {
    handled: true,
    duplicate: false,
    eventType: 'payment_intent.succeeded',
    orgId,
    message:
      `Redeemed ${packId} for org ${orgId}: ${result.baseGrant.amount} purchased` +
      `${result.bonusGrant ? ` + ${result.bonusGrant.amount} bonus` : ''}.`,
  };
}

async function handleCatalogImportSucceeded(
  event: Stripe.Event,
  db: RawDb,
): Promise<WebhookResult> {
  const payload = event.data.object as { id?: string; feed_type?: string; metadata?: Record<string, string> };
  const importId = payload.id ?? event.id;
  const feedType = payload.feed_type;
  const tenantSlug = payload.metadata?.tenant_slug;

  if (tenantSlug && (feedType === 'product' || feedType === 'pricing' || feedType === 'inventory')) {
    const { markCatalogImportComplete } = await import('@/domain/billing/agentic-catalog-service');
    await markCatalogImportComplete(tenantSlug, feedType, importId, db);
  }

  return {
    handled: true,
    duplicate: false,
    eventType: event.type,
    orgId: null,
    message: `Catalog import ${importId} succeeded${feedType ? ` (${feedType})` : ''}.`,
  };
}

async function handleCatalogImportFailed(
  event: Stripe.Event,
  _db: RawDb,
): Promise<WebhookResult> {
  const payload = event.data.object as { id?: string; feed_type?: string; error?: { message?: string } };
  return {
    handled: true,
    duplicate: false,
    eventType: event.type,
    orgId: null,
    message:
      `Catalog import ${payload.id ?? event.id} failed` +
      `${payload.feed_type ? ` (${payload.feed_type})` : ''}: ${payload.error?.message ?? 'unknown error'}.`,
  };
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case 'active':
      return 'active' as const;
    case 'trialing':
      return 'trialing' as const;
    case 'past_due':
    case 'unpaid':
      return 'past_due' as const;
    default:
      return 'canceled' as const;
  }
}

/**
 * Drop an org to Free and tear down the surfaces its paid plan bought.
 *
 * Custom domains are disconnected here because leaving them attached is the
 * one consequence of non-payment that keeps costing us money and keeps
 * delivering value to a customer who stopped paying.
 */
async function downgradeToFree(orgId: string, db: RawDb, reason: string): Promise<void> {
  const { setPlan } = await import('@/domain/billing/entitlement-service');
  const { saveStripeLinkage } = await import('@/domain/billing/stripe-service');

  await setPlan(orgId, { planId: 'free', status: 'canceled' }, db);
  await saveStripeLinkage(
    orgId,
    { subscriptionId: null, priceId: null, gracePeriodEndsAt: null, pendingPlanId: null },
    db,
  );

  await disconnectCustomDomains(orgId, db);

  console.log(`[stripe-webhook] Org ${orgId} downgraded to Free (${reason}).`);
}

/**
 * Detach custom domains from every project this org owns.
 *
 * Runs on downgrade because a custom domain is a paid-plan feature that keeps
 * costing us and keeps delivering value after payment stops — it is the one
 * consequence of non-payment that does not resolve itself.
 *
 * Never throws. A Vercel API failure must not abort the downgrade: the plan
 * change is the part that has to land, and a stranded domain is recoverable by
 * re-running the dunning cron. The `.vercel.app` subdomain is left in place so
 * the customer's site stays up on the free tier rather than going dark.
 */
async function disconnectCustomDomains(
  orgId: string,
  db: RawDb,
): Promise<{ removed: string[] }> {
  const removed: string[] = [];
  try {
    const projects = (await db.$queryRawUnsafe(
      `SELECT slug, vercel_project_id FROM tenants
       WHERE organization_id = $1 AND vercel_project_id IS NOT NULL;`,
      orgId,
    )) as Record<string, unknown>[];

    if (projects.length === 0) return { removed };

    const { removeCustomDomains } = await import('@/domain/tenant/vercel-deploy-service');
    for (const row of projects) {
      const projectId = String(row.vercel_project_id);
      const result = await removeCustomDomains(projectId);
      removed.push(...result.removed);
      if (result.failed.length > 0) {
        console.warn(
          `[stripe-webhook] Could not detach ${result.failed.join(', ')} from tenant ` +
            `${row.slug}; the next dunning run will retry.`,
        );
      }
    }

    if (removed.length > 0) {
      console.log(
        `[stripe-webhook] Detached ${removed.length} custom domain(s) from org ${orgId}: ${removed.join(', ')}`,
      );
    }
  } catch (err) {
    console.error(
      `[stripe-webhook] Domain disconnection failed for org ${orgId} (plan change still applied):`,
      err instanceof Error ? err.message : err,
    );
  }
  return { removed };
}

/**
 * Apply expired grace periods — the enforcement half of dunning.
 *
 * Separate from the webhook handlers because the trigger is the passage of
 * time, not a Stripe event: nothing arrives on the day a grace period lapses.
 * Call from a cron or on billing reads.
 */
export async function enforceDunningDowngrades(
  db?: RawDb,
): Promise<{ downgraded: string[] }> {
  db = await getDb(db);
  await ensureStripeEventTables(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT org_id FROM subscriptions
     WHERE status = 'past_due'
       AND grace_period_ends_at IS NOT NULL
       AND grace_period_ends_at <= CURRENT_TIMESTAMP;`,
  )) as Record<string, unknown>[];

  const downgraded: string[] = [];
  for (const row of rows) {
    const orgId = String(row.org_id);
    await downgradeToFree(orgId, db, 'dunning_grace_expired');
    downgraded.push(orgId);
  }

  return { downgraded };
}
