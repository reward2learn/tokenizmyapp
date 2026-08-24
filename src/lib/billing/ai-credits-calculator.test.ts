import { describe, expect, it } from 'vitest';
import {
  buildAiCreditsCalculatorReport,
  mergeCatalogFaceAmounts,
  staticCatalogFaceAmounts,
} from '@/lib/billing/ai-credits-calculator';
import { MARKUP_FLOOR } from '@/lib/billing/tenant-rate-card';

describe('ai-credits-calculator', () => {
  it('builds plan and pack tables with credits per $1', () => {
    const report = buildAiCreditsCalculatorReport({
      inputs: { appCount: 2, userCount: 5, annualRevenueUsd: 500_000 },
    });
    expect(report.computed.markupPercent).toBeGreaterThanOrEqual(MARKUP_FLOOR);
    expect(report.unitEconomics.creditsPerUsd).toBeGreaterThan(0);
    expect(report.planTable).toHaveLength(3);
    expect(report.packTable).toHaveLength(3);
    expect(report.planTable[0].planId).toBe('free');
  });

  it('flags above-floor markup for large tenants', () => {
    const report = buildAiCreditsCalculatorReport({
      inputs: {
        appCount: 10,
        userCount: 50,
        annualRevenueUsd: 8_000_000,
        monthlyThirdPartyUsd: 2_000,
      },
    });
    expect(report.competitiveFlags).toContain('above_floor');
    expect(report.catalogRecommendation.plans.pro.monthlyCents).toBeGreaterThan(
      staticCatalogFaceAmounts().plans.pro.monthlyCents,
    );
  });

  it('suggests lower Pro face for SMB turnover', () => {
    const report = buildAiCreditsCalculatorReport({
      inputs: { annualRevenueUsd: 100_000 },
    });
    expect(report.catalogRecommendation.plans.pro.monthlyCents).toBeLessThan(
      staticCatalogFaceAmounts().plans.pro.monthlyCents,
    );
  });

  it('honours catalog overrides in tables', () => {
    const catalog = mergeCatalogFaceAmounts({
      packs: { 'pack-25': 3000, 'pack-50': 6000, 'pack-100': 12000 },
    });
    const report = buildAiCreditsCalculatorReport({
      inputs: { appCount: 1 },
      catalog,
    });
    expect(report.packTable.find((p) => p.packId === 'pack-25')?.catalogCents).toBe(3000);
  });

  it('never lets manual markup below floor in report', () => {
    const report = buildAiCreditsCalculatorReport({
      inputs: {},
      manualMarkupPercent: 0.1,
    });
    expect(report.computed.markupPercent).toBe(MARKUP_FLOOR);
  });
});
