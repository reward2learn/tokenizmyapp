/**
 * Cloud Credits Collector — roadmap Phase 5.
 *
 * Meters what deployed tenant apps consume on Vercel and Neon, and debits the
 * owning organization's cloud balance. Usage sources, decided 2026-08-18 and
 * verified live against both providers:
 *
 *  - Vercel: `GET /v1/billing/charges` — the FOCUS v1.3 billing export (new
 *    Feb 2026), streamed JSONL, 1-day granularity. Team-level only: the payload
 *    carries no ResourceId and Tags is always empty, so charges cannot be
 *    attributed to the tenant app that caused them. Per the attribution
 *    decision, they are recorded as platform overhead on the operator org.
 *  - Neon: `GET /projects/{id}` — the Free-plan usage endpoint. Returns
 *    current-billing-period totals (compute_time_seconds, data_transfer_bytes,
 *    data_storage_bytes_hour, consumption_period_start). The consumption
 *    history v2 API needs a Launch plan and the account is on Free, so this is
 *    the source that actually works. Project-level only: all tenant databases
 *    are endpoints inside one project, so per-tenant attribution is not
 *    possible on this plan either — recorded as platform overhead too.
 *
 * Rate card: pass-through at provider cost. Vercel rows carry the billed cost
 * from the FOCUS payload (`cost_cents`); Neon on the Free plan costs nothing,
 * so its rows carry zero and the documented Launch rates in the service's
 * RESOURCES table are the ceiling if the account upgrades.
 *
 * Idempotency: rows upsert on [tenant_slug, app_id, resource, period_start].
 * Re-running the cron for the same day replaces rather than duplicates.
 */
import { createRawClient } from '@/lib/db';

type RawDb = ReturnType<typeof createRawClient>;

/** Marker app id for Vercel team-level rows (no per-project attribution). */
const VERCEL_APP_ID = 'vercel';
/** Marker tenant slug for platform-level overhead rows. */
const PLATFORM_TENANT_SLUG = 'platform';

/** Vercel FOCUS ServiceName → our resource taxonomy. */
const VERCEL_SERVICE_MAP: Record<string, string> = {
  'Function Invocations': 'function_invocations',
  'Function Duration': 'function_duration',
  'Fluid Active CPU': 'function_duration',
  'Fluid Provisioned Memory': 'function_duration',
  'Fast Data Transfer': 'bandwidth',
  'Fast Origin Transfer': 'bandwidth',
  'Blob Data Transfer': 'bandwidth',
  'Build CPU Minutes': 'build_cpu_minutes',
};

export interface CollectorEnv {
  vercelToken?: string;
  vercelTeamId?: string;
  neonApiKey?: string;
  neonOrgId?: string;
  /** Operator org id; falls back to the org with slug 'default'. */
  operatorOrgId?: string;
}

export interface CollectionSummary {
  vercel: { rows: number; costCents: number };
  neon: { rows: number; costCents: number };
  debitedCents: number;
  operatorOrgId: string;
}

interface UsageRow {
  orgId: string;
  tenantSlug: string;
  appId: string;
  resource: string;
  unit: string;
  quantity: number;
  costCents: number | null;
  periodStart: Date;
  periodEnd: Date;
}

const UPSERT_SQL = `
INSERT INTO usage_records
  (id, org_id, tenant_slug, app_id, resource, unit, quantity, cost_cents, period_start, period_end, recorded_at)
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
ON CONFLICT (tenant_slug, app_id, resource, period_start)
DO UPDATE SET
  quantity = EXCLUDED.quantity,
  cost_cents = EXCLUDED.cost_cents,
  period_end = EXCLUDED.period_end,
  recorded_at = NOW();`;

/**
 * Upsert rows and return the change in billed cost (new minus previously
 * stored). The debit must only apply to the delta: the FOCUS payload is
 * provisional, and a re-run over the same period must not charge the balance
 * twice for cost that was already debited.
 */
