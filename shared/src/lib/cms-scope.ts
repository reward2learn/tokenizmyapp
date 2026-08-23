import { getCurrentAppId, getTenantConfig } from './config/tenant';

export interface CmsTenantAppScope {
  tenantSlug: string;
  appId?: string;
}

/** Runtime CMS scope for this deployment (env-based). */
export function getCmsTenantAppScope(): CmsTenantAppScope {
  const tenantSlug = getTenantConfig().slug;
  const appId = getCurrentAppId();
  return appId ? { tenantSlug, appId } : { tenantSlug };
}

/** Composite cache key — route slugs like `home` collide across suite apps. */
export function cmsPageCacheKey(scope: CmsTenantAppScope, routeSlug: string): string {
  return `${scope.tenantSlug}:${scope.appId ?? ''}:${routeSlug}`;
}
