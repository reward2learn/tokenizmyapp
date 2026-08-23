/**
 * Map the current pathname to a CMS page route slug, when the path is a
 * single-segment dynamic page (e.g. /dashboard → "dashboard").
 *
 * The landing route `/` renders the `home` page (see app/page.tsx) but has no
 * URL segment — map it explicitly so inline edit mode can target that page.
 */
const EXCLUDED_SEGMENTS = new Set([
  'admin',
  'settings',
  'review',
  'api',
  'auth',
  'chat',
  'tasks',
  'billing',
]);

export function routePathToPageSlug(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/') return 'home';

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length !== 1) return null;
  const slug = segments[0];
  if (EXCLUDED_SEGMENTS.has(slug)) return null;
  return slug;
}
