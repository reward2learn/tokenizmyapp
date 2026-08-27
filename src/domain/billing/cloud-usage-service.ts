/**
 * Cloud usage — the run-time currency (roadmap Phase 5).
 *
 * Reads what has been metered for an organization and presents it per resource
 * as included-versus-additional. Writing is the collector's job
 * (`/api/cron/cloud-credits`): Vercel FOCUS Usage and Neon project totals are
 * allocated onto orgs by known project / branch counts (approximate — not
 * FOCUS ResourceIds).
 *
 * Control plane only: usage belongs to the Organization that pays, never to a
 * tenant's own database.
 */
import { createRawClient } from '@/lib/db';
import { includedCentsForPlan } from '@/domain/billing/cloud-allowance';

type RawDb = ReturnType<typeof createRawClient>;

export type MeteringState = 'metered' | 'not_collected';

export interface ResourceUsage {
  /** Stable key, matching UsageRecord.resource. */
  resource: string;
  label: string;
  unit: string;
  /**
   * Plan-included allowance for this resource in its native unit, when we can
   * express one. For dollar-backed Vercel resources the included pool is in
   * cents on the report (`includedCostCents`); `included` stays null there.
   */
  included: number | null;
  used: number;
  additional: number;
  additionalCostCents: number;
  state: MeteringState;
}

/**
 * The resources this platform can bill for, in the order the table shows them.
 *
 * Rate card: pass-through at provider cost.
 *  - Vercel rows carry FOCUS billed cost (`cost_cents`).
 *  - Neon Free = $0; Launch rates are the ceiling if the account upgrades.
 */
const RESOURCES: {
  resource: string;
  label: string;
  unit: string;
  costPerUnitCents: number | null;
  needsCollector: boolean;
}[] = [
  { resource: 'ai_gateway', label: 'AI Gateway', unit: 'credits', costPerUnitCents: null, needsCollector: false },
  { resource: 'function_invocations', label: 'Function invocations', unit: 'invocations', costPerUnitCents: null, needsCollector: true },
  { resource: 'function_duration', label: 'Function duration', unit: 'GB-hr', costPerUnitCents: null, needsCollector: true },
  { resource: 'bandwidth', label: 'Data egress', unit: 'GB', costPerUnitCents: null, needsCollector: true },
  { resource: 'db_storage', label: 'Database storage', unit: 'GB', costPerUnitCents: 35, needsCollector: true },
  { resource: 'db_compute', label: 'Database compute', unit: 'CU-hr', costPerUnitCents: 10.6, needsCollector: true },
  { resource: 'build_cpu_minutes', label: 'Build CPU minutes', unit: 'minutes', costPerUnitCents: null, needsCollector: true },
];

const USAGE_RECORDS_DDL = `
CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  tenant_slug TEXT NOT NULL,
  app_id TEXT,
  resource TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'units',
  quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  cost_cents INTEGER,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

export async function ensureCloudUsageTables(db: RawDb): Promise<void> {
  await db.$executeRawUnsafe(USAGE_RECORDS_DDL);
}

export interface CloudUsageReport {
  resources: ResourceUsage[];
  periodStart: string;
  periodEnd: string;
  /** True when no collector has written anything for this org/period. */
  awaitingCollector: boolean;
  balanceCents: number;
  /** Monthly plan-included cloud pool in cents. */
  includedCostCents: number;
  /** Attributed provider cost in the window (sum of cost_cents). */
  usedCostCents: number;
  /** max(0, usedCostCents - includedCostCents). */
  additionalCostCents: number;
  autoTopUpThreshold: number | null;
  autoTopUpAmount: number | null;
}

async function planIdForOrg(db: RawDb, orgId: string): Promise<string> {
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT plan_id FROM subscriptions WHERE org_id = $1 LIMIT 1;`,
      orgId,
    )) as { plan_id?: string }[];
    return String(rows[0]?.plan_id ?? 'free');
  } catch {
    return 'free';
  }
}

