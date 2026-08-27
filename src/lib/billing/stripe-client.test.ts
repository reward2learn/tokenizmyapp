import { describe, expect, it, afterEach } from 'vitest';
import {
  classifyPlanChange,
  planRank,
  getPriceId,
  planForPriceId,
  priceEnvKey,
  listConfiguredPrices,
  listPurchasablePrices,
  stripeConfigError,
  isLiveKey,
} from '@/lib/billing/stripe-client';

const TOUCHED = [
  'STRIPE_PRICE_PRO_MONTHLY',
  'STRIPE_PRICE_PRO_YEARLY',
  'STRIPE_PRICE_BUSINESS_MONTHLY',
  'STRIPE_PRICE_FREE_MONTHLY',
  'STRIPE_PRICE_ENTERPRISE_MONTHLY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'VERCEL_ENV',
];
const saved = new Map(TOUCHED.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const [key, value] of saved) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('classifyPlanChange', () => {
  it('treats a move to a more expensive plan as an upgrade', () => {
    expect(classifyPlanChange('free', 'pro')).toBe('upgrade');
    expect(classifyPlanChange('pro', 'business')).toBe('upgrade');
  });

  it('treats a move to a cheaper plan as a downgrade', () => {
    expect(classifyPlanChange('business', 'pro')).toBe('downgrade');
    expect(classifyPlanChange('pro', 'free')).toBe('downgrade');
  });

  it('reports no change when the plan and interval are the same', () => {
    expect(classifyPlanChange('pro', 'pro')).toBe('unchanged');
    expect(classifyPlanChange('pro', 'pro', 'monthly', 'monthly')).toBe('unchanged');
  });

  it('treats monthly → yearly on the same tier as an upgrade', () => {
    expect(classifyPlanChange('pro', 'pro', 'monthly', 'yearly')).toBe('upgrade');
    expect(classifyPlanChange('business', 'business', 'monthly', 'yearly')).toBe('upgrade');
  });

  it('treats yearly → monthly on the same tier as a downgrade', () => {
    expect(classifyPlanChange('pro', 'pro', 'yearly', 'monthly')).toBe('downgrade');
  });

  it('ranks by price, so a cheaper-but-higher-tier move is a downgrade', () => {
    // The roadmap rule: what decides proration is whether the customer starts
    // paying more or less, not where marketing places the tier.
    expect(planRank('business')).toBeGreaterThan(planRank('pro'));
    expect(planRank('pro')).toBeGreaterThan(planRank('free'));
  });

  it('treats enterprise as an upgrade from everything', () => {
    // It has no list price, so it must not sort as free.
    expect(classifyPlanChange('business', 'enterprise')).toBe('upgrade');
    expect(classifyPlanChange('enterprise', 'business')).toBe('downgrade');
  });
});

describe('getPriceId', () => {
  it('builds the env key from plan and interval', () => {
    expect(priceEnvKey('pro', 'monthly')).toBe('STRIPE_PRICE_PRO_MONTHLY');
    expect(priceEnvKey('business', 'yearly')).toBe('STRIPE_PRICE_BUSINESS_YEARLY');
  });

  it('returns null for plans that are not self-serve', () => {
    // Setting the env var must not make these purchasable: free costs nothing
    // and enterprise is negotiated.
    process.env.STRIPE_PRICE_FREE_MONTHLY = 'price_free';
    process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY = 'price_ent';
    expect(getPriceId('free', 'monthly')).toBeNull();
    expect(getPriceId('enterprise', 'monthly')).toBeNull();
  });

  it('returns null when the price is simply not configured', () => {
    delete process.env.STRIPE_PRICE_PRO_MONTHLY;
    expect(getPriceId('pro', 'monthly')).toBeNull();
  });

  it('reads a configured price', () => {
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_123';
    expect(getPriceId('pro', 'monthly')).toBe('price_123');
  });
});

describe('planForPriceId', () => {
  it('maps a Stripe price back to a plan and interval', () => {
    process.env.STRIPE_PRICE_PRO_YEARLY = 'price_pro_year';
    expect(planForPriceId('price_pro_year')).toEqual({
      planId: 'pro',
      interval: 'yearly',
      priceId: 'price_pro_year',
    });
  });

  it('returns null for a price this deployment does not know', () => {
    // Means the env does not match the Stripe account that sent the event —
    // the webhook has to surface that, not silently pick a plan.
    delete process.env.STRIPE_PRICE_PRO_MONTHLY;
    expect(planForPriceId('price_from_another_account')).toBeNull();
  });

  it('lists only configured, purchasable prices', () => {
    for (const key of TOUCHED) delete process.env[key];
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_a';
    process.env.STRIPE_PRICE_BUSINESS_MONTHLY = 'price_b';

    const configured = listConfiguredPrices();
    expect(configured).toHaveLength(2);
    expect(configured.map((c) => c.priceId).sort()).toEqual(['price_a', 'price_b']);
  });

  it('listPurchasablePrices omits yearly while self-serve yearly is disabled', () => {
    for (const key of TOUCHED) delete process.env[key];
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_m';
    process.env.STRIPE_PRICE_PRO_YEARLY = 'price_pro_y';
    process.env.STRIPE_PRICE_BUSINESS_MONTHLY = 'price_biz_m';

    expect(listConfiguredPrices()).toHaveLength(3);
    const purchasable = listPurchasablePrices();
    expect(purchasable).toHaveLength(2);
    expect(purchasable.every((p) => p.interval === 'monthly')).toBe(true);
    expect(purchasable.map((p) => p.priceId).sort()).toEqual(['price_biz_m', 'price_pro_m']);
  });
});

