import { describe, expect, it, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

/**
 * `findPriceMismatches` — the guard between the pricing card and the invoice.
 *
 * `PlanDef.priceMonthly` is display text; Stripe bills from the price object.
 * Nothing keeps the two in step, so editing the catalog to $199 while Stripe
 * still holds $99 advertises one amount and charges another. The customer
 * finds out on their statement.
 */

let prices: Record<string, Partial<Stripe.Price>> = {};
const retrieve = vi.fn(async (id: string) => {
  const price = prices[id];
  if (!price) throw new Error(`No such price: ${id}`);
  return price as Stripe.Price;
});

vi.mock('@/lib/billing/stripe-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/billing/stripe-client')>();
  return { ...actual, getStripeFor: () => ({ prices: { retrieve } }) };
});

let service: typeof import('./stripe-service');

beforeEach(async () => {
  vi.resetModules();
  retrieve.mockClear();
  prices = {};
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('STRIPE_PRICE_')) delete process.env[key];
  }
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
  service = await import('./stripe-service');
});

describe('findPriceMismatches', () => {
  it('is silent when Stripe charges what the card advertises', async () => {
    // Pro monthly is $50 in the catalog.
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_m';
    prices.price_pro_m = { unit_amount: 5000, currency: 'usd', recurring: { interval: 'month' } as Stripe.Price.Recurring };

    expect(await service.findPriceMismatches()).toEqual([]);
  });

  it('catches a catalog edit that Stripe was never told about', async () => {
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_m';
    prices.price_pro_m = { unit_amount: 2500, currency: 'usd', recurring: { interval: 'month' } as Stripe.Price.Recurring };

    const [mismatch] = await service.findPriceMismatches();
    expect(mismatch.planId).toBe('pro');
    expect(mismatch.catalogCents).toBe(5000);
    expect(mismatch.stripeCents).toBe(2500);
    expect(mismatch.message).toContain('$50.00');
    expect(mismatch.message).toContain('$25.00');
  });

  it('compares a yearly Stripe price per month, not per year', async () => {
    // Stripe states the whole-year total; the catalog states it per month.
    // Comparing raw would flag every correctly configured yearly plan.
    process.env.STRIPE_PRICE_PRO_YEARLY = 'price_pro_y';
    prices.price_pro_y = {
      unit_amount: 5000 * 0.85 * 12,
      currency: 'usd',
      recurring: { interval: 'year' } as Stripe.Price.Recurring,
    };

    expect(await service.findPriceMismatches()).toEqual([]);
  });

  it('reports a metered price as unverifiable rather than assuming it is right', async () => {
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_m';
    prices.price_pro_m = { unit_amount: null, currency: 'usd', recurring: { interval: 'month' } as Stripe.Price.Recurring };

    const [mismatch] = await service.findPriceMismatches();
    expect(mismatch.stripeCents).toBeNull();
    expect(mismatch.message).toContain('cannot be verified');
  });

  it('reports a price id that does not exist in the Stripe account', async () => {
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_from_another_account';

    const [mismatch] = await service.findPriceMismatches();
    expect(mismatch.stripeCents).toBeNull();
    expect(mismatch.message).toContain('could not be read');
  });

  it('ignores plans with no configured price instead of calling Stripe', async () => {
    expect(await service.findPriceMismatches()).toEqual([]);
    expect(retrieve).not.toHaveBeenCalled();
  });
});
