/**
 * Tenant → Organization assignment and entitlement summary.
 *
 * GET /api/admin/tenants/[slug]/organization — owning org, plan and entitlements
 * PUT /api/admin/tenants/[slug]/organization — move the tenant to another org
 *
 * The GET is what client surfaces call to decide whether to show a paywall,
 * so it returns the resolved feature list rather than making the client
 * re-derive it from the plan id.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  assignTenantToOrg,
  getOrganization,
  resolveOrgForTenant,
} from '@/domain/billing/organization-service';
import { getPlanForOrg, getSubscription } from '@/domain/billing/entitlement-service';
import { resolveTenantSelfServeBilling } from '@/domain/billing/self-serve-billing-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    const organization = await resolveOrgForTenant(slug, db);
    if (!organization) return jsonError('Tenant not found', 404);

    const [subscription, plan] = await Promise.all([
      getSubscription(organization.id, db),
      getPlanForOrg(organization.id, db),
    ]);

    const selfServe = await resolveTenantSelfServeBilling(organization.id, db);

    return jsonOk({
      organization,
      subscription,
      plan,
      // Resolved server-side so a client never has to map planId → features.
      features: plan.features,
      selfServeBilling: selfServe.config,
    });
  } catch (err) {
    return jsonError('Failed to resolve organization: ' + (err as Error).message, 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  if (!orgId) return jsonError('orgId is required', 400);

  const db = createRawClient();
  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const moved = await assignTenantToOrg(db, slug, orgId);
    if (!moved) return jsonError('Tenant not found', 404);

    return jsonOk({ tenantSlug: slug, organization });
  } catch (err) {
    return jsonError('Failed to assign organization: ' + (err as Error).message, 500);
  }
}
