/**
 * Shared navigation_items table helpers — used by
 * GET /api/navigation and /api/admin/navigation.
 *
 * Uniqueness model (suite-aware):
 *   (COALESCE(tenant_slug,''), COALESCE(app_id,''), COALESCE(parent_id,''), path)
 * so finance and hr can each keep their own /dashboard in one Postgres.
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

export type NavigationScope = { tenantSlug?: string | null; appId?: string | null };

/** Default infrastructure nav slugs seeded from the page catalog. */
export const DEFAULT_INFRA_NAV_SLUGS = [
  'admin',
  'config',
  'ops-admin',
  'ops-tracking',
  'ops-chat',
  'settings',
] as const;

/** Paths nested under the /admin nav item by default. */
export const ADMIN_CHILD_PATHS = ['/ops-admin', '/ops-tracking', '/config'] as const;

function scopeSql(alias = ''): string {
  const p = alias ? `${alias}.` : '';
  return `
    COALESCE(${p}app_id, '') = $1
    AND (
      $2::text IS NULL
      OR ${p}tenant_slug IS NULL
      OR ${p}tenant_slug = $2
    )
  `;
}

function scopeParams(scope?: NavigationScope): [string, string | null] {
  return [normalizeAppId(scope?.appId), normalizeTenantSlug(scope?.tenantSlug) || null];
}

/** Normalize empty / missing ids to '' for comparisons and unique indexes. */
export function normalizeAppId(appId?: string | null): string {
  return (appId ?? '').trim();
}

export function normalizeTenantSlug(tenantSlug?: string | null): string {
  return (tenantSlug ?? '').trim();
}

