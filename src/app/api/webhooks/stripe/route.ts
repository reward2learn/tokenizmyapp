/**
 * Stripe Webhook Route — /api/webhooks/stripe
 *
 * Register this URL in the Stripe dashboard and put the signing secret in
 * STRIPE_WEBHOOK_SECRET. Events to subscribe to:
 *   checkout.session.completed
 *   customer.subscription.created | updated | deleted
 *   invoice.paid | invoice.payment_failed
 *   payment_intent.succeeded
 *   v2.commerce.product_catalog.import.succeeded | failed (ACS catalog sync)
 *
 * Follows the same shape as the Vercel webhook route next door: read the raw
 * body first, verify, delegate everything else to a service.
 *
 * Status codes here are a control channel for Stripe's retry logic, not
 * decoration:
 *   400 — bad signature or unparseable. Never retry; retrying cannot fix it.
 *   200 — processed, duplicate, or knowingly ignored. Stop retrying.
 *   500 — transient failure. Please retry; the event was un-claimed so the
 *         retry does real work rather than being dropped as a duplicate.
 */
import { NextRequest } from 'next/server';
import { getStripe, getStripeWebhookSecret } from '@/lib/billing/stripe-client';
import { processStripeEvent } from '@/domain/billing/stripe-webhook-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    // 503 rather than 500: the endpoint exists but payments are switched off,
    // and Stripe should stop hammering an endpoint that cannot succeed.
    console.warn('[stripe-webhook] Received an event but Stripe is not configured.');
    return new Response('Stripe is not configured', { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing stripe-signature header', { status: 400 });

  // Critical: the raw body, byte for byte. Any parse-and-restringify breaks the
  // signature and every event fails verification.
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error('[stripe-webhook] Failed to read body:', err);
    return new Response('Failed to read request body', { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    // An unverifiable payload is either a misconfigured secret or a forgery.
    // Both are permanent — 400 so Stripe gives up rather than retrying.
    const message = err instanceof Error ? err.message : String(err);
    console.error('[stripe-webhook] Signature verification failed:', message);
    return new Response(`Signature verification failed: ${message}`, { status: 400 });
  }

  try {
    const result = await processStripeEvent(event);
    if (result.duplicate) {
      console.log(`[stripe-webhook] Duplicate ${event.type} (${event.id}) — already processed.`);
    } else {
      console.log(`[stripe-webhook] ${event.type} (${event.id}): ${result.message}`);
    }
    return Response.json({ received: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[stripe-webhook] Processing failed for ${event.id}:`, message);
    return new Response(`Processing failed: ${message}`, { status: 500 });
  }
}
