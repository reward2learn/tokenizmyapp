/**
 * Backfill `credit_grants.owner_user_id` for self-serve top-ups that predate
 * per-user scoping.
 *
 * Reads `purchaserUserId` from Stripe PaymentIntent / Checkout Session metadata
 * (via each grant's `metadata.paymentRef`) and tags matching addon + promo
 * grants to that user.
 */
import type Stripe from 'stripe';
import type { createRawClient } from '@/lib/db';
import { ensureCreditTables } from '@/domain/billing/credit-service';
import { resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { requireStripeFor } from '@/lib/billing/stripe-client';

type RawDb = ReturnType<typeof createRawClient>;

export interface BackfillTopUpGrantOwnersOptions {
  orgId?: string;
  /** When false, only report what would change. */
  apply?: boolean;
}

export interface BackfillTopUpGrantOwnersResult {
  scannedOrgs: number;
  scannedPaymentRefs: number;
  taggedGrants: number;
  skippedNoMetadata: number;
  skippedNoStripe: number;
  errors: string[];
}

interface GrantRow {
  id: string;
  org_id: string;
  source: string;
  payment_ref: string;
}

async function purchaserFromPaymentRef(
  paymentRef: string,
  stripe: Stripe,
): Promise<string | null> {
  if (paymentRef.startsWith('pi_')) {
    const intent = await stripe.paymentIntents.retrieve(paymentRef);
    return intent.metadata?.purchaserUserId?.trim() || null;
  }

  if (paymentRef.startsWith('cs_')) {
    const session = await stripe.checkout.sessions.retrieve(paymentRef);
    const fromSession = session.metadata?.purchaserUserId?.trim();
    if (fromSession) return fromSession;

    const pi = session.payment_intent;
    const piId = typeof pi === 'string' ? pi : pi?.id;
    if (piId) {
      const intent = await stripe.paymentIntents.retrieve(piId);
      return intent.metadata?.purchaserUserId?.trim() || null;
    }
  }

  return null;
}

/**
 * Tag unscoped top-up grants with the purchaser recorded on Stripe.
 */
export async function backfillTopUpGrantOwners(
  db: RawDb,
  options: BackfillTopUpGrantOwnersOptions = {},
): Promise<BackfillTopUpGrantOwnersResult> {
  await ensureCreditTables(db);

  const result: BackfillTopUpGrantOwnersResult = {
    scannedOrgs: 0,
    scannedPaymentRefs: 0,
    taggedGrants: 0,
    skippedNoMetadata: 0,
    skippedNoStripe: 0,
    errors: [],
  };

  const orgFilter = options.orgId?.trim();
  const rows = (await db.$queryRawUnsafe(
    `SELECT id, org_id, source, metadata->>'paymentRef' AS payment_ref
     FROM credit_grants
     WHERE source IN ('addon', 'promo')
       AND owner_user_id IS NULL
       AND metadata->>'paymentRef' IS NOT NULL
       ${orgFilter ? 'AND org_id = $1' : ''}
     ORDER BY org_id, granted_at ASC;`,
    ...(orgFilter ? [orgFilter] : []),
  )) as GrantRow[];

  const byOrg = new Map<string, Map<string, GrantRow[]>>();
  for (const row of rows) {
    const paymentRef = row.payment_ref?.trim();
    if (!paymentRef) continue;
    if (!byOrg.has(row.org_id)) byOrg.set(row.org_id, new Map());
    const byRef = byOrg.get(row.org_id)!;
    if (!byRef.has(paymentRef)) byRef.set(paymentRef, []);
    byRef.get(paymentRef)!.push(row);
  }

  result.scannedOrgs = byOrg.size;

  for (const [orgId, byRef] of byOrg) {
    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    if (!stripeConfig?.secretKey) {
      result.skippedNoStripe += byRef.size;
      result.errors.push(`Org ${orgId}: no Stripe secret — skipped ${byRef.size} payment ref(s).`);
      continue;
    }

    let stripe: Stripe;
    try {
      stripe = requireStripeFor(stripeConfig);
    } catch (err) {
      result.skippedNoStripe += byRef.size;
      result.errors.push(
        `Org ${orgId}: Stripe client failed — ${(err as Error).message}`,
      );
      continue;
    }

    for (const [paymentRef, grants] of byRef) {
      result.scannedPaymentRefs += 1;
      let purchaserUserId: string | null;
      try {
        purchaserUserId = await purchaserFromPaymentRef(paymentRef, stripe);
      } catch (err) {
        result.errors.push(
          `Org ${orgId} ref ${paymentRef}: Stripe lookup failed — ${(err as Error).message}`,
        );
        continue;
      }

      if (!purchaserUserId) {
        result.skippedNoMetadata += 1;
        continue;
      }

      if (options.apply) {
        await db.$executeRawUnsafe(
          `UPDATE credit_grants
           SET owner_user_id = $1
           WHERE org_id = $2
             AND metadata->>'paymentRef' = $3
             AND owner_user_id IS NULL
             AND source IN ('addon', 'promo');`,
          purchaserUserId,
          orgId,
          paymentRef,
        );
      }

      result.taggedGrants += grants.length;
    }
  }

  return result;
}
