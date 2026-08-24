/**
 * AI Credits Calculator — pure report helpers (client-safe).
 *
 * Builds competitive / unit-economics reports from TenantRateCardInputs + a
 * resolved catalog (static PLANS/CREDIT_PACKS or DB overrides). Never treats
 * client markup as charge authority — callers must apply via secured rate-card PUT.
 */
import {
  CREDIT_PACKS,
  PLANS,
  YEARLY_DISCOUNT,
  yearlyMonthlyPrice,
  type CreditPack,
  type PlanDef,
  type PlanId,
} from '@/lib/billing/plans';
import {
  AI_CREDIT_RATE_INPUT_PER_1K,
  AI_CREDIT_REF_INPUT_USD_PER_M,
  MARKUP_FLOOR,
  computeTenantRateCard,
  defaultRateCardInputs,
  purchasedCreditsForUsdAtMarkup,
  type TenantRateCardComputed,
  type TenantRateCardInputs,
} from '@/lib/billing/tenant-rate-card';

/** gpt-4o list input USD per 1M tokens — illustrative COGS for unit economics. */
export const GPT4O_INPUT_USD_PER_M = AI_CREDIT_REF_INPUT_USD_PER_M;

export type CompetitiveFlag =
  | 'at_floor'
  | 'above_floor'
  | 'under_catalog_credits'
  | 'over_catalog_credits'
  | 'sparse_vs_price'
  | 'generous_vs_price';

export interface CatalogFaceAmounts {
  plans: {
    free: { monthlyCents: number; yearlyCents: number };
    pro: { monthlyCents: number; yearlyCents: number };
    business: { monthlyCents: number; yearlyCents: number };
  };
  packs: {
    'pack-25': number;
    'pack-50': number;
    'pack-100': number;
  };
}

export interface PlanRow {
  planId: PlanId;
  label: string;
  catalogMonthlyCents: number | null;
  credits: number;
  catalogDefaultCredits: number;
  deltaVsCatalog: number;
  creditsPerCatalogDollar: number | null;
  flags: CompetitiveFlag[];
}

export interface PackRow {
  packId: string;
  label: string;
  catalogCents: number;
  credits: number;
  catalogDefaultCredits: number;
  deltaVsCatalog: number;
  creditsPerDollar: number;
  flags: CompetitiveFlag[];
}

export interface UnitEconomics {
  creditsPerUsd: number;
  usdFacePerCredit: number;
  /** Illustrative: credits burned by 1M gpt-4o input tokens at RATE_CARD. */
  gpt4oCreditsPer1MInput: number;
  /** USD face value of those credits at this markup. */
  gpt4oChargedUsdPer1MInput: number;
  /** List COGS for 1M gpt-4o input tokens. */
  gpt4oCogsUsdPer1MInput: number;
  /** Charged − COGS on that illustrative 1M input. */
  illustrativeMarginUsd: number;
  illustrativeMarginPercent: number;
}

export interface CatalogRecommendation {
  plans: CatalogFaceAmounts['plans'];
  packs: CatalogFaceAmounts['packs'];
  rationale: string[];
}

export interface AiCreditsCalculatorReport {
  inputs: TenantRateCardInputs;
  manualMarkupPercent: number | null;
  computed: TenantRateCardComputed;
  catalog: CatalogFaceAmounts;
  planTable: PlanRow[];
  packTable: PackRow[];
  unitEconomics: UnitEconomics;
  competitiveFlags: CompetitiveFlag[];
  catalogRecommendation: CatalogRecommendation;
}

export interface BuildAiCreditsCalculatorReportOptions {
  inputs: Partial<TenantRateCardInputs>;
  manualMarkupPercent?: number | null;
  /** Resolved catalog face amounts (overrides already merged). */
  catalog?: Partial<CatalogFaceAmounts>;
}

/** Static catalog faces from plans.ts / CREDIT_PACKS. */
export function staticCatalogFaceAmounts(): CatalogFaceAmounts {
  const free = PLANS.find((p) => p.id === 'free')!;
  const pro = PLANS.find((p) => p.id === 'pro')!;
  const business = PLANS.find((p) => p.id === 'business')!;
  const pack = (id: string) => CREDIT_PACKS.find((p) => p.id === id)?.priceCents ?? 0;
  return {
    plans: {
      free: {
        monthlyCents: free.priceMonthly ?? 0,
        yearlyCents: free.priceYearly ?? 0,
      },
      pro: {
        monthlyCents: pro.priceMonthly ?? 9900,
        yearlyCents: pro.priceYearly ?? yearlyMonthlyPrice(9900),
      },
      business: {
        monthlyCents: business.priceMonthly ?? 19900,
        yearlyCents: business.priceYearly ?? yearlyMonthlyPrice(19900),
      },
    },
    packs: {
      'pack-25': pack('pack-25') || 2500,
      'pack-50': pack('pack-50') || 5000,
      'pack-100': pack('pack-100') || 10000,
    },
  };
}

