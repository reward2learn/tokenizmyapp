/**
 * Confirm Cloud Credits top-up after Checkout Elements succeeds.
 *
 * POST /api/admin/organizations/[orgId]/cloud-topup/confirm
 *   Body: { checkoutSessionId }
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireOrgCreditPurchase } from '@/lib/auth/billing-guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { confirmCloudTopUpCheckoutSession } from '@/domain/billing/stripe-service';
import { requireStripeFor } from '@/lib/billing/stripe-client';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  checkoutSessionId: z.string().min(1),
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

  try {
    const db = createBillingRawClient();
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const stripe = stripeConfig ? requireStripeFor(stripeConfig) : undefined;
    const result = await confirmCloudTopUpCheckoutSession(
      orgId,
      parsed.data.checkoutSessionId,
      db,
      stripe,
    );
    return jsonOk(result);
  } catch (err) {
    return jsonError('Could not confirm cloud top-up: ' + (err as Error).message, 500);
  }
}
