/**
 * Cloud Credits Collector — roadmap Phase 5 (hybrid attribution).
 *
 * Meters what deployed tenant apps consume on Vercel and Neon, allocates cost
 * onto owning organizations by known project / branch counts, and debits each
 * org's cloud balance for overage past the plan-included allowance.
 *
 * Usage sources:
 *  - Vercel: `GET /v1/billing/charges` (FOCUS). Team-level Usage only — no
 *    ResourceId — so totals are split across orgs proportional to attributed
 *    `vercelProjectId` count (suite apps count separately). Rounding residual
 *    and any unattributed share land on the operator org.
 *  - Neon: prefer `consumption_history` when available (Launch); else Free-plan
 *    project totals split by matching `tenant-{slug}` branch count.
 *
 * Rate card: pass-through provider cost (FOCUS BilledCost; Neon Free = $0).
 * Idempotency: rows upsert on [tenant_slug, app_id, resource, period_start];
 * overage debits use month-to-date attributed cost vs included allowance so
 * re-runs only charge the overage delta.
 */
import { createRawClient } from '@/lib/db';
import { includedCentsForPlan } from '@/domain/billing/cloud-allowance';
import {
  allocateByWeights,
  allocateQuantityByWeights,
  branchToOrgIndex,
  loadCloudAttributionMap,
  totalAttributedProjects,
  type AttributionMap,
  type OrgAttribution,
} from '@/domain/billing/cloud-attribution-map';

type RawDb = ReturnType<typeof createRawClient>;

/** Marker app id for Vercel team-level allocated rows. */
const VERCEL_APP_ID = 'vercel';
/** Marker tenant slug for platform-level residual rows. */
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
  /** Shared Neon project when listing branches without org-wide list. */
  neonProjectId?: string;
  /** Operator org id; falls back to the org with slug 'default'. */
  operatorOrgId?: string;
}

export interface CollectionSummary {
  vercel: { rows: number; costCents: number };
  neon: { rows: number; costCents: number };
  debitedCents: number;
  /** Per-org debit deltas applied this run (overage only). */
  orgDebits: Record<string, number>;
  operatorOrgId: string;
  attributedProjects: number;
}

