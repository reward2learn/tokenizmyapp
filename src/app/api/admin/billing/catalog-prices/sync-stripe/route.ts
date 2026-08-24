/**
 * POST /api/admin/billing/catalog-prices/sync-stripe
 * Sync Stripe list prices to catalog faces (confirm required).
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { syncStripeCatalogPrices } from '@/domain/billing/catalog-price-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  confirm: z.literal(true),
  dryRun: z.boolean().optional().default(false),
});

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      'Stripe sync requires confirm: true. Validation: ' +
        parsed.error.issues.map((i) => i.message).join(', '),
      400,
    );
  }

  const actor = String(guard.session.sub ?? guard.session.email ?? 'platform-admin');
  try {
    const result = await syncStripeCatalogPrices({
      confirm: true,
      dryRun: parsed.data.dryRun,
      updatedBy: actor,
    });
    return jsonOk(result);
  } catch (err) {
    return jsonError(
      `Stripe sync failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
