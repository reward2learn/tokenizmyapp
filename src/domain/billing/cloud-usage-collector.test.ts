import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  allocateByWeights,
  allocateQuantityByWeights,
  neonBranchNameForSlug,
} from '@/domain/billing/cloud-attribution-map';
import {
  aggregateVercelFocusCharges,
  allocateNeonProjectUsage,
  allocateVercelAggregates,
  collectNeonUsage,
  collectVercelUsage,
  resolveOperatorOrgId,
  runCloudUsageCollection,
} from '@/domain/billing/cloud-usage-collector';
import type { AttributionMap, OrgAttribution } from '@/domain/billing/cloud-attribution-map';

/**
 * Hybrid attribution: team Usage splits by project/branch count; residual on
 * operator; overage debits are idempotent across re-runs.
 */

const FOCUS_SAMPLE = [
  {
    ChargePeriodStart: '2026-08-15T07:00:00.000Z',
    ChargePeriodEnd: '2026-08-16T07:00:00.000Z',
    ChargeCategory: 'Usage',
    BilledCost: 0.0189,
    ServiceName: 'Function Invocations',
    ConsumedQuantity: 31514,
    ConsumedUnit: 'Invocations',
  },
  {
    ChargePeriodStart: '2026-08-15T07:00:00.000Z',
    ChargePeriodEnd: '2026-08-16T07:00:00.000Z',
    ChargeCategory: 'Usage',
    BilledCost: 10.164,
    ServiceName: 'Build CPU Minutes',
    ConsumedQuantity: 2904,
    ConsumedUnit: 'minute',
  },
  {
    ChargePeriodStart: '2026-08-15T07:00:00.000Z',
    ChargePeriodEnd: '2026-08-16T07:00:00.000Z',
    ChargeCategory: 'Usage',
    BilledCost: 0,
    ServiceName: 'Edge Requests',
    ConsumedQuantity: 33849,
    ConsumedUnit: 'Requests',
  },
  {
    ChargePeriodStart: '2026-08-15T07:00:00.000Z',
    ChargePeriodEnd: '2026-08-16T07:00:00.000Z',
    ChargeCategory: 'Subscription Licenses',
    BilledCost: 1.9355,
    ServiceName: 'Pro',
    ConsumedQuantity: 0,
    ConsumedUnit: 'Seats',
  },
]
  .map((c) => JSON.stringify(c))
  .join('\n');

type MockDb = Parameters<typeof collectVercelUsage>[0] & { executed: unknown[][] };

function makeDb(opts: { planId?: string } = {}): MockDb {
  const executed: unknown[][] = [];
  // key -> { orgId, costCents }
  const stored = new Map<string, { orgId: string; costCents: number }>();
  const db = {
    $executeRawUnsafe: vi.fn(async (...args: unknown[]) => {
      executed.push(args);
      const sql = String(args[0]);
      if (sql.includes('usage_records')) {
        const key = `${args[3]}|${args[4]}|${args[5]}|${String(args[9])}`;
        stored.set(key, { orgId: String(args[2]), costCents: Number(args[8]) || 0 });
      }
      return 0;
    }),
    $queryRawUnsafe: vi.fn(async (sql: string, ...params: unknown[]) => {
      if (sql.includes('FROM organizations')) return [{ id: 'org_operator' }];
      if (sql.includes('FROM tenants')) {
        return [
          {
            organization_id: 'org_a',
            slug: 'acme',
            vercel_project_id: 'prj_a',
            metadata: {},
          },
          {
            organization_id: 'org_b',
            slug: 'beta',
            vercel_project_id: 'prj_b1',
            metadata: {
              config: {
                appPack: {
                  apps: [{ appId: 'sales', vercelProjectId: 'prj_b2' }],
                },
              },
            },
          },
        ];
      }
      if (sql.includes('FROM subscriptions')) {
        return [{ plan_id: opts.planId ?? 'free' }];
      }
      if (sql.includes('SUM(cost_cents)')) {
        const orgId = String(params[0]);
        let total = 0;
        for (const row of stored.values()) {
          if (row.orgId === orgId) total += row.costCents;
        }
        return [{ total }];
      }
      if (sql.includes('FROM usage_records') && sql.includes('cost_cents')) {
        const key = `${params[0]}|${params[1]}|${params[2]}|${String(params[3])}`;
        const row = stored.get(key);
        return row === undefined ? [] : [{ cost_cents: row.costCents }];
      }
      return [];
    }),
  } as unknown as MockDb;
  db.executed = executed;
  return db;
}