export async function ensureNavigationTable(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(NAV_DDL);
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE navigation_items ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP',
    );
  } catch {
    /* column may not exist yet */
  }

  for (const col of [
    'ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN NOT NULL DEFAULT FALSE',
    'ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE',
    'ADD COLUMN IF NOT EXISTS tenant_slug TEXT',
    'ADD COLUMN IF NOT EXISTS app_id TEXT',
  ]) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE navigation_items ${col}`);
    } catch {
      /* column exists or older PG */
    }
  }

  try {
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS idx_navigation_items_tenant_app ON navigation_items (tenant_slug, app_id)',
    );
  } catch {
    /* index may already exist */
  }

  // Per-app unique path under a parent (expression index — NULL-safe).
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_navigation_items_tenant_app_parent_path
      ON navigation_items (
        COALESCE(tenant_slug, ''),
        COALESCE(app_id, ''),
        COALESCE(parent_id, ''),
        path
      )
    `);
  } catch (err) {
    // Existing duplicates block the index until reconcile runs once.
    console.warn(
      '[navigation] Unique index not applied yet (duplicates may remain until reconcile):',
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Claim legacy unscoped rows (app_id NULL/'') for the current suite app when
 * no app-scoped row already owns that path. Sibling apps (hr vs finance) are
 * never overwritten.
 */
async function claimLegacyUnscopedRows(
  prisma: PrismaClient,
  scope: NavigationScope,
): Promise<number> {
  const appId = normalizeAppId(scope.appId);
  if (!appId) return 0;
  const tenantSlug = normalizeTenantSlug(scope.tenantSlug) || null;

  const result = await prisma.$executeRawUnsafe(
    `UPDATE navigation_items AS n
     SET app_id = $1,
         tenant_slug = COALESCE(n.tenant_slug, $2)
     WHERE COALESCE(n.app_id, '') = ''
       AND ($2::text IS NULL OR n.tenant_slug IS NULL OR n.tenant_slug = $2)
       AND NOT EXISTS (
         SELECT 1 FROM navigation_items AS owned
         WHERE owned.path = n.path
           AND COALESCE(owned.app_id, '') = $1
           AND COALESCE(owned.parent_id, '') = COALESCE(n.parent_id, '')
           AND ($2::text IS NULL OR owned.tenant_slug IS NULL OR owned.tenant_slug = $2)
       )`,
    appId,
    tenantSlug,
  );
  return typeof result === 'number' ? result : 0;
}

/**
 * Collapse duplicate nav rows **within one app scope**. Never deletes another
 * suite app's /dashboard (or any other path).
 */
export async function reconcileNavigationDuplicates(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<{ deleted: number; excelFolderId: string | null }> {
  await ensureNavigationTable(prisma);

  const appId = normalizeAppId(scope?.appId);
  const tenantSlug = normalizeTenantSlug(scope?.tenantSlug) || null;

  // Strict per-app filter (after claiming legacy orphans for this app).
  await claimLegacyUnscopedRows(prisma, { appId, tenantSlug });

  const scopeFilter = scopeSql();
  const scopeBind: unknown[] = [appId, tenantSlug];

  let deleted = 0;

  // ── 1. Merge duplicate root Excel / Workbook folders (this app only) ──
  const excelFolders = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM navigation_items
     WHERE parent_id IS NULL
       AND (LOWER(title) IN ('excel', 'workbook') OR path IN ('/excel', '/workbook'))
       AND ${scopeFilter}
     ORDER BY created_at ASC NULLS LAST, id ASC`,
    ...scopeBind,
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

  // ── 2. Dedupe by (parent_id, path) within this app ───────────────────
  const dupGroups = await prisma.$queryRawUnsafe<
    { parent_id: string | null; path: string; keep_id: string; ids: string }[]
  >(
    `SELECT parent_id, path,
            (ARRAY_AGG(id ORDER BY is_dynamic ASC, created_at ASC NULLS LAST, id ASC))[1] AS keep_id,
            ARRAY_TO_STRING(ARRAY_AGG(id ORDER BY is_dynamic ASC, created_at ASC NULLS LAST, id ASC), ',') AS ids
     FROM navigation_items
     WHERE path <> ''
       AND ${scopeFilter}
     GROUP BY parent_id, path
     HAVING COUNT(*) > 1`,
    ...scopeBind,
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

  // ── 3. Same path under different parents — prefer nested over root ─────
  const pathDupes = await prisma.$queryRawUnsafe<{ path: string; keep_id: string; ids: string }[]>(
    `SELECT path,
            (ARRAY_AGG(id ORDER BY (parent_id IS NULL) ASC, is_dynamic ASC, created_at ASC NULLS LAST, id ASC))[1] AS keep_id,
            ARRAY_TO_STRING(ARRAY_AGG(id ORDER BY (parent_id IS NULL) ASC, is_dynamic ASC, created_at ASC NULLS LAST, id ASC), ',') AS ids
     FROM navigation_items
     WHERE path <> '' AND path <> '/excel' AND path <> '/workbook'
       AND ${scopeFilter}
     GROUP BY path
     HAVING COUNT(*) > 1`,
    ...scopeBind,
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

  if (excelFolderId && appId) {
    await prisma.$executeRawUnsafe(
      `UPDATE navigation_items SET app_id = $1, tenant_slug = COALESCE(tenant_slug, $2)
       WHERE id = $3 OR parent_id = $3`,
      appId,
      tenantSlug,
      excelFolderId,
    );
  }

  // Retry unique index after cleanup.
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_navigation_items_tenant_app_parent_path
      ON navigation_items (
        COALESCE(tenant_slug, ''),
        COALESCE(app_id, ''),
        COALESCE(parent_id, ''),
        path
      )
    `);
  } catch {
    /* still blocked or already exists */
  }

  return { deleted, excelFolderId };
}

/**
 * Find or create a single Excel folder for this app. Merges duplicates first.
 */
export async function ensureExcelNavigationFolder(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<string | null> {
  const { excelFolderId } = await reconcileNavigationDuplicates(prisma, scope);
  if (excelFolderId) return excelFolderId;

  const appId = normalizeAppId(scope?.appId) || null;
  const tenantSlug = normalizeTenantSlug(scope?.tenantSlug) || null;
  const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `INSERT INTO navigation_items (
       id, parent_id, sort_order, title, path, icon, auth_tier, required_groups,
       is_visible, is_dynamic, is_default, tenant_slug, app_id, updated_at
     )
     VALUES (
       gen_random_uuid()::TEXT, NULL,
       (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM navigation_items
        WHERE parent_id IS NULL AND COALESCE(app_id, '') = COALESCE($2, '')),
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
 * Idempotent sheet → nav sync under this app's Excel folder.
 * Path lookup is scoped by app_id so hr's /sheet-pl never blocks finance.
 */
export async function syncSheetPagesIntoNavigation(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<{ created: number; parentId: string | null; totalSheets: number }> {
  const folderId = await ensureExcelNavigationFolder(prisma, scope);
  if (!folderId) return { created: 0, parentId: null, totalSheets: 0 };

  const appId = normalizeAppId(scope?.appId);
  const tenantSlug = normalizeTenantSlug(scope?.tenantSlug) || null;

  const sheets = await prisma.$queryRawUnsafe<{ slug: string; title: string }[]>(
    `SELECT slug, title FROM app_pages
     WHERE slug LIKE 'sheet-%'
       AND (COALESCE(app_id, '') = '' OR COALESCE(app_id, '') = $1)
     ORDER BY sort_order ASC, slug ASC`,
    appId,
  );

  let created = 0;
  let navSort = 0;
  for (const sheet of sheets) {
    const path = `/${sheet.slug}`;
    const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM navigation_items
       WHERE path = $1 AND COALESCE(app_id, '') = $2
       LIMIT 1`,
      path,
      appId,
    );
    if (existing.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE navigation_items
         SET parent_id = $1, title = $2, app_id = $3,
             tenant_slug = COALESCE(tenant_slug, $4), updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        folderId,
        sheet.title,
        appId || null,
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
      appId || null,
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

const STATIC_NAV_SLUGS = new Set<string>(DEFAULT_INFRA_NAV_SLUGS);

async function deriveNavItemsFromCatalog(): Promise<
  { id: string; title: string; path: string; authTier: string; requiredGroups: string }[]
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
        requiredGroups: (p.requiredGroups ?? []).join(','),
      };
    });
}

