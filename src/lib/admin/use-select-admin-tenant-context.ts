'use client';

import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setAdminSelectedTenant, setAdminTenantSelection } from '@/store/ui-slice';
import { useListOrganizationsQuery } from '@/store/apis/organization-api';
import { findOrganizationIdForTenant } from './find-organization-for-tenant';

/**
 * Select tenant / app in the platform-admin Tenants panel and keep the
 * organization filter aligned — a tenant belongs to exactly one organization.
 */
export function useSelectAdminTenantContext() {
  const dispatch = useAppDispatch();
  const { data: orgList } = useListOrganizationsQuery();
  const organizations = useMemo(
    () => orgList?.data?.organizations ?? [],
    [orgList?.data?.organizations],
  );

  const selectTenant = useCallback(
    (tenantSlug: string) => {
      const orgId = findOrganizationIdForTenant(tenantSlug, organizations);
      dispatch(setAdminTenantSelection({ orgId, tenantSlug, appId: null }));
    },
    [dispatch, organizations],
  );

  const selectTenantApp = useCallback(
    (tenantSlug: string, appId: string) => {
      const orgId = findOrganizationIdForTenant(tenantSlug, organizations);
      dispatch(setAdminTenantSelection({ orgId, tenantSlug, appId }));
    },
    [dispatch, organizations],
  );

  const clearTenantSelection = useCallback(() => {
    dispatch(setAdminSelectedTenant(null));
  }, [dispatch]);

  return { selectTenant, selectTenantApp, clearTenantSelection };
}
