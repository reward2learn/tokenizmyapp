import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearFilingScraperCache,
  mergeRevenueEstimates,
  parseRevenueSignals,
  type FinancialExtract,
} from '@/domain/billing/filing-scraper-service';

describe('filing-scraper-service', () => {
  beforeEach(() => {
    clearFilingScraperCache();
  });

  it('parses USD revenue signals from text', () => {
    const { candidatesUsd, currencyHint } = parseRevenueSignals(
      'Total revenues of $1.25 billion for the fiscal year',
    );
    expect(candidatesUsd.some((n) => n >= 1_000_000_000)).toBe(true);
    expect(currencyHint).toBe('USD');
  });

  it('parses GBP turnover with conversion', () => {
    const { candidatesUsd, currencyHint } = parseRevenueSignals(
      'Turnover £10 million in the year ended',
    );
    expect(currencyHint).toBe('GBP');
    expect(candidatesUsd[0]).toBeGreaterThan(10_000_000);
  });

  it('merges extracts preferring higher confidence', () => {
    const a: FinancialExtract = {
      annualRevenueUsd: { low: 1e6, mid: 2e6, high: 3e6 },
      currencyOriginal: 'USD',
      fiscalYear: 2024,
      confidence: 0.8,
      sourceRefs: [{ source: 'sec', label: 'SEC', url: null }],
      companyName: 'Acme',
    };
    const b: FinancialExtract = {
      annualRevenueUsd: { low: 4e6, mid: 5e6, high: 6e6 },
      currencyOriginal: 'USD',
      fiscalYear: 2023,
      confidence: 0.3,
      sourceRefs: [{ source: 'website', label: 'Site', url: null }],
      companyName: null,
    };
    const merged = mergeRevenueEstimates([a, b]);
    expect(merged.annualRevenueUsd.mid).toBe((2e6 + 5e6) / 2);
    expect(merged.sourceRefs).toHaveLength(2);
    expect(merged.confidence).toBeGreaterThanOrEqual(0.8);
  });
});