function stubFetch(handler: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(handler));
}

function orgEntry(
  orgId: string,
  projects: Array<{ projectId: string; tenantSlug: string; appId: string | null }>,
): OrgAttribution {
  return {
    orgId,
    projectIds: projects.map((p) => p.projectId),
    tenantSlugs: [...new Set(projects.map((p) => p.tenantSlug))],
    branchNames: [...new Set(projects.map((p) => neonBranchNameForSlug(p.tenantSlug)))],
    projects,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('allocateByWeights', () => {
  it('splits cents so shares sum exactly to total', () => {
    const shares = allocateByWeights(100, [1, 1, 1]);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(100);
    expect(shares).toEqual([34, 33, 33]);
  });

  it('gives zero when total or weights are empty', () => {
    expect(allocateByWeights(50, [])).toEqual([]);
    expect(allocateByWeights(0, [1, 2])).toEqual([0, 0]);
  });
});

describe('allocateQuantityByWeights', () => {
  it('preserves the total across shares', () => {
    const shares = allocateQuantityByWeights(10, [1, 1]);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(10);
  });
});

describe('allocateVercelAggregates', () => {
  it('splits team totals by project count and residual goes to operator', () => {
    const attribution: AttributionMap = new Map([
      ['org_a', orgEntry('org_a', [{ projectId: 'prj_a', tenantSlug: 'acme', appId: null }])],
      [
        'org_b',
        orgEntry('org_b', [
          { projectId: 'prj_b1', tenantSlug: 'beta', appId: null },
          { projectId: 'prj_b2', tenantSlug: 'beta', appId: 'sales' },
        ]),
      ],
    ]);
    const { aggregated } = aggregateVercelFocusCharges(FOCUS_SAMPLE);
    const rows = allocateVercelAggregates(aggregated, attribution, 'org_operator');

    const buildRows = rows.filter((r) => r.resource === 'build_cpu_minutes');
    const costSum = buildRows.reduce((n, r) => n + (r.costCents ?? 0), 0);
    expect(costSum).toBe(1016);

    const orgA = buildRows.filter((r) => r.orgId === 'org_a');
    const orgB = buildRows.filter((r) => r.orgId === 'org_b');
    // 1 of 3 projects → ~1/3; 2 of 3 → ~2/3
    const costA = orgA.reduce((n, r) => n + (r.costCents ?? 0), 0);
    const costB = orgB.reduce((n, r) => n + (r.costCents ?? 0), 0);
    expect(costA).toBe(339); // floor share of 1016/3 with remainder allocation
    expect(costB).toBe(677);
    expect(orgB.some((r) => r.appId === 'sales')).toBe(true);
  });

  it('assigns everything to operator when nothing is attributed', () => {
    const { aggregated } = aggregateVercelFocusCharges(FOCUS_SAMPLE);
    const rows = allocateVercelAggregates(aggregated, new Map(), 'org_operator');
    expect(rows.every((r) => r.orgId === 'org_operator')).toBe(true);
    expect(rows.every((r) => r.tenantSlug === 'platform')).toBe(true);
  });
});

describe('allocateNeonProjectUsage', () => {
  it('splits Free-plan totals by matching tenant-* branches; unmatched → operator', () => {
    const attribution: AttributionMap = new Map([
      ['org_a', orgEntry('org_a', [{ projectId: 'prj_a', tenantSlug: 'acme', appId: null }])],
    ]);
    const rows = allocateNeonProjectUsage(
      {
        projectId: 'neon_proj',
        computeCuHours: 30,
        transferGb: 3,
        storageGb: 0,
        periodStart: new Date('2026-08-01T00:00:00Z'),
        periodEnd: new Date('2026-08-15T00:00:00Z'),
        costByResource: { db_compute: 0, bandwidth: 0, db_storage: 0 },
      },
      ['tenant-acme', 'tenant-unknown', 'main'],
      attribution,
      'org_operator',
    );
    const compute = rows.filter((r) => r.resource === 'db_compute');
    const orgA = compute.find((r) => r.orgId === 'org_a');
    const residual = compute.find((r) => r.orgId === 'org_operator');
    expect(orgA?.quantity).toBeCloseTo(15);
    expect(residual?.quantity).toBeCloseTo(15);
  });
});

describe('collectVercelUsage', () => {
  it('maps FOCUS charges and allocates onto orgs', async () => {
    stubFetch(async () => new Response(FOCUS_SAMPLE));
    const db = makeDb();
    const attribution: AttributionMap = new Map([
      ['org_a', orgEntry('org_a', [{ projectId: 'prj_a', tenantSlug: 'acme', appId: null }])],
    ]);
    const { rows, costCents } = await collectVercelUsage(db, 'org_operator', {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
    }, attribution);

    expect(costCents).toBe(1016 + 2);
    expect(rows.some((r) => r.orgId === 'org_a')).toBe(true);
    expect(rows.find((r) => r.resource === 'function_invocations')?.quantity).toBeGreaterThan(0);
  });

  it('skips unmapped services and subscription licenses', async () => {
    stubFetch(async () => new Response(FOCUS_SAMPLE));
    const db = makeDb();
    const { rows } = await collectVercelUsage(db, 'org_operator', {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
    }, new Map());
    expect(rows.some((r) => r.resource === 'edge_requests')).toBe(false);
    expect(rows.some((r) => r.resource === 'pro')).toBe(false);
  });

  it('returns no rows when credentials are absent', async () => {
    const db = makeDb();
    const { rows, costCents } = await collectVercelUsage(db, 'org_operator', {}, new Map());
    expect(rows).toHaveLength(0);
    expect(costCents).toBe(0);
  });

  it('upserts with ON CONFLICT on the tenant/app/resource/period key', async () => {
    stubFetch(async () => new Response(FOCUS_SAMPLE));
    const db = makeDb();
    await collectVercelUsage(
      db,
      'org_operator',
      { vercelToken: 'tok', vercelTeamId: 'team_x' },
      new Map(),
    );
    const sql = String(db.executed[0]?.[0]);
    expect(sql).toContain('ON CONFLICT (tenant_slug, app_id, resource, period_start)');
    expect(sql).toContain('DO UPDATE SET');
  });

  it('aggregates multiple FOCUS lines per (resource, day) into one team total before split', async () => {
    const multi = [
      {
        ChargePeriodStart: '2026-08-15T07:00:00.000Z',
        ChargePeriodEnd: '2026-08-16T07:00:00.000Z',
        ChargeCategory: 'Usage',
        BilledCost: 0.5,
        ServiceName: 'Build CPU Minutes',
        ConsumedQuantity: 100,
        ConsumedUnit: 'minute',
      },
      {
        ChargePeriodStart: '2026-08-15T07:00:00.000Z',
        ChargePeriodEnd: '2026-08-16T07:00:00.000Z',
        ChargeCategory: 'Usage',
        BilledCost: 0.3,
        ServiceName: 'Build CPU Minutes',
        ConsumedQuantity: 60,
        ConsumedUnit: 'minute',
      },
      {
        ChargePeriodStart: '2026-08-16T07:00:00.000Z',
        ChargePeriodEnd: '2026-08-17T07:00:00.000Z',
        ChargeCategory: 'Usage',
        BilledCost: 0.2,
        ServiceName: 'Build CPU Minutes',
        ConsumedQuantity: 40,
        ConsumedUnit: 'minute',
      },
    ]
      .map((c) => JSON.stringify(c))
      .join('\n');
    stubFetch(async () => new Response(multi));
    const db = makeDb();
    const { costCents } = await collectVercelUsage(
      db,
      'org_operator',
      { vercelToken: 'tok', vercelTeamId: 'team_x' },
      new Map(),
    );
    expect(costCents).toBe(100);
  });
});

describe('collectNeonUsage', () => {
  const NEON_PROJECT = {
    project: {
      id: 'cold-queen-31708292',
      compute_time_seconds: 91558,
      data_transfer_bytes: 1454840526,
      data_storage_bytes_hour: 0,
      consumption_period_start: '2026-08-01T00:00:00Z',
    },
  };

  it('converts Neon Free-plan usage into CU-hr and GB rows at zero cost', async () => {
    stubFetch(async (url) => {
      if (url.includes('consumption_history')) return new Response('nope', { status: 404 });
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [{ id: 'cold-queen-31708292' }] }));
      }
      if (url.includes('/branches')) {
        return new Response(JSON.stringify({ branches: [{ name: 'main' }] }));
      }
      return new Response(JSON.stringify(NEON_PROJECT));
    });
    const db = makeDb();
    const { rows, costCents } = await collectNeonUsage(
      db,
      'org_operator',
      { neonApiKey: 'key', neonOrgId: 'org-neon' },
      new Map(),
    );

    expect(costCents).toBe(0);
    const compute = rows.find((r) => r.resource === 'db_compute');
    expect(compute?.quantity).toBeCloseTo(91558 / 3600, 5);
    expect(compute?.orgId).toBe('org_operator');
  });
});

