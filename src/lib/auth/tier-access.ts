import type { AuthTier } from '@/lib/page-catalog';
import type { SessionClaims } from '@/lib/auth/jwt';

const TIER_RANK: Record<AuthTier, number> = {
  public: 0,
  pin: 1,
  google: 2,
};

/** Normalize DB / query values to a known auth tier. */
export function normalizeAuthTier(value: string | null | undefined): AuthTier {
  if (value === 'pin' || value === 'google') return value;
  return 'public';
}

/**
 * Cumulative access: Google sees public + PIN + Google; PIN sees public + PIN;
 * signed-out visitors see public only.
 */
export function tierAllowsAccess(userTier: AuthTier, requiredTier: AuthTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
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
