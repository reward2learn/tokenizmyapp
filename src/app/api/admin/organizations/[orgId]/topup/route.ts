/**
 * Paid credit top-up — Phase 4.
 *
 * POST /api/admin/organizations/[orgId]/topup
 *   Body: { packId }
 *   Returns a Stripe PaymentIntent client secret for inline Elements.
 *
 * This is the PAID path. The existing POST .../credits is the unpaid admin
 * grant, and the two stay separate on purpose: one moves money and one does
 * not, and collapsing them would make it impossible to tell purchased credits
 * from comped ones in revenue reporting.
 *
 * Credits are NOT granted here — `payment_intent.succeeded` grants them, so a
 * customer who closes the tab mid-payment still gets what they paid for, and a
 * customer whose card is declined never gets credits at all.
 */
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { createTopUpIntent, stripeReadiness } from '@/domain/billing/stripe-service';
import { getStripePublishableKey, requireStripeFor } from '@/lib/billing/stripe-client';
import { CREDIT_PACKS, canPurchaseCreditPacks } from '@/lib/billing/plans';
import { getSubscription } from '@/domain/billing/entitlement-service';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  packId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { orgId } = await params;
  const db = createRawClient();
  const stripeConfig = await resolveTenantStripeConfig(orgId, db);
  const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;

  const readiness = stripeReadiness(stripeConfig ?? undefined);
  if (!readiness.hasSecretKey || !readiness.hasWebhookSecret) {
    // The webhook secret is required even though this endpoint does not use it:
    // without a working webhook the payment would succeed and the credits would
    // never arrive, which is worse than refusing the sale.
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

  const pack = CREDIT_PACKS.find((p) => p.id === parsed.data.packId);
  if (!pack) {
    return jsonError(
      `Unknown credit pack "${parsed.data.packId}". Available: ${CREDIT_PACKS.map((p) => p.id).join(', ')}`,
      400,
    );
  }

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const subscription = await getSubscription(orgId, db);
    if (!canPurchaseCreditPacks(subscription.planId)) {
      return jsonError('Credit pack purchases require a Pro plan or higher.', 403);
    }

    const intent = await createTopUpIntent(orgId, pack.id, db, stripe);

    return jsonOk({
      clientSecret: intent.clientSecret,
      paymentIntentId: intent.paymentIntentId,
      amountCents: intent.amountCents,
      publishableKey: stripeConfig?.publishableKey ?? getStripePublishableKey(),
      pack,
    });
  } catch (err) {
    return jsonError('Could not start the top-up: ' + (err as Error).message, 500);
  }
}