export function mergeCatalogFaceAmounts(
  partial?: Partial<CatalogFaceAmounts> | null,
): CatalogFaceAmounts {
  const base = staticCatalogFaceAmounts();
  if (!partial) return base;
  return {
    plans: {
      free: { ...base.plans.free, ...partial.plans?.free },
      pro: { ...base.plans.pro, ...partial.plans?.pro },
      business: { ...base.plans.business, ...partial.plans?.business },
    },
    packs: {
      'pack-25': partial.packs?.['pack-25'] ?? base.packs['pack-25'],
      'pack-50': partial.packs?.['pack-50'] ?? base.packs['pack-50'],
      'pack-100': partial.packs?.['pack-100'] ?? base.packs['pack-100'],
    },
  };
}

/** Apply face amounts onto PlanDef / CreditPack copies (display + credit sizing). */
export function applyCatalogToPlans(
  catalog: CatalogFaceAmounts,
  markupPercent: number = MARKUP_FLOOR,
): { plans: PlanDef[]; packs: CreditPack[] } {
  const plans = PLANS.map((p) => {
    if (p.id === 'enterprise') return { ...p };
    const faces = catalog.plans[p.id as 'free' | 'pro' | 'business'];
    if (!faces) return { ...p };
    // Free trial allotment stays ~$20 of AI even when list monthly is $0.
    const faceUsd = p.id === 'free' ? 20 : faces.monthlyCents / 100;
    return {
      ...p,
      priceMonthly: faces.monthlyCents,
      priceYearly: faces.yearlyCents,
      aiCreditsPerMonth: purchasedCreditsForUsdAtMarkup(faceUsd, markupPercent),
    };
  });

  const packs: CreditPack[] = CREDIT_PACKS.map((pack) => {
    const cents = catalog.packs[pack.id as keyof CatalogFaceAmounts['packs']] ?? pack.priceCents;
    return {
      ...pack,
      priceCents: cents,
      label: `$${(cents / 100).toFixed(0)}`,
      baseCredits: purchasedCreditsForUsdAtMarkup(cents / 100, markupPercent),
      bonusCredits: 0,
    };
  });

  return { plans, packs };
}

function planUsdFace(planId: PlanId, catalog: CatalogFaceAmounts): number {
  if (planId === 'free') return 20;
  if (planId === 'pro') return catalog.plans.pro.monthlyCents / 100;
  if (planId === 'business') return catalog.plans.business.monthlyCents / 100;
  return 0;
}

function buildUnitEconomics(markupPercent: number): UnitEconomics {
  const creditsPerUsd = purchasedCreditsForUsdAtMarkup(1, markupPercent);
  const usdFacePerCredit = creditsPerUsd > 0 ? 1 / creditsPerUsd : 0;
  const gpt4oCreditsPer1MInput = AI_CREDIT_RATE_INPUT_PER_1K * 1000;
  const gpt4oChargedUsdPer1MInput = gpt4oCreditsPer1MInput * usdFacePerCredit;
  const gpt4oCogsUsdPer1MInput = GPT4O_INPUT_USD_PER_M;
  const illustrativeMarginUsd = gpt4oChargedUsdPer1MInput - gpt4oCogsUsdPer1MInput;
  const illustrativeMarginPercent =
    gpt4oChargedUsdPer1MInput > 0
      ? illustrativeMarginUsd / gpt4oChargedUsdPer1MInput
      : 0;

  return {
    creditsPerUsd,
    usdFacePerCredit,
    gpt4oCreditsPer1MInput,
    gpt4oChargedUsdPer1MInput,
    gpt4oCogsUsdPer1MInput,
    illustrativeMarginUsd,
    illustrativeMarginPercent,
  };
}

