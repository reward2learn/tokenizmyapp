/**
 * AI Credits Calculator — analyze pipeline (scrape + filings + live org + AI).
 */
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createRawClient } from '@/lib/db';
import { scrapeUrl } from '@/domain/ai/url-scraper-service';
import {
  getOrgRateCard,
  recalculateOrgRateCard,
} from '@/domain/billing/org-rate-card-service';
import { getBillingCatalog } from '@/domain/billing/catalog-price-service';
import {
  scrapeFilings,
  mergeRevenueEstimates,
  type FinancialExtract,
} from '@/domain/billing/filing-scraper-service';
import {
  buildAiCreditsCalculatorReport,
  type AiCreditsCalculatorReport,
} from '@/lib/billing/ai-credits-calculator';
import {
  defaultRateCardInputs,
  type TenantRateCardInputs,
} from '@/lib/billing/tenant-rate-card';
import { meterAiUsage } from '@/domain/billing/credit-service';

type RawDb = ReturnType<typeof createRawClient>;

/**
 * OpenAI / Gateway structured outputs require every `properties` key to appear in
 * `required`. Use `.nullable()` (not `.optional()`) so optional values are
 * represented as `type: ["string","null"]` while still listed in `required`.
 */
export const AnalyzeAiSchema = z.object({
  businessSummary: z.string(),
  industry: z.string(),
  estimatedAnnualRevenueUsd: z.object({
    low: z.number(),
    mid: z.number(),
    high: z.number(),
  }),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(
    z.object({
      source: z.enum(['website', 'sec', 'companies_house', 'admin_override', 'live_org', 'ai']),
      label: z.string(),
      note: z.string().nullable(),
    }),
  ),
  estimatedUsers: z.number().int().min(1).nullable(),
  growthSignals: z.array(z.string()),
  competitiveNotes: z.array(z.string()),
  suggestedRateCardInputs: z.object({
    appCount: z.number().int().min(1).nullable(),
    userCount: z.number().int().min(1).nullable(),
    annualRevenueUsd: z.number().min(0).nullable(),
    macStudioCostUsd: z.number().min(0).nullable(),
    monthlyThirdPartyUsd: z.number().min(0).nullable(),
  }),
  suggestedCatalogUsd: z
    .object({
      proMonthlyCents: z.number().int().min(0).nullable(),
      businessMonthlyCents: z.number().int().min(0).nullable(),
      pack25Cents: z.number().int().min(0).nullable(),
      pack50Cents: z.number().int().min(0).nullable(),
      pack100Cents: z.number().int().min(0).nullable(),
    })
    .nullable(),
  risks: z.array(z.string()),
});

export type AnalyzeAiResult = z.infer<typeof AnalyzeAiSchema>;

export interface AnalyzeCalculatorInput {
  websiteUrl?: string | null;
  secCikOrTicker?: string | null;
  companiesHouseNumber?: string | null;
  orgId?: string | null;
  tenantSlug?: string | null;
  /** Admin-confirmed revenue — wins over scrape/AI on Apply path. */
  adminAnnualRevenueUsd?: number | null;
  inputsOverride?: Partial<TenantRateCardInputs>;
  /** Factory/platform tenant slug for metering. */
  meterTenantSlug?: string;
}

export interface AnalyzeCalculatorResult {
  report: AiCreditsCalculatorReport;
  analysis: AnalyzeAiResult | null;
  filings: {
    sec: FinancialExtract | null;
    companiesHouse: FinancialExtract | null;
    merged: FinancialExtract;
    errors: string[];
  };
  scrape: {
    url: string | null;
    businessName: string | null;
    description: string | null;
    textExcerpt: string | null;
    error: string | null;
  };
  liveOrg: {
    orgId: string | null;
    appCount: number | null;
    userCount: number | null;
    monthlyThirdPartyUsd: number | null;
    existingRateCard: boolean;
  };
  recommendedInputs: TenantRateCardInputs;
  warnings: string[];
}

