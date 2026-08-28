import type { Organization } from '@/store/apis/organization-api';

/**
 * Resolve the organization that owns a tenant.
 *
 * Tenant records carry no organizationId — membership lives on the
 * organization payload from listOrganizations — so every "select this tenant"
 * action has to walk that list once.
 */
export function findOrganizationIdForTenant(
  tenantSlug: string,
  organizations: Organization[],
): string | null {
  for (const org of organizations) {
    if (org.tenants?.some((t) => t.slug === tenantSlug)) {
      return org.id;
    }
  }
  return null;
}
