'use client';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { useGetTenantOrganizationQuery } from '@/store/apis/organization-api';
import { BillingPanel } from '@/components/billing/billing-panel';

/**
 * Resolves a tenant to its paying organization, then renders Billing for it.
 *
 * Billing is owned by the Organization, not the Tenant (Organization → Tenant →
 * Apps), so the admin panel's tenant selection has to be mapped through before
 * anything billing-related can be shown. The query is already warm — the
 * organization bar above issues the same one — so this costs no extra request.
 */
export function TenantBillingTab({ tenantSlug }: { tenantSlug: string }) {
  const { data, isLoading, isError } = useGetTenantOrganizationQuery(tenantSlug, {
    skip: !tenantSlug,
  });

  if (isLoading) return <Skeleton variant="rounded" height={320} />;

  if (isError || !data?.data?.organization) {
    return (
      <Alert severity="warning">
        This tenant is not assigned to an organization yet, so it has no billing owner. Assign
        one in the organization bar above.
      </Alert>
    );
  }

  return <BillingPanel orgId={data.data.organization.id} />;
}