export interface UsageRow {
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
  org_id = EXCLUDED.org_id,
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
export async function upsertRows(db: RawDb, rows: UsageRow[]): Promise<number> {
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

interface AggregatedCharge {
  quantity: number;
  cost: number;
  unit: string;
  periodStart: Date;
  periodEnd: Date;
  resource: string;
}

/** Parse FOCUS JSONL into team totals per (resource, day). */
export function aggregateVercelFocusCharges(text: string): {
  aggregated: AggregatedCharge[];
  costCents: number;
} {
  const map = new Map<string, AggregatedCharge>();
  let costCents = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const charge = JSON.parse(line) as Record<string, unknown>;
    if (charge.ChargeCategory !== 'Usage') continue;
    const resource = VERCEL_SERVICE_MAP[String(charge.ServiceName ?? '')];
    if (!resource) continue;
    const quantity = Number(charge.ConsumedQuantity) || 0;
    const billed = Number(charge.BilledCost) || 0;
    if (quantity === 0 && billed === 0) continue;
    const periodStart = new Date(String(charge.ChargePeriodStart));
    const key = `${resource}|${periodStart.toISOString()}`;
    const existing = map.get(key);
    const cost = Math.round(billed * 100);
    costCents += cost;
    if (existing) {
      existing.quantity += quantity;
      existing.cost += cost;
    } else {
      map.set(key, {
        resource,
        quantity,
        cost,
        unit: String(charge.ConsumedUnit ?? 'units'),
        periodStart,
        periodEnd: new Date(String(charge.ChargePeriodEnd)),
      });
    }
  }
  return { aggregated: [...map.values()], costCents };
}

/**
 * Prefer one row per project (1:1 tenant) or parent slug + app_id for suite.
 * Split the org's day share equally across its attributed projects.
 */
function splitOrgShareAcrossProjects(
  entry: OrgAttribution,
  share: {
    resource: string;
    unit: string;
    costCents: number;
    quantity: number;
    periodStart: Date;
    periodEnd: Date;
  },
): UsageRow[] {
  const projects =
    entry.projects.length > 0
      ? entry.projects
      : entry.tenantSlugs.map((slug) => ({
          projectId: VERCEL_APP_ID,
          tenantSlug: slug,
          appId: null as string | null,
        }));

  if (projects.length === 0) {
    return [
      {
        orgId: entry.orgId,
        tenantSlug: entry.tenantSlugs[0] ?? 'multi',
        appId: VERCEL_APP_ID,
        resource: share.resource,
        unit: share.unit,
        quantity: share.quantity,
        costCents: share.costCents,
        periodStart: share.periodStart,
        periodEnd: share.periodEnd,
      },
    ];
  }

  const weights = projects.map(() => 1);
  const costShares = allocateByWeights(share.costCents, weights);
  const qtyShares = allocateQuantityByWeights(share.quantity, weights);

  return projects.map((p, i) => ({
    orgId: entry.orgId,
    tenantSlug: p.tenantSlug,
    appId: p.appId ?? VERCEL_APP_ID,
    resource: share.resource,
    unit: share.unit,
    quantity: qtyShares[i],
    costCents: costShares[i],
    periodStart: share.periodStart,
    periodEnd: share.periodEnd,
  }));
}

/**
 * Allocate one day's team totals across orgs by project-count weights.
 * Operator receives the rounding residual (and the full amount when nothing
 * is attributed).
 */
export function allocateVercelAggregates(
  aggregated: AggregatedCharge[],
  attribution: AttributionMap,
  operatorOrgId: string,
): UsageRow[] {
  const entries = [...attribution.values()].filter((e) => e.projectIds.length > 0);
  const totalProjects = entries.reduce((n, e) => n + e.projectIds.length, 0);
  const rows: UsageRow[] = [];

  for (const agg of aggregated) {
    if (totalProjects <= 0) {
      rows.push({
        orgId: operatorOrgId,
        tenantSlug: PLATFORM_TENANT_SLUG,
        appId: VERCEL_APP_ID,
        resource: agg.resource,
        unit: agg.unit,
        quantity: agg.quantity,
        costCents: agg.cost,
        periodStart: agg.periodStart,
        periodEnd: agg.periodEnd,
      });
      continue;
    }

    const weights = entries.map((e) => e.projectIds.length);
    const costShares = allocateByWeights(agg.cost, weights);
    const qtyShares = allocateQuantityByWeights(agg.quantity, weights);
    let costAssigned = 0;
    let qtyAssigned = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const costShare = costShares[i];
      const qtyShare = qtyShares[i];
      costAssigned += costShare;
      qtyAssigned += qtyShare;
      rows.push(
        ...splitOrgShareAcrossProjects(entry, {
          resource: agg.resource,
          unit: agg.unit,
          costCents: costShare,
          quantity: qtyShare,
          periodStart: agg.periodStart,
          periodEnd: agg.periodEnd,
        }),
      );
    }

    const residualCost = agg.cost - costAssigned;
    const residualQty = agg.quantity - qtyAssigned;
    if (residualCost !== 0 || Math.abs(residualQty) > 1e-12) {
      rows.push({
        orgId: operatorOrgId,
        tenantSlug: PLATFORM_TENANT_SLUG,
        appId: VERCEL_APP_ID,
        resource: agg.resource,
        unit: agg.unit,
        quantity: residualQty,
        costCents: residualCost,
        periodStart: agg.periodStart,
        periodEnd: agg.periodEnd,
      });
    }
  }

  return rows;
}

/**
 * Fetch Vercel FOCUS charges and allocate onto orgs by project count.
 */