function recommendCatalog(
  inputs: TenantRateCardInputs,
  computed: TenantRateCardComputed,
  catalog: CatalogFaceAmounts,
): CatalogRecommendation {
  const rationale: string[] = [];
  const plans = { ...catalog.plans, pro: { ...catalog.plans.pro }, business: { ...catalog.plans.business }, free: { ...catalog.plans.free } };
  const packs = { ...catalog.packs };

  // Large commercial tenants → nudge Pro/Business faces up slightly for positioning.
  if (inputs.annualRevenueUsd >= 5_000_000) {
    const bump = 1.1;
    plans.pro.monthlyCents = Math.round(plans.pro.monthlyCents * bump);
    plans.pro.yearlyCents = yearlyMonthlyPrice(plans.pro.monthlyCents);
    plans.business.monthlyCents = Math.round(plans.business.monthlyCents * bump);
    plans.business.yearlyCents = yearlyMonthlyPrice(plans.business.monthlyCents);
    rationale.push(
      'Annual turnover ≥ $5M — suggested +10% Pro/Business list faces for enterprise positioning.',
    );
  } else if (inputs.annualRevenueUsd > 0 && inputs.annualRevenueUsd < 250_000) {
    const cut = 0.9;
    plans.pro.monthlyCents = Math.round(plans.pro.monthlyCents * cut);
    plans.pro.yearlyCents = yearlyMonthlyPrice(plans.pro.monthlyCents);
    rationale.push(
      'SMB turnover < $250k — suggested −10% Pro list face to stay competitive.',
    );
  } else {
    rationale.push('Catalog faces left near current list; adjust manually if competitors undercut.');
  }

  // Keep yearly discount consistent.
  plans.pro.yearlyCents = Math.round(plans.pro.monthlyCents * (1 - YEARLY_DISCOUNT));
  plans.business.yearlyCents = Math.round(plans.business.monthlyCents * (1 - YEARLY_DISCOUNT));

  if (computed.markupPercent > MARKUP_FLOOR + 0.15) {
    rationale.push(
      `Tenant markup ${((computed.markupPercent) * 100).toFixed(0)}% is well above floor — pack faces can stay; credits shrink naturally.`,
    );
  }

  return { plans, packs, rationale };
}

export function buildAiCreditsCalculatorReport(
  options: BuildAiCreditsCalculatorReportOptions,
): AiCreditsCalculatorReport {
  const inputs = defaultRateCardInputs(options.inputs);
  const manual =
    options.manualMarkupPercent != null && Number.isFinite(options.manualMarkupPercent)
      ? options.manualMarkupPercent
      : null;
  const computed = computeTenantRateCard(inputs, manual);
  const catalog = mergeCatalogFaceAmounts(options.catalog);
  const floorCredits = computeTenantRateCard(inputs, MARKUP_FLOOR);

  const planTable: PlanRow[] = (['free', 'pro', 'business'] as const).map((planId) => {
    const plan = PLANS.find((p) => p.id === planId)!;
    const catalogMonthlyCents =
      planId === 'free'
        ? catalog.plans.free.monthlyCents
        : planId === 'pro'
          ? catalog.plans.pro.monthlyCents
          : catalog.plans.business.monthlyCents;
    const usd = planUsdFace(planId, catalog);
    const credits = computed.planCredits[planId];
    const catalogDefaultCredits = floorCredits.planCredits[planId];
    const flags: CompetitiveFlag[] = [];

    if (computed.markupPercent <= MARKUP_FLOOR + 0.001) flags.push('at_floor');
    else flags.push('above_floor');

    if (credits < catalogDefaultCredits) flags.push('under_catalog_credits');
    else if (credits > catalogDefaultCredits) flags.push('over_catalog_credits');

    const creditsPerCatalogDollar = usd > 0 ? credits / usd : null;
    if (creditsPerCatalogDollar != null) {
      const dens = computed.creditsPerUsd;
      if (creditsPerCatalogDollar < dens * 0.85) flags.push('sparse_vs_price');
      if (creditsPerCatalogDollar > dens * 1.15) flags.push('generous_vs_price');
    }

    return {
      planId,
      label: plan.label,
      catalogMonthlyCents,
      credits,
      catalogDefaultCredits,
      deltaVsCatalog: credits - catalogDefaultCredits,
      creditsPerCatalogDollar,
      flags,
    };
  });

  const packTable: PackRow[] = (['pack-25', 'pack-50', 'pack-100'] as const).map((packId) => {
    const cents = catalog.packs[packId];
    const usd = cents / 100;
    const credits = computed.packCredits[packId];
    const catalogDefaultCredits = floorCredits.packCredits[packId];
    const flags: CompetitiveFlag[] = [];
    if (credits < catalogDefaultCredits) flags.push('under_catalog_credits');
    else if (credits > catalogDefaultCredits) flags.push('over_catalog_credits');
    const creditsPerDollar = usd > 0 ? credits / usd : 0;
    if (creditsPerDollar < computed.creditsPerUsd * 0.85) flags.push('sparse_vs_price');
    if (creditsPerDollar > computed.creditsPerUsd * 1.15) flags.push('generous_vs_price');

    return {
      packId,
      label: `$${(cents / 100).toFixed(0)}`,
      catalogCents: cents,
      credits,
      catalogDefaultCredits,
      deltaVsCatalog: credits - catalogDefaultCredits,
      creditsPerDollar,
      flags,
    };
  });

  const competitiveFlags = Array.from(
    new Set([...planTable.flatMap((r) => r.flags), ...packTable.flatMap((r) => r.flags)]),
  );

  return {
    inputs,
    manualMarkupPercent: manual,
    computed,
    catalog,
    planTable,
    packTable,
    unitEconomics: buildUnitEconomics(computed.markupPercent),
    competitiveFlags,
    catalogRecommendation: recommendCatalog(inputs, computed, catalog),
  };
}
