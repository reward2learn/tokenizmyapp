'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useListOrganizationsQuery } from '@/store/apis/organization-api';

/**
 * Narrow a tenant list to the organization selected in the admin console.
 *
 * A tenant belongs to exactly one organization, so the organization picker
 * scopes every view of tenants — the selector in the Tenants panel and the
 * Tenant Applications list are showing the same set and must agree. This hook
 * exists so that rule is written once: two copies of it drift the moment one
 * gains a special case, and a filter that disagrees with itself between two
 * sections of the same page is worse than no filter.
 *
 * Membership comes from `listOrganizations`, which returns each organization's
 * tenants. `TenantEntry` carries no `organizationId`, and the query is warm —
 * the organization bar issues it on the same screen.
 */
export function useOrgScopedTenants<T extends { slug: string }>(tenants: T[]): {
  /** Tenants owned by the selected organization, or all of them when none is set. */
  scoped: T[];
  /** The active filter, or null for "all organizations". */
  selectedOrgId: string | null;
  /** Display name of the active filter, for empty states and headings. */
  selectedOrgName: string | null;
  /** True when a filter is set and it matches nothing. */
  isEmptyForOrg: boolean;
} {
  const selectedOrgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  const { data: orgList } = useListOrganizationsQuery();

  const organization = useMemo(
    () =>
      selectedOrgId
        ? orgList?.data?.organizations?.find((o) => o.id === selectedOrgId) ?? null
        : null,
    [orgList, selectedOrgId],
  );

  const scoped = useMemo(() => {
    if (!selectedOrgId) return tenants;
    // Until the organization list resolves we cannot filter. Returning every
    // tenant would contradict the filter that was just set, so an empty list
    // for one render is the honest reading of "not known yet".
    const slugs = new Set((organization?.tenants ?? []).map((t) => t.slug));
    return tenants.filter((t) => slugs.has(t.slug));
  }, [tenants, organization, selectedOrgId]);

  return {
    scoped,
    selectedOrgId: selectedOrgId ?? null,
    selectedOrgName: organization?.displayName ?? null,
    isEmptyForOrg: Boolean(selectedOrgId) && scoped.length === 0,
  };
}
