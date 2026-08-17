/**
 * Credit conversion rate card — `credits = f(model, tokens)`.
 *
 * Deliberately has NO server-only imports (no Prisma, no db, no secrets), so it
 * is safe to import from client components — the billing UI needs to preview
 * "this generation will cost ~N credits" before any request is made. Mirrors
 * the `plans.ts` split: `credit-service.ts` re-exports these alongside the
 * DB-backed functions.
 *
 * Rates below are a CALIBRATION REFERENCE, not a commercial decision. They are
 * rough multiples of the observed per-token COGS of each model family, chosen
 * so that a typical generation costs a handful of credits. Our real COGS are
 * Vercel's AI Gateway and the providers' own pricing. Tune these against actual
 * spend before charging anyone — see docs/MONETIZATION-CREDITS-ROADMAP.md §3.4.
 */

export interface CreditRate {
  /** Credits charged per 1,000 prompt (input) tokens. */
  inputPer1K: number;
  /** Credits charged per 1,000 completion (output) tokens. */
  outputPer1K: number;
}

/**
 * Per-model rate card, keyed by model name.
 *
 * Matching is exact-name first, then longest-prefix (so `gpt-4o` matches
 * `gpt-4o-2024-08-06` but NOT `gpt-4o-mini`, which is its own cheaper entry).
 * Reasoning models (o3, deepseek-reasoner) are deliberately more expensive —
 * they burn far more tokens per useful answer.
 */
export const RATE_CARD: Record<string, CreditRate> = {
  // Flagship / gpt-4o-class.
  'gpt-5.5': { inputPer1K: 0.4, outputPer1K: 1.6 },
  'gpt-4o': { inputPer1K: 0.4, outputPer1K: 1.6 },
  'gpt-4.1': { inputPer1K: 0.4, outputPer1K: 1.6 },
  'claude-sonnet-4-5': { inputPer1K: 0.4, outputPer1K: 1.6 },
  // Mini / haiku-class.
  'gpt-4o-mini': { inputPer1K: 0.1, outputPer1K: 0.4 },
  'gpt-4.1-mini': { inputPer1K: 0.1, outputPer1K: 0.4 },
  'claude-haiku-4-5': { inputPer1K: 0.1, outputPer1K: 0.4 },
  'deepseek-chat': { inputPer1K: 0.1, outputPer1K: 0.4 },
  // Reasoning models — higher per-token cost AND higher token burn.
  'o3': { inputPer1K: 0.8, outputPer1K: 3.2 },
  'o4-mini': { inputPer1K: 0.2, outputPer1K: 0.8 },
  'deepseek-reasoner': { inputPer1K: 0.2, outputPer1K: 0.8 },
};

/**
 * Fallback for unknown models — set slightly above the flagship rate, so an
 * unmapped mainstream model never undercharges the platform.
 *
 * ⚠️ It does NOT cover the reasoning tier: `o3` is priced above this on
 * purpose, so an unmapped reasoning-class model is undercharged until it gets
 * its own entry. Add new reasoning models to RATE_CARD rather than relying on
 * this fallback.
 */
export const DEFAULT_RATE: CreditRate = { inputPer1K: 0.5, outputPer1K: 2.0 };

function rateForModel(model: string | null | undefined): CreditRate {
  if (!model) return DEFAULT_RATE;
  const exact = RATE_CARD[model];
  if (exact) return exact;
  // Prefix match, longest key first: `gpt-4o-2024-08-06` → `gpt-4o`, but
  // `gpt-4o-mini-2024-07-18` → `gpt-4o-mini` (its own, cheaper entry).
  const prefix = Object.keys(RATE_CARD)
    .filter((key) => model.startsWith(`${key}-`))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? RATE_CARD[prefix] : DEFAULT_RATE;
}

/**
 * Convert a usage record into credits.
 *
 * `Math.ceil` on the total so a tiny call still costs a whole credit, and a
 * minimum of 1 whenever any tokens were exchanged — a zero-token call is the
 * only case that costs nothing.
 */
export function creditsForUsage(
  model: string | null | undefined,
  promptTokens: number,
  completionTokens: number,
): number {
  if (promptTokens <= 0 && completionTokens <= 0) return 0;
  const rate = rateForModel(model);
  const credits = Math.ceil(
    (promptTokens / 1000) * rate.inputPer1K + (completionTokens / 1000) * rate.outputPer1K,
  );
  return Math.max(1, credits);
}