/**
 * Idempotently insert static infrastructure nav items for **this app**.
 * Path uniqueness is per (tenant, app) — finance and hr each get /admin etc.
 */
export async function seedMissingNavigationFromCatalog(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<number> {
  const tenantSlug = normalizeTenantSlug(scope?.tenantSlug) || null;
  const appId = normalizeAppId(scope?.appId);

  const existing = await prisma.$queryRawUnsafe<{ id: string; path: string }[]>(
    `SELECT id, path FROM navigation_items
     WHERE COALESCE(app_id, '') = $1
       AND ($2::text IS NULL OR tenant_slug IS NULL OR tenant_slug = $2)`,
    appId,
    tenantSlug,
  );
  const existingIds = new Set(existing.map((r) => r.id));
  const existingPaths = new Set(existing.map((r) => r.path));

  const catalogItems = await deriveNavItemsFromCatalog();
  let inserted = 0;

  const insertIfMissing = async (
    id: string,
    title: string,
    path: string,
    authTier: string,
    requiredGroups: string,
  ) => {
    if (existingPaths.has(path)) return;
    const scopedId =
      tenantSlug || appId ? `${id}_${appId || tenantSlug}` : id;
    if (existingIds.has(scopedId) || existingIds.has(id)) return;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic, is_default, tenant_slug, app_id, updated_at)
         VALUES ($1, NULL, $2, $3, $4, '', CAST($5 AS "AuthTier"), $6, TRUE, FALSE, $7, $8, $9, NOW())`,
        scopedId,
        inserted,
        title,
        path,
        authTier,
        requiredGroups,
        path === '/',
        tenantSlug,
        appId || null,
      );
      existingIds.add(scopedId);
      existingPaths.add(path);
      inserted++;
    } catch (err) {
      console.error(`[navigation] Failed to seed item ${scopedId}:`, err);
    }
  };

  for (const item of catalogItems) {
    await insertIfMissing(item.id, item.title, item.path, item.authTier, item.requiredGroups);
  }

  return inserted;
}

/**
 * Nest default infrastructure items:
 *   - /admin stays at root and becomes parent of ops-admin, ops-tracking, config
 */
export async function ensureDefaultNavigationHierarchy(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<{ updated: number }> {
  const [appId, tenantSlug] = scopeParams(scope);
  const filter = scopeSql();

  const adminRows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM navigation_items
     WHERE path = '/admin' AND ${filter}
     ORDER BY is_dynamic ASC, created_at ASC NULLS LAST, id ASC
     LIMIT 1`,
    appId,
    tenantSlug,
  );
  const adminId = adminRows[0]?.id;
  if (!adminId) return { updated: 0 };

  await prisma.$executeRawUnsafe(
    `UPDATE navigation_items SET parent_id = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND ${filter}`,
    adminId,
    appId,
    tenantSlug,
  );

  let updated = 0;
  for (let i = 0; i < ADMIN_CHILD_PATHS.length; i++) {
    const childPath = ADMIN_CHILD_PATHS[i]!;
    const result = await prisma.$executeRawUnsafe(
      `UPDATE navigation_items
       SET parent_id = $1, sort_order = $2, updated_at = CURRENT_TIMESTAMP
       WHERE path = $3 AND ${filter}`,
      adminId,
      i,
      childPath,
      appId,
      tenantSlug,
    );
    updated += typeof result === 'number' ? result : 0;
  }

  return { updated };
}

/**
 * Full navigation reconcile: seed defaults, dedupe, sync workbook sheets, apply hierarchy.
 */
export async function reconcileNavigation(
  prisma: PrismaClient,
  scope?: NavigationScope,
): Promise<{
  deleted: number;
  seeded: number;
  sheetsSynced: number;
  hierarchyUpdated: number;
  excelFolderId: string | null;
}> {
  await ensureNavigationTable(prisma);
  const seeded = await seedMissingNavigationFromCatalog(prisma, scope);
  const { deleted, excelFolderId } = await reconcileNavigationDuplicates(prisma, scope);
  const sheetResult = await syncSheetPagesIntoNavigation(prisma, scope);
  const { updated: hierarchyUpdated } = await ensureDefaultNavigationHierarchy(prisma, scope);
  return {
    deleted,
    seeded,
    sheetsSynced: sheetResult.created,
    hierarchyUpdated,
    excelFolderId: sheetResult.parentId ?? excelFolderId,
  };
}
