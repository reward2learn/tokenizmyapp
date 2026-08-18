'use client';

import { useAppSelector } from '@/store/hooks';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { useGetTenantOrganizationQuery, useListOrganizationsQuery } from '@/store/apis/organization-api';
import { getClientTenantConfig } from '@shared/lib/config/tenant';

/**
 * Supplies Settings with the organization currently selected in the admin
 * console.
 *
 * Read from the store rather than a route parameter so the choice made in the
 * organization bar survives navigating here — the two surfaces would otherwise
 * disagree about which organization is being administered, which is the exact
 * confusion the shared `useOrgScopedTenants` hook exists to prevent elsewhere.
 *
 * When nothing has been selected yet (a tenant admin who never touched the
 * organization bar), fall back to the tenant's owning organization — the same
 * resolution the organization bar uses — so Billing opens on the org that
 * actually pays for this tenant instead of a "No organization" pane.
 */
export function SettingsGate() {
  const selectedOrgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  const tenantSlug = getClientTenantConfig().slug;

  const { data: tenantOrg } = useGetTenantOrganizationQuery(tenantSlug, {
    skip: !tenantSlug,
  });
  const { data: orgList } = useListOrganizationsQuery();

  const orgId =
    selectedOrgId ??
    tenantOrg?.data?.organization.id ??
    orgList?.data?.organizations?.[0]?.id ??
    null;

  return <SettingsPanel orgId={orgId} />;
}
