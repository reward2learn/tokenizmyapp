import { describe, expect, it, vi } from 'vitest';
import { getCloudUsage } from '@/domain/billing/cloud-usage-service';
import { CLOUD_INCLUDED_BASE_CENTS, includedCentsForPlan } from '@/domain/billing/cloud-allowance';

/**
 * Honesty contract: uncollected resources stay "not_collected"; plan included
 * pool drives overage; awaitingCollector clears once this org has collector rows.
 */
function makeDb(
  opts: {
    usage?: Record<string, { quantity: number; costCents?: number }>;
    ledgerSpend?: number;
    planId?: string;
    balanceCents?: number;
  } = {},
) {
  return {
    $queryRawUnsafe: vi.fn(async (sql: string) => {
      if (sql.includes('FROM usage_records')) {
        return Object.entries(opts.usage ?? {}).map(([resource, v]) => ({
          resource,
          unit: 'units',
          quantity: v.quantity,
          cost_cents: v.costCents ?? 0,
        }));
      }
      if (sql.includes('FROM credit_ledger')) {
        return [{ spent: opts.ledgerSpend ?? 0 }];
      }
      if (sql.includes('FROM cloud_balances')) {
        return [
          {
            balance_cents: opts.balanceCents ?? 0,
            auto_top_up_threshold: null,
            auto_top_up_amount: null,
          },
        ];
      }
      if (sql.includes('FROM subscriptions')) {
        return [{ plan_id: opts.planId ?? 'free' }];
      }
      return [];
    }),
    $executeRawUnsafe: vi.fn(async () => 0),
  } as unknown as Parameters<typeof getCloudUsage>[1];
}

describe('includedCentsForPlan', () => {
  it('multiplies the Free base by cloudMultiplier', () => {
    expect(includedCentsForPlan('free')).toBe(CLOUD_INCLUDED_BASE_CENTS);
    expect(includedCentsForPlan('pro')).toBe(CLOUD_INCLUDED_BASE_CENTS * 20);
  });
});

describe('getCloudUsage', () => {
  it('reports uncollected resources as not metered, never as zero', async () => {
    const report = await getCloudUsage('org_1', makeDb());
    const storage = report.resources.find((r) => r.resource === 'db_storage');
    expect(storage?.state).toBe('not_collected');
    expect(report.awaitingCollector).toBe(true);
  });

  it('populates AI Gateway from the credit ledger, which Phase 3 already meters', async () => {
    const report = await getCloudUsage('org_1', makeDb({ ledgerSpend: 42 }));
    const gateway = report.resources.find((r) => r.resource === 'ai_gateway');
    expect(gateway?.state).toBe('metered');
    expect(gateway?.used).toBe(42);
  });

  it('keeps AI Gateway metered at zero spend, but still flags the collector', async () => {
    const report = await getCloudUsage('org_1', makeDb({ ledgerSpend: 0 }));
    expect(report.resources.find((r) => r.resource === 'ai_gateway')?.state).toBe('metered');
    expect(report.awaitingCollector).toBe(true);
  });

  it('sums collected usage and clears awaitingCollector for this org', async () => {
    const report = await getCloudUsage(
      'org_1',
      makeDb({ usage: { bandwidth: { quantity: 12.5, costCents: 100 } } }),
    );
    const egress = report.resources.find((r) => r.resource === 'bandwidth');
    expect(egress?.state).toBe('metered');
    expect(egress?.used).toBe(12.5);
    expect(report.awaitingCollector).toBe(false);
  });

  it('sets included pool from the plan and computes overage', async () => {
    const report = await getCloudUsage(
      'org_1',
      makeDb({
        planId: 'free',
        usage: {
          build_cpu_minutes: { quantity: 100, costCents: 800 },
        },
      }),
    );
    expect(report.includedCostCents).toBe(CLOUD_INCLUDED_BASE_CENTS);
    expect(report.usedCostCents).toBe(800);
    expect(report.additionalCostCents).toBe(800 - CLOUD_INCLUDED_BASE_CENTS);
    const build = report.resources.find((r) => r.resource === 'build_cpu_minutes');
    expect(build?.additionalCostCents).toBe(800 - CLOUD_INCLUDED_BASE_CENTS);
  });

  it('survives a database that has never seen the usage table', async () => {
    const db = {
      $queryRawUnsafe: vi.fn(async (sql: string) => {
        if (sql.includes('FROM usage_records')) throw new Error('relation does not exist');
        if (sql.includes('FROM subscriptions')) return [{ plan_id: 'free' }];
        return [];
      }),
      $executeRawUnsafe: vi.fn(async () => 0),
    } as unknown as Parameters<typeof getCloudUsage>[1];

    const report = await getCloudUsage('org_1', db);
    expect(report.awaitingCollector).toBe(true);
    expect(report.includedCostCents).toBe(CLOUD_INCLUDED_BASE_CENTS);
  });
});
