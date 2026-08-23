/**
 * Ensure hero CTA hrefs resolve to real app_pages rows + navigation items.
 */

import { normalizeCmsScope } from '@shared/lib/cms-scope';
import {
  collectHeroNavLinks,
  parseHeroNavHref,
  type HeroNavLink,
} from '@shared/lib/hero-nav-routes';
import {
  provisionAppPageFromCatalog,
  provisionMinimalDocPage,
  type CatalogPageInput,
} from '@shared/lib/page-cms-provision';
import { resolveAppPageRow } from '@shared/lib/page-cms-resolve';
import { ensureNavigationTable } from '@/lib/navigation/db';

type EnsureDb = {
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
};

export interface EnsureHeroNavRoutesResult {
  paths: string[];
  pagesCreated: number;
  navCreated: number;
  skipped: string[];
}

export interface EnsureHeroNavRoutesOptions {
  tenantSlug?: string | null;
  appId?: string | null;
  /** Resolve catalog page definitions (server-only). */
  resolveCatalogPage?: (slug: string) => CatalogPageInput | null;
}

async function pageExists(
  db: EnsureDb,
  slug: string,
  registryTenantSlug: string,
  appId: string,
): Promise<boolean> {
  const row = await resolveAppPageRow(db, slug, {
    tenantSlug: registryTenantSlug,
    appId,
  });
  return Boolean(row);
}

async function ensureNavItem(
  db: EnsureDb,
  path: string,
  title: string,
  registryTenantSlug: string | null,
  appId: string,
): Promise<boolean> {
  const existing = await db.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM navigation_items
     WHERE path = $1 AND COALESCE(app_id, '') = $2
       AND ($3::text IS NULL OR COALESCE(tenant_slug, '') = $3)
     LIMIT 1`,
    path,
    appId,
    registryTenantSlug,
  );
  if (existing[0]) return false;

  await db.$executeRawUnsafe(
    `INSERT INTO navigation_items (
       id, parent_id, sort_order, title, path, icon, auth_tier, required_groups,
       is_visible, is_dynamic, tenant_slug, app_id, updated_at
     )
     VALUES (
       gen_random_uuid()::TEXT, NULL,
       (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM navigation_items
        WHERE parent_id IS NULL AND COALESCE(app_id, '') = $1),
       $2, $3, 'Description', CAST('google' AS "AuthTier"), '',
       TRUE, TRUE, $4, $5, CURRENT_TIMESTAMP
     )`,
    appId,
    title,
    path,
    registryTenantSlug,
    appId || null,
  );
  return true;
}

export async function ensureHeroNavRoutes(
  db: EnsureDb,
  linksOrConfig: HeroNavLink[] | Record<string, unknown>,
  options: EnsureHeroNavRoutesOptions = {},
): Promise<EnsureHeroNavRoutesResult> {
  const scope = normalizeCmsScope({
    tenantSlug: options.tenantSlug,
    appId: options.appId,
  });
  const appId = scope.appId ?? '';
  const registryTenantSlug = scope.tenantSlug;

  await ensureNavigationTable(db as Parameters<typeof ensureNavigationTable>[0]);

  const links = Array.isArray(linksOrConfig) ? linksOrConfig : collectHeroNavLinks(linksOrConfig);
  const seen = new Set<string>();
  const result: EnsureHeroNavRoutesResult = {
    paths: [],
    pagesCreated: 0,
    navCreated: 0,
    skipped: [],
  };

  for (const link of links) {
    const parsed = parseHeroNavHref(link.href);
    if (!parsed) {
      result.skipped.push(link.href);
      continue;
    }
    if (seen.has(parsed.path)) continue;
    seen.add(parsed.path);
    result.paths.push(parsed.path);

    const exists = await pageExists(db, parsed.slug, registryTenantSlug, appId);
    if (!exists) {
      const catalog = options.resolveCatalogPage?.(parsed.slug) ?? null;
      if (catalog) {
        const provisioned = await provisionAppPageFromCatalog(db, catalog, {
          deploymentTenantSlug: scope.deploymentSlug,
          appId: scope.appId,
        });
        if (provisioned.created) result.pagesCreated += 1;
      } else {
        const provisioned = await provisionMinimalDocPage(
          db,
          { slug: parsed.slug, title: link.label || parsed.slug },
          { deploymentTenantSlug: scope.deploymentSlug, appId: scope.appId },
        );
        if (provisioned.created) result.pagesCreated += 1;
      }
    }

    const navCreated = await ensureNavItem(
      db,
      parsed.path,
      link.label || parsed.slug,
      registryTenantSlug,
      appId,
    );
    if (navCreated) result.navCreated += 1;
  }

  return result;
}
