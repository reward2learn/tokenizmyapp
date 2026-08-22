import { describe, expect, it } from 'vitest';
import { interpretStripeWebhookHttpStatus } from './stripe-webhook-test-service';

describe('interpretStripeWebhookHttpStatus', () => {
  it('passes on HTTP 200', () => {
    const r = interpretStripeWebhookHttpStatus(200, '{"received":true}');
    expect(r.ok).toBe(true);
    expect(r.status).toBe('pass');
  });

  it('fails on signature errors', () => {
    const r = interpretStripeWebhookHttpStatus(400, 'Signature verification failed');
    expect(r.ok).toBe(false);
    expect(r.status).toBe('fail');
    expect(r.message).toMatch(/signature/i);
  });

  it('fails on 503 unconfigured', () => {
    const r = interpretStripeWebhookHttpStatus(503, 'Stripe is not configured');
    expect(r.status).toBe('fail');
  });

  it('fails on 404 missing route', () => {
    const r = interpretStripeWebhookHttpStatus(404, 'Not Found');
    expect(r.message).toMatch(/404/);
  });
});
