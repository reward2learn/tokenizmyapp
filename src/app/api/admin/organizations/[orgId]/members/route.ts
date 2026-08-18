/**
 * Organization membership.
 *
 * POST /api/admin/organizations/:orgId/members — add or re-role someone
 *
 * Write only. Reading membership is already `GET /api/admin/organizations/:orgId`,
 * which returns members alongside the organization; a second read path here
 * would be two caches for one fact.
 *
 * Always the platform root DB: membership decides who can act on billing, and
 * billing state is control-plane. See organization-service.ts.
 *
 * Auth: requireWriteAuth + platform admin. Membership grants reach over an
 * organization's plan and credit balance, so it is gated exactly as tightly as
 * the credit and checkout routes — anything looser would make this the soft
 * way in to everything they protect.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  addOrgMember,
  getOrganization,
  listOrgMembers,
} from '@/domain/billing/organization-service';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  userId: z.string().trim().min(1, 'userId is required'),
  role: z.enum(['owner', 'admin', 'member', 'billing']).default('member'),
});

export async function POST(
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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  const db = createRawClient();
  try {
    // Checked before the insert rather than after: org_members carries no
    // foreign key on the runtime-DDL path, so a bad orgId would otherwise be
    // accepted and produce a member of an organization that does not exist.
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    await addOrgMember(db, orgId, parsed.data.userId, parsed.data.role);
    const members = await listOrgMembers(db, orgId);
    return jsonOk({ members }, { status: 201 });
  } catch (err) {
    return jsonError('Failed to add member: ' + (err as Error).message, 500);
  }
}
