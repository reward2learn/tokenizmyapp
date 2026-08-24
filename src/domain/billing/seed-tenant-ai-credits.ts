/**
 * Seed / sync AI credit entitlements for a tenant and all its suite apps.
 *
 * Charge authority stays org-level (org rate card + catalog faces). Suite apps
 * share one paying org via `tenants.organization_id`; this flow refreshes that
 * card, aligns the current plan grant, and propagates billing identity so every
 * app resolves the same org for Billing / top-ups.
 */
import { createRawClient } from '@/lib/db';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import {
  recalculateOrgRateCard,
  refreshOrgRateCardCreditsFromCatalog,
} from '@/domain/billing/org-rate-card-service';
import type { TenantRateCardRecord } from '@/lib/billing/tenant-rate-card';
import {
  syncCurrentPeriodPlanAllowance,
  type SyncPlanAllowanceResult,
} from '@/domain/billing/credit-service';
import {
  propagateBillingIdentityForTenant,
  type PropagateBillingIdentityResult,
} from '@/domain/billing/propagate-billing-identity';
import type { AppPackConfig } from '@/store/apis/tenant-api';

type RawDb = ReturnType<typeof createRawClient>;

export interface TenantSuiteAppRef {
  appId: string;
  name: string;
  vercelProjectId: string | null;
}

export interface SeedTenantAiCreditsResult {
  tenantSlug: string;
  orgId: string;
  /** Optional UI-scoped app; seed still applies at org + all apps. */
  scopedAppId: string | null;
  apps: TenantSuiteAppRef[];
  rateCard: TenantRateCardRecord;
  planAllowance: SyncPlanAllowanceResult;
  packCredits: TenantRateCardRecord['packCredits'];
  planCredits: TenantRateCardRecord['planCredits'];
  billingIdentity: PropagateBillingIdentityResult;
}

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

/** Suite apps from appPack, or a single synthetic app for non-suite tenants. */
export function listTenantSuiteApps(
  tenantSlug: string,
  tenant: Record<string, unknown>,
): TenantSuiteAppRef[] {
  const pack = getAppPack(tenant);
  if (pack?.apps && pack.apps.length > 0) {
    return pack.apps.map((app) => ({
      appId: app.appId,
      name: app.name || app.appId,
      vercelProjectId: app.vercelProjectId ?? null,
    }));
  }

  const displayName =
    String(tenant.display_name ?? tenant.displayName ?? tenantSlug).trim() || tenantSlug;
  const rootProject = String(tenant.vercel_project_id ?? '').trim() || null;
  return [
    {
      appId: tenantSlug,
      name: displayName,
      vercelProjectId: rootProject,
    },
  ];
}

/**
 * Recalculate org rate card → apply catalog face USD × markup → sync plan
 * grant → propagate ORGANIZATION_ID to every suite app Vercel project.
 */
export async function seedTenantAiCredits(
  tenantSlug: string,
  options: { scopedAppId?: string | null } = {},
  db: RawDb = createRawClient(),
): Promise<SeedTenantAiCreditsResult> {
  await ensureTenantsTable(db);

  const rows = (await db.$queryRawUnsafe(
    `SELECT slug, display_name, organization_id, vercel_project_id, metadata
     FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as Record<string, unknown>[];

  if (rows.length === 0) {
    throw new Error(`Tenant "${tenantSlug}" not found.`);
  }

  const tenant = rows[0];
  const orgId = String(tenant.organization_id ?? '').trim();
  if (!orgId) {
    throw new Error(
      `Tenant "${tenantSlug}" has no organization_id — assign an org before seeding AI credits.`,
    );
  }

  const apps = listTenantSuiteApps(tenantSlug, tenant);
  const scopedAppId = options.scopedAppId?.trim() || null;
  if (scopedAppId && !apps.some((a) => a.appId === scopedAppId)) {
    throw new Error(
      `App "${scopedAppId}" is not in tenant "${tenantSlug}" suite (or single-app slug).`,
    );
  }

  // 1) Live app/user/spend → markup (honours manual lock)
  await recalculateOrgRateCard(orgId, db);
  // 2) Plan/pack credit amounts from catalog faces × secured markup
  const rateCard = await refreshOrgRateCardCreditsFromCatalog(orgId, db);
  // 3) Current-period plan grant aligned to rate card (grant or top-up only)
  const planAllowance = await syncCurrentPeriodPlanAllowance(orgId, db);
  // 4) Every suite app (and root project) points at the same paying org
  const billingIdentity = await propagateBillingIdentityForTenant(tenantSlug, db);

  return {
    tenantSlug,
    orgId,
    scopedAppId,
    apps,
    rateCard,
    planAllowance,
    packCredits: rateCard.packCredits,
    planCredits: rateCard.planCredits,
    billingIdentity,
  };
}
