/**
 * Functional role catalog — generic fallback for UI when the roles API has not loaded.
 *
 * Provisioned tenants seed roles from their template into the `roles` table.
 * Prefer `useListRoleConfigsQuery()` or `roleOptionsFromApi()` in admin UI.
 */

export interface FunctionalRole {
  code: string;
  name: string;
  isPlatformAdmin?: boolean;
}

/** Generic fallback when the roles API has not loaded yet. */
export const FUNCTIONAL_ROLES: FunctionalRole[] = [
  { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
  { code: 'manager', name: 'Manager' },
  { code: 'finance', name: 'Finance' },
  { code: 'operations', name: 'Operations' },
];

export { DEFAULT_PLATFORM_ADMIN_EMAIL } from './persons';

export function roleOptionsFromApi(
  apiRoles: { code: string; name: string }[] | undefined,
): { code: string; name: string }[] {
  if (apiRoles?.length) {
    return apiRoles.map((r) => ({ code: r.code, name: r.name }));
  }
  return FUNCTIONAL_ROLES;
}
