import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

/**
 * Status codes here are a control channel for Stripe's retry logic, so each one
 * is worth pinning:
 *   503 — unconfigured; stop hammering an endpoint that cannot succeed.
 *   400 — bad signature; permanent, retrying cannot fix it.
 *   500 — transient; please retry.
 *   200 — processed, duplicate, or knowingly ignored.
 *
 * A regression that turns the 400 into a 500 would put Stripe into an infinite
 * retry loop against a forged or misconfigured payload.
 */

const constructEvent = vi.fn();
const processStripeEvent = vi.fn();

vi.mock('@/lib/billing/stripe-client', () => ({
  getStripe: () => (process.env.__FAKE_STRIPE === '1' ? { webhooks: { constructEvent } } : null),
  getStripeWebhookSecret: () => (process.env.__FAKE_STRIPE === '1' ? 'whsec_fake' : null),
}));

vi.mock('@/domain/billing/stripe-webhook-service', () => ({
  processStripeEvent: (...args: unknown[]) => processStripeEvent(...args),
}));

function post(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  constructEvent.mockReset();
  processStripeEvent.mockReset();
  process.env.__FAKE_STRIPE = '1';
});

afterEach(() => {
  delete process.env.__FAKE_STRIPE;
});

describe('POST /api/webhooks/stripe', () => {
  it('returns 503 when Stripe is not configured', async () => {
    delete process.env.__FAKE_STRIPE;
    const res = await POST(post('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(503);
    expect(processStripeEvent).not.toHaveBeenCalled();
  });

  it('rejects a request with no signature header', async () => {
    const res = await POST(post('{}'));
    expect(res.status).toBe(400);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it('returns 400 — not 500 — on a bad signature', async () => {
    // Permanent failure. A 500 here would have Stripe retry a forged payload
    // forever.
    constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    const res = await POST(post('{"id":"evt_1"}', { 'stripe-signature': 'bogus' }));

    expect(res.status).toBe(400);
    expect(processStripeEvent).not.toHaveBeenCalled();
  });

  it('verifies against the RAW body, byte for byte', async () => {
    // Any parse-and-restringify breaks the signature and every event fails.
    const raw = '{"id":"evt_2",  "type":"invoice.paid"}';
    constructEvent.mockReturnValue({ id: 'evt_2', type: 'invoice.paid' });
    processStripeEvent.mockResolvedValue({
      handled: true,
      duplicate: false,
      eventType: 'invoice.paid',
      orgId: 'org_1',
      message: 'ok',
    });

    await POST(post(raw, { 'stripe-signature': 'sig' }));

    expect(constructEvent).toHaveBeenCalledWith(raw, 'sig', 'whsec_fake');
  });

  it('ACKs a verified event', async () => {
    constructEvent.mockReturnValue({ id: 'evt_3', type: 'invoice.paid' });
    processStripeEvent.mockResolvedValue({
      handled: true,
      duplicate: false,
      eventType: 'invoice.paid',
      orgId: 'org_1',
      message: 'granted',
    });

    const res = await POST(post('{}', { 'stripe-signature': 'sig' }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ received: true, handled: true });
  });

  it('ACKs a duplicate rather than asking for another retry', async () => {
    constructEvent.mockReturnValue({ id: 'evt_4', type: 'invoice.paid' });
    processStripeEvent.mockResolvedValue({
      handled: false,
      duplicate: true,
      eventType: 'invoice.paid',
      orgId: null,
      message: 'already processed',
    });

    const res = await POST(post('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
  });

  it('returns 500 on a transient processing failure so Stripe retries', async () => {
    constructEvent.mockReturnValue({ id: 'evt_5', type: 'invoice.paid' });
    processStripeEvent.mockRejectedValue(new Error('database unavailable'));

    const res = await POST(post('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(500);
  });
});
