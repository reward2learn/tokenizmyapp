/**
 * Tenant / org AI rate card — pure calculation (client-safe).
 *
 * Markup is derived from scale (apps, users), commercial size (annual turnover),
 * control-plane hardware amortization (Mac Studio Ultra 256 reference), and
 * observed third-party COGS (Vercel, Neon, storage, etc.). The result drives
 * how many AIR credits $1 purchases and how many plan credits are granted —
 * always at least the platform floor (default 30%).
 *
 * Server code must recompute; never trust a client-supplied markupPercent for
 * charging. Preview in the wizard uses this same function.
 */

export const AI_CREDIT_RATE_INPUT_PER_1K = 0.4;
export const AI_CREDIT_REF_INPUT_USD_PER_M = 2.5;

/** Platform floor — never price below this margin on gpt-4o list COGS. */
export const MARKUP_FLOOR = 0.3;

/** Soft ceiling so a large tenant cannot be priced into absurdity. */
export const MARKUP_CEILING = 0.95;

/**
 * Reference street price for Apple Mac Studio Ultra-class (256GB unified memory).
 * Editable per tenant; used only as an amortization input for markup.
 */
export const DEFAULT_MAC_STUDIO_ULTRA_256_USD = 12_999;

/** Amortize hardware over this many months. */
export const HARDWARE_AMORT_MONTHS = 36;

export interface TenantRateCardInputs {
  /** Apps in the tenant suite (incl. single-app = 1). */
  appCount: number;
  /** Active user accounts across the tenant. */
  userCount: number;
  /** Stated annual turnover / revenue (USD). */
  annualRevenueUsd: number;
  /** Hardware reference cost (USD). Defaults to Mac Studio Ultra 256. */
  macStudioCostUsd: number;
  /**
   * Trailing monthly third-party spend (USD): Vercel, Neon, blob/storage, etc.
   * When unknown at create time, pass 0 — recalc fills this from usage_records.
   */
  monthlyThirdPartyUsd: number;
}

export interface MarkupBreakdown {
  floor: number;
  appFactor: number;
  userFactor: number;
  revenueFactor: number;
  hardwareFactor: number;
  expenseFactor: number;
  raw: number;
  clamped: number;
}

export interface TenantRateCardComputed {
  markupPercent: number;
  breakdown: MarkupBreakdown;
  /** Purchased credits per USD at this markup (gpt-4o rate card). */
  creditsPerUsd: number;
  planCredits: {
    free: number;
    pro: number;
    business: number;
  };
  packCredits: {
    'pack-25': number;
    'pack-50': number;
    'pack-100': number;
  };
}

export interface TenantRateCardRecord extends TenantRateCardComputed {
  inputs: TenantRateCardInputs;
  /** When set, overrides computed markup (platform-admin lock). */
  manualMarkupPercent: number | null;
  computedAt: string;
  updatedAt: string;
}

export function defaultRateCardInputs(
  partial?: Partial<TenantRateCardInputs>,
): TenantRateCardInputs {
  return {
    appCount: Math.max(1, Math.floor(partial?.appCount ?? 1)),
    userCount: Math.max(1, Math.floor(partial?.userCount ?? 1)),
    annualRevenueUsd: Math.max(0, Number(partial?.annualRevenueUsd ?? 0)),
    macStudioCostUsd: Math.max(
      0,
      Number(partial?.macStudioCostUsd ?? DEFAULT_MAC_STUDIO_ULTRA_256_USD),
    ),
    monthlyThirdPartyUsd: Math.max(0, Number(partial?.monthlyThirdPartyUsd ?? 0)),
  };
}

/**
 * Compute markup from scale + commercial + hardware + COGS inputs.
 *
 * Factors are additive on top of MARKUP_FLOOR and clamped to MARKUP_CEILING.
 */
export function computeMarkupBreakdown(inputs: TenantRateCardInputs): MarkupBreakdown {
  const i = defaultRateCardInputs(inputs);

  // +2% per app beyond the first, capped at +15%
  const appFactor = Math.min(0.15, Math.max(0, i.appCount - 1) * 0.02);

  // +0.5% per user beyond the first, capped at +15%
  const userFactor = Math.min(0.15, Math.max(0, i.userCount - 1) * 0.005);

  // +2% per $1M annual turnover, capped at +20%
  const revenueFactor = Math.min(0.2, (i.annualRevenueUsd / 1_000_000) * 0.02);

  // Monthly hardware amort / (amort + third-party) → up to +25%
  const monthlyHardware = i.macStudioCostUsd / HARDWARE_AMORT_MONTHS;
  const monthlyLoad = monthlyHardware + i.monthlyThirdPartyUsd;
  const hardwareFactor =
    monthlyLoad <= 0 ? 0 : Math.min(0.25, (monthlyHardware / monthlyLoad) * 0.25);

  // Third-party share of a revenue proxy (turnover/12 or $1k floor) → up to +25%
  const monthlyRevenueProxy = Math.max(1_000, i.annualRevenueUsd / 12);
  const expenseFactor = Math.min(
    0.25,
    (i.monthlyThirdPartyUsd / monthlyRevenueProxy) * 0.5,
  );

  const raw = MARKUP_FLOOR + appFactor + userFactor + revenueFactor + hardwareFactor + expenseFactor;
  const clamped = Math.min(MARKUP_CEILING, Math.max(MARKUP_FLOOR, raw));

  return {
    floor: MARKUP_FLOOR,
    appFactor,
    userFactor,
    revenueFactor,
    hardwareFactor,
    expenseFactor,
    raw,
    clamped,
  };
}

/** Credits granted per USD at `markupPercent` with the gpt-4o input rate card. */
export function purchasedCreditsForUsdAtMarkup(usd: number, markupPercent: number): number {
  if (usd <= 0) return 0;
  const markup = Math.min(MARKUP_CEILING, Math.max(MARKUP_FLOOR, markupPercent));
  const usdPerCredit =
    (markup * AI_CREDIT_REF_INPUT_USD_PER_M) / (AI_CREDIT_RATE_INPUT_PER_1K * 1000);
  return Math.round(usd / usdPerCredit);
}

export function computeTenantRateCard(
  inputs: TenantRateCardInputs,
  manualMarkupPercent?: number | null,
): TenantRateCardComputed {
  const normalized = defaultRateCardInputs(inputs);
  const breakdown = computeMarkupBreakdown(normalized);
  const markupPercent =
    manualMarkupPercent != null && Number.isFinite(manualMarkupPercent)
      ? Math.min(MARKUP_CEILING, Math.max(MARKUP_FLOOR, manualMarkupPercent))
      : breakdown.clamped;

  const creditsPerUsd = purchasedCreditsForUsdAtMarkup(1, markupPercent);

  return {
    markupPercent,
    breakdown,
    creditsPerUsd,
    planCredits: {
      // Free trial ≈ $20 of AI at this tenant's face value
      free: purchasedCreditsForUsdAtMarkup(20, markupPercent),
      pro: purchasedCreditsForUsdAtMarkup(99, markupPercent),
      business: purchasedCreditsForUsdAtMarkup(199, markupPercent),
    },
    packCredits: {
      'pack-25': purchasedCreditsForUsdAtMarkup(25, markupPercent),
      'pack-50': purchasedCreditsForUsdAtMarkup(50, markupPercent),
      'pack-100': purchasedCreditsForUsdAtMarkup(100, markupPercent),
    },
  };
}

export function formatMarkupPercent(markup: number): string {
  return `${(markup * 100).toFixed(1)}%`;
}
