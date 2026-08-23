/**
 * Paid credit top-up — Phase 4.
 *
 * POST /api/admin/organizations/[orgId]/topup
 *   Body: { packId }
 *   Returns a Stripe Checkout Session client secret for inline Elements.
 *
 * This is the PAID path. The existing POST .../credits is the unpaid admin
 * grant, and the two stay separate on purpose: one moves money and one does
 * not, and collapsing them would make it impossible to tell purchased credits
 * from comped ones in revenue reporting.
 *
 * Credits are granted after payment via webhook and/or POST …/topup/confirm.
 * The create endpoint only returns a client secret — it does not grant credits.
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireOrgCreditPurchase } from '@/lib/auth/billing-guards';
import { resolveViewerUserId } from '@/lib/auth/resolve-viewer-user';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import {
  createTopUpCheckoutSession,
  reconcileSubscriptionFromStripe,
  stripeReadiness,
} from '@/domain/billing/stripe-service';
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
  const { orgId } = await params;
  const guard = await requireOrgCreditPurchase(request, orgId);
  if (!guard.ok) return guard.response;

  const db = createBillingRawClient();
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

    // Same self-heal as GET …/checkout: a paid Pro whose webhook never landed
    // still shows Free in the DB. Reconcile before the Pro gate so top-up does
    // not 403 after a successful plan purchase on this org.
    try {
      const reconcile = await reconcileSubscriptionFromStripe(
        orgId,
        db,
        stripeConfig ?? undefined,
      );
      if (reconcile.changed) {
        console.log(`[billing] topup reconcile ${orgId}: ${reconcile.reason}`);
      }
    } catch (err) {
      console.warn(`[billing] topup reconcile failed for ${orgId}:`, (err as Error).message);
    }

    const subscription = await getSubscription(orgId, db);
    if (!canPurchaseCreditPacks(subscription.planId)) {
      return jsonError(
        `Credit pack purchases require a Pro plan or higher. This organization (${orgId}) is on the ${subscription.planId} plan.`,
        403,
      );
    }

    // Platform admins grant org-wide credits; self-serve purchasers get a personal pool.
    const purchaserUserId = sessionIsPlatformAdmin(guard.session)
      ? null
      : await resolveViewerUserId(guard.session.sub);

    const returnUrlObj = new URL('/settings/billing', request.url);
    returnUrlObj.searchParams.set('topup', 'complete');
    returnUrlObj.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    const returnUrl = returnUrlObj.toString();

    const session = await createTopUpCheckoutSession(
      orgId,
      pack.id,
      returnUrl,
      db,
      stripe,
      { purchaserUserId },
    );

    return jsonOk({
      clientSecret: session.clientSecret,
      checkoutSessionId: session.checkoutSessionId,
      amountCents: session.amountCents,
      publishableKey: stripeConfig?.publishableKey ?? getStripePublishableKey(),
      pack,
    });
  } catch (err) {
    return jsonError('Could not start the top-up: ' + (err as Error).message, 500);
  }
}
