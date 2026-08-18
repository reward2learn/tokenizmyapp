/**
 * Plan purchase and plan change — Phase 4.
 *
 * GET  /api/admin/organizations/[orgId]/checkout
 *   Stripe readiness plus the plan × interval combinations this deployment can
 *   actually sell. The UI needs this to avoid offering a plan whose price id
 *   is missing, which would fail only after the customer clicked buy.
 *
 * POST /api/admin/organizations/[orgId]/checkout
 *   Body: { planId, interval, successUrl?, cancelUrl? }
 *   No subscription yet → returns a hosted Checkout URL to redirect to.
 *   Already subscribed → changes the plan in place and reports whether it
 *   applied immediately (upgrade) or is scheduled (downgrade).
 *
 * Neither path writes the new plan. The webhook does — see
 * stripe-webhook-service.ts for why that asymmetry is deliberate.
 *
 * Auth: requireWriteAuth + platform admin. Billing is control-plane money.
 */
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import {
  createCheckoutSession,
  changePlan,
  getStripeLinkage,
  stripeReadiness,
} from '@/domain/billing/stripe-service';
import { listConfiguredPrices } from '@/lib/billing/stripe-client';
import { isPlanId } from '@/lib/billing/plans';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  planId: z.string().refine(isPlanId, 'Unknown plan id'),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/** Fallback return URLs when the caller does not supply them. */
function defaultUrls(request: Request): { successUrl: string; cancelUrl: string } {
  const origin = new URL(request.url).origin;
  return {
    successUrl: `${origin}/admin?billing=success`,
    cancelUrl: `${origin}/admin?billing=cancelled`,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;
  const db = createRawClient();
  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    return jsonOk({
      // Tenant orgs report the tenant's own Stripe configuration, so the
      // billing panel shows the tenant's real readiness instead of this
      // deployment's (the factory env has no per-tenant keys).
      readiness: stripeReadiness(stripeConfig ?? undefined),
      purchasable: listConfiguredPrices().map(({ planId, interval }) => ({ planId, interval })),
      linkage: await getStripeLinkage(orgId, db),
    });
  } catch (err) {
    return jsonError('Failed to read billing state: ' + (err as Error).message, 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;

  if (!stripeReadiness().ready) {
    // 503, not 400: the request is fine, the deployment is not configured.
    return jsonError(
      'Payments are not configured. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and at least one STRIPE_PRICE_* variable.',
      503,
    );
  }

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
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const { planId, interval } = parsed.data;
    const linkage = await getStripeLinkage(orgId, db);

    // An existing subscription is modified in place so the billing anchor and
    // proration rules apply; a fresh Checkout session would start a second
    // subscription and bill the customer twice.
    if (linkage.subscriptionId) {
      const result = await changePlan(orgId, planId, interval, db);
      return jsonOk({
        mode: 'plan_change',
        applied: result.applied,
        planId,
        interval,
      });
    }

    const urls = defaultUrls(request);
    const session = await createCheckoutSession(
      {
        orgId,
        planId,
        interval,
        successUrl: parsed.data.successUrl ?? urls.successUrl,
        cancelUrl: parsed.data.cancelUrl ?? urls.cancelUrl,
      },
      db,
    );

    return jsonOk({ mode: 'checkout', url: session.url, sessionId: session.sessionId });
  } catch (err) {
    return jsonError('Checkout failed: ' + (err as Error).message, 500);
  }
}
