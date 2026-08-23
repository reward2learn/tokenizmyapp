/**
 * Who may open /admin — platform admins or anyone with an admin-area capability.
 */
import { ALL_CAPABILITIES, CAPABILITY_AREAS, capability } from '@/domain/security/capabilities';

/** Capability codes that grant entry to the admin surface (besides platform admin). */
export const ADMIN_ENTRY_CAPABILITIES: string[] = [
  ALL_CAPABILITIES,
  ...CAPABILITY_AREAS.flatMap((a) =>
    a.accesses
      .filter((acc) => acc === 'write' || (a.area === 'pages' && acc === 'read'))
      .map((acc) => capability(a.area, acc)),
  ),
];

export function hasAdminAccess(
  platformAdmin: boolean | undefined,
  groups: string[] | undefined,
  permissions: string[] | undefined,
): boolean {
  if (platformAdmin || groups?.includes('platform-admin')) return true;
  const perms = permissions ?? [];
  if (perms.includes(ALL_CAPABILITIES)) return true;
  return ADMIN_ENTRY_CAPABILITIES.some((cap) => cap !== ALL_CAPABILITIES && perms.includes(cap));
}

export function hasPagesWrite(permissions: string[] | undefined, platformAdmin?: boolean): boolean {
  if (platformAdmin) return true;
  const perms = permissions ?? [];
  return perms.includes(ALL_CAPABILITIES) || perms.includes('pages:write');
}

export function hasPagesRead(permissions: string[] | undefined, platformAdmin?: boolean): boolean {
  if (platformAdmin) return true;
  const perms = permissions ?? [];
  return (
    perms.includes(ALL_CAPABILITIES) ||
    perms.includes('pages:read') ||
    perms.includes('pages:write')
  );
}
