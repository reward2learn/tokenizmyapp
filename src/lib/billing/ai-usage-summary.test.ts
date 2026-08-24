import { describe, expect, it } from 'vitest';
import {
  aggregateAiUsageSummaries,
  toAiUsageSummary,
} from '@/lib/billing/ai-usage-summary';
import type { MeterResult } from '@/domain/billing/credit-service';

const chargedMeter = (overrides: Partial<MeterResult> = {}): MeterResult => ({
  charged: true,
  credits: 3,
  consumed: 3,
  shortfall: 0,
  debt: 0,
  writtenOff: 0,
  balance: 97,
  ...overrides,
});

describe('ai-usage-summary', () => {
  it('maps MeterResult + tokens into AiUsageSummary', () => {
    const summary = toAiUsageSummary(chargedMeter(), { promptTokens: 1200, completionTokens: 400 }, {
      model: 'gpt-4o',
    });
    expect(summary).toEqual({
      promptTokens: 1200,
      completionTokens: 400,
      credits: 3,
      consumed: 3,
      charged: true,
      balance: 97,
      model: 'gpt-4o',
    });
  });

  it('aggregates multiple summaries and keeps latest balance', () => {
    const a = toAiUsageSummary(chargedMeter({ credits: 2, consumed: 2, balance: 98 }), {
      promptTokens: 100,
      completionTokens: 50,
    });
    const b = toAiUsageSummary(chargedMeter({ credits: 1, consumed: 1, balance: 97 }), {
      promptTokens: 40,
      completionTokens: 10,
    });
    expect(aggregateAiUsageSummaries([a, b])).toEqual({
      promptTokens: 140,
      completionTokens: 60,
      credits: 3,
      consumed: 3,
      charged: true,
      balance: 97,
      model: null,
    });
  });

  it('returns null when aggregating empty list', () => {
    expect(aggregateAiUsageSummaries([])).toBeNull();
    expect(aggregateAiUsageSummaries([null, undefined])).toBeNull();
  });
});
