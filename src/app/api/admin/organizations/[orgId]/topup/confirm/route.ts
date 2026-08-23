/**
 * Confirm a paid credit top-up after Stripe Elements succeeds.
 *
 * POST /api/admin/organizations/[orgId]/topup/confirm
 *   Body: { paymentIntentId }
 *
 * Retrieves the PaymentIntent from the tenant (or factory) Stripe account,
 * verifies it succeeded with credit_topup metadata for this org, then calls
 * redeemCreditPack on the control-plane billing DB.
 *
 * Needed because top-ups often charge a per-tenant Stripe account whose
 * webhooks do not verify against this app's STRIPE_WEBHOOK_SECRET — so
 * payment_intent.succeeded never grants credits even though the card charged.
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireOrgCreditPurchase } from '@/lib/auth/billing-guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { confirmTopUpPaymentIntent } from '@/domain/billing/stripe-service';
import { requireStripeFor } from '@/lib/billing/stripe-client';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  paymentIntentId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const { orgId } = await params;
  const guard = await requireOrgCreditPurchase(request, orgId);
  if (!guard.ok) return guard.response;

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

  const db = createBillingRawClient();
  const stripeConfig = await resolveTenantStripeConfig(orgId, db);
  if (!stripeConfig?.secretKey) {
    return jsonError('Payments are not configured for this organization.', 503);
  }

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const stripe = requireStripeFor(stripeConfig);
    const result = await confirmTopUpPaymentIntent(
      orgId,
      parsed.data.paymentIntentId,
      db,
      stripe,
    );

    return jsonOk(result);
  } catch (err) {
    return jsonError('Could not confirm top-up: ' + (err as Error).message, 500);
  }
}
