/**
 * Cloud Credits Collector — /api/cron/cloud-credits
 *
 * Phase 5: meter what deployed tenant apps consume on Vercel + Neon and debit
 * the owning organization's cloud balance for the overage.
 *
 * NOT IMPLEMENTED YET. The cron stays registered in vercel.json so the schedule
 * is in place the day the collector is, but this handler deliberately does no
 * work, because none of the three things it needs exist:
 *
 *  1. A usage source. The previous draft polled `GET /v9/projects/{id}` and read
 *     `.metrics` off the response — that endpoint returns project configuration
 *     and carries no such field. Per-project consumption has to come from a real
 *     source (Vercel Observability export, the marketplace billing API, or
 *     Neon's own consumption API), and which one is a decision, not a detail.
 *  2. Storage. That draft wrote to `usage_records` and `cloud_balances`, neither
 *     of which is declared in zenstack/schema.zmodel or created by any runtime
 *     DDL helper. Every INSERT would have failed with 42P01 (undefined_table).
 *  3. A rate card. What an invocation or a GB-hour costs in credits, and the
 *     per-plan multiplier applied to it, are pricing decisions.
 *
 * Until then this answers 200 with `metered: false` rather than 500. A missing
 * feature is not an incident, and a scheduled job that fails every night is how
 * people learn to ignore the alerts that matter.
 *
 * The Cloud Credits tab in the billing panel shows the matching empty state.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled runs.
 */
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return jsonError(
      'CRON_SECRET is not set — refusing to run cloud credits collector unauthenticated.',
      503,
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return jsonError('Unauthorized', 401);
  }

  return jsonOk({
    metered: false,
    reason:
      'Cloud usage metering is not implemented: no usage source is wired, and the ' +
      'usage_records / cloud_balances tables are not part of the schema.',
  });
}
