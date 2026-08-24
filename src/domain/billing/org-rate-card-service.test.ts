import { describe, expect, it, vi, beforeEach } from 'vitest';
import { purchasedCreditsForUsdAtMarkup, MARKUP_FLOOR } from '@/lib/billing/tenant-rate-card';

describe('refreshOrgRateCardCreditsFromCatalog', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('writes plan/pack credits from catalog faces × markup', async () => {
    const executeRawUnsafe = vi.fn().mockResolvedValue(0);
    const queryRawUnsafe = vi.fn().mockResolvedValue([
      {
        org_id: 'org_1',
        markup_percent: 0.4,
        manual_markup_percent: null,
        inputs: {
          appCount: 2,
          userCount: 3,
          annualRevenueUsd: 0,
          macStudioCostUsd: 12999,
          monthlyThirdPartyUsd: 0,
        },
        plan_credits: { free: 1, pro: 1, business: 1 },
        pack_credits: { 'pack-25': 1, 'pack-50': 1, 'pack-100': 1 },
        breakdown: {
          floor: 0.3,
          appFactor: 0,
          userFactor: 0,
          revenueFactor: 0,
          hardwareFactor: 0,
          expenseFactor: 0,
          raw: 0.4,
          clamped: 0.4,
        },
        computed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    vi.doMock('@/lib/db', () => ({
      createRawClient: () => ({
        $executeRawUnsafe: executeRawUnsafe,
        $queryRawUnsafe: queryRawUnsafe,
      }),
    }));

    vi.doMock('@/domain/billing/catalog-price-service', () => ({
      getBillingCatalog: vi.fn().mockResolvedValue({
        catalog: {
          plans: {
            free: { monthlyCents: 0, yearlyCents: 0 },
            pro: { monthlyCents: 12000, yearlyCents: 122400 },
            business: { monthlyCents: 25000, yearlyCents: 255000 },
          },
          packs: {
            'pack-25': 3000,
            'pack-50': 6000,
            'pack-100': 12000,
          },
        },
      }),
    }));

    const { refreshOrgRateCardCreditsFromCatalog } = await import(
      '@/domain/billing/org-rate-card-service'
    );
    const card = await refreshOrgRateCardCreditsFromCatalog('org_1');

    expect(card.planCredits.pro).toBe(purchasedCreditsForUsdAtMarkup(120, 0.4));
    expect(card.planCredits.business).toBe(purchasedCreditsForUsdAtMarkup(250, 0.4));
    expect(card.planCredits.free).toBe(purchasedCreditsForUsdAtMarkup(20, 0.4));
    expect(card.packCredits['pack-25']).toBe(purchasedCreditsForUsdAtMarkup(30, 0.4));
    expect(card.packCredits['pack-50']).toBe(purchasedCreditsForUsdAtMarkup(60, 0.4));
    expect(card.packCredits['pack-100']).toBe(purchasedCreditsForUsdAtMarkup(120, 0.4));

    const updateCall = executeRawUnsafe.mock.calls.find((c) =>
      String(c[0]).includes('UPDATE org_billing_rate_cards'),
    );
    expect(updateCall).toBeTruthy();
    expect(JSON.parse(String(updateCall![2]))).toEqual(card.planCredits);
    expect(JSON.parse(String(updateCall![3]))).toEqual(card.packCredits);
  });

  it('uses markup floor when building catalog-default density baseline', () => {
    expect(purchasedCreditsForUsdAtMarkup(99, MARKUP_FLOOR)).toBeGreaterThan(0);
  });
});
