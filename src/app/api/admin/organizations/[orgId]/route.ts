/**
 * Single organization + its subscription.
 *
 * GET   /api/admin/organizations/[orgId] — org, members, subscription, plan
 * PATCH /api/admin/organizations/[orgId] — rename, re-slug, set logo, set plan
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  getOrganization,
  listOrgMembers,
  updateOrganization,
} from '@/domain/billing/organization-service';
import { getPlan, getSubscription, isPlanId, setPlan } from '@/domain/billing/entitlement-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { orgId } = await params;
  const db = createRawClient();

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const [members, subscription] = await Promise.all([
      listOrgMembers(db, orgId),
      getSubscription(orgId, db),
    ]);

    return jsonOk({
      organization,
      members,
      subscription,
      plan: getPlan(subscription.planId),
    });
  } catch (err) {
    return jsonError('Failed to load organization: ' + (err as Error).message, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { orgId } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const db = createRawClient();
  try {
    const existing = await getOrganization(db, orgId);
    if (!existing) return jsonError('Organization not found', 404);

    const organization = await updateOrganization(db, orgId, {
      displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      logoUrl: typeof body.logoUrl === 'string' || body.logoUrl === null
        ? (body.logoUrl as string | null)
        : undefined,
    });

    // Plan changes go through setPlan() so the billing anchor is preserved.
    let subscription = await getSubscription(orgId, db);
    if (body.planId !== undefined) {
      if (!isPlanId(body.planId)) return jsonError(`Unknown planId: ${String(body.planId)}`, 400);
      subscription = await setPlan(
        orgId,
        {
          planId: body.planId,
          interval: body.interval === 'yearly' ? 'yearly' : body.interval === 'monthly' ? 'monthly' : undefined,
        },
        db,
      );
    }

    return jsonOk({ organization, subscription, plan: getPlan(subscription.planId) });
  } catch (err) {
    const message = (err as Error).message;
    if (/unique/i.test(message)) return jsonError('That slug is already taken', 409);
    return jsonError('Failed to update organization: ' + message, 500);
  }
}
