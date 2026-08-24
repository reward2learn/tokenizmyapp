import { describe, expect, it } from 'vitest';
import {
  computeMarkupBreakdown,
  computeTenantRateCard,
  defaultRateCardInputs,
  MARKUP_FLOOR,
  purchasedCreditsForUsdAtMarkup,
} from '@/lib/billing/tenant-rate-card';

describe('tenant-rate-card', () => {
  it('never prices below the 30% floor', () => {
    const b = computeMarkupBreakdown(
      defaultRateCardInputs({
        appCount: 1,
        userCount: 1,
        annualRevenueUsd: 0,
        monthlyThirdPartyUsd: 0,
        macStudioCostUsd: 0,
      }),
    );
    expect(b.clamped).toBe(MARKUP_FLOOR);
  });

  it('raises markup with apps, users, and turnover', () => {
    const small = computeMarkupBreakdown(defaultRateCardInputs({ appCount: 1, userCount: 1 }));
    const large = computeMarkupBreakdown(
      defaultRateCardInputs({
        appCount: 8,
        userCount: 40,
        annualRevenueUsd: 5_000_000,
        monthlyThirdPartyUsd: 800,
      }),
    );
    expect(large.clamped).toBeGreaterThan(small.clamped);
    expect(large.clamped).toBeLessThanOrEqual(0.95);
  });

  it('higher markup yields fewer credits per dollar (protects margin)', () => {
    const at30 = purchasedCreditsForUsdAtMarkup(25, 0.3);
    const at50 = purchasedCreditsForUsdAtMarkup(25, 0.5);
    expect(at30).toBeGreaterThan(at50);
  });

  it('fills plan and pack credit tables from markup', () => {
    const card = computeTenantRateCard(
      defaultRateCardInputs({ appCount: 2, userCount: 5, annualRevenueUsd: 250_000 }),
    );
    expect(card.planCredits.pro).toBeGreaterThan(0);
    expect(card.packCredits['pack-25']).toBe(purchasedCreditsForUsdAtMarkup(25, card.markupPercent));
  });

  it('honours a manual markup lock within bounds', () => {
    const card = computeTenantRateCard(defaultRateCardInputs({ appCount: 10 }), 0.45);
    expect(card.markupPercent).toBe(0.45);
  });
});
