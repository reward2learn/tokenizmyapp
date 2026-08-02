/**
 * Functional role catalog — the business titles in the restaurant.
 * Used by UserAccount.roleCode, the roles DB table, security groups, and Role Manager UI.
 *
 * This is a pure-data file — no server-only imports. Safe to import from client components.
 * Preferred source of truth for roles over the LEGACY persons.ts.
 *
 * See:
 * - security-service.ts for user_accounts backfill, listConfiguredPinUsers, capability resolution
 * - persons.ts (LEGACY/DEPRECATED) for transitional mappings only
 */

export interface FunctionalRole {
  code: string;
  name: string;
  isPlatformAdmin?: boolean;
}

export const FUNCTIONAL_ROLES: FunctionalRole[] = [
  { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
  { code: 'finance', name: 'Finance' },
  { code: 'ceo', name: 'CEO' },
  { code: 'entertainment', name: 'Entertainment' },
  { code: 'operations', name: 'Operations / Data' },
  { code: 'compliance', name: 'Compliance / Permits' },
];

// Re-export for convenience during auth refactor (exported from both;
// definition lives in LEGACY persons.ts but prefer importing from here).
export { DEFAULT_PLATFORM_ADMIN_EMAIL } from './persons';