async function loadLiveOrgSignals(
  orgId: string | null | undefined,
  db: RawDb,
): Promise<AnalyzeCalculatorResult['liveOrg']> {
  if (!orgId) {
    return {
      orgId: null,
      appCount: null,
      userCount: null,
      monthlyThirdPartyUsd: null,
      existingRateCard: false,
    };
  }
  try {
    const card = await recalculateOrgRateCard(orgId, db);
    return {
      orgId,
      appCount: card.inputs.appCount,
      userCount: card.inputs.userCount,
      monthlyThirdPartyUsd: card.inputs.monthlyThirdPartyUsd,
      existingRateCard: true,
    };
  } catch {
    const existing = await getOrgRateCard(orgId, db);
    return {
      orgId,
      appCount: existing?.inputs.appCount ?? null,
      userCount: existing?.inputs.userCount ?? null,
      monthlyThirdPartyUsd: existing?.inputs.monthlyThirdPartyUsd ?? null,
      existingRateCard: Boolean(existing),
    };
  }
}

async function resolveOrgIdFromTenant(
  tenantSlug: string | null | undefined,
  db: RawDb,
): Promise<string | null> {
  if (!tenantSlug) return null;
  const rows = (await db.$queryRawUnsafe(
    `SELECT organization_id FROM tenants WHERE slug = $1 LIMIT 1;`,
    tenantSlug,
  )) as { organization_id: string | null }[];
  return rows[0]?.organization_id ?? null;
}

/**
 * Merge live org signals, client override, AI suggestions, and admin revenue.
 *
 * Scale / COGS: prefer the stronger of live org vs client override via Math.max
 * so wizard defaults (appCount/userCount === 1, monthly3p === 0) do not clobber
 * real live counts. AI suggestions participate in the same max for apps/users.
 * Revenue: `adminAnnualRevenueUsd` always wins; otherwise override → AI mid →
 * filings mid → AI suggested → 0. macStudioCostUsd: override only when set.
 */
export function mergeRecommendedRateCardInputs(args: {
  inputsOverride?: Partial<TenantRateCardInputs>;
  liveOrg: AnalyzeCalculatorResult['liveOrg'];
  analysis: AnalyzeAiResult | null;
  adminAnnualRevenueUsd?: number | null;
  filingsRevenueMid?: number | null;
}): TenantRateCardInputs {
  const { inputsOverride: override, liveOrg, analysis } = args;
  const suggested = analysis?.suggestedRateCardInputs;

  return defaultRateCardInputs({
    appCount:
      Math.max(
        liveOrg.appCount ?? 0,
        override?.appCount ?? 0,
        suggested?.appCount ?? 0,
      ) || 1,
    userCount:
      Math.max(
        liveOrg.userCount ?? 0,
        override?.userCount ?? 0,
        analysis?.estimatedUsers ?? 0,
        suggested?.userCount ?? 0,
      ) || 1,
    // Admin-confirmed revenue always wins; otherwise override → AI/filings mid → AI suggested.
    annualRevenueUsd:
      args.adminAnnualRevenueUsd != null && args.adminAnnualRevenueUsd >= 0
        ? args.adminAnnualRevenueUsd
        : (override?.annualRevenueUsd ??
          analysis?.estimatedAnnualRevenueUsd.mid ??
          args.filingsRevenueMid ??
          suggested?.annualRevenueUsd ??
          0),
    macStudioCostUsd: override?.macStudioCostUsd,
    monthlyThirdPartyUsd: Math.max(
      liveOrg.monthlyThirdPartyUsd ?? 0,
      override?.monthlyThirdPartyUsd ?? 0,
      suggested?.monthlyThirdPartyUsd ?? 0,
    ),
  });
}