export async function collectVercelUsage(
  db: RawDb,
  operatorOrgId: string,
  env: CollectorEnv,
  attribution: AttributionMap,
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
  const { aggregated, costCents } = aggregateVercelFocusCharges(text);
  const rows = allocateVercelAggregates(aggregated, attribution, operatorOrgId);
  const deltaCents = await upsertRows(db, rows);
  return { rows, costCents, deltaCents };
}

interface NeonProjectUsage {
  projectId: string;
  computeCuHours: number;
  transferGb: number;
  storageGb: number;
  periodStart: Date;
  periodEnd: Date;
  /** Pass-through cost when Launch rates apply; Free stays 0. */
  costByResource: Record<string, number>;
}

async function listNeonProjects(env: CollectorEnv): Promise<string[]> {
  if (env.neonProjectId?.trim()) {
    return [env.neonProjectId.trim()];
  }
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

async function listNeonBranches(env: CollectorEnv, projectId: string): Promise<string[]> {
  const res = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}/branches`, {
    headers: { Authorization: `Bearer ${env.neonApiKey}` },
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { branches?: { name?: string }[] };
  return (body.branches ?? []).map((b) => String(b.name ?? '')).filter(Boolean);
}

/**
 * Try Launch consumption_history; return null when unavailable so Free path runs.
 * Free is the default path — Launch upgrade is out of scope for this phase.
 */
async function tryNeonConsumptionHistory(
  env: CollectorEnv,
  projectId: string,
): Promise<NeonProjectUsage | null> {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  const url =
    `https://console.neon.tech/api/v2/projects/${projectId}/consumption_history/account` +
    `?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}` +
    `&granularity=daily`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${env.neonApiKey}` },
    });
    if (!res.ok) return null;
    // Acknowledge Launch endpoint when it starts returning usable per-branch
    // data; until then Free snapshot remains authoritative.
    void (await res.json());
    return null;
  } catch {
    return null;
  }
}

async function fetchNeonFreeProjectUsage(
  env: CollectorEnv,
  projectId: string,
): Promise<NeonProjectUsage | null> {
  const res = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${env.neonApiKey}` },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    project?: {
      compute_time_seconds?: number;
      data_transfer_bytes?: number;
      data_storage_bytes_hour?: number;
      consumption_period_start?: string;
    };
  };
  const p = body.project;
  if (!p?.consumption_period_start) return null;
  const periodStart = new Date(p.consumption_period_start);
  const periodEnd = new Date();
  const hoursInPeriod = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / 3_600_000);
  return {
    projectId,
    computeCuHours: (Number(p.compute_time_seconds) || 0) / 3600,
    transferGb: (Number(p.data_transfer_bytes) || 0) / 1_000_000_000,
    storageGb: (Number(p.data_storage_bytes_hour) || 0) / hoursInPeriod / 1_000_000_000,
    periodStart,
    periodEnd,
    costByResource: { db_compute: 0, bandwidth: 0, db_storage: 0 },
  };
}

/**
 * Allocate Neon project totals by matching `tenant-*` branch counts.
 * Unmatched branches → operator residual.
 */
