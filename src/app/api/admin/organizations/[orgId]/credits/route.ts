/**
 * Organization credits — Phase 3 admin top-up + balance surface.
 *
 * GET  /api/admin/organizations/[orgId]/credits
 *   Returns: balance { available, expiringSoon }, recent grants (50), recent
 *   ledger entries (50) — the audit trail behind the balance.
 *
 * POST /api/admin/organizations/[orgId]/credits
 *   Body: { packId: string, paymentRef?: string }             — redeem a catalog pack
 *      or { source: 'addon'|'promo'|'onetime', amount, metadata? } — manual adjustment
 *   Grants credits to the org (30-day expiry, oldest-expiring-first
 *   consumption). This is the admin top-up path; the Stripe purchase flow
 *   (Phase 4) will call the same redeemCreditPack() with the payment reference.
 *
 * Auth: platform admin, or self-serve tenant users (read balance only).
 */
import { z } from 'zod';
import { createBillingRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { requireOrgCreditsRead } from '@/lib/auth/billing-guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization, resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { stripeReadiness } from '@/domain/billing/stripe-service';
import {
  getCreditBalance,
  grantCredits,
  redeemCreditPack,
  reconcileCredits,
  mapCreditGrant,
  mapCreditLedgerEntry,
} from '@/domain/billing/credit-service';

export const dynamic = 'force-dynamic';

const GRANTS_LIMIT = 50;
const LEDGER_LIMIT = 50;

/**
 * Two ways to add credits, and they are not interchangeable:
 *
 *  - `{ packId }`  — redeem a catalog pack. Writes the base as an `addon` grant
 *                    and the bonus as a separate `promo` grant, so promotional
 *                    generosity stays measurable and separately reversible.
 *  - `{ source, amount }` — a manual adjustment (support credit, negotiated
 *                    volume deal). Deliberately kept: packs must not become the
 *                    only lever, or every off-catalog grant gets mislabelled as
 *                    a purchase and pollutes revenue reporting.
 */
const postSchema = z.union([
  z.object({
    packId: z.string().min(1),
    paymentRef: z.string().min(1).optional(),
  }),
  z.object({
    source: z.enum(['addon', 'promo', 'onetime']),
    amount: z.number().int().positive('Amount must be a positive integer'),
    metadata: z.record(z.unknown()).optional(),
  }),
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const { orgId } = await params;
  const guard = await requireOrgCreditsRead(request, orgId);
  if (!guard.ok) return guard.response;

  const db = createBillingRawClient();

  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const paymentsReadiness = stripeReadiness(stripeConfig ?? undefined);

    // Heal stuck top-ups (paid on tenant Stripe, webhook never granted).
    if (stripeConfig?.secretKey) {
      try {
        const { reconcileRecentTopUpPayments } = await import(
          '@/domain/billing/stripe-service'
        );
        const { requireStripeFor } = await import('@/lib/billing/stripe-client');
        const healed = await reconcileRecentTopUpPayments(
          orgId,
          db,
          requireStripeFor(stripeConfig),
        );
        if (healed.granted > 0) {
          console.log(
            `[billing] credits GET healed ${healed.granted}/${healed.scanned} top-ups for ${orgId}`,
          );
        }
      } catch (err) {
        console.warn(
          `[billing] top-up reconcile on credits GET failed for ${orgId}:`,
          (err as Error).message,
        );
      }
    }

    const [balance, grants, ledger] = await Promise.all([
      getCreditBalance(orgId, db),
      db.$queryRawUnsafe(
        `SELECT * FROM credit_grants WHERE org_id = $1 ORDER BY granted_at DESC LIMIT ${GRANTS_LIMIT};`,
        orgId,
      ) as Promise<Record<string, unknown>[]>,
      db.$queryRawUnsafe(
        `SELECT * FROM credit_ledger WHERE org_id = $1 ORDER BY created_at DESC LIMIT ${LEDGER_LIMIT};`,
        orgId,
      ) as Promise<Record<string, unknown>[]>,
    ]);

    return jsonOk({
      balance,
      // Surfaced with the balance so a bookkeeping bug is visible where the
      // numbers are read, rather than only when someone thinks to go looking.
      reconciliation: await reconcileCredits(orgId, db),
      grants: grants.map(mapCreditGrant),
      ledger: ledger.map(mapCreditLedgerEntry),
      paymentsReady: paymentsReadiness.ready,
    });
  } catch (err) {
    return jsonError('Failed to load credits: ' + (err as Error).message, 500);
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

    if ('packId' in parsed.data) {
      const result = await redeemCreditPack(
        orgId,
        parsed.data.packId,
        { paymentRef: parsed.data.paymentRef ?? null },
        db,
      );
      return jsonOk(
        {
          pack: result.pack,
          grant: result.baseGrant,
          bonusGrant: result.bonusGrant,
          balance: result.balance,
        },
        { status: 201 },
      );
    }

    const grant = await grantCredits(
      orgId,
      {
        source: parsed.data.source,
        amount: parsed.data.amount,
        metadata: parsed.data.metadata ?? null,
      },
      db,
    );

    const balance = await getCreditBalance(orgId, db);
    return jsonOk({ grant, balance }, { status: 201 });
  } catch (err) {
    return jsonError('Failed to grant credits: ' + (err as Error).message, 500);
  }
}