/**
 * Agentic Commerce Flight Check rows for a tenant org.
 *
 * GET /api/admin/tenants/[slug]/agentic-commerce-health
 */
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { resolveTenantStripeConfig } from '@/domain/billing/organization-service';
import { runAgenticCommerceFlightChecks } from '@/domain/billing/agentic-catalog-service';
import type { AgenticCommerceConfig } from '@/lib/billing/agentic-commerce-types';

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
      `SELECT organization_id, metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
      slug,
    )) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const orgId = String(rows[0].organization_id ?? '');
    if (!orgId) return jsonError('Tenant has no billing organization assigned', 400);

    const meta = (rows[0].metadata ?? {}) as Record<string, unknown>;
    const cfg = (meta.config ?? {}) as Record<string, unknown>;
    const stripeMeta = (cfg.stripe ?? {}) as Record<string, unknown>;
    const raw = (stripeMeta.agenticCommerce ?? {}) as Record<string, unknown>;
    const agenticConfig: AgenticCommerceConfig = {
      enabled: raw.enabled === true,
      sellerOnboarded: raw.sellerOnboarded === true,
      lastCatalogSyncAt: typeof raw.lastCatalogSyncAt === 'string' ? raw.lastCatalogSyncAt : undefined,
      skuByPackId: raw.skuByPackId as Record<string, string> | undefined,
      connectPlatform: raw.connectPlatform as AgenticCommerceConfig['connectPlatform'],
    };

    const stripeConfig = await resolveTenantStripeConfig(orgId, db);
    const steps = await runAgenticCommerceFlightChecks({
      tenantSlug: slug,
      orgId,
      agenticConfig,
      stripeConfig,
    });

    return jsonOk({ steps });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Agentic commerce health check failed', 500);
  }
}
