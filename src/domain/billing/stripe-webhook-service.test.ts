import { describe, expect, it, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

/**
 * Fake platform DB covering just the tables the webhook path touches.
 *
 * `stripe_events` is modelled with a real unique-key check because that INSERT
 * *is* the idempotency lock — a double-grant bug would show up here and nowhere
 * else.
 */
function makeDb() {
  const events = new Map<string, { type: string; status: string; orgId: string | null }>();
  const linkage: Record<string, Record<string, unknown>> = {};
  const planCalls: Array<{ orgId: string; planId: string; status?: string }> = [];
  const grants: Array<{ orgId: string; amount: number; source: string }> = [];

  const db = {
    events,
    linkage,
    planCalls,
    grants,
    $executeRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('INSERT INTO stripe_events')) {
        const id = args[0] as string;
        if (events.has(id)) return 0; // ON CONFLICT DO NOTHING
        events.set(id, { type: args[1] as string, status: 'processing', orgId: null });
        return 1;
      }
      if (sql.includes('UPDATE stripe_events')) {
        const row = events.get(args[3] as string);
        if (row) {
          row.status = args[0] as string;
          row.orgId = (args[1] as string) ?? null;
        }
        return 1;
      }
      if (sql.includes('DELETE FROM stripe_events')) {
        events.delete(args[0] as string);
        return 1;
      }
      if (sql.includes('UPDATE subscriptions SET')) {
        const orgId = args[args.length - 1] as string;
        linkage[orgId] = { ...(linkage[orgId] ?? {}), lastUpdate: args.slice(0, -1) };
        return 1;
      }
      return 0;
    }),
    $queryRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('FROM subscriptions WHERE stripe_customer_id')) {
        // Every fixture customer maps to the same org.
        return args[0] === 'cus_known' ? [{ org_id: 'org_known' }] : [];
      }
      if (sql.includes('SELECT stripe_customer_id')) {
        return [{ stripe_customer_id: 'cus_known', stripe_subscription_id: 'sub_1' }];
      }
      return [];
    }),
  };

  // The service takes a PrismaClient; this double implements only the two raw
  // methods it actually calls. Cast at the boundary rather than stubbing 40
  // unused Prisma members.
  return db as unknown as Parameters<
    typeof import('./stripe-webhook-service').processStripeEvent
  >[1] &
    typeof db;
}

const setPlan = vi.fn(async (orgId: string, input: { planId: string; status?: string }) => {
  db.planCalls.push({ orgId, planId: input.planId, status: input.status });
});
const grantCredits = vi.fn(async (orgId: string, input: { amount: number; source: string }) => {
  db.grants.push({ orgId, amount: input.amount, source: input.source });
  return { id: 'g1' };
});
const redeemCreditPack = vi.fn(async (orgId: string) => {
  db.grants.push({ orgId, amount: 50, source: 'addon' });
  return { baseGrant: { amount: 50 }, bonusGrant: { amount: 100 } };
});
const creditCloudBalance = vi.fn(async (orgId: string, cents: number) => {
  db.grants.push({ orgId, amount: cents, source: 'cloud_topup' });
  return { balanceCents: cents, alreadyCredited: false };
});

vi.mock('@/domain/billing/entitlement-service', () => ({
  ensureBillingTables: vi.fn(async () => {}),
  setPlan: (...args: Parameters<typeof setPlan>) => setPlan(...args),
  getSubscription: vi.fn(async () => ({
    planId: 'pro',
    status: 'active',
    interval: 'monthly',
  })),
}));

vi.mock('@/domain/billing/credit-service', () => ({
  grantCredits: (...args: Parameters<typeof grantCredits>) => grantCredits(...args),
  grantMonthlyAllowanceIfDue: vi.fn(async () => ({ id: 'g1', amount: 52800 })),
  syncCurrentPeriodPlanAllowance: vi.fn(async () => ({
    action: 'topped_up' as const,
    targetCredits: 60720,
    delta: 7920,
    planId: 'pro',
    grantId: 'g1',
  })),
  redeemCreditPack: (...args: Parameters<typeof redeemCreditPack>) => redeemCreditPack(...args),
}));

vi.mock('@/domain/billing/cloud-balance-service', () => ({
  creditCloudBalance: (...args: Parameters<typeof creditCloudBalance>) =>
    creditCloudBalance(...args),
}));

vi.mock('@/domain/billing/dunning-service', () => ({
  clearDunningOnPaid: vi.fn(async () => {}),
  recordPaymentFailure: vi.fn(async () => ({
    state: { attemptCount: 1, noticeCount: 0 },
    shouldDisableDefaultPm: false,
  })),
}));

