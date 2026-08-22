/**
 * Plan purchase and plan change — Phase 4.
 *
 * GET  /api/admin/organizations/[orgId]/checkout
 *   Stripe readiness plus the plan × interval combinations this deployment can
 *   actually sell. The UI needs this to avoid offering a plan whose price id
 *   is missing, which would fail only after the customer clicked buy.
 *
 *   Also reconciles the stored plan against Stripe before answering, and
 *   returns the result as `subscription`. Opening Settings → Billing is
 *   therefore self-healing: a purchase whose webhook never arrived shows the
 *   plan the customer actually bought instead of Free.
 *
 * POST /api/admin/organizations/[orgId]/checkout
 *   Body: { planId, interval, successUrl?, cancelUrl? }
 *   No subscription yet → returns a hosted Checkout URL to redirect to.
 *   Already subscribed → changes the plan in place and reports whether it
 *   applied immediately (upgrade) or is scheduled (downgrade).
 *
 * Neither POST path writes the new plan. The webhook does — see
 * stripe-webhook-service.ts for why that asymmetry is deliberate. GET is the
 * safety net for when the webhook never arrives; it converges on Stripe rather
 * than deciding anything itself.
 *
 * Auth: requireWriteAuth + platform admin. Billing is control-plane money.
 */
import type Stripe from 'stripe';
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import {
  createCheckoutSession,
  createEmbeddedSubscriptionCheckoutSession,
  changePlan,
  findPriceMismatches,
  getStripeLinkage,
  reconcileSubscriptionFromStripe,
  stripeReadiness,
} from '@/domain/billing/stripe-service';
import { getSubscription } from '@/domain/billing/entitlement-service';
import { getStripePublishableKey, listConfiguredPrices } from '@/lib/billing/stripe-client';
import { isPlanId } from '@/lib/billing/plans';

function formatStripeApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'type' in err) {
    const stripeErr = err as Stripe.errors.StripeError;
    const param = 'param' in stripeErr && stripeErr.param ? ` (param: ${stripeErr.param})` : '';
    return `${stripeErr.message}${param}`;
  }
  return err instanceof Error ? err.message : String(err);
}

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  planId: z.string().refine(isPlanId, 'Unknown plan id'),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  /** When true, return an embedded Checkout client_secret instead of a hosted URL. */
  embedded: z.boolean().optional().default(false),
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

    // Repair before reporting. A missing STRIPE_WEBHOOK_SECRET or an
    // unregistered endpoint leaves a paid customer on Free with nothing in the
    // product to notice it; asking Stripe on the read that renders the plan
    // closes that gap without depending on webhook delivery. Never fatal — a
    // Stripe outage should degrade to the stored plan, not a 500 on Settings.
    let reconcile: Awaited<ReturnType<typeof reconcileSubscriptionFromStripe>> | null = null;
    try {
      reconcile = await reconcileSubscriptionFromStripe(orgId, db, stripeConfig ?? undefined);
      if (reconcile.changed) {
        console.log(`[billing] ${orgId}: ${reconcile.reason}`);
      }
    } catch (err) {
      console.warn(`[billing] Reconcile failed for ${orgId}:`, (err as Error).message);
    }

    // A plan whose card and Stripe price disagree is not sellable: the customer
    // would be charged an amount the page never showed them. Dropping it from
    // `purchasable` greys out its Choose button, which is the same mechanism
    // already used for a plan with no configured price at all.
    let mismatches: Awaited<ReturnType<typeof findPriceMismatches>> = [];
    try {
      mismatches = await findPriceMismatches(stripeConfig ?? undefined);
    } catch (err) {
      console.warn(`[billing] Price check failed for ${orgId}:`, (err as Error).message);
    }
    const mispriced = new Set(mismatches.map((m) => `${m.planId}:${m.interval}`));

    return jsonOk({
      // Tenant orgs report the tenant's own Stripe configuration, so the
      // billing panel shows the tenant's real readiness instead of this
      // deployment's (the factory env has no per-tenant keys).
      readiness: stripeReadiness(stripeConfig ?? undefined),
      purchasable: listConfiguredPrices(stripeConfig ?? undefined)
        .filter(({ planId, interval }) => !mispriced.has(`${planId}:${interval}`))
        .map(({ planId, interval }) => ({
          planId,
          interval,
        })),
      priceMismatches: mismatches.map((m) => m.message),
      linkage: await getStripeLinkage(orgId, db),
      // Read after the reconcile so the Plan tab marks the plan Stripe agrees
      // with, rather than the one the organization GET cached a moment ago.
      subscription: await getSubscription(orgId, db),
      // Only the price-catalog mismatch. Every other outcome is ordinary, and
      // reporting those would hang a permanent warning on healthy accounts —
      // see ReconcileCode. This one looks exactly like "my payment did nothing"
      // from the customer's side, so it has to be visible in the panel and not
      // only in the server log.
      reconcileNote: reconcile?.code === 'price_unknown' ? reconcile.reason : null,
      publishableKey: stripeConfig?.publishableKey?.trim() || getStripePublishableKey(),
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

  const db = createRawClient();
  const stripeConfig = await resolveTenantStripeConfig(orgId, db);

  if (!stripeReadiness(stripeConfig ?? undefined).ready) {
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

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const { planId, interval, embedded } = parsed.data;
    const linkage = await getStripeLinkage(orgId, db);

    // An existing subscription is modified in place so the billing anchor and
    // proration rules apply; a fresh Checkout session would start a second
    // subscription and bill the customer twice.
    if (linkage.subscriptionId) {
      const result = await changePlan(orgId, planId, interval, db, stripeConfig ?? undefined);
      return jsonOk({
        mode: 'plan_change',
        applied: result.applied,
        planId,
        interval,
      });
    }

    const urls = defaultUrls(request);
    const publishableKey = stripeConfig?.publishableKey?.trim() || getStripePublishableKey();

    if (embedded) {
      if (!publishableKey) {
        return jsonError(
          'Embedded Checkout requires a publishable key on this tenant (Organization & Billing → Stripe publishable key).',
          503,
        );
      }
      const session = await createEmbeddedSubscriptionCheckoutSession(
        {
          orgId,
          planId,
          interval,
        },
        db,
        stripeConfig ?? undefined,
      );
      return jsonOk({
        mode: 'embedded_checkout',
        clientSecret: session.clientSecret,
        sessionId: session.sessionId,
        publishableKey,
      });
    }

    const session = await createCheckoutSession(
      {
        orgId,
        planId,
        interval,
        successUrl: parsed.data.successUrl ?? urls.successUrl,
        cancelUrl: parsed.data.cancelUrl ?? urls.cancelUrl,
      },
      db,
      stripeConfig ?? undefined,
    );

    return jsonOk({ mode: 'checkout', url: session.url, sessionId: session.sessionId });
  } catch (err) {
    const detail = formatStripeApiError(err);
    const status =
      err && typeof err === 'object' && 'statusCode' in err && (err as Stripe.errors.StripeError).statusCode === 400
        ? 400
        : 500;
    return jsonError(`Checkout failed: ${detail}`, status);
  }
}
