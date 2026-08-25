/**
 * Dunning enforcement — /api/cron/dunning
 *
 * Nightly pass (UTC midnight): send overdue payment notices (every 2 days, max 3),
 * lock orgs after notices + failed attempts, and apply legacy grace-period Free
 * downgrades.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
import { jsonError, jsonOk } from '@/lib/api/response';
import { runNightlyDunningPass } from '@/domain/billing/dunning-service';

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
    const result = await runNightlyDunningPass();
    if (result.noticesSent.length > 0) {
      console.log(`[cron-dunning] Notices: ${result.noticesSent.join(', ')}`);
    }
    if (result.locked.length > 0) {
      console.log(`[cron-dunning] Locked: ${result.locked.join(', ')}`);
    }
    return jsonOk({
      noticesSent: result.noticesSent,
      locked: result.locked,
      noticeCount: result.noticesSent.length,
      lockCount: result.locked.length,
    });
  } catch (err) {
    return jsonError('Dunning enforcement failed: ' + (err as Error).message, 500);
  }
}
