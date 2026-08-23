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
 */
export async function resolveAppPageRow(
  db: CmsSqlClient,
  routeSlug: string,
  options?: { appId?: string; tenantSlug?: string },
): Promise<AppPageRow | null> {
  const appId = options?.appId ?? '';
  const tenantSlug = options?.tenantSlug?.trim() ?? '';
  const candidates = pageSlugLookupCandidates(routeSlug, appId);

  for (const storageSlug of candidates) {
    const params: unknown[] = [storageSlug];
    const clauses = ['slug = $1'];
    let idx = 2;
    if (tenantSlug) {
      clauses.push(`COALESCE(tenant_slug, '') = $${idx++}`);
      params.push(tenantSlug);
    }
    if (appId) {
      clauses.push(`COALESCE(app_id, '') = $${idx++}`);
      params.push(appId);
    }
    const rows = await db.$queryRawUnsafe<{ id: string; slug: string; title: string }[]>(
      `SELECT id, slug, title FROM app_pages WHERE ${clauses.join(' AND ')} LIMIT 1`,
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
