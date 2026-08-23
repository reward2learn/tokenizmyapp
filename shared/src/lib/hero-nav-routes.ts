/**
 * Hero navigation button helpers — extract internal app paths from hero config.
 */

export interface HeroNavLink {
  label: string;
  href: string;
}

const EXCLUDED_SINGLE_SEGMENT = new Set([
  'admin',
  'settings',
  'api',
  'auth',
  'chat',
  'tasks',
  'billing',
]);

/** Collect CTA links from a hero block config (single slide or carousel). */
export function collectHeroNavLinks(config: Record<string, unknown>): HeroNavLink[] {
  const links: HeroNavLink[] = [];
  const push = (raw: unknown) => {
    if (!Array.isArray(raw)) return;
    for (const row of raw) {
      if (!row || typeof row !== 'object') continue;
      const label = typeof (row as HeroNavLink).label === 'string' ? (row as HeroNavLink).label.trim() : '';
      const href = typeof (row as HeroNavLink).href === 'string' ? (row as HeroNavLink).href.trim() : '';
      if (!href) continue;
      links.push({ label: label || href, href });
    }
  };

  push(config.navButtons);
  if (Array.isArray(config.slides)) {
    for (const slide of config.slides) {
      if (slide && typeof slide === 'object') {
        push((slide as Record<string, unknown>).navButtons);
      }
    }
  }
  return links;
}

/**
 * Parse an internal single-segment app path from a hero href.
 * Returns null for external URLs, review parts, home, or infrastructure routes.
 */
export function parseHeroNavHref(href: string): { path: string; slug: string } | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) return null;

  let pathname = trimmed;
  try {
    if (trimmed.startsWith('/')) {
      pathname = trimmed;
    } else if (trimmed.includes('://')) {
      return null;
    } else {
      pathname = `/${trimmed.replace(/^\/+/, '')}`;
    }
  } catch {
    return null;
  }

  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/') return null;

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 2 && segments[0] === 'review') {
    // Review parts are not app_pages rows — skip auto-provision here.
    return null;
  }
  if (segments.length !== 1) return null;

  const slug = segments[0]!.toLowerCase();
  if (EXCLUDED_SINGLE_SEGMENT.has(slug)) return null;

  return { path: `/${slug}`, slug };
}
