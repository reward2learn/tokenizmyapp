import { describe, expect, it } from 'vitest';
import {
  YEARLY_DISCOUNT,
  getPlan,
  planAiCreditsPerMonth,
  applyYearlyCreditBonus,
} from '@/lib/billing/plans';

describe('planAiCreditsPerMonth', () => {
  it('returns catalog credits for monthly billing', () => {
    const pro = getPlan('pro');
    expect(planAiCreditsPerMonth('pro', 'monthly')).toBe(pro.aiCreditsPerMonth);
    expect(planAiCreditsPerMonth('pro', 'monthly')).toBe(52_800);
  });

  it('adds 15% bonus credits for yearly billing', () => {
    const pro = getPlan('pro');
    expect(planAiCreditsPerMonth('pro', 'yearly')).toBe(
      Math.round(pro.aiCreditsPerMonth * (1 + YEARLY_DISCOUNT)),
    );
    expect(planAiCreditsPerMonth('pro', 'yearly')).toBe(60_720);
  });

  it('leaves free and enterprise unchanged', () => {
    expect(planAiCreditsPerMonth('free', 'yearly')).toBe(getPlan('free').aiCreditsPerMonth);
    expect(planAiCreditsPerMonth('enterprise', 'yearly')).toBe(0);
  });
});

describe('applyYearlyCreditBonus', () => {
  it('applies bonus to rate-card overrides', () => {
    expect(applyYearlyCreditBonus(10_000, 'yearly')).toBe(11_500);
    expect(applyYearlyCreditBonus(10_000, 'monthly')).toBe(10_000);
  });
});
