'use client';

import { useAppSelector } from '@/store/hooks';
import {
  useGetTenantOrganizationQuery,
  useListOrganizationsQuery,
} from '@/store/apis/organization-api';
import { getClientTenantConfig, isPlatformApp } from '@shared/lib/config/tenant';

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
 * On a tenant deploy the local DB has no `tenants` registry row, so
 * `/api/admin/tenants/:slug/organization` 404s — skip that lookup off-platform.
 */
export function useBillingOrgId(): string | null {
  const selectedOrgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  const tenantSlug = getClientTenantConfig().slug;
  const onPlatform = isPlatformApp();

  const { data: tenantOrg } = useGetTenantOrganizationQuery(tenantSlug, {
    skip: !tenantSlug || !onPlatform,
  });
  const { data: orgList } = useListOrganizationsQuery(undefined, { skip: !onPlatform });

  if (!onPlatform) {
    return selectedOrgId ?? null;
  }

  return (
    selectedOrgId ??
    tenantOrg?.data?.organization.id ??
    orgList?.data?.organizations?.[0]?.id ??
    null
  );
}