vi.mock('@/domain/billing/stripe-service', () => ({
  ensureStripeColumns: vi.fn(async () => {}),
  saveStripeLinkage: vi.fn(async () => {}),
  getStripeLinkage: vi.fn(async () => ({ gracePeriodEndsAt: null })),
  orgIdForCustomer: vi.fn(async (customerId: string) =>
    customerId === 'cus_known' ? 'org_known' : null,
  ),
}));

let db: ReturnType<typeof makeDb>;
let service: typeof import('./stripe-webhook-service');

beforeEach(async () => {
  db = makeDb();
  setPlan.mockClear();
  grantCredits.mockClear();
  redeemCreditPack.mockClear();
  creditCloudBalance.mockClear();
  creditCloudBalance.mockImplementation(async (orgId: string, cents: number) => {
    db.grants.push({ orgId, amount: cents, source: 'cloud_topup' });
    return { balanceCents: cents, alreadyCredited: false };
  });
  service = await import('./stripe-webhook-service');
  process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly';
});

function event(type: string, object: unknown, id = `evt_${Math.random()}`): Stripe.Event {
  return { id, type, data: { object } } as unknown as Stripe.Event;
}

describe('idempotency', () => {
  it('processes an event once and skips every redelivery', async () => {
    const evt = event(
      'payment_intent.succeeded',
      { id: 'pi_1', metadata: { kind: 'credit_topup', orgId: 'org_known', packId: 'pack-25' } },
      'evt_dup',
    );

    const first = await service.processStripeEvent(evt, db);
    const second = await service.processStripeEvent(evt, db);
    const third = await service.processStripeEvent(evt, db);

    expect(first.handled).toBe(true);
    expect(second.duplicate).toBe(true);
    expect(third.duplicate).toBe(true);
    // The whole point: Stripe retries, and the customer must not be granted
    // three packs for one payment.
    expect(redeemCreditPack).toHaveBeenCalledTimes(1);
  });

  it('un-claims the event when a handler throws so the retry can work', async () => {
    redeemCreditPack.mockRejectedValueOnce(new Error('database unavailable'));
    const evt = event(
      'payment_intent.succeeded',
      { id: 'pi_2', metadata: { kind: 'credit_topup', orgId: 'org_known', packId: 'pack-25' } },
      'evt_transient',
    );

    await expect(service.processStripeEvent(evt, db)).rejects.toThrow(/database unavailable/);
    // Left claimed, Stripe's retry would be dropped as a duplicate and the
    // customer would never receive credits they paid for.
    expect(db.events.has('evt_transient')).toBe(false);

    const retry = await service.processStripeEvent(evt, db);
    expect(retry.handled).toBe(true);
    expect(retry.duplicate).toBe(false);
  });

  it('records an unhandled event type instead of retrying forever', async () => {
    const result = await service.processStripeEvent(event('customer.created', { id: 'cus_x' }), db);
    expect(result.handled).toBe(false);
    expect(result.duplicate).toBe(false);
  });
});

describe('subscription events', () => {
  it('applies the plan from the price Stripe is billing', async () => {
    const result = await service.processStripeEvent(
      event('customer.subscription.updated', {
        id: 'sub_1',
        customer: 'cus_known',
        status: 'active',
        metadata: {},
        items: { data: [{ price: { id: 'price_pro_monthly' } }] },
      }),
      db,
    );

    expect(result.handled).toBe(true);
    expect(setPlan).toHaveBeenCalledWith(
      'org_known',
      expect.objectContaining({ planId: 'pro', status: 'active' }),
      expect.anything(),
    );
  });

  it('leaves the plan alone when the price is unknown to this deployment', async () => {
    // A price from a different Stripe account means the env is wrong. Guessing
    // a plan here would put a customer on a tier nobody sold them.
    const result = await service.processStripeEvent(
      event('customer.subscription.updated', {
        id: 'sub_2',
        customer: 'cus_known',
        status: 'active',
        metadata: {},
        items: { data: [{ price: { id: 'price_from_elsewhere' } }] },
      }),
      db,
    );

    expect(result.handled).toBe(false);
    expect(result.message).toMatch(/price catalog/i);
    expect(setPlan).not.toHaveBeenCalled();
  });

  it('maps unpaid to past_due rather than cancelling immediately', async () => {
    await service.processStripeEvent(
      event('customer.subscription.updated', {
        id: 'sub_3',
        customer: 'cus_known',
        status: 'unpaid',
        metadata: {},
        items: { data: [{ price: { id: 'price_pro_monthly' } }] },
      }),
      db,
    );

    expect(setPlan).toHaveBeenCalledWith(
      'org_known',
      expect.objectContaining({ status: 'past_due' }),
      expect.anything(),
    );
  });

  it('drops to Free when the subscription is deleted', async () => {
    await service.processStripeEvent(
      event('customer.subscription.deleted', {
        id: 'sub_4',
        customer: 'cus_known',
        metadata: {},
        items: { data: [] },
      }),
      db,
    );

    expect(setPlan).toHaveBeenCalledWith(
      'org_known',
      expect.objectContaining({ planId: 'free', status: 'canceled' }),
      expect.anything(),
    );
  });

  it('does nothing for a customer it cannot map to an org', async () => {
    const result = await service.processStripeEvent(
      event('customer.subscription.updated', {
        id: 'sub_5',
        customer: 'cus_unknown',
        status: 'active',
        metadata: {},
        items: { data: [{ price: { id: 'price_pro_monthly' } }] },
      }),
      db,
    );

    expect(result.handled).toBe(false);
    expect(setPlan).not.toHaveBeenCalled();
  });
});