export async function getCloudUsage(
  orgId: string,
  db: RawDb,
  windowDays = 30,
): Promise<CloudUsageReport> {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - windowDays * 86_400_000);
  const includedCostCents = includedCentsForPlan(await planIdForOrg(db, orgId));

  let rows: Record<string, unknown>[] = [];
  try {
    rows = (await db.$queryRawUnsafe(
      `SELECT resource, unit, SUM(quantity) AS quantity, SUM(cost_cents) AS cost_cents
         FROM usage_records
        WHERE org_id = $1 AND period_start >= $2
        GROUP BY resource, unit;`,
      orgId,
      periodStart.toISOString(),
    )) as Record<string, unknown>[];
  } catch {
    rows = [];
  }

  const measured = new Map<string, number>();
  const measuredCost = new Map<string, number>();
  for (const row of rows) {
    measured.set(String(row.resource), Number(row.quantity) || 0);
    measuredCost.set(String(row.resource), Number(row.cost_cents) || 0);
  }

  measured.set('ai_gateway', await aiGatewaySpend(orgId, db, periodStart));

  const usedCostCents = [...measuredCost.values()].reduce((a, b) => a + b, 0);
  const totalAdditionalCostCents = Math.max(0, usedCostCents - includedCostCents);

  // Spread additional cost across resources proportional to their billed cost
  // so the per-row Additional cost column sums to the org overage.
  const resources: ResourceUsage[] = RESOURCES.map((def) => {
    const used = measured.get(def.resource);
    const isMeasured = !def.needsCollector || used !== undefined;
    const billed = measuredCost.get(def.resource);
    const cost =
      billed !== undefined
        ? billed
        : (used ?? 0) * (def.costPerUnitCents ?? 0);

    let additionalCostCents = 0;
    if (isMeasured && usedCostCents > 0 && cost > 0 && totalAdditionalCostCents > 0) {
      additionalCostCents = Math.round((cost / usedCostCents) * totalAdditionalCostCents);
    }

    // Quantity "additional" is only meaningful when we have a unit included
    // allowance — cloud inclusion is dollar-based, so leave quantity additional
    // as 0 for provider resources and surface dollars via additionalCostCents.
    return {
      resource: def.resource,
      label: def.label,
      unit: def.unit,
      included: null,
      used: used ?? 0,
      additional: 0,
      additionalCostCents,
      state: isMeasured ? 'metered' : 'not_collected',
    };
  });

  // Fix rounding so row additional costs sum to totalAdditionalCostCents.
  const collectorResources = resources.filter(
    (r) => RESOURCES.find((d) => d.resource === r.resource)?.needsCollector && r.state === 'metered',
  );
  const sumAdditional = collectorResources.reduce((n, r) => n + r.additionalCostCents, 0);
  const drift = totalAdditionalCostCents - sumAdditional;
  if (drift !== 0 && collectorResources.length > 0) {
    const richest = collectorResources.reduce((a, b) =>
      a.additionalCostCents >= b.additionalCostCents ? a : b,
    );
    richest.additionalCostCents += drift;
  }

  const balance = await cloudBalanceRow(orgId, db);

  return {
    resources,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    awaitingCollector: resources
      .filter((r) => RESOURCES.find((d) => d.resource === r.resource)?.needsCollector)
      .every((r) => r.state === 'not_collected'),
    balanceCents: balance.balanceCents,
    includedCostCents,
    usedCostCents,
    additionalCostCents: totalAdditionalCostCents,
    autoTopUpThreshold: balance.autoTopUpThreshold,
    autoTopUpAmount: balance.autoTopUpAmount,
  };
}

async function aiGatewaySpend(orgId: string, db: RawDb, since: Date): Promise<number> {
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT COALESCE(SUM(-delta), 0) AS spent
         FROM credit_ledger
        WHERE org_id = $1 AND delta < 0 AND created_at >= $2;`,
      orgId,
      since.toISOString(),
    )) as Record<string, unknown>[];
    return Number(rows[0]?.spent) || 0;
  } catch {
    return 0;
  }
}

async function cloudBalanceRow(
  orgId: string,
  db: RawDb,
): Promise<{
  balanceCents: number;
  autoTopUpThreshold: number | null;
  autoTopUpAmount: number | null;
}> {
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT balance_cents, auto_top_up_threshold, auto_top_up_amount
         FROM cloud_balances WHERE org_id = $1 LIMIT 1;`,
      orgId,
    )) as Record<string, unknown>[];
    if (!rows[0]) {
      return { balanceCents: 0, autoTopUpThreshold: null, autoTopUpAmount: null };
    }
    return {
      balanceCents: Number(rows[0].balance_cents) || 0,
      autoTopUpThreshold:
        rows[0].auto_top_up_threshold == null
          ? null
          : Number(rows[0].auto_top_up_threshold),
      autoTopUpAmount:
        rows[0].auto_top_up_amount == null ? null : Number(rows[0].auto_top_up_amount),
    };
  } catch {
    return { balanceCents: 0, autoTopUpThreshold: null, autoTopUpAmount: null };
  }
}
