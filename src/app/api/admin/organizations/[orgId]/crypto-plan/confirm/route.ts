/**
 * Confirm a USDC prepaid plan purchase after on-chain transfer.
 *
 * POST /api/admin/organizations/[orgId]/crypto-plan/confirm
 *   Body: { intentId, txHash }
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireLinkedWallet } from '@/lib/auth/billing-guards';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';
import { confirmCryptoPlanPurchase } from '@/domain/billing/crypto-payment-service';

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
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let linked = await requireLinkedWallet(guard);
  if (!linked.ok) return linked.response;

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

    const result = await confirmCryptoPlanPurchase(
      orgId,
      parsed.data.intentId,
      parsed.data.txHash,
      db,
    );

    return jsonOk(result);
  } catch (err) {
    return jsonError('Could not confirm crypto plan purchase: ' + (err as Error).message, 500);
  }
}
