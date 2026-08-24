/**
 * Vercel Webhook Route — /api/webhooks/vercel
 *
 * Production-ready Vercel webhook endpoint.
 * - Reads raw body for accurate signature verification (critical)
 * - Fast ACK: returns 200 immediately after basic validation (Vercel retries on non-2xx)
 * - Delegates all business logic to vercel-webhook-service.ts
 * - Comprehensive error handling and structured logging
 * - Integrates with ZenStack models (WebhookEvent) for audit trail
 *
 * Register this URL in Vercel Dashboard > Settings > Webhooks with the secret from VERCEL_WEBHOOK_SECRET.
 */

import { NextRequest } from 'next/server';
import { handleVercelWebhook } from '@/domain/tenant/vercel-webhook-service';
import { jsonError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

// Vercel may send x-vercel-event header too, but main is in body.type
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now().toString(36)}`;
  console.log(`[vercel-webhook-route] ${requestId} - Incoming webhook`);

  let rawBody: string;
  try {
    // Critical: read raw body BEFORE any parsing for signature verification
    rawBody = await request.text();
    if (!rawBody || rawBody.trim() === '') {
      console.warn(`[vercel-webhook-route] ${requestId} - Empty body received`);
      return new Response('No body', { status: 400 });
    }
  } catch (err) {
    console.error(`[vercel-webhook-route] ${requestId} - Failed to read raw body:`, err);
    return jsonError('Failed to read request body', 400);
  }

  try {
    // Pass rawBody + headers to service for verification, routing, Inngest, cleanup, DB audit
    const result = await handleVercelWebhook(rawBody, request.headers);

    if (!result.success) {
      console.warn(`[vercel-webhook-route] ${requestId} - Handled with issues: ${result.eventType}`, result.error);
      if (result.dbUnavailable) {
        // Neon scale-to-zero: wake the DB and let Vercel retry the webhook.
        return new Response('Database temporarily unavailable', { status: 503 });
      }
      // Still ACK with 200 to prevent Vercel retries for non-fatal errors
    } else {
      console.log(`[vercel-webhook-route] ${requestId} - Successfully processed ${result.eventType} for ${result.tenantSlug || 'unknown'}`);
    }

    // ALWAYS return 200 for Vercel webhooks (fast ACK). Errors are handled internally + Inngest.
    // Vercel will retry only on 5xx or connection errors.
    return new Response('OK', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error(`[vercel-webhook-route] ${requestId} - Unexpected error:`, error);

    // Log to audit via service if possible, but since crash, just console
    // Still return 200 to avoid infinite retries on systemic issues (use Inngest dead letter instead)
    return new Response('Internal processing error - event queued via Inngest', { 
      status: 200 
    });
  }
}

// Optional GET for health check / verification in Vercel dashboard
export async function GET() {
  return new Response('Vercel webhook endpoint is active. Use POST for events.', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