describe('stripeConfigError', () => {
  /** Test-mode keys, structurally valid, used only as fixtures. */
  const TEST_SECRET = 'sk_test_placeholder';
  const TEST_PUBLISHABLE = 'pk_test_placeholder';
  const LIVE_SECRET = 'sk_live_placeholder';
  const LIVE_PUBLISHABLE = 'pk_live_placeholder';

  function configure(env: Record<string, string | undefined>) {
    for (const key of TOUCHED) delete process.env[key];
    for (const [key, value] of Object.entries(env)) {
      if (value !== undefined) process.env[key] = value;
    }
  }

  it('treats an unconfigured deployment as fine, not broken', () => {
    // Payments are optional; a platform with no Stripe key must keep working.
    configure({});
    expect(stripeConfigError()).toBeNull();
  });

  it('accepts a coherent test-mode setup', () => {
    configure({
      STRIPE_SECRET_KEY: TEST_SECRET,
      STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: TEST_PUBLISHABLE,
    });
    expect(stripeConfigError()).toBeNull();
  });

  it('refuses a live key outside production', () => {
    // The expensive mistake: someone runs "a test" against live and charges
    // real cards.
    configure({ STRIPE_SECRET_KEY: LIVE_SECRET, VERCEL_ENV: 'preview' });
    expect(stripeConfigError()).toMatch(/LIVE key/i);
  });

  it('allows a live key in production', () => {
    configure({
      STRIPE_SECRET_KEY: LIVE_SECRET,
      STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: LIVE_PUBLISHABLE,
      VERCEL_ENV: 'production',
    });
    expect(stripeConfigError()).toBeNull();
  });

  it('rejects an API key pasted into the webhook secret', () => {
    // Signing secrets start with whsec_. An API key there makes every webhook
    // fail verification and puts Stripe into a retry loop.
    configure({
      STRIPE_SECRET_KEY: TEST_SECRET,
      STRIPE_WEBHOOK_SECRET: TEST_SECRET,
    });
    expect(stripeConfigError()).toMatch(/whsec_/);
  });

  it('rejects mixed live and test modes', () => {
    // Fails at payment confirmation with an opaque error, long after the point
    // where it could be understood.
    configure({
      STRIPE_SECRET_KEY: TEST_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: LIVE_PUBLISHABLE,
      VERCEL_ENV: 'production',
    });
    expect(stripeConfigError()).toMatch(/different modes/i);
  });

  it('rejects a secret key that is not a secret key', () => {
    configure({ STRIPE_SECRET_KEY: TEST_PUBLISHABLE });
    expect(stripeConfigError()).toMatch(/sk_/);
  });

  it('identifies live keys of both kinds', () => {
    expect(isLiveKey(LIVE_SECRET)).toBe(true);
    expect(isLiveKey(LIVE_PUBLISHABLE)).toBe(true);
    expect(isLiveKey(TEST_SECRET)).toBe(false);
    expect(isLiveKey(null)).toBe(false);
  });
});

describe('config-based price resolution (tenant-scoped billing)', () => {
  it('prefers config prices over env prices', () => {
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_env';
    expect(getPriceId('pro', 'monthly', { prices: { PRO_MONTHLY: 'price_tenant' } })).toBe(
      'price_tenant',
    );
  });

  it('falls back to env when the config has no price for that plan', () => {
    process.env.STRIPE_PRICE_PRO_YEARLY = 'price_env_year';
    expect(getPriceId('pro', 'yearly', { prices: { PRO_MONTHLY: 'price_tenant' } })).toBe(
      'price_env_year',
    );
  });

  it('returns null when neither config nor env has the price', () => {
    delete process.env.STRIPE_PRICE_BUSINESS_MONTHLY;
    expect(getPriceId('business', 'monthly', { prices: { PRO_MONTHLY: 'price_tenant' } })).toBeNull();
  });

  it('lists configured prices from config alone', () => {
    for (const key of TOUCHED) delete process.env[key];
    const configured = listConfiguredPrices({
      prices: {
        PRO_MONTHLY: 'price_pro_m',
        BUSINESS_YEARLY: 'price_biz_y',
      },
    });
    expect(configured).toHaveLength(2);
    expect(configured.map((c) => c.priceId).sort()).toEqual(['price_biz_y', 'price_pro_m']);
  });

  it('ignores empty config price values', () => {
    for (const key of TOUCHED) delete process.env[key];
    const configured = listConfiguredPrices({
      prices: { PRO_MONTHLY: '  ', PRO_YEARLY: 'price_pro_y' },
    });
    expect(configured).toHaveLength(1);
    expect(configured[0]).toEqual({ planId: 'pro', interval: 'yearly', priceId: 'price_pro_y' });
  });
});
