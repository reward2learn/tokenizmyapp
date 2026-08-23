/**
 * @LEGACY / DEPRECATED — DO NOT EXTEND
 *
 * Retained only for DEFAULT_PLATFORM_ADMIN_EMAIL and transitional PIN key
 * resolution during the auth refactor. User identities live in `user_accounts`;
 * role definitions live in the `roles` table seeded from each app's template.
 *
 * Do not add person-specific entries here. New tenants get roles from
 * template-default-roles.ts at provisioning.
 */

export interface Person {
  sub: string;
  name: string;
  roleCode: string;
  roleName: string;
  isPlatformAdmin?: boolean;
  email?: string;
}

/** Default dedicated platform-admin Google email seeded into every tenant. */
export const DEFAULT_PLATFORM_ADMIN_EMAIL = 'reward2learn@gmail.com';

/** Minimal legacy registry — platform admin only. */
export const PERSONS: Person[] = [
  {
    sub: 'platform-admin',
    name: 'Platform Admin',
    roleCode: 'platform-admin',
    roleName: 'Platform Admin',
    isPlatformAdmin: true,
    email: DEFAULT_PLATFORM_ADMIN_EMAIL,
  },
];

/** Resolve a person by `sub` (lowercased). */
export function resolvePerson(sub: string): Person | undefined {
  return PERSONS.find((p) => p.sub === sub.toLowerCase());
}

/**
 * @deprecated Prefer role codes from session / user_accounts.role_code.
 */
export function legacyTaskCodeForSub(sub: string): string | null {
  const person = resolvePerson(sub);
  if (!person) return null;
  return person.sub.charAt(0).toUpperCase() + person.sub.slice(1);
}

/** Resolve a person by email — only matches the platform-admin default. */
export function resolvePersonByEmail(email: string | undefined): Person | null {
  if (!email) return null;
  const lower = email.toLowerCase();
  return PERSONS.find((p) => p.email && p.email.toLowerCase() === lower) ?? null;
}

/** List active persons as known-account rows for backfill. */
export function listKnownAccounts(): { sub: string; name: string; tier: string; roleCode?: string | null }[] {
  return PERSONS.map((p) => ({
    sub: p.sub,
    name: p.name,
    tier: 'pin',
    roleCode: p.roleCode,
  }));
}
