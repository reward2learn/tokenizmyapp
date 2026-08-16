/**
 * Organization credits — Phase 3 admin top-up + balance surface.
 *
 * GET  /api/admin/organizations/[orgId]/credits
 *   Returns: balance { available, expiringSoon }, recent grants (50), recent
 *   ledger entries (50) — the audit trail behind the balance.
 *
 * POST /api/admin/organizations/[orgId]/credits
 *   Body: { source: 'addon'|'promo'|'onetime', amount: number, metadata?: object }
 *   Grants credits to the org (30-day expiry, oldest-expiring-first
 *   consumption). This is the admin top-up path; the Stripe purchase flow
 *   (Phase 4) will call the same grantCredits() with source 'addon'.
 *
 * Auth: requireWriteAuth + platform admin — credits are control-plane money.
 */
import { z } from 'zod';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';
import {
  getCreditBalance,
  grantCredits,
  mapCreditGrant,
  mapCreditLedgerEntry,
} from '@/domain/billing/credit-service';

export const dynamic = 'force-dynamic';

const GRANTS_LIMIT = 50;
const LEDGER_LIMIT = 50;

const postSchema = z.object({
  source: z.enum(['addon', 'promo', 'onetime']),
  amount: z.number().int().positive('Amount must be a positive integer'),
  metadata: z.record(z.unknown()).optional(),
});

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
      grants: grants.map(mapCreditGrant),
      ledger: ledger.map(mapCreditLedgerEntry),
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

  const db = createRawClient();
  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

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