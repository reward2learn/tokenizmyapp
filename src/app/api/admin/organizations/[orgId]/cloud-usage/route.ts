/**
 * GET  /api/admin/organizations/:orgId/cloud-usage — run-time consumption.
 * PATCH /api/admin/organizations/:orgId/cloud-usage — auto top-up settings.
 *
 * Auth: platform admin (write), matching other billing routes.
 */
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getCloudUsage } from '@/domain/billing/cloud-usage-service';
import { updateCloudAutoTopUp } from '@/domain/billing/cloud-balance-service';
import { CREDIT_PACK_MIN_PRICE_CENTS } from '@/lib/billing/plans';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  autoTopUpThreshold: z.number().int().min(0).nullable(),
  autoTopUpAmount: z
    .number()
    .int()
    .min(CREDIT_PACK_MIN_PRICE_CENTS)
    .nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;
  const db = createRawClient();
  try {
    return jsonOk(await getCloudUsage(orgId, db));
  } catch (err) {
    return jsonError('Failed to read cloud usage: ' + (err as Error).message, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  // Both null = off; both set = on. Mixed is rejected.
  const { autoTopUpThreshold, autoTopUpAmount } = parsed.data;
  const oneSet =
    (autoTopUpThreshold == null) !== (autoTopUpAmount == null);
  if (oneSet) {
    return jsonError(
      'Set both autoTopUpThreshold and autoTopUpAmount, or both null to disable.',
      400,
    );
  }

  try {
    const db = createRawClient();
    const balance = await updateCloudAutoTopUp(orgId, parsed.data, db);
    return jsonOk(balance);
  } catch (err) {
    return jsonError('Failed to update auto top-up: ' + (err as Error).message, 500);
  }
}
