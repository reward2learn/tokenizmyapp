import { beforeEach, describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';

const getSubscription = vi.fn(async () => ({ planId: 'free', status: 'active' }));
const getOrganization = vi.fn(async () => ({ displayName: 'Acme' }));

vi.mock('@/domain/billing/entitlement-service', () => ({
  ensureBillingTables: vi.fn(async () => {}),
  getSubscription: (...args: unknown[]) => getSubscription(...(args as [])),
}));

vi.mock('@/domain/billing/organization-service', () => ({
  getOrganization: (...args: unknown[]) => getOrganization(...(args as [])),
}));

const customersCreate = vi.fn();
const customersSearch = vi.fn();
const checkoutSessionsCreate = vi.fn();

const dataDbStore = { stripeCustomerId: null as string | null };
const dataDb = {
  $executeRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
    if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX')) return 0;
    if (sql.includes('UPDATE user_accounts') && sql.includes('stripe_customer_id')) {
      dataDbStore.stripeCustomerId = String(args[0]);
      return 1;
    }
    return 0;
  }),
  $queryRawUnsafe: vi.fn(async (sql: string) => {
    if (sql.includes('FROM user_accounts') && sql.includes('stripe_customer_id')) {
      return dataDbStore.stripeCustomerId
        ? [{ stripe_customer_id: dataDbStore.stripeCustomerId }]
        : [{}];
    }
    return [];
  }),
};

vi.mock('@/lib/db', () => ({
  createRawClient: () => dataDb,
  createBillingRawClient: () => ({
    $executeRawUnsafe: vi.fn(async () => 0),
    $queryRawUnsafe: vi.fn(async () => []),
  }),
}));

vi.mock('@/lib/billing/stripe-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/billing/stripe-client')>();
  return {
    ...actual,
    requireStripe: () =>
      ({
        customers: { create: customersCreate, search: customersSearch },
        checkout: { sessions: { create: checkoutSessionsCreate } },
      }) as unknown as Stripe,
  };
});

function makeBillingDb(orgCustomerId: string | null = null) {
  const linkage = {
    stripe_customer_id: orgCustomerId,
    stripe_subscription_id: null as string | null,
    stripe_price_id: null as string | null,
    grace_period_ends_at: null as string | null,
    pending_plan_id: null as string | null,
  };
  return {
    $executeRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('UPDATE subscriptions') && sql.includes('stripe_customer_id')) {
        // First bound arg is the customer id in saveStripeLinkage for customerId patch.
        const customerIdx = sql.indexOf('stripe_customer_id');
        if (customerIdx >= 0) {
          linkage.stripe_customer_id = String(args[0]);
        }
        return 1;
      }
      return 0;
    }),
    $queryRawUnsafe: vi.fn(async (sql: string) => {
      if (sql.includes('FROM subscriptions') && sql.includes('SELECT stripe_customer_id')) {
        return linkage.stripe_customer_id
          ? [{ ...linkage }]
          : [];
      }
      return [];
    }),
  } as never;
}

let service: typeof import('./stripe-service');

beforeEach(async () => {
  vi.resetModules();
  customersCreate.mockReset();
  customersSearch.mockReset();
  checkoutSessionsCreate.mockReset();
  dataDbStore.stripeCustomerId = null;
  dataDb.$executeRawUnsafe.mockClear();
  dataDb.$queryRawUnsafe.mockClear();
  getSubscription.mockResolvedValue({ planId: 'free', status: 'active' });
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
  service = await import('./stripe-service');
});

describe('ensureUserStripeCustomer', () => {
  it('returns an existing user customer id', async () => {
    dataDbStore.stripeCustomerId = 'cus_user_existing';
    const id = await service.ensureUserStripeCustomer('user_1', {}, dataDb as never);
    expect(id).toBe('cus_user_existing');
    expect(customersCreate).not.toHaveBeenCalled();
  });

  it('heals an orphaned Stripe customer via metadata.userId', async () => {
    customersSearch.mockResolvedValue({ data: [{ id: 'cus_orphan' }] });
    const id = await service.ensureUserStripeCustomer('user_1', { orgId: 'org_1' }, dataDb as never);
    expect(id).toBe('cus_orphan');
    expect(dataDbStore.stripeCustomerId).toBe('cus_orphan');
    expect(customersCreate).not.toHaveBeenCalled();
  });

  it('creates and persists a new user customer', async () => {
    customersSearch.mockRejectedValue(new Error('search unavailable'));
    customersCreate.mockResolvedValue({ id: 'cus_new' });
    const id = await service.ensureUserStripeCustomer(
      'user_1',
      { email: 'a@b.com', name: 'Ada', orgId: 'org_1' },
      dataDb as never,
    );
    expect(id).toBe('cus_new');
    expect(customersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'a@b.com',
        name: 'Ada',
        metadata: { userId: 'user_1', orgId: 'org_1' },
      }),
    );
    expect(dataDbStore.stripeCustomerId).toBe('cus_new');
  });
});

describe('createTopUpCheckoutSession customer routing', () => {
  it('uses the org customer when purchaserUserId is absent', async () => {
    customersCreate.mockResolvedValue({ id: 'cus_org' });
    customersSearch.mockResolvedValue({ data: [] });
    checkoutSessionsCreate.mockResolvedValue({
      id: 'cs_1',
      client_secret: 'cs_secret',
    });

    await service.createTopUpCheckoutSession(
      'org_1',
      'pack-25',
      'https://example.com/return',
      makeBillingDb(null),
      undefined,
      {},
    );

    expect(checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_org' }),
    );
  });

  it('uses the user customer when purchaserUserId is set', async () => {
    dataDbStore.stripeCustomerId = 'cus_user';
    checkoutSessionsCreate.mockResolvedValue({
      id: 'cs_2',
      client_secret: 'cs_secret_user',
    });

    await service.createTopUpCheckoutSession(
      'org_1',
      'pack-25',
      'https://example.com/return',
      makeBillingDb('cus_org'),
      undefined,
      { purchaserUserId: 'user_1' },
    );

    expect(checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_user',
        metadata: expect.objectContaining({ purchaserUserId: 'user_1' }),
      }),
    );
  });
});
