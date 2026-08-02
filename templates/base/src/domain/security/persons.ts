/**
 * @LEGACY / DEPRECATED — DO NOT EXTEND
 *
 * This file is retained for minimal backward compatibility during the auth refactor.
 * It will be removed once all call sites (SignInPanel, seed-runner, legacy task labels)
 * are migrated to the new architecture.
 *
 * NEW ARCHITECTURE (PREFERRED):
 * - User identities, names, roleCode, last_seen: `user_accounts` table
 * - Role definitions, is_platform_admin flag: `roles` table + functional-roles.ts
 * - Group-based permissions & capabilities: security_groups + user_groups
 * - Resolution & backfill: security-service.ts (upsertUserAccount, backfillKnownAccounts,
 *   listConfiguredPinUsers, resolveGroupCodesForSub, resolveCapabilitiesForSub)
 *
 * Use PERSONS / resolvePerson* / legacyTaskCodeForSub ONLY for transitional legacy flows.
 * Prefer DB-driven role-based logic (see updates in tasks/route.ts, admin/roles/route.ts).
 *
 * DEFAULT_PLATFORM_ADMIN_EMAIL is defined here for PERSONS compat and re-exported
 * from functional-roles.ts (import from functional-roles.ts when possible).
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

export const PERSONS: Person[] = [
  {
    sub: 'admin',
    name: 'Admin',
    roleCode: 'platform-admin',
    roleName: 'Platform Admin',
    isPlatformAdmin: true,
    email: DEFAULT_PLATFORM_ADMIN_EMAIL,
  },
  {
    sub: 'ama',
    name: 'Ama',
    roleCode: 'finance',
    roleName: 'Finance',
  },
  {
    sub: 'graham',
    name: 'Graham',
    roleCode: 'ceo',
    roleName: 'CEO',
    email: 'graham@starworksglobal.com',
  },
  {
    sub: 'james',
    name: 'James',
    roleCode: 'entertainment',
    roleName: 'Entertainment',
  },
  {
    sub: 'lucas',
    name: 'Lucas',
    roleCode: 'operations',
    roleName: 'Operations / Data',
  },
  {
    sub: 'made',
    name: 'Made',
    roleCode: 'compliance',
    roleName: 'Compliance / Permits',
  },
  {
    sub: 'alex',
    name: 'Alex Shapiro',
    roleCode: 'platform-admin',
    roleName: 'Platform Admin',
    isPlatformAdmin: true,
  },
];

/** Resolve a person by `sub` (lowercased). */
export function resolvePerson(sub: string): Person | undefined {
  return PERSONS.find((p) => p.sub === sub.toLowerCase());
}

/**
 * @deprecated Use role-based logic from user_accounts.role_code + roles table instead.
 * Maps a person's `sub` to the legacy task-owner code used in PRIORITY_ACTIONS
 * task labels (e.g. "Ama:", "Lukas + Made:"). Kept for transitional compatibility only.
 * See updated resolveViewerRole in tasks/route.ts for role-based alternative.
 */
export function legacyTaskCodeForSub(sub: string): string | null {
  const person = resolvePerson(sub);
  if (!person) return null;
  // Task labels use "Lukas" while the person's sub is 'lucas'.
  if (person.sub === 'lucas') return 'Lukas';
  return person.sub.charAt(0).toUpperCase() + person.sub.slice(1);
}

/** Resolve a person by email (case-insensitive). Used by Google sign-in. */
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

// DEFAULT_PLATFORM_ADMIN_EMAIL is defined here (for PERSONS array compat) and re-exported
// from functional-roles.ts. See deprecation notes at top of this file.
