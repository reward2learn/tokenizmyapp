/**
 * Cloud usage — the run-time currency (roadmap Phase 5).
 *
 * Reads what has been metered for an organization and presents it per resource
 * as included-versus-additional. Writing is the collector's job and the
 * collector does not exist yet: `/api/cron/cloud-credits` is a documented stub
 * because no usage source has been chosen. See its header.
 *
 * So this reports honestly on a table that is empty for the Vercel and Neon
 * resources, and populated for AI Gateway, which Phase 3 already meters through
 * the credit ledger. A resource that is not being measured says so, rather than
 * showing a confident zero — "we metered nothing" and "you used nothing" are
 * different claims and only one of them is true.
 *
 * Control plane only: usage belongs to the Organization that pays, never to a
 * tenant's own database.
 */
import { createRawClient } from '@/lib/db';

type RawDb = ReturnType<typeof createRawClient>;

export type MeteringState = 'metered' | 'not_collected';

export interface ResourceUsage {
  /** Stable key, matching UsageRecord.resource. */
  resource: string;
  label: string;
  unit: string;
  /** What the plan covers. Null where no allowance has been set. */
  included: number | null;
  used: number;
  additional: number;
  additionalCostCents: number;
  state: MeteringState;
}

/**
 * The resources this platform can bill for, in the order the table shows them.
 *
 * Ours deliberately differs from Hercules': these are what Vercel and Neon
 * actually expose, and the rates must come from our own COGS. No rate card is
 * set, hence `costPerUnitCents: null` throughout — a made-up rate would produce
 * invoices we cannot defend.
 */
const RESOURCES: {
  resource: string;
  label: string;
  unit: string;
  costPerUnitCents: number | null;
  /**
   * Whether this resource waits on the Phase 5 collector.
   *
   * AI Gateway does not: Phase 3 already meters every generation into the
   * credit ledger, so zero there means zero generations — a true statement.
   * For the provider resources zero means nobody counted, which is a different
   * thing and must not be rendered as a number.
   */
  needsCollector: boolean;
}[] = [
  { resource: 'ai_gateway', label: 'AI Gateway', unit: 'credits', costPerUnitCents: null, needsCollector: false },
  { resource: 'function_invocations', label: 'Function invocations', unit: 'invocations', costPerUnitCents: null, needsCollector: true },
  { resource: 'function_duration', label: 'Function duration', unit: 'GB-hr', costPerUnitCents: null, needsCollector: true },
  { resource: 'bandwidth', label: 'Data egress', unit: 'GB', costPerUnitCents: null, needsCollector: true },
  { resource: 'db_storage', label: 'Database storage', unit: 'GB', costPerUnitCents: null, needsCollector: true },
  { resource: 'db_compute', label: 'Database compute', unit: 'GB-hr', costPerUnitCents: null, needsCollector: true },
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
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

/**
 * `usage_records` and `cloud_balances` are both declared in the zmodel, so
 * `db push` owns them and creates them at build time before the app serves a
 * request. This helper exists for the read path on a database that has not been
 * pushed yet — it creates nothing that db push would race, because both tables
 * already exist by then and CREATE TABLE IF NOT EXISTS is a no-op.
 *
 * Kept deliberately narrow after the org_attribution incident: a brand-new
 * table with two creators lost that race and failed a deploy. These two ship in
 * the same release as this code, so the first `db push` that knows about them
 * runs before any request can.
 */
export async function ensureCloudUsageTables(db: RawDb): Promise<void> {
  await db.$executeRawUnsafe(USAGE_RECORDS_DDL);
}

export interface CloudUsageReport {
  resources: ResourceUsage[];
  periodStart: string;
  periodEnd: string;
  /** True when no collector has written anything for this period. */
  awaitingCollector: boolean;
  balanceCents: number;
}

export async function getCloudUsage(
  orgId: string,
  db: RawDb,
  windowDays = 30,
): Promise<CloudUsageReport> {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - windowDays * 86_400_000);

  let rows: Record<string, unknown>[] = [];
  try {
    rows = (await db.$queryRawUnsafe(
      `SELECT resource, unit, SUM(quantity) AS quantity
         FROM usage_records
        WHERE org_id = $1 AND period_start >= $2
        GROUP BY resource, unit;`,
      orgId,
      periodStart.toISOString(),
    )) as Record<string, unknown>[];
  } catch {
    // Table absent on a database this release has not reached. An empty report
    // is the truth there, and it renders the same as "nothing collected yet".
    rows = [];
  }

  const measured = new Map<string, number>();
  for (const row of rows) {
    measured.set(String(row.resource), Number(row.quantity) || 0);
  }

  // AI Gateway is the one resource already metered, by Phase 3, in the credit
  // ledger rather than usage_records. Read it from where it actually lives
  // instead of reporting "not collected" for something we do measure.
  measured.set('ai_gateway', await aiGatewaySpend(orgId, db, periodStart));

  const resources: ResourceUsage[] = RESOURCES.map((def) => {
    const used = measured.get(def.resource);
    // A resource that does not need the collector is metered by definition.
    // One that does is metered only once a row exists for it.
    const isMeasured = !def.needsCollector || used !== undefined;
    return {
      resource: def.resource,
      label: def.label,
      unit: def.unit,
      included: null,
      used: used ?? 0,
      additional: 0,
      additionalCostCents: 0,
      state: isMeasured ? 'metered' : 'not_collected',
    };
  });

  return {
    resources,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    // Only the collector-backed resources count here. AI Gateway is always
    // metered, so including it would make this permanently false and the
    // warning it drives would never appear.
    awaitingCollector: resources
      .filter((r) => RESOURCES.find((d) => d.resource === r.resource)?.needsCollector)
      .every((r) => r.state === 'not_collected'),
    balanceCents: await cloudBalanceCents(orgId, db),
  };
}

/** Credits consumed by AI generation in the window. Positive number. */
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

async function cloudBalanceCents(orgId: string, db: RawDb): Promise<number> {
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT balance_cents FROM cloud_balances WHERE org_id = $1 LIMIT 1;`,
      orgId,
    )) as Record<string, unknown>[];
    return Number(rows[0]?.balance_cents) || 0;
  } catch {
    return 0;
  }
}
