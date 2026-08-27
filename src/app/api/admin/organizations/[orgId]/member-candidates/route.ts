/**
 * GET /api/admin/organizations/:orgId/member-candidates
 *
 * Users already provisioned on tenants owned by this org — for the Teammates
 * picker. Replaces pasting opaque Account ids.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';
import { listMemberCandidates } from '@/domain/billing/org-teammate-invite';

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
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const { tenants, candidates } = await listMemberCandidates(db, orgId);
    return jsonOk({ tenants, candidates });
  } catch (err) {
    return jsonError('Failed to load candidates: ' + (err as Error).message, 500);
  }
}
