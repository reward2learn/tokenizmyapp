/**
 * Plan-included Cloud Credits allowance.
 *
 * Free-tier base pool × each plan's `cloudMultiplier`. Overage above this
 * monthly included amount debits the org's `CloudBalance`.
 */
import { getPlan, type PlanId } from '@/lib/billing/plans';

/** Free-tier included cloud spend pool, in USD cents ($5/mo). */
export const CLOUD_INCLUDED_BASE_CENTS = 500;

/** Monthly included cloud allowance for a plan, in cents. */
export function includedCentsForPlan(planId: string | PlanId | null | undefined): number {
  const plan = getPlan(planId);
  return CLOUD_INCLUDED_BASE_CENTS * plan.cloudMultiplier;
}
