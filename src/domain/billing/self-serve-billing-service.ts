import type { createRawClient } from '@/lib/db';
import { getTenantConfig, isPlatformApp } from '@shared/lib/config/tenant';
import {
  isSelfServeBillingEnabledFromEnv,
  parseSelfServeBillingConfig,
  type SelfServeBillingConfig,
} from '@/lib/billing/self-serve-billing';
import { resolveOrgForTenant } from '@/domain/billing/organization-service';

type RawDb = ReturnType<typeof createRawClient>;

async function getDb(db?: RawDb): Promise<RawDb> {
  if (db) return db;
  const { createRawClient } = await import('@/lib/db');
  return createRawClient();
}

function readSelfServeFromTenantMetadata(metadata: unknown): SelfServeBillingConfig {
  const meta = (metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;
  return parseSelfServeBillingConfig(stripe.selfServeBilling);
}

/**
 * Whether self-serve AI credit top-ups are enabled for the org's owning tenant.
 *
 * Factory reads tenant metadata; deployed tenant apps read the env var pushed
 * on Save Changes (local DB may have no tenants registry row).
 */
export async function resolveTenantSelfServeBilling(
  orgId: string,
  db?: RawDb,
): Promise<{ enabled: boolean; tenantSlug: string | null; config: SelfServeBillingConfig }> {
  db = await getDb(db);

  if (!isPlatformApp()) {
    const slug = getTenantConfig().slug;
    const org = await resolveOrgForTenant(slug, db);
    const enabled = org?.id === orgId && isSelfServeBillingEnabledFromEnv();
    return {
      enabled,
      tenantSlug: slug,
      config: { enabled },
    };
  }

  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, metadata FROM tenants WHERE organization_id = $1 LIMIT 1;`,
    orgId,
  )) as Record<string, unknown>[];

  if (rows.length === 0) {
    return { enabled: false, tenantSlug: null, config: { enabled: false } };
  }

  const config = readSelfServeFromTenantMetadata(rows[0].metadata);
  return {
    enabled: config.enabled,
    tenantSlug: String(rows[0].slug),
    config,
  };
}