export async function analyzeAiCreditsCalculator(
  input: AnalyzeCalculatorInput,
  db?: RawDb,
): Promise<AnalyzeCalculatorResult> {
  db ??= createRawClient();
  const warnings: string[] = [];

  let orgId = input.orgId ?? null;
  if (!orgId && input.tenantSlug) {
    orgId = await resolveOrgIdFromTenant(input.tenantSlug, db);
  }

  const [scrapeSettled, filingsSettled, liveOrg, catalogRecord] = await Promise.all([
    input.websiteUrl?.trim()
      ? scrapeUrl(input.websiteUrl.trim())
          .then((s) => ({ ok: true as const, data: s }))
          .catch((err) => ({
            ok: false as const,
            error: err instanceof Error ? err.message : String(err),
          }))
      : Promise.resolve(null),
    scrapeFilings({
      secCikOrTicker: input.secCikOrTicker,
      companiesHouseNumber: input.companiesHouseNumber,
    }),
    loadLiveOrgSignals(orgId, db),
    getBillingCatalog(db),
  ]);

  const scrape =
    scrapeSettled == null
      ? { url: null, businessName: null, description: null, textExcerpt: null, error: null }
      : scrapeSettled.ok
        ? {
            url: scrapeSettled.data.url,
            businessName: scrapeSettled.data.businessName,
            description: scrapeSettled.data.description,
            textExcerpt: scrapeSettled.data.textContent.slice(0, 4000),
            error: null,
          }
        : {
            url: input.websiteUrl ?? null,
            businessName: null,
            description: null,
            textExcerpt: null,
            error: scrapeSettled.error,
          };

  if (scrape.error) warnings.push(`Website scrape: ${scrape.error}`);
  warnings.push(...filingsSettled.errors);

  const mergedFilings = mergeRevenueEstimates([
    filingsSettled.sec,
    filingsSettled.companiesHouse,
  ]);

  let analysis: AnalyzeAiResult | null = null;
  try {
    const contextParts = [
      scrape.businessName ? `Business: ${scrape.businessName}` : '',
      scrape.description ? `Description: ${scrape.description}` : '',
      scrape.textExcerpt ? `Website text:\n${scrape.textExcerpt}` : '',
      filingsSettled.sec
        ? `SEC extract: ${JSON.stringify(filingsSettled.sec)}`
        : '',
      filingsSettled.companiesHouse
        ? `Companies House extract: ${JSON.stringify(filingsSettled.companiesHouse)}`
        : '',
      liveOrg.orgId
        ? `Live org signals: apps=${liveOrg.appCount}, users=${liveOrg.userCount}, monthly3p=$${liveOrg.monthlyThirdPartyUsd}`
        : '',
      `Catalog faces: ${JSON.stringify(catalogRecord.catalog)}`,
      input.adminAnnualRevenueUsd != null
        ? `Admin override annual revenue USD: ${input.adminAnnualRevenueUsd}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const { object, usage } = await generateObject({
      model: openai('gpt-4o'),
      schema: AnalyzeAiSchema,
      system: `You are a platform billing analyst for TokenizMyApp.
Estimate business scale and suggest AI credit rate-card inputs and competitive catalog USD faces.
Never invent precise audited revenue — give ranges with confidence.
Prefer filings over marketing sites when both exist.
Admin override revenue always wins when provided.
Respond with structured JSON only.`,
      prompt: contextParts || 'No external context — suggest cautious defaults for a small SaaS tenant.',
      temperature: 0.2,
    });
    analysis = object;

    try {
      await meterAiUsage({
        tenantSlug: input.meterTenantSlug ?? 'tokenizmyapp',
        model: 'gpt-4o',
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        keySource: 'env',
        refType: 'ai_credits_calculator',
      });
    } catch (err) {
      console.warn(
        '[ai-credits-calculator] Metering failed (non-blocking):',
        err instanceof Error ? err.message : err,
      );
    }
  } catch (err) {
    warnings.push(
      `AI analysis unavailable: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const recommendedInputs = mergeRecommendedRateCardInputs({
    inputsOverride: input.inputsOverride,
    liveOrg,
    analysis,
    adminAnnualRevenueUsd: input.adminAnnualRevenueUsd,
    filingsRevenueMid: mergedFilings.annualRevenueUsd.mid,
  });

  const report = buildAiCreditsCalculatorReport({
    inputs: recommendedInputs,
    catalog: catalogRecord.catalog,
  });

  // Overlay AI catalog suggestions onto recommendation rationale when present
  if (analysis?.suggestedCatalogUsd) {
    const s = analysis.suggestedCatalogUsd;
    if (s.proMonthlyCents != null) {
      report.catalogRecommendation.plans.pro.monthlyCents = s.proMonthlyCents;
    }
    if (s.businessMonthlyCents != null) {
      report.catalogRecommendation.plans.business.monthlyCents = s.businessMonthlyCents;
    }
    if (s.pack25Cents != null) report.catalogRecommendation.packs['pack-25'] = s.pack25Cents;
    if (s.pack50Cents != null) report.catalogRecommendation.packs['pack-50'] = s.pack50Cents;
    if (s.pack100Cents != null) report.catalogRecommendation.packs['pack-100'] = s.pack100Cents;
  }

  warnings.push(
    'Website + filings estimates still require admin confirmation before Apply to org.',
  );

  return {
    report,
    analysis,
    filings: {
      sec: filingsSettled.sec,
      companiesHouse: filingsSettled.companiesHouse,
      merged: mergedFilings,
      errors: filingsSettled.errors,
    },
    scrape,
    liveOrg,
    recommendedInputs,
    warnings,
  };
}
