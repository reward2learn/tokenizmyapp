import { describe, expect, it } from 'vitest';
import { zodSchema } from 'ai';
import {
  AnalyzeAiSchema,
  mergeRecommendedRateCardInputs,
} from '@/domain/billing/ai-credits-calculator-service';

/** Every object property must be listed in `required` (OpenAI structured-output rule). */
function assertJsonSchemaFullyRequired(node: unknown, path = 'root'): void {
  if (!node || typeof node !== 'object') return;
  const schema = node as {
    type?: string;
    properties?: Record<string, unknown>;
    required?: string[];
    items?: unknown;
    anyOf?: unknown[];
  };
  if (schema.properties) {
    const keys = Object.keys(schema.properties);
    const required = schema.required ?? [];
    const missing = keys.filter((k) => !required.includes(k));
    expect(missing, `OpenAI required gap at ${path}`).toEqual([]);
    for (const [key, child] of Object.entries(schema.properties)) {
      assertJsonSchemaFullyRequired(child, `${path}.${key}`);
    }
  }
  if (schema.items) {
    assertJsonSchemaFullyRequired(schema.items, `${path}[]`);
  }
  if (schema.anyOf) {
    schema.anyOf.forEach((child, i) =>
      assertJsonSchemaFullyRequired(child, `${path}.anyOf[${i}]`),
    );
  }
}

const emptyLiveOrg = {
  orgId: null as string | null,
  appCount: null as number | null,
  userCount: null as number | null,
  monthlyThirdPartyUsd: null as number | null,
  existingRateCard: false,
};

describe('AnalyzeAiSchema (OpenAI response_format)', () => {
  it('lists every property in required, including sourceRefs[].note', () => {
    const jsonSchema = zodSchema(AnalyzeAiSchema).jsonSchema;
    assertJsonSchemaFullyRequired(jsonSchema);

    const sourceRefItem = (
      jsonSchema as {
        properties: { sourceRefs: { items: { properties: object; required: string[] } } };
      }
    ).properties.sourceRefs.items;
    expect(Object.keys(sourceRefItem.properties).sort()).toEqual(
      ['label', 'note', 'source'].sort(),
    );
    expect(sourceRefItem.required.sort()).toEqual(['label', 'note', 'source'].sort());
  });
});

describe('mergeRecommendedRateCardInputs', () => {
  it('prefers live org appCount over wizard default override of 1', () => {
    const merged = mergeRecommendedRateCardInputs({
      inputsOverride: { appCount: 1, userCount: 1, monthlyThirdPartyUsd: 0 },
      liveOrg: { ...emptyLiveOrg, orgId: 'org1', appCount: 2, userCount: 8, monthlyThirdPartyUsd: 120 },
      analysis: null,
    });
    expect(merged.appCount).toBe(2);
    expect(merged.userCount).toBe(8);
    expect(merged.monthlyThirdPartyUsd).toBe(120);
  });

  it('takes Math.max when override exceeds live', () => {
    const merged = mergeRecommendedRateCardInputs({
      inputsOverride: { appCount: 5, userCount: 20 },
      liveOrg: { ...emptyLiveOrg, orgId: 'org1', appCount: 2, userCount: 8 },
      analysis: null,
    });
    expect(merged.appCount).toBe(5);
    expect(merged.userCount).toBe(20);
  });

  it('lets adminAnnualRevenueUsd win over override and AI', () => {
    const merged = mergeRecommendedRateCardInputs({
      inputsOverride: { annualRevenueUsd: 999_999 },
      liveOrg: emptyLiveOrg,
      analysis: {
        businessSummary: 'x',
        industry: 'y',
        estimatedAnnualRevenueUsd: { low: 1, mid: 50_000, high: 100_000 },
        confidence: 0.5,
        sourceRefs: [],
        estimatedUsers: null,
        growthSignals: [],
        competitiveNotes: [],
        suggestedRateCardInputs: {
          appCount: null,
          userCount: null,
          annualRevenueUsd: 40_000,
          macStudioCostUsd: null,
          monthlyThirdPartyUsd: null,
        },
        suggestedCatalogUsd: null,
        risks: [],
      },
      adminAnnualRevenueUsd: 250_000,
      filingsRevenueMid: 80_000,
    });
    expect(merged.annualRevenueUsd).toBe(250_000);
  });
});
