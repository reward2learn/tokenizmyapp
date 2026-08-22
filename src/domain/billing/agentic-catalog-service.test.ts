import { describe, expect, it } from 'vitest';
import {
  agenticCreditPackSku,
  buildInventoryFeedCsv,
  buildPricingFeedCsv,
  buildProductFeedCsv,
  packIdFromAgenticSku,
  resolvePackIdFromCheckoutMetadata,
} from '@/domain/billing/agentic-catalog-service';
import { catalogSkusComplete, isCatalogSyncFresh } from '@/lib/billing/agentic-commerce-types';
import { CREDIT_PACKS } from '@/lib/billing/plans';

describe('agenticCreditPackSku', () => {
  it('builds a stable tenant-scoped SKU', () => {
    expect(agenticCreditPackSku('redrubybali', 'pack-25')).toBe('tokenizmyapp-redrubybali-pack-25');
  });
});

describe('packIdFromAgenticSku', () => {
  it('reverses the SKU naming convention', () => {
    expect(packIdFromAgenticSku('tokenizmyapp-redrubybali-pack-50')).toBe('pack-50');
    expect(packIdFromAgenticSku('other-sku')).toBeNull();
  });
});

describe('catalog feed CSV', () => {
  it('includes every credit pack in product, pricing, and inventory feeds', () => {
    const product = buildProductFeedCsv('demo');
    const pricing = buildPricingFeedCsv('demo');
    const inventory = buildInventoryFeedCsv('demo');
    for (const pack of CREDIT_PACKS) {
      const sku = agenticCreditPackSku('demo', pack.id);
      expect(product).toContain(sku);
      expect(pricing).toContain(sku);
      expect(inventory).toContain(sku);
    }
  });
});

describe('isCatalogSyncFresh', () => {
  it('accepts sync within 24 hours', () => {
    const recent = new Date(Date.now() - 3_600_000).toISOString();
    expect(isCatalogSyncFresh(recent)).toBe(true);
  });

  it('rejects stale sync', () => {
    const stale = new Date(Date.now() - 48 * 3_600_000).toISOString();
    expect(isCatalogSyncFresh(stale)).toBe(false);
  });
});

describe('catalogSkusComplete', () => {
  it('requires every pack id mapped', () => {
    expect(catalogSkusComplete({ 'pack-25': 'a' }, ['pack-25', 'pack-50'])).toBe(false);
    expect(
      catalogSkusComplete(
        { 'pack-25': 'a', 'pack-50': 'b', 'pack-100': 'c' },
        CREDIT_PACKS.map((p) => p.id),
      ),
    ).toBe(true);
  });
});

describe('resolvePackIdFromCheckoutMetadata', () => {
  it('prefers metadata packId', () => {
    expect(resolvePackIdFromCheckoutMetadata({ packId: 'pack-100' }, [])).toBe('pack-100');
  });

  it('falls back to SKU mapping table', () => {
    expect(
      resolvePackIdFromCheckoutMetadata(
        { sku: 'tokenizmyapp-demo-pack-50' },
        [],
        { 'pack-50': 'tokenizmyapp-demo-pack-50' },
      ),
    ).toBe('pack-50');
  });
});
