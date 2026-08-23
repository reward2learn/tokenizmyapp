import { getCurrentAppId, getTenantConfig } from './config/tenant';

export interface CmsTenantAppScope {
  /** Registry tenant slug stored in app_pages.tenant_slug (parent slug for suite apps). */
  tenantSlug: string;
  /** Deployment slug from NEXT_PUBLIC_TENANT_SLUG — used for cache keys. */
  deploymentSlug: string;
  appId?: string;
}

/**
 * Suite apps deploy as `{parentSlug}-{appId}` but seed CMS rows under the parent
 * registry slug (e.g. tokenizmyapp-finance → tokenizmyapp).
 */
export function resolveRegistryTenantSlug(deploymentSlug: string, appId?: string): string {
  const slug = deploymentSlug.trim();
  const id = appId?.trim() ?? '';
  if (!id) return slug;
  const suffix = `-${id}`;
  if (slug.endsWith(suffix) && slug.length > suffix.length) {
    return slug.slice(0, -suffix.length);
  }
  return slug;
}

/** Normalize API/query scope — accepts deployment or registry tenant slugs. */
export function normalizeCmsScope(scope?: {
  tenantSlug?: string | null;
  appId?: string | null;
}): CmsTenantAppScope {
  const deploymentSlug =
    scope?.tenantSlug?.trim() || getTenantConfig().slug;
  const appId = scope?.appId?.trim() || getCurrentAppId() || undefined;
  const registryTenantSlug = resolveRegistryTenantSlug(deploymentSlug, appId);
  return appId
    ? { tenantSlug: registryTenantSlug, deploymentSlug, appId }
    : { tenantSlug: registryTenantSlug, deploymentSlug };
}

/** Runtime CMS scope for this deployment (env-based). */
export function getCmsTenantAppScope(): CmsTenantAppScope {
  return normalizeCmsScope();
}

/** Composite cache key — route slugs like `home` collide across suite apps. */
export function cmsPageCacheKey(scope: CmsTenantAppScope, routeSlug: string): string {
  return `${scope.deploymentSlug}:${scope.appId ?? ''}:${routeSlug}`;
}
