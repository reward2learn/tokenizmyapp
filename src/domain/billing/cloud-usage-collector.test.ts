import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  collectNeonUsage,
  collectVercelUsage,
  resolveOperatorOrgId,
  runCloudUsageCollection,
} from '@/domain/billing/cloud-usage-collector';

/**
 * The collector's contract: real provider payloads reduce to usage rows that
 * upsert idempotently, and the operator org's cloud balance is debited by the
 * billed cost. The FOCUS sample below is a trimmed copy of a live response.
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
].map((c) => JSON.stringify(c)).join('\n');

type MockDb = Parameters<typeof collectVercelUsage>[0] & { executed: unknown[][] };

function makeDb(): MockDb {
  const executed: unknown[][] = [];
  // Simulates the usage_records table: key -> stored cost_cents.
  const stored = new Map<string, number>();
  const db = {
    $executeRawUnsafe: vi.fn(async (...args: unknown[]) => {
      executed.push(args);
      // args: [sql, id, orgId, tenantSlug, appId, resource, unit, quantity, costCents, periodStart, periodEnd]
      const key = `${args[3]}|${args[4]}|${args[5]}|${String(args[9])}`;
      stored.set(key, Number(args[8]) || 0);
      return 0;
    }),
    $queryRawUnsafe: vi.fn(async (sql: string, ...params: unknown[]) => {
      if (sql.includes('FROM organizations')) return [{ id: 'org_operator' }];
      if (sql.includes('FROM usage_records')) {
        const key = `${params[0]}|${params[1]}|${params[2]}|${String(params[3])}`;
        const cents = stored.get(key);
        return cents === undefined ? [] : [{ cost_cents: cents }];
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('collectVercelUsage', () => {
  it('maps FOCUS charges to usage rows with billed cost in cents', async () => {
    stubFetch(async () => new Response(FOCUS_SAMPLE));
    const db = makeDb();
    const { rows, costCents } = await collectVercelUsage(db, 'org_1', {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
    });

    expect(costCents).toBe(1016 + 2); // $10.164 + $0.0189
    expect(rows).toHaveLength(2);
    const invocations = rows.find((r) => r.resource === 'function_invocations');
    expect(invocations?.quantity).toBe(31514);
    expect(invocations?.costCents).toBe(2);
    expect(invocations?.appId).toBe('vercel');
    const build = rows.find((r) => r.resource === 'build_cpu_minutes');
    expect(build?.quantity).toBe(2904);
    expect(build?.costCents).toBe(1016);
  });

  it('skips unmapped services and subscription licenses', async () => {
    stubFetch(async () => new Response(FOCUS_SAMPLE));
    const db = makeDb();
    const { rows } = await collectVercelUsage(db, 'org_1', {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
    });
    // Edge Requests (unmapped) and Pro (subscription) must not appear.
    expect(rows.some((r) => r.resource === 'edge_requests')).toBe(false);
    expect(rows.some((r) => r.resource === 'pro')).toBe(false);
  });

  it('returns no rows when credentials are absent', async () => {
    const db = makeDb();
    const { rows, costCents } = await collectVercelUsage(db, 'org_1', {});
    expect(rows).toHaveLength(0);
    expect(costCents).toBe(0);
  });

  it('upserts with ON CONFLICT on the tenant/app/resource/period key', async () => {
    stubFetch(async () => new Response(FOCUS_SAMPLE));
    const db = makeDb();
    await collectVercelUsage(db, 'org_1', { vercelToken: 'tok', vercelTeamId: 'team_x' });
    const sql = String(db.executed[0]?.[0]);
    expect(sql).toContain('ON CONFLICT (tenant_slug, app_id, resource, period_start)');
    expect(sql).toContain('DO UPDATE SET');
  });

  it('aggregates multiple FOCUS lines per (resource, day) into one row', async () => {
    const multi = [
      { ChargePeriodStart: '2026-08-15T07:00:00.000Z', ChargePeriodEnd: '2026-08-16T07:00:00.000Z', ChargeCategory: 'Usage', BilledCost: 0.5, ServiceName: 'Build CPU Minutes', ConsumedQuantity: 100, ConsumedUnit: 'minute' },
      { ChargePeriodStart: '2026-08-15T07:00:00.000Z', ChargePeriodEnd: '2026-08-16T07:00:00.000Z', ChargeCategory: 'Usage', BilledCost: 0.3, ServiceName: 'Build CPU Minutes', ConsumedQuantity: 60, ConsumedUnit: 'minute' },
      { ChargePeriodStart: '2026-08-16T07:00:00.000Z', ChargePeriodEnd: '2026-08-17T07:00:00.000Z', ChargeCategory: 'Usage', BilledCost: 0.2, ServiceName: 'Build CPU Minutes', ConsumedQuantity: 40, ConsumedUnit: 'minute' },
    ].map((c) => JSON.stringify(c)).join('\n');
    stubFetch(async () => new Response(multi));
    const db = makeDb();
    const { rows, costCents } = await collectVercelUsage(db, 'org_1', {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
    });

    expect(costCents).toBe(100); // $0.50 + $0.30 + $0.20
    expect(rows).toHaveLength(2); // one row per day, not per line
    const day1 = rows.find((r) => r.periodStart.toISOString() === '2026-08-15T07:00:00.000Z');
    expect(day1?.quantity).toBe(160);
    expect(day1?.costCents).toBe(80);
    const day2 = rows.find((r) => r.periodStart.toISOString() === '2026-08-16T07:00:00.000Z');
    expect(day2?.quantity).toBe(40);
    expect(day2?.costCents).toBe(20);
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
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [{ id: 'cold-queen-31708292' }] }));
      }
      return new Response(JSON.stringify(NEON_PROJECT));
    });
    const db = makeDb();
    const { rows, costCents } = await collectNeonUsage(db, 'org_1', {
      neonApiKey: 'key',
      neonOrgId: 'org-neon',
    });

    expect(costCents).toBe(0); // Free plan carries no costs
    const compute = rows.find((r) => r.resource === 'db_compute');
    expect(compute?.quantity).toBeCloseTo(91558 / 3600, 5);
    expect(compute?.unit).toBe('CU-hr');
    const transfer = rows.find((r) => r.resource === 'bandwidth');
    expect(transfer?.quantity).toBeCloseTo(1.454840526, 5);
    expect(transfer?.unit).toBe('GB');
    expect(rows.every((r) => r.costCents === 0)).toBe(true);
  });

  it('skips projects that error or carry no period start', async () => {
    stubFetch(async (url) => {
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [{ id: 'ok' }, { id: 'broken' }] }));
      }
      if (url.endsWith('/projects/ok')) {
        return new Response(JSON.stringify(NEON_PROJECT));
      }
      return new Response('nope', { status: 404 });
    });
    const db = makeDb();
    const { rows } = await collectNeonUsage(db, 'org_1', {
      neonApiKey: 'key',
      neonOrgId: 'org-neon',
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.appId === 'ok')).toBe(true);
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
  it('debites the operator org by the total billed cost', async () => {
    stubFetch(async (url) => {
      if (url.includes('api.vercel.com')) return new Response(FOCUS_SAMPLE);
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [] }));
      }
      return new Response(JSON.stringify({ project: {} }));
    });
    const db = makeDb();
    const summary = await runCloudUsageCollection(db, {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
      neonApiKey: 'key',
      neonOrgId: 'org-neon',
    });

    expect(summary.operatorOrgId).toBe('org_operator');
    expect(summary.debitedCents).toBe(1018);
    const debit = db.executed.find((args) => String(args[0]).includes('cloud_balances'));
    expect(debit).toBeDefined();
    expect(debit?.[2]).toBe('org_operator');
    expect(debit?.[3]).toBe(1018);
  });

  it('debits only the delta on re-runs over the same period', async () => {
    stubFetch(async (url) => {
      if (url.includes('api.vercel.com')) return new Response(FOCUS_SAMPLE);
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [] }));
      }
      return new Response(JSON.stringify({ project: {} }));
    });
    const db = makeDb();
    const env = {
      vercelToken: 'tok',
      vercelTeamId: 'team_x',
      neonApiKey: 'key',
      neonOrgId: 'org-neon',
    };

    // First run: nothing stored yet -> full billed cost is debited.
    const first = await runCloudUsageCollection(db, env);
    expect(first.debitedCents).toBe(1018);

    // Second run with the same payload: rows exist with identical cost ->
    // the delta is zero and the balance is not charged twice.
    const second = await runCloudUsageCollection(db, env);
    expect(second.debitedCents).toBe(0);

    // A corrected payload (higher cost) debits only the difference.
    const corrected = FOCUS_SAMPLE.replace('10.164', '10.364');
    stubFetch(async (url) => {
      if (url.includes('api.vercel.com')) return new Response(corrected);
      if (url.includes('/projects?org_id=')) {
        return new Response(JSON.stringify({ projects: [] }));
      }
      return new Response(JSON.stringify({ project: {} }));
    });
    const third = await runCloudUsageCollection(db, env);
    expect(third.debitedCents).toBe(20); // only the $0.20 increase
  });
});
