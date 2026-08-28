/**
 * Client-safe helpers for crypto prepaid plan billing UI.
 */
import { DEFAULT_PLAN_ID, type PlanId } from '@/lib/billing/plans';

export type CryptoPrepaidUiStatus = 'none' | 'active' | 'expiring_soon' | 'expired';

const EXPIRING_SOON_MS = 7 * 86_400_000;

export function cryptoPrepaidUiStatus(input: {
  planId: PlanId | string;
  currentPeriodEnd: string | null | undefined;
  hasStripeSubscription: boolean;
  nowMs?: number;
}): CryptoPrepaidUiStatus {
  if (input.hasStripeSubscription) return 'none';
  if (!input.currentPeriodEnd || input.planId === DEFAULT_PLAN_ID) return 'none';

  const endMs = new Date(input.currentPeriodEnd).getTime();
  if (!Number.isFinite(endMs)) return 'none';

  const now = input.nowMs ?? Date.now();
  if (endMs <= now) return 'expired';
  if (endMs - now <= EXPIRING_SOON_MS) return 'expiring_soon';
  return 'active';
}

export function formatPaidThroughDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
