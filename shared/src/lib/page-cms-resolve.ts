import { resolveRegistryTenantSlug } from './cms-scope';
import { pageSlugLookupCandidates, toRoutePageSlug } from './page-slug';

export interface AppPageRow {
  id: string;
  title: string;
  storageSlug: string;
  routeSlug: string;
}

export type CmsSqlClient = {
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
};

/**
 * Resolve an app_pages row from the public route slug (e.g. "dashboard").
 *
 * Suite apps store `{appId}-{routeSlug}`; older seeds may still use the bare
 * route slug. Tenant filter prefers the registry slug but also accepts
 * null/empty tenant_slug so legacy sheet pages keep resolving.
 */
export async function resolveAppPageRow(
  db: CmsSqlClient,
  routeSlug: string,
  options?: { appId?: string; tenantSlug?: string },
): Promise<AppPageRow | null> {
  const appId = options?.appId ?? '';
  const deploymentSlug = options?.tenantSlug?.trim() ?? '';
  const tenantSlug = resolveRegistryTenantSlug(deploymentSlug, appId);
  const candidates = pageSlugLookupCandidates(routeSlug, appId);

  for (const storageSlug of candidates) {
    const params: unknown[] = [storageSlug];
    const clauses = ['slug = $1'];
    let idx = 2;
    let tenantParamIndex: number | null = null;

    if (tenantSlug) {
      tenantParamIndex = idx;
      clauses.push(
        `(COALESCE(tenant_slug, '') = $${idx} OR COALESCE(tenant_slug, '') = '')`,
      );
      params.push(tenantSlug);
      idx += 1;
    }
    if (appId) {
      clauses.push(`COALESCE(app_id, '') = $${idx++}`);
      params.push(appId);
    }

    const orderBy =
      tenantParamIndex != null
        ? `ORDER BY CASE WHEN COALESCE(tenant_slug, '') = $${tenantParamIndex} THEN 0 ELSE 1 END`
        : '';

    const rows = await db.$queryRawUnsafe<{ id: string; slug: string; title: string }[]>(
      `SELECT id, slug, title FROM app_pages
       WHERE ${clauses.join(' AND ')}
       ${orderBy}
       LIMIT 1`,
      ...params,
    );
    const row = rows[0];
    if (row) {
      return {
        id: row.id,
        title: row.title,
        storageSlug: row.slug,
        routeSlug: toRoutePageSlug(row.slug, appId),
      };
    }
  }
  return null;
}