export function allocateNeonProjectUsage(
  usage: NeonProjectUsage,
  branchNames: string[],
  attribution: AttributionMap,
  operatorOrgId: string,
): UsageRow[] {
  const branchIndex = branchToOrgIndex(attribution);
  const matchedByOrg = new Map<string, number>();
  let unmatched = 0;
  for (const name of branchNames) {
    if (!name.startsWith('tenant-')) continue;
    const orgId = branchIndex.get(name);
    if (orgId) {
      matchedByOrg.set(orgId, (matchedByOrg.get(orgId) ?? 0) + 1);
    } else {
      unmatched += 1;
    }
  }

  const orgIds = [...matchedByOrg.keys()];
  const weights = orgIds.map((id) => matchedByOrg.get(id) ?? 0);
  const totalMatched = weights.reduce((a, b) => a + b, 0);
  const totalBranches = totalMatched + unmatched;

  const metrics: Array<{ resource: string; unit: string; quantity: number; cost: number }> = [
    {
      resource: 'db_compute',
      unit: 'CU-hr',
      quantity: usage.computeCuHours,
      cost: usage.costByResource.db_compute ?? 0,
    },
    {
      resource: 'bandwidth',
      unit: 'GB',
      quantity: usage.transferGb,
      cost: usage.costByResource.bandwidth ?? 0,
    },
    {
      resource: 'db_storage',
      unit: 'GB',
      quantity: usage.storageGb,
      cost: usage.costByResource.db_storage ?? 0,
    },
  ];

  const rows: UsageRow[] = [];

  for (const metric of metrics) {
    if (metric.quantity <= 0 && metric.cost <= 0) continue;

    if (totalBranches <= 0) {
      rows.push({
        orgId: operatorOrgId,
        tenantSlug: PLATFORM_TENANT_SLUG,
        appId: usage.projectId,
        resource: metric.resource,
        unit: metric.unit,
        quantity: metric.quantity,
        costCents: metric.cost,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
      });
      continue;
    }

    const allWeights = [...weights, unmatched];
    const qtyShares = allocateQuantityByWeights(metric.quantity, allWeights);
    const costShares = allocateByWeights(metric.cost, allWeights);

    for (let i = 0; i < orgIds.length; i++) {
      const orgId = orgIds[i];
      const entry = attribution.get(orgId);
      const primarySlug =
        entry?.tenantSlugs.length === 1
          ? entry.tenantSlugs[0]
          : (entry?.tenantSlugs[0] ?? 'multi');
      rows.push({
        orgId,
        tenantSlug: primarySlug,
        appId: usage.projectId,
        resource: metric.resource,
        unit: metric.unit,
        quantity: qtyShares[i],
        costCents: costShares[i],
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
      });
    }

    const residualQty = qtyShares[orgIds.length] ?? 0;
    const residualCost = costShares[orgIds.length] ?? 0;
    if (residualQty > 0 || residualCost > 0 || unmatched > 0) {
      rows.push({
        orgId: operatorOrgId,
        tenantSlug: PLATFORM_TENANT_SLUG,
        appId: usage.projectId,
        resource: metric.resource,
        unit: metric.unit,
        quantity: residualQty,
        costCents: residualCost,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
      });
    }
  }

  return rows;
}

/**
 * Fetch Neon usage (Launch history when available, else Free snapshot) and
 * allocate by tenant branch counts.
 */
export async function collectNeonUsage(
  db: RawDb,
  operatorOrgId: string,
  env: CollectorEnv,
  attribution: AttributionMap,
): Promise<{ rows: UsageRow[]; costCents: number; deltaCents: number }> {
  if (!env.neonApiKey || (!env.neonOrgId && !env.neonProjectId)) {
    return { rows: [], costCents: 0, deltaCents: 0 };
  }
  const projects = await listNeonProjects(env);
  const rows: UsageRow[] = [];
  for (const projectId of projects) {
    const launch = await tryNeonConsumptionHistory(env, projectId);
    const usage = launch ?? (await fetchNeonFreeProjectUsage(env, projectId));
    if (!usage) continue;
    const branches = await listNeonBranches(env, projectId);
    rows.push(...allocateNeonProjectUsage(usage, branches, attribution, operatorOrgId));
  }
  const costCents = rows.reduce((n, r) => n + (r.costCents ?? 0), 0);
  const deltaCents = await upsertRows(db, rows);
  return { rows, costCents, deltaCents };
}

