/**
 * Functional role catalog — generic fallback for UI when the roles API has not loaded.
 *
 * At runtime each tenant's `roles` table is seeded from its template
 * (see template-default-roles.ts). Prefer `useListRoleConfigsQuery()` or
 * `roleOptionsFromApi()` in admin UI instead of this static list.
 */
import { GENERIC_DEFAULT_ROLES, type TemplateRole } from '@/domain/tenant/template-default-roles';

export type FunctionalRole = TemplateRole;

/** Generic fallback — not the authoritative list for provisioned tenants. */
export const FUNCTIONAL_ROLES: FunctionalRole[] = GENERIC_DEFAULT_ROLES;

export { DEFAULT_PLATFORM_ADMIN_EMAIL } from './persons';

/** Role dropdown options: DB roles when present, otherwise the generic fallback. */
export function roleOptionsFromApi(
  apiRoles: { code: string; name: string }[] | undefined,
): { code: string; name: string }[] {
  if (apiRoles?.length) {
    return apiRoles.map((r) => ({ code: r.code, name: r.name }));
  }
  return FUNCTIONAL_ROLES;
}
