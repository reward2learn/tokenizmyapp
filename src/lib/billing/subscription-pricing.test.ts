import { describe, expect, it } from 'vitest';
import {
  defaultSubscriptionAmounts,
  priceEnvVarName,
  stripeYearlyUnitAmount,
} from '@/lib/billing/subscription-pricing';

describe('subscription-pricing', () => {
  it('defaults match catalog Pro/Business monthly and yearly rates', () => {
    const amounts = defaultSubscriptionAmounts();
    expect(amounts.PRO_MONTHLY).toBe(9900);
    expect(amounts.BUSINESS_MONTHLY).toBe(19900);
    expect(amounts.PRO_YEARLY).toBeLessThan(amounts.PRO_MONTHLY);
  });

  it('maps short keys to STRIPE_PRICE env vars', () => {
    expect(priceEnvVarName('PRO_MONTHLY')).toBe('STRIPE_PRICE_PRO_MONTHLY');
  });

  it('computes annual charge from yearly monthly rate', () => {
    expect(stripeYearlyUnitAmount(8415)).toBe(100980);
  });
});
