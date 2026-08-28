import { describe, expect, it, vi } from 'vitest';
import { prepaidPlanPriceCents } from '@/lib/billing/plans';
import {
  isCryptoPrepaidPeriodActive,
  isCryptoPrepaidSubscription,
  PREPAID_MONTH_DAYS,
} from '@/domain/billing/crypto-plan-service';

describe('prepaidPlanPriceCents', () => {
  it('computes monthly list price × months for Pro and Business', () => {
    expect(prepaidPlanPriceCents('pro', 1)).toBe(9900);
    expect(prepaidPlanPriceCents('pro', 3)).toBe(29700);
    expect(prepaidPlanPriceCents('business', 12)).toBe(19900 * 12);
  });

  it('returns null for free and enterprise', () => {
    expect(prepaidPlanPriceCents('free', 1)).toBeNull();
    expect(prepaidPlanPriceCents('enterprise', 6)).toBeNull();
  });
});

describe('crypto prepaid helpers', () => {
  it('detects crypto-only subscriptions', () => {
    expect(isCryptoPrepaidSubscription({ planId: 'pro', hasStripeSubscription: false })).toBe(true);
    expect(isCryptoPrepaidSubscription({ planId: 'pro', hasStripeSubscription: true })).toBe(false);
    expect(isCryptoPrepaidSubscription({ planId: 'free', hasStripeSubscription: false })).toBe(false);
  });

  it('checks whether a prepaid window is still active', () => {
    const now = Date.parse('2026-06-01T00:00:00.000Z');
    expect(isCryptoPrepaidPeriodActive('2026-07-01T00:00:00.000Z', now)).toBe(true);
    expect(isCryptoPrepaidPeriodActive('2026-05-01T00:00:00.000Z', now)).toBe(false);
  });

  it('uses 30-day prepaid months', () => {
    expect(PREPAID_MONTH_DAYS).toBe(30);
  });
});

describe('reconcileCryptoPrepaidSubscription', () => {
  it('downgrades expired crypto-only orgs to Free', async () => {
    vi.resetModules();

    const setPlan = vi.fn(async () => ({
      id: 'sub_1',
      orgId: 'org_1',
      planId: 'free',
      status: 'active',
      interval: 'monthly',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date().toISOString(),
      cancelAtPeriodEnd: false,
      anchorDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    vi.doMock('@/domain/billing/entitlement-service', () => ({
      ensureBillingTables: vi.fn(async () => undefined),
      getSubscription: vi.fn(async () => ({
        id: 'sub_1',
        orgId: 'org_1',
        planId: 'pro',
        status: 'active',
        interval: 'monthly',
        currentPeriodStart: '2026-01-01T00:00:00.000Z',
        currentPeriodEnd: '2026-02-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
        anchorDate: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })),
      setPlan,
    }));

    vi.doMock('@/domain/billing/stripe-service', () => ({
      getStripeLinkage: vi.fn(async () => ({
        customerId: null,
        subscriptionId: null,
        priceId: null,
        gracePeriodEndsAt: null,
        pendingPlanId: null,
      })),
    }));

    vi.doMock('@/lib/db', () => ({
      createBillingRawClient: vi.fn(() => ({})),
    }));

    const { reconcileCryptoPrepaidSubscription } = await import(
      '@/domain/billing/crypto-plan-service'
    );

    const result = await reconcileCryptoPrepaidSubscription('org_1');
    expect(result.changed).toBe(true);
    expect(setPlan).toHaveBeenCalledWith('org_1', { planId: 'free', status: 'active' }, {});
  });
});
