/**
 * Cloud Credits Collector — /api/cron/cloud-credits
 *
 * Phase 5 (hybrid): meter Vercel + Neon, allocate onto orgs by known
 * vercelProjectId / tenant-{slug} branch counts, debit each org's cloud
 * balance for overage past plan-included allowance, then best-effort auto
 * top-up when balance is below threshold.
 *
 * Env: CRON_SECRET, VERCEL_TOKEN + VERCEL_TEAM_ID, NEON_API_KEY + NEON_ORG_ID
 * (or NEON_PROJECT_ID), OPERATOR_ORG_ID (optional — falls back to 'default').
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
      neonProjectId: process.env.NEON_PROJECT_ID,
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
