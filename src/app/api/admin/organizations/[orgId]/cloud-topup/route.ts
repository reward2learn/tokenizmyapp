/**
 * Paid Cloud Credits top-up — Phase 5.
 *
 * POST /api/admin/organizations/[orgId]/cloud-topup
 *   Body: { amountCents }
 *   Returns a Stripe Checkout Session client secret for inline Elements.
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireOrgCreditPurchase } from '@/lib/auth/billing-guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import {
  createCloudTopUpCheckoutSession,
  stripeReadiness,
} from '@/domain/billing/stripe-service';
import { getStripePublishableKey, requireStripeFor } from '@/lib/billing/stripe-client';
import { CREDIT_PACK_MIN_PRICE_CENTS } from '@/lib/billing/plans';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  amountCents: z.number().int().min(CREDIT_PACK_MIN_PRICE_CENTS),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const { orgId } = await params;
  const guard = await requireOrgCreditPurchase(request, orgId);
  if (!guard.ok) return guard.response;

  const db = createBillingRawClient();
  const stripeConfig = await resolveTenantStripeConfig(orgId, db);
  const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;

  const readiness = stripeReadiness(stripeConfig ?? undefined);
  if (!readiness.hasSecretKey || !readiness.hasWebhookSecret) {
    return jsonError(
      'Payments are not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.',
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

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const returnUrlObj = new URL('/settings/billing', request.url);
    returnUrlObj.searchParams.set('cloud_topup', 'complete');
    returnUrlObj.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    const returnUrl = returnUrlObj.toString();

    const session = await createCloudTopUpCheckoutSession(
      orgId,
      parsed.data.amountCents,
      returnUrl,
      db,
      stripe,
    );

    return jsonOk({
      clientSecret: session.clientSecret,
      checkoutSessionId: session.checkoutSessionId,
      amountCents: session.amountCents,
      publishableKey: stripeConfig?.publishableKey ?? getStripePublishableKey(),
    });
  } catch (err) {
    return jsonError('Could not start the cloud top-up: ' + (err as Error).message, 500);
  }
}
