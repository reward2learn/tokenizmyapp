/**
 * Shared navigation_items table helpers — used by
 * GET /api/navigation and /api/admin/navigation.
 */

import type { PrismaClient } from '@/generated/prisma';

const NAV_DDL = `
CREATE TABLE IF NOT EXISTS navigation_items (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES navigation_items(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  auth_tier TEXT NOT NULL DEFAULT 'public',
  required_groups TEXT NOT NULL DEFAULT '',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

export async function ensureNavigationTable(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(NAV_DDL);
  // Ensure updated_at has a default so raw inserts don't fail on NOT NULL
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE navigation_items ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP"
    );
  } catch {
    /* column may not exist yet if table was just created */
  }

  for (const col of [
    'ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN NOT NULL DEFAULT FALSE',
    'ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE',
    // tenant_slug pre-existed via a separate, rarely-run migration path
    // (tenant-seed-service.ts addTenantColumnsIfMissing) — re-declared here,
    // idempotently, alongside the new app_id column so both land on every deploy.
    'ADD COLUMN IF NOT EXISTS tenant_slug TEXT',
    'ADD COLUMN IF NOT EXISTS app_id TEXT',
  ]) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE navigation_items ${col}`);
    } catch {
      /* column exists or older PG without IF NOT EXISTS */
    }
  }

  try {
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS idx_navigation_items_tenant_app ON navigation_items (tenant_slug, app_id)',
    );
  } catch {
    /* index may already exist */
  }
}

interface CatalogPage {
  slug: string;
  title: string;
  authTier: string;
  navLabel?: string;
  showInNav?: boolean;
  requiredGroups?: string[];
}

/**
 * Slugs that are always-present infrastructure pages.
 * These are seeded from the page catalog regardless of tenant template.
 * All other nav items come from the tenant template (app_pages).
 */
const STATIC_NAV_SLUGS = new Set(['admin', 'config', 'ops-chat', 'settings']);

async function deriveNavItemsFromCatalog(): Promise<
  { id: string; title: string; path: string; authTier: string }[]
> {
  const { getFullCatalog } = await import('@/lib/page-catalog');
  const catalog = getFullCatalog();
  return Object.entries(catalog)
    .filter(([slug, p]) => STATIC_NAV_SLUGS.has(slug) && (p as CatalogPage).showInNav !== false)
    .map(([slug, page]) => {
      const p = page as CatalogPage;
      return {
        id: `static-${slug}`,
        title: p.navLabel ?? p.title,
        path: `/${slug}`,
        authTier: p.authTier,
      };
    });
}

/**
 * Idempotently insert static infrastructure nav items from the page catalog.
 * Template-driven pages are NOT seeded here — they come from the tenant template
 * via app_pages. Returns the number of rows inserted.
 *
 * `scope` matters only when `prisma` is a shared/multi-tenant database (the
 * platform root DB, or a suite parent DB holding several apps) — without it,
 * the "already seeded" check was global, so once ANY tenant/app anywhere had
 * e.g. an "admin" item, every other tenant/app silently never got its own.
 * When `prisma` is a tenant's own dedicated database, every row already
 * belongs to that one tenant and `scope` can be omitted.
 */
export async function seedMissingNavigationFromCatalog(
  prisma: PrismaClient,
  scope?: { tenantSlug?: string | null; appId?: string | null },
): Promise<number> {
  const tenantSlug = scope?.tenantSlug ?? null;
  const appId = scope?.appId ?? null;
  const where: string[] = [];
  const params: unknown[] = [];
  if (tenantSlug) { params.push(tenantSlug); where.push(`tenant_slug = $${params.length}`); }
  if (appId) { params.push(appId); where.push(`app_id = $${params.length}`); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const existing = await prisma.$queryRawUnsafe<{ id: string; path: string }[]>(
    `SELECT id, path FROM navigation_items ${whereClause}`,
    ...params,
  );
  const existingIds = new Set(existing.map((r) => r.id));
  const existingPaths = new Set(existing.map((r) => r.path));

  const catalogItems = await deriveNavItemsFromCatalog();
  let inserted = 0;

  const insertIfMissing = async (id: string, title: string, path: string, authTier: string) => {
    if (existingIds.has(id) || existingPaths.has(path)) return;
    // Scoped ids so the same catalog slug can exist once per tenant/app.
    const scopedId = tenantSlug ? `${id}_${appId ?? tenantSlug}` : id;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic, is_default, tenant_slug, app_id, updated_at)
         VALUES ($1, NULL, $2, $3, $4, '', CAST($5 AS "AuthTier"), '', TRUE, FALSE, $6, $7, $8, NOW())`,
        scopedId,
        inserted,
        title,
        path,
        authTier,
        path === '/', // the Home '/' item becomes the default landing route when seeded
        tenantSlug,
        appId,
      );
      existingIds.add(scopedId);
      inserted++;
    } catch (err) {
      console.error(`[navigation] Failed to seed item ${scopedId}:`, err);
    }
  };

  for (const item of catalogItems) {
    await insertIfMissing(item.id, item.title, item.path, item.authTier);
  }

  return inserted;
}
