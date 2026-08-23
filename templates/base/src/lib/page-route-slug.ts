/**
 * Map the current pathname to a CMS page route slug, when the path is a
 * single-segment dynamic page (e.g. /dashboard → "dashboard").
 *
 * The landing route `/` renders the `home` page (see app/page.tsx) but has no
 * URL segment — map it explicitly so inline edit mode can target that page.
 *
 * Review parts use a dedicated prefix: `/review/part-a` → `review:part-a`.
 */
const EXCLUDED_SEGMENTS = new Set([
  'admin',
  'settings',
  'api',
  'auth',
  'chat',
  'tasks',
  'billing',
]);

const REVIEW_PART_EDIT_PREFIX = 'review:';

/** CMS edit slug for a review part route segment (e.g. `part-a` → `review:part-a`). */
export function reviewPartEditSlug(partSlug: string): string {
  return `${REVIEW_PART_EDIT_PREFIX}${partSlug.trim().toLowerCase()}`;
}

/** True when the CMS edit slug targets a review part (e.g. `review:part-a`). */
export function isReviewPartEditSlug(slug: string | null): slug is string {
  return typeof slug === 'string' && slug.startsWith(REVIEW_PART_EDIT_PREFIX);
}

/** Extract the review part route segment from a CMS edit slug, or null. */
export function parseReviewPartEditSlug(editSlug: string): string | null {
  if (!editSlug.startsWith(REVIEW_PART_EDIT_PREFIX)) return null;
  const partSlug = editSlug.slice(REVIEW_PART_EDIT_PREFIX.length).trim().toLowerCase();
  return partSlug.length > 0 ? partSlug : null;
}

export function routePathToPageSlug(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/') return 'home';

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 2 && segments[0] === 'review') {
    const partSlug = segments[1]!.trim().toLowerCase();
    return partSlug.length > 0 ? reviewPartEditSlug(partSlug) : null;
  }

  if (segments.length !== 1) return null;
  const slug = segments[0];
  if (EXCLUDED_SEGMENTS.has(slug)) return null;
  return slug;
}
