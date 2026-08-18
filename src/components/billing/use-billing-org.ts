'use client';

import { useAppSelector } from '@/store/hooks';
import {
  useGetTenantOrganizationQuery,
  useListOrganizationsQuery,
} from '@/store/apis/organization-api';
import { getClientTenantConfig } from '@shared/lib/config/tenant';

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
 */
export function useBillingOrgId(): string | null {
  const selectedOrgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  const tenantSlug = getClientTenantConfig().slug;

  const { data: tenantOrg } = useGetTenantOrganizationQuery(tenantSlug, { skip: !tenantSlug });
  const { data: orgList } = useListOrganizationsQuery();

  return (
    selectedOrgId ??
    tenantOrg?.data?.organization.id ??
    orgList?.data?.organizations?.[0]?.id ??
    null
  );
}
