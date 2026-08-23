'use client';

import { useAppSelector } from '@/store/hooks';
import {
  useGetTenantOrganizationQuery,
  useListOrganizationsQuery,
} from '@/store/apis/organization-api';
import { getClientTenantConfig, isPlatformApp } from '@shared/lib/config/tenant';
import { getPublicOrganizationIdFromEnv } from '@/lib/billing/organization-env';

/**
 * Which organization the billing surfaces are about.
 *
 * Billing is keyed on the Organization (the owner of one or more tenants),
 * never on the tenant, so every surface that shows a plan or a balance has to
 * answer the same question. Extracted from SettingsGate once the app header
 * started asking it too: the header chip and the Settings panel disagreeing
 * about which org they describe is the exact confusion this resolution order
 * exists to prevent.
 *
 * Order: the organization bar's explicit choice wins, then the org that pays
 * for the tenant this app is served as, then the first org the caller can see.
 *
 * Tenant apps have no organization bar — the owning org is resolved from this
 * deployment's slug via `/api/admin/tenants/:slug/organization` (which falls
 * back to the default org when the local DB has no tenants registry row).
 */
export function useBillingOrgId(): string | null {
  const selectedOrgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  const tenantSlug = getClientTenantConfig().slug;
  const onPlatform = isPlatformApp();

  const { data: tenantOrg } = useGetTenantOrganizationQuery(tenantSlug, {
    skip: !tenantSlug,
  });
  const { data: orgList } = useListOrganizationsQuery(undefined, { skip: !onPlatform });

  const tenantOrgId = tenantOrg?.data?.organization.id ?? null;

  if (!onPlatform) {
    // Stamped at Seed All Apps / env push — wins over a stale local default org.
    return getPublicOrganizationIdFromEnv() ?? tenantOrgId;
  }

  return selectedOrgId ?? tenantOrgId ?? orgList?.data?.organizations?.[0]?.id ?? null;
}

/** Whether this deployment allows signed-in users to buy AI credit top-ups. */
export function useSelfServeBillingEnabled(): boolean {
  const tenantSlug = getClientTenantConfig().slug;
  const onPlatform = isPlatformApp();
  const { data: tenantOrg } = useGetTenantOrganizationQuery(tenantSlug, {
    skip: !tenantSlug || onPlatform,
  });

  if (onPlatform) return false;
  return tenantOrg?.data?.selfServeBilling?.enabled === true;
}
