import { describe, expect, it, vi, beforeEach } from 'vitest';

const checkoutSessionsCreate = vi.fn();

vi.mock('@/lib/billing/stripe-client', () => ({
  getStripeFor: vi.fn(() => ({
    checkout: { sessions: { create: checkoutSessionsCreate } },
  })),
}));

import { getStripeFor } from '@/lib/billing/stripe-client';
import { probeEmbeddedCheckoutHealth } from '@/domain/billing/stripe-service';

describe('probeEmbeddedCheckoutHealth', () => {
  beforeEach(() => {
    checkoutSessionsCreate.mockReset();
    (getStripeFor as ReturnType<typeof vi.fn>).mockReturnValue({
      checkout: { sessions: { create: checkoutSessionsCreate } },
    });
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_probe';
  });

  it('returns pass when Stripe returns client_secret', async () => {
    checkoutSessionsCreate.mockResolvedValue({
      id: 'cs_probe_1',
      client_secret: 'cs_test_secret',
    });

    const result = await probeEmbeddedCheckoutHealth({
      secretKey: 'sk_test',
      publishableKey: 'pk_test_tenant',
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe('pass');
    expect(result.sessionId).toBe('cs_probe_1');
    expect(checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        ui_mode: 'embedded_page',
        mode: 'payment',
        redirect_on_completion: 'never',
      }),
    );
  });

  it('returns fail when publishable key is missing', async () => {
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const result = await probeEmbeddedCheckoutHealth({ secretKey: 'sk_test' });

    expect(result.ok).toBe(false);
    expect(result.status).toBe('fail');
    expect(checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it('returns fail when Stripe omits client_secret', async () => {
    checkoutSessionsCreate.mockResolvedValue({ id: 'cs_probe_2', client_secret: null });

    const result = await probeEmbeddedCheckoutHealth({
      secretKey: 'sk_test',
      publishableKey: 'pk_test',
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('client_secret');
  });
});
