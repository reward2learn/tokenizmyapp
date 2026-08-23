/**
 * Map the current pathname to a CMS page route slug, when the path is a
 * single-segment dynamic page (e.g. /dashboard → "dashboard").
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
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return null;
  const slug = segments[0];
  if (EXCLUDED_SEGMENTS.has(slug)) return null;
  return slug;
}
