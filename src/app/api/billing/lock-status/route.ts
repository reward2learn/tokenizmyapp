/**
 * GET /api/billing/lock-status?orgId=
 *
 * Returns whether the organization is billing-locked and the countdown until
 * lock (or 0d:00h:00m when already locked). Used by Settings and the app shell
 * to redirect billing owners to Invoices.
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrgLockStatus, isBillingOwner } from '@/domain/billing/dunning-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const orgId = new URL(request.url).searchParams.get('orgId')?.trim();
  if (!orgId) return jsonError('orgId is required', 400);

  try {
    const { locked, state, countdown } = await getOrgLockStatus(orgId);
    const userId = guard.session.sub;
    return jsonOk({
      locked,
      countdown,
      attemptCount: state?.attemptCount ?? 0,
      noticeCount: state?.noticeCount ?? 0,
      canUnlock: isBillingOwner(userId, state),
      unlockUserId: state?.unlockUserId ?? null,
      defaultPmDisabled: Boolean(state?.defaultPmDisabledAt),
    });
  } catch (err) {
    return jsonError('Failed to load lock status: ' + (err as Error).message, 500);
  }
}
