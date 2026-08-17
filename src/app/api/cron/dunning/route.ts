/**
 * Dunning enforcement — /api/cron/dunning
 *
 * Downgrades organizations whose 7-day grace period after a failed payment has
 * lapsed (roadmap §4.4).
 *
 * Time-driven rather than event-driven on purpose: Stripe sends nothing on the
 * day a grace period expires, so no webhook can trigger this. Registered as a
 * Vercel cron in vercel.json.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled
 * invocations. When CRON_SECRET is unset the endpoint refuses rather than
 * running open — it changes customers' plans, so an unauthenticated caller
 * being able to trigger it is worse than the job not running.
 */
import { jsonError, jsonOk } from '@/lib/api/response';
import { enforceDunningDowngrades } from '@/domain/billing/stripe-webhook-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return jsonError(
      'CRON_SECRET is not set — refusing to run dunning enforcement unauthenticated.',
      503,
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const result = await enforceDunningDowngrades();
    if (result.downgraded.length > 0) {
      console.log(
        `[cron-dunning] Downgraded ${result.downgraded.length} org(s) to Free: ${result.downgraded.join(', ')}`,
      );
    }
    return jsonOk({ downgraded: result.downgraded, count: result.downgraded.length });
  } catch (err) {
    return jsonError('Dunning enforcement failed: ' + (err as Error).message, 500);
  }
}