async function upsertRows(db: RawDb, rows: UsageRow[]): Promise<number> {
  let deltaCents = 0;
  for (const row of rows) {
    let previousCents = 0;
    try {
      const existing = (await db.$queryRawUnsafe(
        `SELECT cost_cents FROM usage_records
          WHERE tenant_slug = $1 AND app_id = $2 AND resource = $3 AND period_start = $4
          LIMIT 1;`,
        row.tenantSlug,
        row.appId,
        row.resource,
        row.periodStart,
      )) as { cost_cents?: number | null }[];
      previousCents = Number(existing[0]?.cost_cents) || 0;
    } catch {
      // Table absent on a database this release has not reached — treat as new.
    }
    await db.$executeRawUnsafe(
      UPSERT_SQL,
      `ur_${row.tenantSlug}_${row.appId}_${row.resource}_${row.periodStart.toISOString()}`,
      row.orgId,
      row.tenantSlug,
      row.appId,
      row.resource,
      row.unit,
      row.quantity,
      row.costCents,
      row.periodStart,
      row.periodEnd,
    );
    deltaCents += (row.costCents ?? 0) - previousCents;
  }
  return deltaCents;
}

/**
 * Fetch Vercel FOCUS charges for the last `days` days and reduce them to
 * usage rows. Returns rows plus the total billed cost in cents.
 */
export async function collectVercelUsage(
  db: RawDb,
  orgId: string,
  env: CollectorEnv,
  days = 3,
): Promise<{ rows: UsageRow[]; costCents: number; deltaCents: number }> {
  if (!env.vercelToken || !env.vercelTeamId) {
    return { rows: [], costCents: 0, deltaCents: 0 };
  }
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const url =
    `https://api.vercel.com/v1/billing/charges?teamId=${encodeURIComponent(env.vercelTeamId)}` +
    `&from=${from.toISOString()}&to=${to.toISOString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.vercelToken}` },
  });
  if (!res.ok) {
    throw new Error(`Vercel billing charges failed: ${res.status} ${await res.text()}`);
  }
  const text = await res.text();
  // The payload carries one line per project per service per day, with no
  // project identifier on the line. Team-level recording therefore sums the
  // lines per (resource, day) — otherwise each line would overwrite the
  // previous one through the upsert key and the table would understate usage.
  const aggregated = new Map<string, { quantity: number; cost: number; unit: string; periodStart: Date; periodEnd: Date }>();
  let costCents = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const charge = JSON.parse(line) as Record<string, unknown>;
    // Subscription licenses (Pro, seats, Speed Insights) are platform
    // overhead of a different kind — not usage we meter per resource.
    if (charge.ChargeCategory !== 'Usage') continue;
    const resource = VERCEL_SERVICE_MAP[String(charge.ServiceName ?? '')];
    if (!resource) continue;
    const quantity = Number(charge.ConsumedQuantity) || 0;
    const billed = Number(charge.BilledCost) || 0;
    if (quantity === 0 && billed === 0) continue;
    const periodStart = new Date(String(charge.ChargePeriodStart));
    const key = `${resource}|${periodStart.toISOString()}`;
    const existing = aggregated.get(key);
    const cost = Math.round(billed * 100);
    costCents += cost;
    if (existing) {
      existing.quantity += quantity;
      existing.cost += cost;
    } else {
      aggregated.set(key, {
        quantity,
        cost,
        unit: String(charge.ConsumedUnit ?? 'units'),
        periodStart,
        periodEnd: new Date(String(charge.ChargePeriodEnd)),
      });
    }
  }
  const rows: UsageRow[] = [...aggregated.entries()].map(([key, agg]) => {
    const [resource] = key.split('|');
    return {
      orgId,
      tenantSlug: PLATFORM_TENANT_SLUG,
      appId: VERCEL_APP_ID,
      resource,
      unit: agg.unit,
      quantity: agg.quantity,
      costCents: agg.cost,
      periodStart: agg.periodStart,
      periodEnd: agg.periodEnd,
    };
  });
  const deltaCents = await upsertRows(db, rows);
  return { rows, costCents, deltaCents };
}

/**
 * Fetch Neon per-project usage (Free-plan endpoint) for every project in the
 * org and reduce it to usage rows. Free plan carries no costs, so rows are
 * metered with cost 0 and the documented Launch rates apply only after an
 * upgrade.
 */
