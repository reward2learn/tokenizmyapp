import type { MeterResult } from '@/domain/billing/credit-service';
import { creditsForUsage } from '@/lib/billing/credit-rates';

/**
 * Client-facing summary of one AI metering event (or an aggregate of several).
 * Built from `MeterResult` plus provider token counts after each AI call.
 */
export interface AiUsageSummary {
  promptTokens: number;
  completionTokens: number;
  /** Rate-card cost for this usage. */
  credits: number;
  /** Actually deducted from the balance (may be less than `credits` under debt). */
  consumed: number;
  /** False only for operator exemption — nothing was taken from platform credits. */
  charged: boolean;
  /**
   * Remaining spendable balance after this call, when known.
   * `null` means metering did not return a balance (failure, or exempt gate
   * with no org read) — not the same as zero credits remaining.
   */
  balance: number | null;
  model?: string | null;
  /**
   * True when a tenant-stored API key was used. Informational only — does not
   * mean the turn was free.
   */
  byok?: boolean;
}

/** Chat SSE / stream-slice turn payload — same shape as AiUsageSummary. */
export type ChatTurnUsage = AiUsageSummary;

export function toAiUsageSummary(
  meter: MeterResult | null | undefined,
  tokens: { promptTokens: number; completionTokens: number },
  options?: { model?: string | null; byok?: boolean },
): AiUsageSummary {
  if (!meter) {
    // Metering threw or was skipped — still report rate-card cost so the client
    // does not read `credits: 0` as "this turn was free / waived".
    const credits =
      tokens.promptTokens > 0 || tokens.completionTokens > 0
        ? creditsForUsage(options?.model, tokens.promptTokens, tokens.completionTokens)
        : 0;
    return {
      promptTokens: tokens.promptTokens,
      completionTokens: tokens.completionTokens,
      credits,
      consumed: 0,
      charged: false,
      balance: null,
      model: options?.model ?? null,
      ...(options?.byok ? { byok: true } : {}),
    };
  }

  return {
    promptTokens: tokens.promptTokens,
    completionTokens: tokens.completionTokens,
    credits: meter.credits,
    consumed: meter.consumed,
    charged: meter.charged,
    balance: Number.isFinite(meter.balance) ? meter.balance : null,
    model: options?.model ?? null,
    ...(options?.byok ? { byok: true } : {}),
  };
}

/** Sum token/credit fields across multiple metering events; keep the latest balance. */
export function aggregateAiUsageSummaries(
  parts: Array<AiUsageSummary | null | undefined>,
): AiUsageSummary | null {
  const present = parts.filter((p): p is AiUsageSummary => p != null);
  if (present.length === 0) return null;

  let promptTokens = 0;
  let completionTokens = 0;
  let credits = 0;
  let consumed = 0;
  let charged = false;
  let balance: number | null = null;
  let model: string | null | undefined;
  let byok = true;

  for (const part of present) {
    promptTokens += part.promptTokens;
    completionTokens += part.completionTokens;
    credits += part.credits;
    consumed += part.consumed;
    if (part.charged) charged = true;
    if (part.balance != null) balance = part.balance;
    if (part.model) model = part.model;
    if (!part.byok) byok = false;
  }

  return {
    promptTokens,
    completionTokens,
    credits,
    consumed,
    charged,
    balance,
    model: model ?? null,
    ...(byok ? { byok: true } : {}),
  };
}

export function emptyAiUsageSummary(options?: {
  model?: string | null;
  byok?: boolean;
}): AiUsageSummary {
  return {
    promptTokens: 0,
    completionTokens: 0,
    credits: 0,
    consumed: 0,
    charged: false,
    balance: null,
    model: options?.model ?? null,
    ...(options?.byok ? { byok: true } : {}),
  };
}

/** Fold one MeterResult + token counts into a running aggregate. */
export function foldMeterIntoUsage(
  current: AiUsageSummary,
  meter: MeterResult | null | undefined,
  tokens: { promptTokens: number; completionTokens: number },
  options?: { model?: string | null; byok?: boolean },
): AiUsageSummary {
  return aggregateAiUsageSummaries([
    current,
    toAiUsageSummary(meter, tokens, options),
  ])!;
}
