/**
 * Agentic credit top-up checkout — hosted Stripe Checkout when ACS catalog is live.
 *
 * POST /api/admin/organizations/[orgId]/agentic-topup
 *   Body: { packId, successUrl?, cancelUrl? }
 */
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireOrgCreditPurchase } from '@/lib/auth/billing-guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { stripeReadiness } from '@/domain/billing/stripe-service';
import { CREDIT_PACKS, canPurchaseCreditPacks } from '@/lib/billing/plans';
import { getSubscription } from '@/domain/billing/entitlement-service';
import {
  createAgenticTopUpCheckout,
  isAgenticCatalogLive,
  resolveTenantAgenticCommerce,
} from '@/domain/billing/agentic-catalog-service';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  packId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const { orgId } = await params;
  const guard = await requireOrgCreditPurchase(request, orgId);
  if (!guard.ok) return guard.response;

  const db = createRawClient();
  const stripeConfig = await resolveTenantStripeConfig(orgId, db);
  const readiness = stripeReadiness(stripeConfig ?? undefined);
  if (!readiness.hasSecretKey || !readiness.hasWebhookSecret) {
    return jsonError(
      'Payments are not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.',
      503,
    );
  }

  const subscription = await getSubscription(orgId, db);
  if (!canPurchaseCreditPacks(subscription.planId)) {
    return jsonError('Credit pack purchases require a Pro plan or higher.', 403);
  }

  const agentic = await resolveTenantAgenticCommerce(orgId, db);
  if (!isAgenticCatalogLive(agentic.config)) {
    return jsonError(
      'Agentic catalog is not live for this organization. Sync the catalog in Organization & Billing first.',
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

  const organization = await getOrganization(db, orgId);
  if (!organization) return jsonError('Organization not found', 404);

  const origin = process.env.NEXT_PUBLIC_APP_URL?.trim()
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tokenizmyapp.vercel.app');
  const successUrl = parsed.data.successUrl ?? `${origin}/settings/billing?topup=success`;
  const cancelUrl = parsed.data.cancelUrl ?? `${origin}/settings/billing?topup=cancelled`;

  try {
    const checkout = await createAgenticTopUpCheckout(
      orgId,
      pack.id,
      successUrl,
      cancelUrl,
      db,
      stripeConfig,
    );

    return jsonOk({
      checkoutUrl: checkout.url,
      sessionId: checkout.sessionId,
      sku: checkout.sku,
      pack,
    });
  } catch (err) {
    return jsonError('Could not start agentic checkout: ' + (err as Error).message, 500);
  }
}
