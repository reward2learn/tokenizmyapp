/**
 * Remove legacy unprefixed `sheet-*` app_pages when a suite-prefixed twin
 * (`{appId}-sheet-*`) already exists for the same app.
 *
 * Older seeds wrote bare `sheet-daily-sales`; suite mode also writes
 * `finance-sheet-daily-sales`. Both resolve to the same public route, which
 * caused duplicate nav inserts (unique index 23505).
 */

import { toStoragePageSlug } from '@shared/lib/page-slug';

export type CleanupLegacySheetPagesDb = {
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
};

export type CleanupLegacySheetPagesScope = {
  tenantSlug?: string | null;
  appId?: string | null;
};

export type CleanupLegacySheetPagesResult = {
  deleted: number;
  migrated: number;
};

type LegacyTwinRow = {
  legacy_id: string;
  legacy_slug: string;
  legacy_locked: boolean;
  prefixed_id: string;
  prefixed_locked: boolean;
  prefixed_section_count: number;
};

/**
 * Pure helper for tests: storage slug of the suite twin for a legacy sheet slug.
 * Returns null when cleanup does not apply (no appId, or slug already prefixed / not a sheet).
 */
export function legacySheetTwinStorageSlug(
  legacySlug: string,
  appId: string,
): string | null {
  const id = (appId ?? '').trim();
  if (!id) return null;
  if (!legacySlug.startsWith('sheet-')) return null;
  if (legacySlug.startsWith(`${id}-`)) return null;
  return toStoragePageSlug(legacySlug, id);
}

/**
 * Delete legacy `sheet-*` rows that have a matching `{appId}-sheet-*` twin.
 *
 * When the legacy row is `content_locked` and the twin is not, section rows are
 * moved onto the twin (if it has none) and the lock is copied — then legacy is deleted.
 * No-op when `appId` is empty (single-app / non-suite deployments).
 */
export async function cleanupLegacySheetAppPages(
  db: CleanupLegacySheetPagesDb,
  scope: CleanupLegacySheetPagesScope = {},
): Promise<CleanupLegacySheetPagesResult> {
  const appId = (scope.appId ?? '').trim();
  if (!appId) return { deleted: 0, migrated: 0 };

  const tenantSlug = (scope.tenantSlug ?? '').trim() || null;

  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS content_locked BOOLEAN DEFAULT false`,
    );
  } catch {
    /* table may not exist yet */
  }

  const pairs = await db.$queryRawUnsafe<LegacyTwinRow[]>(
    `SELECT
       legacy.id AS legacy_id,
       legacy.slug AS legacy_slug,
       COALESCE(legacy.content_locked, false) AS legacy_locked,
       pref.id AS prefixed_id,
       COALESCE(pref.content_locked, false) AS prefixed_locked,
       (
         SELECT COUNT(*)::int FROM page_sections ps WHERE ps.page_id = pref.id
       ) AS prefixed_section_count
     FROM app_pages legacy
     INNER JOIN app_pages pref
       ON pref.slug = $1 || '-' || legacy.slug
     WHERE legacy.slug LIKE 'sheet-%'
       AND (
         COALESCE(legacy.app_id, '') = ''
         OR COALESCE(legacy.app_id, '') = $1
       )
       AND (
         COALESCE(pref.app_id, '') = ''
         OR COALESCE(pref.app_id, '') = $1
       )
       AND (
         $2::text IS NULL
         OR legacy.tenant_slug IS NULL
         OR legacy.tenant_slug = $2
       )
       AND (
         $2::text IS NULL
         OR pref.tenant_slug IS NULL
         OR pref.tenant_slug = $2
       )`,
    appId,
    tenantSlug,
  );

  let deleted = 0;
  let migrated = 0;

  for (const pair of pairs) {
    if (pair.legacy_locked && !pair.prefixed_locked) {
      if (pair.prefixed_section_count === 0) {
        await db.$executeRawUnsafe(
          `UPDATE page_sections SET page_id = $1 WHERE page_id = $2`,
          pair.prefixed_id,
          pair.legacy_id,
        );
        migrated += 1;
      }
      await db.$executeRawUnsafe(
        `UPDATE app_pages SET content_locked = TRUE WHERE id = $1`,
        pair.prefixed_id,
      );
    }

    // page_sections cascade on app_pages delete (ZenStack onDelete: Cascade)
    await db.$executeRawUnsafe(`DELETE FROM app_pages WHERE id = $1`, pair.legacy_id);
    deleted += 1;
  }

  return { deleted, migrated };
}
