/**
 * Confirm a USDC credit top-up after on-chain transfer.
 *
 * POST /api/admin/organizations/[orgId]/crypto-topup/confirm
 *   Body: { intentId, txHash }
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireLinkedWallet, requireOrgCreditPurchase } from '@/lib/auth/billing-guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';
import { confirmCryptoTopUp } from '@/domain/billing/crypto-payment-service';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  intentId: z.string().min(1),
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
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

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const result = await confirmCryptoTopUp(
      orgId,
      parsed.data.intentId,
      parsed.data.txHash,
      db,
    );

    return jsonOk(result);
  } catch (err) {
    return jsonError('Could not confirm crypto top-up: ' + (err as Error).message, 500);
  }
}
