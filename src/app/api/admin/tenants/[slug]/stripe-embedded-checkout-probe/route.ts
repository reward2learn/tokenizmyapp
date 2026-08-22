/**
 * Flight Check — embedded Checkout health probe for a tenant org.
 *
 * GET /api/admin/tenants/[slug]/stripe-embedded-checkout-probe
 *
 * Creates a one-time embedded session (Vercel × Stripe guide T-shirt pattern)
 * and verifies client_secret is returned. No payment is taken.
 */
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { probeEmbeddedCheckoutHealth } from '@/domain/billing/stripe-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);
    const rows = (await db.$queryRawUnsafe(
      `SELECT organization_id FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    )) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const orgId = String(rows[0].organization_id ?? '');
    if (!orgId) return jsonError('Tenant has no billing organization assigned', 400);

    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const probe = await probeEmbeddedCheckoutHealth(stripeConfig ?? undefined);

    return jsonOk({
      ok: probe.ok,
      status: probe.status,
      message: probe.message,
      sessionId: probe.sessionId ?? null,
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Embedded Checkout probe failed', 500);
  }
}