describe('invoice events', () => {
  it('grants the period allowance only when the invoice is actually paid', async () => {
    const { grantMonthlyAllowanceIfDue } = await import('@/domain/billing/credit-service');

    await service.processStripeEvent(
      event('invoice.paid', {
        id: 'in_1',
        customer: 'cus_known',
        metadata: {},
        billing_reason: 'subscription_cycle',
        lines: { data: [{ pricing: { price_details: { price: 'price_pro_monthly' } } }] },
      }),
      db,
    );

    expect(grantMonthlyAllowanceIfDue).toHaveBeenCalledTimes(1);
    expect(grantCredits).not.toHaveBeenCalled();
  });

  it('syncs allowance on proration invoices instead of minting a second full grant', async () => {
    const { syncCurrentPeriodPlanAllowance } = await import('@/domain/billing/credit-service');

    await service.processStripeEvent(
      event('invoice.paid', {
        id: 'in_proration',
        customer: 'cus_known',
        metadata: {},
        billing_reason: 'subscription_update',
        lines: { data: [{ pricing: { price_details: { price: 'price_pro_yearly' } } }] },
      }),
      db,
    );

    expect(syncCurrentPeriodPlanAllowance).toHaveBeenCalledTimes(1);
    expect(grantCredits).not.toHaveBeenCalled();
  });

  it('marks past_due on failure without dropping the plan', async () => {
    // Cutting a customer off on the first failed charge punishes an expired
    // card; the grace period is what makes recovery the normal outcome.
    await service.processStripeEvent(
      event('invoice.payment_failed', {
        id: 'in_2',
        customer: 'cus_known',
        metadata: {},
        lines: { data: [] },
      }),
      db,
    );

    expect(setPlan).toHaveBeenCalledWith(
      'org_known',
      expect.objectContaining({ planId: 'pro', status: 'past_due' }),
      expect.anything(),
    );
    expect(grantCredits).not.toHaveBeenCalled();
  });
});

describe('checkout.session.completed credit top-up', () => {
  it('redeems the pack for agentic/payment checkout sessions', async () => {
    const result = await service.processStripeEvent(
      event('checkout.session.completed', {
        id: 'cs_topup',
        mode: 'payment',
        client_reference_id: 'org_known',
        customer: 'cus_known',
        metadata: { kind: 'credit_topup', orgId: 'org_known', packId: 'pack-50' },
      }),
      db,
    );

    expect(result.handled).toBe(true);
    expect(redeemCreditPack).toHaveBeenCalledWith(
      'org_known',
      'pack-50',
      expect.objectContaining({ paymentRef: 'cs_topup' }),
      db,
    );
  });
});

describe('cloud_topup', () => {
  it('credits cloud balance from checkout.session.completed', async () => {
    const result = await service.processStripeEvent(
      event('checkout.session.completed', {
        id: 'cs_cloud',
        mode: 'payment',
        client_reference_id: 'org_known',
        customer: 'cus_known',
        metadata: { kind: 'cloud_topup', orgId: 'org_known', amountCents: '5000' },
      }),
      db,
    );

    expect(result.handled).toBe(true);
    expect(creditCloudBalance).toHaveBeenCalledWith('org_known', 5000, 'cs_cloud', db);
  });

  it('credits cloud balance from payment_intent.succeeded (auto top-up)', async () => {
    const result = await service.processStripeEvent(
      event('payment_intent.succeeded', {
        id: 'pi_cloud_auto',
        amount: 2500,
        metadata: {
          kind: 'cloud_topup',
          orgId: 'org_known',
          amountCents: '2500',
          source: 'auto',
        },
      }),
      db,
    );

    expect(result.handled).toBe(true);
    expect(creditCloudBalance).toHaveBeenCalledWith('org_known', 2500, 'pi_cloud_auto', db);
  });
});
