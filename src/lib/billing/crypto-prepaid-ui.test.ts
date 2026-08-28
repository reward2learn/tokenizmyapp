import { describe, expect, it } from 'vitest';
import {
  cryptoPrepaidUiStatus,
  formatPaidThroughDate,
} from '@/lib/billing/crypto-prepaid-ui';

describe('cryptoPrepaidUiStatus', () => {
  const now = Date.parse('2026-06-01T12:00:00.000Z');

  it('returns none for Stripe subscriptions and Free', () => {
    expect(
      cryptoPrepaidUiStatus({
        planId: 'pro',
        currentPeriodEnd: '2026-12-01T00:00:00.000Z',
        hasStripeSubscription: true,
        nowMs: now,
      }),
    ).toBe('none');
    expect(
      cryptoPrepaidUiStatus({
        planId: 'free',
        currentPeriodEnd: '2026-12-01T00:00:00.000Z',
        hasStripeSubscription: false,
        nowMs: now,
      }),
    ).toBe('none');
  });

  it('classifies active, expiring, and expired prepaid windows', () => {
    expect(
      cryptoPrepaidUiStatus({
        planId: 'pro',
        currentPeriodEnd: '2026-08-01T00:00:00.000Z',
        hasStripeSubscription: false,
        nowMs: now,
      }),
    ).toBe('active');

    expect(
      cryptoPrepaidUiStatus({
        planId: 'pro',
        currentPeriodEnd: '2026-06-05T00:00:00.000Z',
        hasStripeSubscription: false,
        nowMs: now,
      }),
    ).toBe('expiring_soon');

    expect(
      cryptoPrepaidUiStatus({
        planId: 'pro',
        currentPeriodEnd: '2026-05-01T00:00:00.000Z',
        hasStripeSubscription: false,
        nowMs: now,
      }),
    ).toBe('expired');
  });
});

describe('formatPaidThroughDate', () => {
  it('formats ISO dates for display', () => {
    expect(formatPaidThroughDate('2026-12-15T00:00:00.000Z')).toMatch(/2026/);
  });
});
