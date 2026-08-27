import { describe, expect, it, vi } from 'vitest';
import {
  cleanupLegacySheetAppPages,
  legacySheetTwinStorageSlug,
} from '@/domain/cms/cleanup-legacy-sheet-pages';

describe('legacySheetTwinStorageSlug', () => {
  it('maps legacy sheet slug to suite storage twin', () => {
    expect(legacySheetTwinStorageSlug('sheet-daily-sales', 'finance')).toBe(
      'finance-sheet-daily-sales',
    );
  });

  it('returns null without appId or for non-sheet / already-prefixed slugs', () => {
    expect(legacySheetTwinStorageSlug('sheet-daily-sales', '')).toBeNull();
    expect(legacySheetTwinStorageSlug('dashboard', 'finance')).toBeNull();
    expect(legacySheetTwinStorageSlug('finance-sheet-daily-sales', 'finance')).toBeNull();
  });
});

describe('cleanupLegacySheetAppPages', () => {
  it('no-ops when appId is empty', async () => {
    const db = {
      $queryRawUnsafe: vi.fn(),
      $executeRawUnsafe: vi.fn(),
    };
    await expect(cleanupLegacySheetAppPages(db, { appId: '' })).resolves.toEqual({
      deleted: 0,
      migrated: 0,
    });
    expect(db.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('deletes legacy rows that have a prefixed twin', async () => {
    const execute = vi.fn().mockResolvedValue(0);
    const query = vi.fn().mockResolvedValue([
      {
        legacy_id: 'leg-1',
        legacy_slug: 'sheet-daily-sales',
        legacy_locked: false,
        prefixed_id: 'pref-1',
        prefixed_locked: false,
        prefixed_section_count: 2,
      },
    ]);
    const db = { $queryRawUnsafe: query, $executeRawUnsafe: execute };

    await expect(
      cleanupLegacySheetAppPages(db, { tenantSlug: 'tokenizmyapp', appId: 'finance' }),
    ).resolves.toEqual({ deleted: 1, migrated: 0 });

    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM app_pages WHERE id = $1'),
      'leg-1',
    );
  });

  it('migrates locked CMS sections onto an empty twin before delete', async () => {
    const execute = vi.fn().mockResolvedValue(0);
    const query = vi.fn().mockResolvedValue([
      {
        legacy_id: 'leg-1',
        legacy_slug: 'sheet-pl',
        legacy_locked: true,
        prefixed_id: 'pref-1',
        prefixed_locked: false,
        prefixed_section_count: 0,
      },
    ]);
    const db = { $queryRawUnsafe: query, $executeRawUnsafe: execute };

    await expect(
      cleanupLegacySheetAppPages(db, { appId: 'finance' }),
    ).resolves.toEqual({ deleted: 1, migrated: 1 });

    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE page_sections SET page_id = $1 WHERE page_id = $2'),
      'pref-1',
      'leg-1',
    );
    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('SET content_locked = TRUE'),
      'pref-1',
    );
  });
});
