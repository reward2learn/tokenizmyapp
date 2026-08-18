/**
 * Cloud Credits Collector — /api/cron/cloud-credits
 *
 * Phase 5: meter what deployed tenant apps consume on Vercel + Neon and debit
 * the owning organization's cloud balance for the overage.
 *
 * Usage sources, decided 2026-08-18 and verified live:
 *
 *  1. Vercel `GET /v1/billing/charges` — the FOCUS v1.3 billing export (new
 *     Feb 2026), streamed JSONL, 1-day granularity. Team-level only: no
 *     ResourceId, empty Tags, so charges are recorded as platform overhead on
 *     the operator org (attribution decision (a)).
 *  2. Neon `GET /projects/{id}` — the Free-plan usage endpoint (the
 *     consumption_history v2 API requires a Launch plan). Current-billing-
 *     period totals per project; all tenant databases are endpoints inside one
 *     project, so this is platform overhead too.
 *
 * Storage exists: usage_records and cloud_balances are declared in the zmodel
 * and `db push` owns them. Rate card: pass-through at provider cost — Vercel
 * rows carry the FOCUS billed cost, Neon on the Free plan costs nothing.
 *
 * Env: CRON_SECRET (auth), VERCEL_TOKEN + VERCEL_TEAM_ID, NEON_API_KEY +
 * NEON_ORG_ID, OPERATOR_ORG_ID (optional — falls back to the 'default' org).
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled runs.
 */
import { jsonError, jsonOk } from '@/lib/api/response';
import { createRawClient } from '@/lib/db';
import { runCloudUsageCollection } from '@/domain/billing/cloud-usage-collector';

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

  try {
    const db = createRawClient();
    const summary = await runCloudUsageCollection(db, {
      vercelToken: process.env.VERCEL_TOKEN,
      vercelTeamId: process.env.VERCEL_TEAM_ID,
      neonApiKey: process.env.NEON_API_KEY,
      neonOrgId: process.env.NEON_ORG_ID,
      operatorOrgId: process.env.OPERATOR_ORG_ID,
    });
    return jsonOk({
      metered: true,
      ...summary,
    });
  } catch (error) {
    return jsonError(
      `Cloud credits collection failed: ${error instanceof Error ? error.message : String(error)}`,
      500,
    );
  }
}
