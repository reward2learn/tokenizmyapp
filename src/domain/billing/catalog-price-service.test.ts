import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  mergeCatalogFaceAmounts,
  staticCatalogFaceAmounts,
} from '@/lib/billing/ai-credits-calculator';

/**
 * Catalog override resolve — pure merge path (DB layer covered separately when
 * POSTGRES available). Stripe sync confirm gate is asserted via service throws.
 */

describe('catalog face merge', () => {
  it('falls back to static catalog', () => {
    const base = staticCatalogFaceAmounts();
    const merged = mergeCatalogFaceAmounts(null);
    expect(merged.plans.pro.monthlyCents).toBe(base.plans.pro.monthlyCents);
  });

  it('overrides pack faces', () => {
    const merged = mergeCatalogFaceAmounts({
      packs: { 'pack-25': 3000, 'pack-50': 6000, 'pack-100': 12000 },
    });
    expect(merged.packs['pack-25']).toBe(3000);
    expect(merged.plans.pro.monthlyCents).toBe(
      staticCatalogFaceAmounts().plans.pro.monthlyCents,
    );
  });
});

describe('catalog-price-service confirm gates', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('upsertCatalogPrices rejects without confirm', async () => {
    vi.mock('@/lib/db', () => ({
      createRawClient: () => ({
        $executeRawUnsafe: vi.fn(),
        $queryRawUnsafe: vi.fn().mockResolvedValue([]),
      }),
    }));
    const { upsertCatalogPrices } = await import('@/domain/billing/catalog-price-service');
    await expect(
      upsertCatalogPrices({
        // @ts-expect-error intentional
        confirm: false,
        updatedBy: 'test',
      }),
    ).rejects.toThrow(/confirm/);
  });

  it('syncStripeCatalogPrices rejects without confirm', async () => {
    const { syncStripeCatalogPrices } = await import('@/domain/billing/catalog-price-service');
    await expect(
      syncStripeCatalogPrices({
        // @ts-expect-error intentional
        confirm: false,
        updatedBy: 'test',
      }),
    ).rejects.toThrow(/confirm/);
  });
});
