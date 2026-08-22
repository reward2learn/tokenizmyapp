/**
 * Stripe webhook health — /api/cron/stripe-webhook-health
 *
 * Runs the same checklist Flight Check uses, without Stripe CLI (not available
 * on Vercel). Step 3 uses the Stripe API to fire customer.subscription.updated
 * — equivalent to `stripe trigger customer.subscription.updated`.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled runs.
 * Flight Check calls POST /api/admin/stripe-webhook-health instead (JWT auth).
 */
import { jsonError, jsonOk } from '@/lib/api/response';
import { runStripeWebhookHealthCheck } from '@/domain/billing/stripe-webhook-health-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return jsonError(
      'CRON_SECRET is not set — refusing to run Stripe webhook health check unauthenticated.',
      503,
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const result = await runStripeWebhookHealthCheck({
      billingTarget: true,
    });

    if (!result.ok) {
      const failed = result.steps.filter((s) => s.status === 'fail').map((s) => s.label);
      console.warn(`[cron-stripe-webhook-health] Failed steps: ${failed.join(', ')}`);
    } else {
      console.log('[cron-stripe-webhook-health] All checks passed.');
    }

    return jsonOk(result);
  } catch (err) {
    return jsonError(
      `Stripe webhook health check failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