/** Debit an org's cloud balance by `costCents` (may be zero; no-op). */
export async function debitCloudBalance(
  db: RawDb,
  orgId: string,
  costCents: number,
): Promise<void> {
  if (costCents === 0) return;
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

/** Calendar-month start (UTC) for included-allowance accounting. */
export function monthStartUtc(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

async function monthAttributedCostCents(
  db: RawDb,
  orgId: string,
  since: Date,
): Promise<number> {
  try {
    const rows = (await db.$queryRawUnsafe(
      `SELECT COALESCE(SUM(cost_cents), 0) AS total
         FROM usage_records
        WHERE org_id = $1 AND period_start >= $2;`,
      orgId,
      since.toISOString(),
    )) as { total?: number }[];
    return Number(rows[0]?.total) || 0;
  } catch {
    return 0;
  }
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

/**
 * Per-org overage debit: month-to-date attributed cost minus plan included.
 * Returns the delta actually applied (idempotent across re-runs when costs
 * are unchanged). Pass `previousMonthTotals` from before the upserts.
 */
export async function debitOrgsForOverage(
  db: RawDb,
  orgIds: Iterable<string>,
  previousMonthTotals: Map<string, number>,
): Promise<Record<string, number>> {
  const since = monthStartUtc();
  const debits: Record<string, number> = {};

  for (const orgId of orgIds) {
    const included = includedCentsForPlan(await planIdForOrg(db, orgId));
    const after = await monthAttributedCostCents(db, orgId, since);
    const before = previousMonthTotals.has(orgId)
      ? (previousMonthTotals.get(orgId) as number)
      : 0;
    const overageBefore = Math.max(0, before - included);
    const overageAfter = Math.max(0, after - included);
    const delta = overageAfter - overageBefore;
    if (delta !== 0) {
      await debitCloudBalance(db, orgId, delta);
      debits[orgId] = delta;
    }
  }

  return debits;
}

/** Snapshot month-to-date attributed cost for orgs before upserts. */
export async function snapshotMonthTotals(
  db: RawDb,
  orgIds: Iterable<string>,
): Promise<Map<string, number>> {
  const since = monthStartUtc();
  const map = new Map<string, number>();
  for (const orgId of orgIds) {
    map.set(orgId, await monthAttributedCostCents(db, orgId, since));
  }
  return map;
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
 * Run one collection pass: allocate Vercel + Neon onto orgs, then debit each
 * org's cloud balance for overage past the plan-included allowance.
 */
export async function runCloudUsageCollection(
  db: RawDb,
  env: CollectorEnv,
): Promise<CollectionSummary> {
  const operatorOrgId = await resolveOperatorOrgId(db, env);
  if (!operatorOrgId) {
    throw new Error('No operator org found — set OPERATOR_ORG_ID or create the default org.');
  }

  const attribution = await loadCloudAttributionMap(db);
  const affectedOrgIds = new Set<string>([operatorOrgId, ...attribution.keys()]);
  const previousTotals = await snapshotMonthTotals(db, affectedOrgIds);

  const vercel = await collectVercelUsage(db, operatorOrgId, env, attribution);
  const neon = await collectNeonUsage(db, operatorOrgId, env, attribution);

  for (const row of [...vercel.rows, ...neon.rows]) {
    affectedOrgIds.add(row.orgId);
  }

  const orgDebits = await debitOrgsForOverage(db, affectedOrgIds, previousTotals);
  const debitedCents = Object.values(orgDebits).reduce((a, b) => a + b, 0);

  try {
    const { maybeAutoTopUpCloudBalances } = await import('@/domain/billing/cloud-balance-service');
    await maybeAutoTopUpCloudBalances(db, [...affectedOrgIds]);
  } catch (err) {
    console.warn(
      '[cloud-credits] auto top-up skipped:',
      err instanceof Error ? err.message : String(err),
    );
  }

  return {
    vercel: { rows: vercel.rows.length, costCents: vercel.costCents },
    neon: { rows: neon.rows.length, costCents: neon.costCents },
    debitedCents,
    orgDebits,
    operatorOrgId,
    attributedProjects: totalAttributedProjects(attribution),
  };
}
