import type { AuthTier } from '@/lib/page-catalog';
import type { SessionClaims } from '@/lib/auth/jwt';

const TIER_RANK: Record<AuthTier, number> = {
  public: 0,
  pin: 1,
  google: 2,
};

const KNOWN_TIERS: AuthTier[] = ['public', 'pin', 'google'];

/** Normalize DB / query values to a known auth tier. */
export function normalizeAuthTier(value: string | null | undefined): AuthTier {
  if (value === 'pin' || value === 'google') return value;
  return 'public';
}

/**
 * Parse a stored auth_tier value into one or more tiers.
 * Supports legacy single values (`google`) and comma-separated allowlists (`pin,google`).
 */
export function parseAuthTiers(value: string | null | undefined): AuthTier[] {
  const raw = new Set(
    String(value ?? 'public')
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter((part): part is AuthTier => part === 'public' || part === 'pin' || part === 'google'),
  );
  const tiers = KNOWN_TIERS.filter((t) => raw.has(t));
  return tiers.length > 0 ? tiers : ['public'];
}

/** Serialize selected tiers for storage (stable order: public → pin → google). */
export function serializeAuthTiers(tiers: AuthTier[]): string {
  const unique = KNOWN_TIERS.filter((t) => tiers.includes(t));
  return unique.length > 0 ? unique.join(',') : 'public';
}

/**
 * Nav / page access check.
 *
 * - Single stored tier (legacy): cumulative minimum — Google sees public+PIN+Google;
 *   PIN sees public+PIN; signed-out visitors see public only.
 * - Multiple stored tiers (allowlist): viewer must match one of the selected tiers
 *   exactly (e.g. `pin,google` is visible to PIN and Google users, not anonymous).
 */
export function tierAllowsAccess(userTier: AuthTier, requiredTier: AuthTier | string): boolean {
  const allowed = typeof requiredTier === 'string'
    ? parseAuthTiers(requiredTier)
    : [requiredTier];

  if (allowed.length > 1) {
    return allowed.includes(userTier);
  }

  return TIER_RANK[userTier] >= TIER_RANK[allowed[0] ?? 'public'];
}

/**
 * Resolve the viewer's tier for navigation and other server-side filters.
 * Signed-in users use the session cookie (authoritative); query params apply
 * only when there is no session.
 */
export function resolveViewerAuthTier(
  session: Pick<SessionClaims, 'tier'> | null | undefined,
  queryTier?: string | null,
): AuthTier {
  if (session?.tier) return normalizeAuthTier(session.tier);
  return normalizeAuthTier(queryTier ?? 'public');
}
