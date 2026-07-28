/**
 * Shared navigation_items table helpers — used by
 * GET /api/navigation and /api/admin/navigation.
 */
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
export async function ensureNavigationTable(prisma) {
    await prisma.$executeRawUnsafe(NAV_DDL);
    // Ensure updated_at has a default so raw inserts don't fail on NOT NULL
    try {
        await prisma.$executeRawUnsafe("ALTER TABLE navigation_items ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP");
    }
    catch {
        /* column may not exist yet if table was just created */
    }
    for (const col of [
        'ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN NOT NULL DEFAULT FALSE',
        'ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE',
    ]) {
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE navigation_items ${col}`);
        }
        catch {
            /* column exists or older PG without IF NOT EXISTS */
        }
    }
}
/**
 * Slugs that are always-present infrastructure pages.
 * These are seeded from the page catalog regardless of tenant template.
 * All other nav items come from the tenant template (app_pages).
 */
const STATIC_NAV_SLUGS = new Set(['admin', 'config', 'ops-chat']);
async function deriveNavItemsFromCatalog() {
    const { getFullCatalog } = await import('@/lib/page-catalog');
    const catalog = getFullCatalog();
    return Object.entries(catalog)
        .filter(([slug, p]) => STATIC_NAV_SLUGS.has(slug) && p.showInNav !== false)
        .map(([slug, page]) => {
        const p = page;
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
 */
export async function seedMissingNavigationFromCatalog(prisma) {
    const existing = await prisma.$queryRawUnsafe(`SELECT id, path FROM navigation_items`);
    const existingIds = new Set(existing.map((r) => r.id));
    const existingPaths = new Set(existing.map((r) => r.path));
    const catalogItems = await deriveNavItemsFromCatalog();
    let inserted = 0;
    const insertIfMissing = async (id, title, path, authTier) => {
        if (existingIds.has(id) || existingPaths.has(path))
            return;
        try {
            await prisma.$executeRawUnsafe(`INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic, updated_at)
         VALUES ($1, NULL, $2, $3, $4, '', CAST($5 AS "AuthTier"), '', TRUE, FALSE, NOW())`, id, inserted, title, path, authTier);
            existingIds.add(id);
            inserted++;
        }
        catch (err) {
            console.error(`[navigation] Failed to seed item ${id}:`, err);
        }
    };
    for (const item of catalogItems) {
        await insertIfMissing(item.id, item.title, item.path, item.authTier);
    }
    return inserted;
}
