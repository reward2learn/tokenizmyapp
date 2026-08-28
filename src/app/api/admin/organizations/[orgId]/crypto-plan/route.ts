/**
 * Prepaid plan purchase — USDC rail (Phase 5 dual-rail billing).
 *
 * POST /api/admin/organizations/[orgId]/crypto-plan
 *   Body: { planId, prepaidMonths }
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireLinkedWallet } from '@/lib/auth/billing-guards';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';
import { getStripeLinkage } from '@/domain/billing/stripe-service';
import { createCryptoPlanIntent } from '@/domain/billing/crypto-payment-service';
import { cryptoPaymentsReadiness, CRYPTO_PLAN_PREPAID_MONTHS } from '@/lib/web3/crypto-billing-config';
import { isPlanId, isCryptoPrepaidPlanId } from '@/lib/billing/plans';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  planId: z.string().refine(isPlanId, 'Unknown plan id'),
  prepaidMonths: z.coerce
    .number()
    .int()
    .refine(
      (n): n is (typeof CRYPTO_PLAN_PREPAID_MONTHS)[number] =>
        (CRYPTO_PLAN_PREPAID_MONTHS as readonly number[]).includes(n),
      `prepaidMonths must be one of ${CRYPTO_PLAN_PREPAID_MONTHS.join(', ')}`,
    ),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const { orgId } = await params;
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let linked = await requireLinkedWallet(guard);
  if (!linked.ok) return linked.response;

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

  if (!isCryptoPrepaidPlanId(parsed.data.planId)) {
    return jsonError(`Plan "${parsed.data.planId}" is not available for crypto prepaid purchase.`, 400);
  }

  const db = createBillingRawClient();

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const linkage = await getStripeLinkage(orgId, db);
    if (linkage.subscriptionId) {
      return jsonError(
        'This organization has an active Stripe subscription. Change plans via Stripe or cancel first.',
        400,
      );
    }

    const intent = await createCryptoPlanIntent(
      orgId,
      parsed.data.planId,
      parsed.data.prepaidMonths,
      linked.session.walletAddress!,
      db,
    );

    return jsonOk(intent);
  } catch (err) {
    return jsonError('Could not start crypto plan checkout: ' + (err as Error).message, 500);
  }
}
