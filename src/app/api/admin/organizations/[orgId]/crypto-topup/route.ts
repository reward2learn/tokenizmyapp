/**
 * Paid credit top-up — USDC rail (Phase 4 dual-rail billing).
 *
 * POST /api/admin/organizations/[orgId]/crypto-topup
 *   Body: { packId }
 *   Returns a payment intent for an on-chain USDC transfer to treasury.
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireLinkedWallet, requireOrgCreditPurchase } from '@/lib/auth/billing-guards';
import { resolveViewerUserId } from '@/lib/auth/resolve-viewer-user';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { createCryptoTopUpIntent } from '@/domain/billing/crypto-payment-service';
import { cryptoPaymentsReadiness } from '@/lib/web3/crypto-billing-config';
import { CREDIT_PACKS, canPurchaseCreditPacks } from '@/lib/billing/plans';
import { getSubscription } from '@/domain/billing/entitlement-service';
import { reconcileSubscriptionFromStripe } from '@/domain/billing/stripe-service';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  packId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const { orgId } = await params;
  let guard = await requireOrgCreditPurchase(request, orgId);
  if (!guard.ok) return guard.response;
  guard = await requireLinkedWallet(guard);
  if (!guard.ok) return guard.response;

  const readiness = cryptoPaymentsReadiness();
  if (!readiness.enabled) {
    return jsonError(
      'Crypto payments are not configured. Set CRYPTO_TREASURY_ADDRESS and CRYPTO_PAYMENTS_ENABLED.',
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

  const db = createBillingRawClient();

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    try {
      const reconcile = await reconcileSubscriptionFromStripe(
        orgId,
        db,
        stripeConfig ?? undefined,
      );
      if (reconcile.changed) {
        console.log(`[billing] crypto-topup reconcile ${orgId}: ${reconcile.reason}`);
      }
    } catch (err) {
      console.warn(
        `[billing] crypto-topup reconcile failed for ${orgId}:`,
        (err as Error).message,
      );
    }

    const subscription = await getSubscription(orgId, db);
    if (!canPurchaseCreditPacks(subscription.planId)) {
      return jsonError(
        `Credit pack purchases require a Pro plan or higher. This organization (${orgId}) is on the ${subscription.planId} plan.`,
        403,
      );
    }

    const purchaserUserId = sessionIsPlatformAdmin(guard.session)
      ? null
      : await resolveViewerUserId(guard.session.sub);

    const intent = await createCryptoTopUpIntent(
      orgId,
      pack.id,
      guard.session.walletAddress!,
      { purchaserUserId },
      db,
    );

    return jsonOk({
      intentId: intent.intentId,
      treasury: intent.treasury,
      amountUsdc: intent.amountUsdc,
      chainId: intent.chainId,
      usdcContract: intent.usdcContract,
      reference: intent.reference,
      expiresAt: intent.expiresAt,
      pack: intent.pack,
    });
  } catch (err) {
    return jsonError('Could not start crypto top-up: ' + (err as Error).message, 500);
  }
}
