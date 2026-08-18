/**
 * GET /api/admin/organizations/:orgId/cloud-usage — run-time consumption.
 *
 * Auth: requireWriteAuth + platform admin, matching every other billing read.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getCloudUsage } from '@/domain/billing/cloud-usage-service';

export const dynamic = 'force-dynamic';

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
