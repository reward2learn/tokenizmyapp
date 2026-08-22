/**
 * Tenant-scoped Agentic Commerce (ACS seller) configuration.
 *
 * Stored in tenant metadata.config.stripe.agenticCommerce. Phase 4 adds
 * connectPlatform for the Stripe Connect platform waitlist track — kept here
 * so the tenant-keys path and future Connect migration share one shape.
 */
export interface AgenticCommerceConfig {
  /** Publish credit packs to this tenant's Stripe ACS catalog. */
  enabled: boolean;
  /** Set after Stripe Dashboard → Agentic commerce seller onboarding. */
  sellerOnboarded?: boolean;
  /** ISO timestamp of the last successful catalog sync. */
  lastCatalogSyncAt?: string;
  /** pack-25 → stable SKU id in the product feed. */
  skuByPackId?: Record<string, string>;
  /** Last catalog import id per feed type (for webhook correlation). */
  lastImportIds?: Partial<Record<'product' | 'pricing' | 'inventory', string>>;
  /**
   * Future: Stripe Connect platform agentic waitlist (Phase 4).
   * Not used while billing stays on tenant-owned API keys.
   */
  connectPlatform?: {
    waitlistRequested?: boolean;
    waitlistRequestedAt?: string;
    notes?: string;
  };
}

export const STRIPE_AGENTIC_API_VERSION = '2026-07-29.preview';

/** Stable ACS SKU for a credit pack on a tenant account. */
export function agenticCreditPackSku(tenantSlug: string, packId: string): string {
  return `tokenizmyapp-${tenantSlug}-${packId}`;
}

/** Reverse map: SKU → pack id when it matches our naming convention. */
export function packIdFromAgenticSku(sku: string): string | null {
  const match = /^tokenizmyapp-[a-z0-9-]+-(pack-\d+)$/.exec(sku.trim());
  return match?.[1] ?? null;
}

export function isCatalogSyncFresh(lastCatalogSyncAt: string | undefined, maxAgeMs = 86_400_000): boolean {
  if (!lastCatalogSyncAt) return false;
  const ts = Date.parse(lastCatalogSyncAt);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= maxAgeMs;
}

export function catalogSkusComplete(skuByPackId: Record<string, string> | undefined, packIds: string[]): boolean {
  if (!skuByPackId) return false;
  return packIds.every((id) => Boolean(skuByPackId[id]?.trim()));
}