export async function collectNeonUsage(
  db: RawDb,
  orgId: string,
  env: CollectorEnv,
): Promise<{ rows: UsageRow[]; costCents: number; deltaCents: number }> {
  if (!env.neonApiKey || !env.neonOrgId) {
    return { rows: [], costCents: 0, deltaCents: 0 };
  }
  const projects = await listNeonProjects(env);
  const rows: UsageRow[] = [];
  for (const project of projects) {
    const res = await fetch(`https://console.neon.tech/api/v2/projects/${project}`, {
      headers: { Authorization: `Bearer ${env.neonApiKey}` },
    });
    if (!res.ok) continue; // A project that 404s is not ours to meter.
    const body = (await res.json()) as {
      project?: {
        compute_time_seconds?: number;
        data_transfer_bytes?: number;
        data_storage_bytes_hour?: number;
        consumption_period_start?: string;
      };
    };
    const p = body.project;
    if (!p?.consumption_period_start) continue;
    const periodStart = new Date(p.consumption_period_start);
    const periodEnd = new Date();
    const hoursInPeriod = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / 3_600_000);
    const computeCuHours = (Number(p.compute_time_seconds) || 0) / 3600;
    const transferGb = (Number(p.data_transfer_bytes) || 0) / 1_000_000_000;
    // byte-hours → average GB over the period (the billing unit is GB-months;
    // the Free-plan snapshot is a period total, so report the average).
    const storageGb = (Number(p.data_storage_bytes_hour) || 0) / hoursInPeriod / 1_000_000_000;
    const push = (resource: string, unit: string, quantity: number) => {
      if (quantity <= 0) return;
      rows.push({
        orgId,
        tenantSlug: PLATFORM_TENANT_SLUG,
        appId: project,
        resource,
        unit,
        quantity,
        costCents: 0,
        periodStart,
        periodEnd,
      });
    };
    push('db_compute', 'CU-hr', computeCuHours);
    push('bandwidth', 'GB', transferGb);
    push('db_storage', 'GB', storageGb);
  }
  const deltaCents = await upsertRows(db, rows);
  return { rows, costCents: 0, deltaCents };
}

async function listNeonProjects(env: CollectorEnv): Promise<string[]> {
  const res = await fetch(
    `https://console.neon.tech/api/v2/projects?org_id=${encodeURIComponent(env.neonOrgId ?? '')}`,
    { headers: { Authorization: `Bearer ${env.neonApiKey}` } },
  );
  if (!res.ok) {
    throw new Error(`Neon projects list failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { projects?: { id?: string }[] };
  return (body.projects ?? []).map((p) => p.id ?? '').filter(Boolean);
}

/** Debit the operator org's cloud balance by the collected cost. */
async function debitOperatorOrg(db: RawDb, orgId: string, costCents: number): Promise<void> {
  if (costCents <= 0) return;
  await db.$executeRawUnsafe(
    `INSERT INTO cloud_balances (id, org_id, balance_cents, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (org_id)
     DO UPDATE SET balance_cents = cloud_balances.balance_cents - $3, updated_at = NOW();`,
    `cb_${orgId}`,
    orgId,
    costCents,
  );
}

/** Resolve the operator org: explicit env, else the org with slug 'default'. */
export async function resolveOperatorOrgId(db: RawDb, env: CollectorEnv): Promise<string | null> {
  if (env.operatorOrgId) return env.operatorOrgId;
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT id FROM organizations WHERE slug = 'default' LIMIT 1;`,
    )) as { id?: string }[];
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Run one collection pass: Vercel FOCUS charges + Neon project usage, then
 * debit the operator org's cloud balance by the total billed cost.
 */
export async function runCloudUsageCollection(
  db: RawDb,
  env: CollectorEnv,
): Promise<CollectionSummary> {
  const orgId = await resolveOperatorOrgId(db, env);
  if (!orgId) {
    throw new Error('No operator org found — set OPERATOR_ORG_ID or create the default org.');
  }
  const vercel = await collectVercelUsage(db, orgId, env);
  const neon = await collectNeonUsage(db, orgId, env);
  const debitedCents = vercel.deltaCents + neon.deltaCents;
  await debitOperatorOrg(db, orgId, debitedCents);
  return {
    vercel: { rows: vercel.rows.length, costCents: vercel.costCents },
    neon: { rows: neon.rows.length, costCents: neon.costCents },
    debitedCents,
    operatorOrgId: orgId,
  };
}
