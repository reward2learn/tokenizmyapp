'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { useGetTenantOrganizationQuery } from '@/store/apis/organization-api';
import { BillingPanel } from '@/components/billing/billing-panel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAdminCalculatorContext } from '@/store/ui-slice';

/**
 * Resolves a tenant to its paying organization, then renders Billing for it.
 *
 * Billing is owned by the Organization, not the Tenant (Organization → Tenant →
 * Apps), so the admin panel's tenant selection has to be mapped through before
 * anything billing-related can be shown. The query is already warm — the
 * organization bar above issues the same one — so this costs no extra request.
 */
export function TenantBillingTab({ tenantSlug }: { tenantSlug: string }) {
  const dispatch = useAppDispatch();
  const adminAppId = useAppSelector((s) => s.ui.adminSelectedAppId);
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

  const orgId = data.data.organization.id;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }} useFlexGap>
        <Button
          size="small"
          variant="outlined"
          onClick={() =>
            dispatch(
              setAdminCalculatorContext({
                orgId,
                tenantSlug,
                appId: adminAppId,
              }),
            )
          }
        >
          Open AI Credits Calculator
        </Button>
      </Stack>
      <Alert severity="info">
        Calculator context saved — open the <strong>AI Credits Calculator</strong> tab to
        analyze, apply the org rate card, or <strong>Seed / sync AI credits for all apps</strong>
        under this tenant.
      </Alert>
      <BillingPanel orgId={orgId} />
    </Stack>
  );
}
