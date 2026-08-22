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

export type NavigationScope = { tenantSlug?: string | null; appId?: string | null };

/** Normalize empty / missing app ids to a single sentinel for comparisons. */
function normalizeAppId(appId?: string | null): string {
  return (appId ?? '').trim();
}

/**
 * Collapse duplicate nav rows created by repeated reseeds / Excel-folder
 * inserts (no unique constraint on path). Keeps the oldest row per
 * (parent_id, path) and merges extra root "Excel" folders into one.
 *
 * Returns how many rows were deleted.
 */
export async function reconcileNavigationDuplicates(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<{ deleted: number; excelFolderId: string | null }> {
  await ensureNavigationTable(prisma);

  const appId = normalizeAppId(scope?.appId);
  const tenantSlug = scope?.tenantSlug?.trim() || null;

  // Scope filter: current app + legacy unscoped rows (null / '') so we don't
  // leave orphans that keep reappearing in the unfiltered drawer.
  const scopeSql = `
    (
      COALESCE(app_id, '') = '' OR COALESCE(app_id, '') = $1
    )
    AND (
      $2::text IS NULL
      OR tenant_slug IS NULL
      OR tenant_slug = $2
    )
  `;
  const scopeParams: unknown[] = [appId, tenantSlug];

  let deleted = 0;

  // ── 1. Merge duplicate root Excel / Workbook folders ─────────────
  const excelFolders = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM navigation_items
     WHERE parent_id IS NULL
       AND (LOWER(title) IN ('excel', 'workbook') OR path IN ('/excel', '/workbook'))
       AND ${scopeSql}
     ORDER BY created_at ASC NULLS LAST, id ASC`,
    ...scopeParams,
  );

  let excelFolderId: string | null = excelFolders[0]?.id ?? null;
  if (excelFolders.length > 1 && excelFolderId) {
    for (const extra of excelFolders.slice(1)) {
      await prisma.$executeRawUnsafe(
        `UPDATE navigation_items SET parent_id = $1 WHERE parent_id = $2`,
        excelFolderId,
        extra.id,
      );
      await prisma.$executeRawUnsafe(`DELETE FROM navigation_items WHERE id = $1`, extra.id);
      deleted += 1;
    }
  }

  // ── 2. Dedupe by (parent_id, path) — keep oldest ─────────────────
  const dupGroups = await prisma.$queryRawUnsafe<{ parent_id: string | null; path: string; keep_id: string; ids: string }[]>(
    `SELECT parent_id, path,
            (ARRAY_AGG(id ORDER BY created_at ASC NULLS LAST, id ASC))[1] AS keep_id,
            ARRAY_TO_STRING(ARRAY_AGG(id ORDER BY created_at ASC NULLS LAST, id ASC), ',') AS ids
     FROM navigation_items
     WHERE path <> ''
       AND ${scopeSql}
     GROUP BY parent_id, path
     HAVING COUNT(*) > 1`,
    ...scopeParams,
  );

  for (const group of dupGroups) {
    const ids = group.ids.split(',').filter(Boolean);
    for (const id of ids) {
      if (id === group.keep_id) continue;
      await prisma.$executeRawUnsafe(
        `UPDATE navigation_items SET parent_id = $1 WHERE parent_id = $2`,
        group.keep_id,
        id,
      );
      await prisma.$executeRawUnsafe(`DELETE FROM navigation_items WHERE id = $1`, id);
      deleted += 1;
    }
  }

  // ── 3. Dedupe the same path under different parents ───────────────
  const pathDupes = await prisma.$queryRawUnsafe<{ path: string; keep_id: string; ids: string }[]>(
    `SELECT path,
            (ARRAY_AGG(id ORDER BY created_at ASC NULLS LAST, id ASC))[1] AS keep_id,
            ARRAY_TO_STRING(ARRAY_AGG(id ORDER BY created_at ASC NULLS LAST, id ASC), ',') AS ids
     FROM navigation_items
     WHERE path <> '' AND path <> '/excel' AND path <> '/workbook'
       AND ${scopeSql}
     GROUP BY path
     HAVING COUNT(*) > 1`,
    ...scopeParams,
  );

  for (const group of pathDupes) {
    const ids = group.ids.split(',').filter(Boolean);
    for (const id of ids) {
      if (id === group.keep_id) continue;
      await prisma.$executeRawUnsafe(
        `UPDATE navigation_items SET parent_id = $1 WHERE parent_id = $2`,
        group.keep_id,
        id,
      );
      await prisma.$executeRawUnsafe(`DELETE FROM navigation_items WHERE id = $1`, id);
      deleted += 1;
    }
  }

  // Stamp keeper Excel + sheet children with current app_id so future deletes match.
  if (excelFolderId && appId) {
    await prisma.$executeRawUnsafe(
      `UPDATE navigation_items SET app_id = $1, tenant_slug = COALESCE(tenant_slug, $2)
       WHERE id = $3 OR parent_id = $3`,
      appId,
      tenantSlug,
      excelFolderId,
    );
  }

  return { deleted, excelFolderId };
}

/**
 * Find or create a single Excel folder for sheet pages. Merges duplicates first.
 */
export async function ensureExcelNavigationFolder(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<string | null> {
  const { excelFolderId } = await reconcileNavigationDuplicates(prisma, scope);
  if (excelFolderId) return excelFolderId;

  const appId = normalizeAppId(scope?.appId) || null;
  const tenantSlug = scope?.tenantSlug?.trim() || null;
  const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `INSERT INTO navigation_items (
       id, parent_id, sort_order, title, path, icon, auth_tier, required_groups,
       is_visible, is_dynamic, is_default, tenant_slug, app_id, updated_at
     )
     VALUES (
       gen_random_uuid()::TEXT, NULL,
       (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM navigation_items WHERE parent_id IS NULL),
       'Excel', '/excel', 'Folder', CAST('google' AS "AuthTier"), '',
       TRUE, TRUE, FALSE, $1, $2, CURRENT_TIMESTAMP
     )
     RETURNING id`,
    tenantSlug,
    appId,
  );
  return rows[0]?.id ?? null;
}

/**
 * Idempotent sheet → nav sync under the Excel folder. Skips paths that already
 * exist anywhere (not only under this parent) so reseeds never stack copies.
 */
export async function syncSheetPagesIntoNavigation(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<{ created: number; parentId: string | null; totalSheets: number }> {
  const folderId = await ensureExcelNavigationFolder(prisma, scope);
  if (!folderId) return { created: 0, parentId: null, totalSheets: 0 };

  const appId = normalizeAppId(scope?.appId) || null;
  const tenantSlug = scope?.tenantSlug?.trim() || null;

  const sheets = await prisma.$queryRawUnsafe<{ slug: string; title: string }[]>(
    `SELECT slug, title FROM app_pages
     WHERE slug LIKE 'sheet-%'
     ORDER BY sort_order ASC, slug ASC`,
  );

  let created = 0;
  let navSort = 0;
  for (const sheet of sheets) {
    const path = `/${sheet.slug}`;
    const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM navigation_items WHERE path = $1 LIMIT 1`,
      path,
    );
    if (existing.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE navigation_items
         SET parent_id = $1, title = $2, app_id = COALESCE(NULLIF(app_id, ''), $3),
             tenant_slug = COALESCE(tenant_slug, $4), updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        folderId,
        sheet.title,
        appId,
        tenantSlug,
        existing[0]!.id,
      );
      continue;
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO navigation_items (
         id, parent_id, sort_order, title, path, icon, auth_tier, required_groups,
         is_visible, is_dynamic, tenant_slug, app_id, updated_at
       )
       VALUES (
         gen_random_uuid()::TEXT, $1, $2, $3, $4, 'Description', CAST('google' AS "AuthTier"), '',
         TRUE, TRUE, $5, $6, CURRENT_TIMESTAMP
       )`,
      folderId,
      navSort++,
      sheet.title,
      path,
      tenantSlug,
      appId,
    );
    created += 1;
  }

  await reconcileNavigationDuplicates(prisma, scope);
  return { created, parentId: folderId, totalSheets: sheets.length };
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
 * Path uniqueness is enforced globally so reseeds never stack /admin etc.
 */
export async function seedMissingNavigationFromCatalog(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<number> {
  const tenantSlug = scope?.tenantSlug ?? null;
  const appId = normalizeAppId(scope?.appId) || null;

  const existing = await prisma.$queryRawUnsafe<{ id: string; path: string }[]>(
    `SELECT id, path FROM navigation_items`,
  );
  const existingIds = new Set(existing.map((r) => r.id));
  const existingPaths = new Set(existing.map((r) => r.path));

  const catalogItems = await deriveNavItemsFromCatalog();
  let inserted = 0;

  const insertIfMissing = async (id: string, title: string, path: string, authTier: string) => {
    if (existingPaths.has(path)) return;
    const scopedId =
      tenantSlug || appId ? `${id}_${appId || tenantSlug}` : id;
    if (existingIds.has(scopedId) || existingIds.has(id)) return;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic, is_default, tenant_slug, app_id, updated_at)
         VALUES ($1, NULL, $2, $3, $4, '', CAST($5 AS "AuthTier"), '', TRUE, FALSE, $6, $7, $8, NOW())`,
        scopedId,
        inserted,
        title,
        path,
        authTier,
        path === '/',
        tenantSlug,
        appId,
      );
      existingIds.add(scopedId);
      existingPaths.add(path);
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
