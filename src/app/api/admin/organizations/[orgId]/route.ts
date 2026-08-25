/**
 * Single organization + its subscription.
 *
 * GET   /api/admin/organizations/[orgId] — org, members, subscription, plan
 * PATCH /api/admin/organizations/[orgId] — rename, re-slug, set logo, billing details
 *         (planId is rejected — plans change only via Checkout + webhooks)
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { isPlatformApp } from '@shared/lib/config/tenant';
import {
  getOrganization,
  listOrgMembers,
  updateOrganization,
  deleteOrganization,
} from '@/domain/billing/organization-service';
import { getPlan, getSubscription } from '@/domain/billing/entitlement-service';

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

/**
 * Billing-detail fields off the request body.
 *
 * Absent stays absent: `undefined` means "not being changed", which is what
 * lets this endpoint serve both the General form and the Billing Details form
 * without either clearing the other's fields. Explicit null clears.
 */
function billingDetails(body: Record<string, unknown>): Record<string, string | null | undefined> {
  const fields = [
    'billingEmail',
    'billingName',
    'billingCountry',
    'billingLine1',
    'billingLine2',
    'billingCity',
    'billingPostal',
    'taxId',
  ] as const;

  const out: Record<string, string | null | undefined> = {};
  for (const field of fields) {
    const value = body[field];
    if (typeof value === 'string' || value === null) out[field] = value;
  }
  return out;
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

    const identityFields = ['displayName', 'slug', 'logoUrl'] as const;
    const hasIdentityChange = identityFields.some((field) => body[field] !== undefined);
    if (!isPlatformApp() && hasIdentityChange) {
      return jsonError(
        'Organization name, slug, and logo can only be changed from the platform console.',
        403,
      );
    }

    const organization = await updateOrganization(db, orgId, {
      displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      logoUrl: typeof body.logoUrl === 'string' || body.logoUrl === null
        ? (body.logoUrl as string | null)
        : undefined,
      ...billingDetails(body),
    });

    // Plans change only via Stripe Checkout + webhooks — never a free PATCH.
    // Letting this endpoint set planId would skip payment and break dunning.
    if (body.planId !== undefined) {
      return jsonError(
        'Plan changes require a completed purchase. Open Settings → Billing → Plan (or the tenant Choose Plan dialog) to check out.',
        403,
      );
    }

    const subscription = await getSubscription(orgId, db);
    return jsonOk({ organization, subscription, plan: getPlan(subscription.planId) });
  } catch (err) {
    const message = (err as Error).message;
    if (/unique/i.test(message)) return jsonError('That slug is already taken', 409);
    return jsonError('Failed to update organization: ' + message, 500);
  }
}

/** DELETE /api/admin/organizations/[orgId] — delete an organization */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { orgId } = await params;
  const db = createRawClient();

  try {
    const result = await deleteOrganization(db, orgId);
    if (!result.success) {
      return jsonError('Organization not found or could not be deleted', 404);
    }
    return jsonOk({ message: 'Organization deleted', tenantsReassigned: result.tenantsReassigned });
  } catch (err) {
    return jsonError('Failed to delete organization: ' + (err as Error).message, 500);
  }
}
