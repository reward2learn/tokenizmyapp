/**
 * Suite app page slug helpers.
 *
 * Multiple suite apps can share one tenant database. `app_pages.slug` is
 * globally unique, so per-app pages are stored as `{appId}-{routeSlug}`
 * while URLs stay `/dashboard`, `/home`, etc.
 */

/** DB storage slug for a route slug when scoped to a suite app. */
export function toStoragePageSlug(routeSlug: string, appId: string): string {
  if (!appId) return routeSlug;
  return `${appId}-${routeSlug}`;
}

/** Public route slug from a DB storage slug. */
export function toRoutePageSlug(storageSlug: string, appId: string): string {
  if (!appId) return storageSlug;
  const prefix = `${appId}-`;
  if (storageSlug.startsWith(prefix)) return storageSlug.slice(prefix.length);
  return storageSlug;
}

/** Slug values to try when resolving a page row (prefixed first, then legacy). */
export function pageSlugLookupCandidates(routeSlug: string, appId: string): string[] {
  if (!appId) return [routeSlug];
  const storage = toStoragePageSlug(routeSlug, appId);
  return storage === routeSlug ? [routeSlug] : [storage, routeSlug];
}
