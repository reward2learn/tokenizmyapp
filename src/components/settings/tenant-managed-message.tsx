import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

/** Shown on organization-scoped settings in tenant apps. */
export const TENANT_MANAGED_ORG_MESSAGE =
  'Your plan, billing, and team membership are managed by your organization administrator.';

export function TenantManagedOrgAlert() {
  return (
    <Alert severity="info">
      <AlertTitle>Managed by your organization</AlertTitle>
      {TENANT_MANAGED_ORG_MESSAGE}
    </Alert>
  );
}
