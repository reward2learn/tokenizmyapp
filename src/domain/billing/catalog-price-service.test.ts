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

  it('ensureCatalogTables runs one DDL statement per executeRawUnsafe call', async () => {
    const executeRawUnsafe = vi.fn().mockResolvedValue(0);
    vi.doMock('@/lib/db', () => ({
      createRawClient: () => ({
        $executeRawUnsafe: executeRawUnsafe,
        $queryRawUnsafe: vi.fn().mockResolvedValue([]),
      }),
    }));
    const { ensureCatalogTables } = await import('@/domain/billing/catalog-price-service');
    await ensureCatalogTables();
    expect(executeRawUnsafe).toHaveBeenCalledTimes(2);
    for (const [sql] of executeRawUnsafe.mock.calls) {
      const statements = String(sql)
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      expect(statements).toHaveLength(1);
      expect(statements[0]).toMatch(/^CREATE TABLE IF NOT EXISTS/i);
    }
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

  it('catalogStripePriceEnvKey maps short keys to STRIPE_PRICE_*', async () => {
    const { catalogStripePriceEnvKey } = await import('@/domain/billing/catalog-price-service');
    expect(catalogStripePriceEnvKey('PRO_MONTHLY')).toBe('STRIPE_PRICE_PRO_MONTHLY');
    expect(catalogStripePriceEnvKey('PACK_25')).toBe('STRIPE_PRICE_PACK_25');
  });

  it('pushCatalogStripePricesToFactoryVercel skips when no token', async () => {
    vi.doMock('@/domain/tenant/vercel-sdk-client', () => ({
      listVercelBearerTokens: vi.fn().mockResolvedValue([]),
    }));
    vi.doMock('@/domain/billing/stripe-webhook-test-service', () => ({
      FACTORY_VERCEL_PROJECT_ID: 'prj_test',
    }));
    const { pushCatalogStripePricesToFactoryVercel } = await import(
      '@/domain/billing/catalog-price-service'
    );
    const result = await pushCatalogStripePricesToFactoryVercel({
      PRO_MONTHLY: 'price_123',
    });
    expect(result.ok).toBe(false);
    expect(result.skippedReason).toMatch(/No Vercel token/i);
  });
});