describe('resolveOperatorOrgId', () => {
  it('prefers the explicit env override', async () => {
    const db = makeDb();
    expect(await resolveOperatorOrgId(db, { operatorOrgId: 'org_explicit' })).toBe('org_explicit');
  });

  it('falls back to the default org', async () => {
    const db = makeDb();
    expect(await resolveOperatorOrgId(db, {})).toBe('org_operator');
  });
});

describe('runCloudUsageCollection', () => {
  it('debits orgs only for overage past included allowance', async () => {
    stubFetch(async (url) => {
      if (url.includes('api.vercel.com')) return new Response(FOCUS_SAMPLE);
      if (url.includes('consumption_history')) return new Response('nope', { status: 404 });
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [] }));
      }
      if (url.includes('/branches')) {
        return new Response(JSON.stringify({ branches: [] }));
      }
      return new Response(JSON.stringify({ project: {} }));
    });
    // Free plan included = 500¢; FOCUS sample is 1018¢ so overage debits.
    const db = makeDb({ planId: 'free' });
    const summary = await runCloudUsageCollection(db, {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
      neonApiKey: 'key',
      neonOrgId: 'org-neon',
    });

    expect(summary.operatorOrgId).toBe('org_operator');
    expect(summary.attributedProjects).toBe(3); // prj_a + prj_b1 + prj_b2
    expect(summary.debitedCents).toBeGreaterThan(0);
    const debit = db.executed.find((args) => String(args[0]).includes('cloud_balances'));
    expect(debit).toBeDefined();
  });

  it('debits only the overage delta on re-runs over the same period', async () => {
    stubFetch(async (url) => {
      if (url.includes('api.vercel.com')) return new Response(FOCUS_SAMPLE);
      if (url.includes('consumption_history')) return new Response('nope', { status: 404 });
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [] }));
      }
      if (url.includes('/branches')) {
        return new Response(JSON.stringify({ branches: [] }));
      }
      return new Response(JSON.stringify({ project: {} }));
    });
    const db = makeDb({ planId: 'free' });
    const env = {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
      neonApiKey: 'key',
      neonOrgId: 'org-neon',
    };

    const first = await runCloudUsageCollection(db, env);
    expect(first.debitedCents).toBeGreaterThan(0);

    const second = await runCloudUsageCollection(db, env);
    expect(second.debitedCents).toBe(0);
  });
});
