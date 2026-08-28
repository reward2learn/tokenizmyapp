/**
 * Vercel team identity — Tokenizin Pro owns factory + tenant projects.
 * Override via env or tenant metadata.config.vercelTeamSlug (wizard).
 */
export const VERCEL_TEAM_ID =
  process.env.VERCEL_TEAM_ID?.trim() || 'team_7m5fwG2qKtVsGtgV35AB3nHi';

export const DEFAULT_VERCEL_TEAM_SLUG = 'tokenizin-projects';

export const VERCEL_TEAM_SLUG =
  process.env.VERCEL_TEAM_SLUG?.trim() ||
  process.env.NEXT_PUBLIC_VERCEL_TEAM_SLUG?.trim() ||
  DEFAULT_VERCEL_TEAM_SLUG;

/** Previous factory team — still filter transient deployment URLs in stored data. */
const LEGACY_TEAM_SLUGS = ['ilishaps-projects'] as const;

const TEAM_SLUG_PATTERN = /^[a-z0-9-]+$/;

export function normalizeVercelTeamSlug(input: string): string {
  const slug = input.trim().toLowerCase();
  if (!slug) return DEFAULT_VERCEL_TEAM_SLUG;
  if (!TEAM_SLUG_PATTERN.test(slug)) {
    throw new Error(
      'Vercel team slug must contain only lowercase letters, numbers, and hyphens (e.g. tokenizin-projects).',
    );
  }
  return slug;
}

export function resolveVercelTeamSlug(override?: string | null): string {
  const trimmed = override?.trim();
  if (trimmed) return normalizeVercelTeamSlug(trimmed);
  return VERCEL_TEAM_SLUG;
}

export function readTenantVercelTeamSlug(cfg: Record<string, unknown> | undefined): string {
  const raw = String(cfg?.vercelTeamSlug ?? '').trim();
  if (raw) return normalizeVercelTeamSlug(raw);
  return DEFAULT_VERCEL_TEAM_SLUG;
}

export function buildVercelTeamSlugEnvVars(teamSlug: string): Record<string, string> {
  const slug = normalizeVercelTeamSlug(teamSlug);
  return {
    VERCEL_TEAM_SLUG: slug,
    NEXT_PUBLIC_VERCEL_TEAM_SLUG: slug,
  };
}

export function vercelTeamDashboardUrl(teamSlug?: string | null): string {
  return `https://vercel.com/${resolveVercelTeamSlug(teamSlug)}`;
}

export function vercelProjectDashboardUrl(projectName: string, teamSlug?: string | null): string {
  return `https://vercel.com/${resolveVercelTeamSlug(teamSlug)}/${encodeURIComponent(projectName)}`;
}

export function vercelProjectDomainsUrl(projectName: string, teamSlug?: string | null): string {
  return `${vercelProjectDashboardUrl(projectName, teamSlug)}/settings/domains`;
}

/** Team-scoped *.vercel.app deployment alias suffix (transient — not the stable project URL). */
export function vercelTeamDeploymentUrlMarker(teamSlug?: string | null): string {
  return `-${resolveVercelTeamSlug(teamSlug)}.vercel.app`;
}

/** True when URL is a per-deployment team alias, not the stable project alias. */
export function isTransientVercelDeploymentUrl(url: string, teamSlug?: string | null): boolean {
  const markers = [
    vercelTeamDeploymentUrlMarker(teamSlug),
    ...LEGACY_TEAM_SLUGS.map((slug) => vercelTeamDeploymentUrlMarker(slug)),
  ];
  return markers.some((marker) => url.includes(marker));
}
