import { describe, expect, it, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

/**
 * `reconcileSubscriptionFromStripe` — the safety net for a purchase whose
 * webhook never arrived.
 *
 * The cases that matter are the ones where it must NOT write: an unrecognised
 * price would otherwise hand out entitlements nobody bought, and a stale
 * canceled subscription would resurrect a plan the customer already left.
 */

const setPlan = vi.fn(async () => ({}));
const getSubscription = vi.fn(async () => ({ planId: 'free', status: 'active' }));

vi.mock('@/domain/billing/entitlement-service', () => ({
  ensureBillingTables: vi.fn(async () => {}),
  setPlan: (...args: unknown[]) => setPlan(...(args as [])),
  getSubscription: (...args: unknown[]) => getSubscription(...(args as [])),
}));

let subscriptionList: Partial<Stripe.Subscription>[] = [];
const listSubscriptions = vi.fn(async () => ({ data: subscriptionList }));

vi.mock('@/lib/billing/stripe-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/billing/stripe-client')>();
  return {
    ...actual,
    getStripeFor: () => ({ subscriptions: { list: listSubscriptions } }),
  };
});

/**
 * Only the linkage read matters here. The linkage WRITE is left real — it goes
 * through `$executeRawUnsafe`, which this double swallows — so a reconcile that
 * tried to write a malformed UPDATE would still surface rather than being
 * hidden behind a stub.
 */
function makeDb(linkage: Record<string, unknown>) {
  return {
    $executeRawUnsafe: vi.fn(async () => 0),
    $queryRawUnsafe: vi.fn(async (sql: string) =>
      sql.includes('SELECT stripe_customer_id') ? [linkage] : [],
    ),
  } as never;
}

function sub(over: Partial<Stripe.Subscription> & { priceId?: string }) {
  const { priceId = 'price_pro_monthly', ...rest } = over;
  return {
    id: 'sub_1',
    status: 'active',
    created: 1000,
    items: { data: [{ price: { id: priceId } }] },
    ...rest,
  } as unknown as Stripe.Subscription;
}

let service: typeof import('./stripe-service');

beforeEach(async () => {
  vi.resetModules();
  setPlan.mockClear();
  listSubscriptions.mockClear();
  getSubscription.mockResolvedValue({ planId: 'free', status: 'active' });
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
  process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly';
  service = await import('./stripe-service');
});

describe('reconcileSubscriptionFromStripe', () => {
  it('writes the paid plan when the database still says free', async () => {
    subscriptionList = [sub({})];
    const result = await service.reconcileSubscriptionFromStripe(
      'org_1',
      makeDb({ stripe_customer_id: 'cus_1' }),
    );

    expect(result.code).toBe('repaired');
    expect(result.planId).toBe('pro');
    expect(setPlan).toHaveBeenCalledWith(
      'org_1',
      expect.objectContaining({ planId: 'pro', status: 'active' }),
      expect.anything(),
    );
  });

  it('leaves the plan alone when the price is not in the catalog', async () => {
    subscriptionList = [sub({ priceId: 'price_from_another_account' })];
    const result = await service.reconcileSubscriptionFromStripe(
      'org_1',
      makeDb({ stripe_customer_id: 'cus_1' }),
    );

    // The visible failure mode this guards: writing "some" plan here would
    // grant entitlements based on a price this deployment cannot identify.
    expect(result.code).toBe('price_unknown');
    expect(result.changed).toBe(false);
    expect(setPlan).not.toHaveBeenCalled();
  });

  it('falls back to free when the only subscription is canceled', async () => {
    getSubscription.mockResolvedValue({ planId: 'pro', status: 'active' });
    subscriptionList = [sub({ status: 'canceled' as Stripe.Subscription.Status })];
    const result = await service.reconcileSubscriptionFromStripe(
      'org_1',
      makeDb({ stripe_customer_id: 'cus_1' }),
    );

    expect(result.planId).toBe('free');
    expect(result.status).toBe('canceled');
  });

  it('prefers the newest live subscription over an older canceled one', async () => {
    getSubscription.mockResolvedValue({ planId: 'free', status: 'active' });
    subscriptionList = [
      sub({ id: 'sub_old', status: 'canceled' as Stripe.Subscription.Status, created: 5000 }),
      sub({ id: 'sub_new', status: 'active', created: 2000 }),
    ];
    const result = await service.reconcileSubscriptionFromStripe(
      'org_1',
      makeDb({ stripe_customer_id: 'cus_1' }),
    );

    // Ordering by `created` alone would pick the canceled one and downgrade an
    // org that has resubscribed.
    expect(result.planId).toBe('pro');
    expect(result.status).toBe('active');
  });

  it('does nothing for an organization that has no Stripe customer', async () => {
    subscriptionList = [sub({})];
    const result = await service.reconcileSubscriptionFromStripe('org_1', makeDb({}));

    expect(result.code).toBe('no_customer');
    expect(listSubscriptions).not.toHaveBeenCalled();
    expect(setPlan).not.toHaveBeenCalled();
  });

  it('reports in_sync without writing when the stored state already matches', async () => {
    getSubscription.mockResolvedValue({ planId: 'pro', status: 'active' });
    subscriptionList = [sub({})];
    const result = await service.reconcileSubscriptionFromStripe(
      'org_1',
      makeDb({
        stripe_customer_id: 'cus_1',
        stripe_subscription_id: 'sub_1',
        stripe_price_id: 'price_pro_monthly',
      }),
    );

    expect(result.code).toBe('in_sync');
    expect(setPlan).not.toHaveBeenCalled();
  });
});
