import { describe, expect, it, vi } from 'vitest';
import { getCloudUsage } from '@/domain/billing/cloud-usage-service';

/**
 * The distinction under test is the whole reason this service exists: a
 * resource nobody is counting must not report zero. Deployed apps consume real
 * Vercel and Neon capacity on our accounts, so "0 GB" would tell an operator
 * something false, while "not metered" tells them the truth.
 */
function makeDb(opts: { usage?: Record<string, number>; ledgerSpend?: number } = {}) {
  return {
    $queryRawUnsafe: vi.fn(async (sql: string) => {
      if (sql.includes('FROM usage_records')) {
        return Object.entries(opts.usage ?? {}).map(([resource, quantity]) => ({
          resource,
          unit: 'units',
          quantity,
        }));
      }
      if (sql.includes('FROM credit_ledger')) {
        return [{ spent: opts.ledgerSpend ?? 0 }];
      }
      if (sql.includes('FROM cloud_balances')) return [{ balance_cents: 0 }];
      return [];
    }),
    $executeRawUnsafe: vi.fn(async () => 0),
  } as unknown as Parameters<typeof getCloudUsage>[1];
}

describe('getCloudUsage', () => {
  it('reports uncollected resources as not metered, never as zero', async () => {
    const report = await getCloudUsage('org_1', makeDb());
    const storage = report.resources.find((r) => r.resource === 'db_storage');
    expect(storage?.state).toBe('not_collected');
    expect(report.awaitingCollector).toBe(true);
  });

  it('populates AI Gateway from the credit ledger, which Phase 3 already meters', async () => {
    // The one resource we genuinely measure today. Reporting it as uncollected
    // alongside the others would understate what is actually known.
    const report = await getCloudUsage('org_1', makeDb({ ledgerSpend: 42 }));
    const gateway = report.resources.find((r) => r.resource === 'ai_gateway');
    expect(gateway?.state).toBe('metered');
    expect(gateway?.used).toBe(42);
  });

  it('keeps AI Gateway metered at zero spend, but still flags the collector', async () => {
    // Zero generations is a true zero, unlike an uncounted provider resource.
    // The two must not be conflated: AI Gateway being metered cannot be allowed
    // to suppress the warning that nothing else is.
    const report = await getCloudUsage('org_1', makeDb({ ledgerSpend: 0 }));
    expect(report.resources.find((r) => r.resource === 'ai_gateway')?.state).toBe('metered');
    expect(report.awaitingCollector).toBe(true);
  });

  it('sums collected usage per resource once a collector writes', async () => {
    const report = await getCloudUsage('org_1', makeDb({ usage: { bandwidth: 12.5 } }));
    const egress = report.resources.find((r) => r.resource === 'bandwidth');
    expect(egress?.state).toBe('metered');
    expect(egress?.used).toBe(12.5);
  });

  it('leaves every allowance unset rather than inventing one', async () => {
    // No rate card and no plan allowance has been decided. Printing 0 would be
    // a pricing claim nobody made.
    const report = await getCloudUsage('org_1', makeDb({ ledgerSpend: 5 }));
    expect(report.resources.every((r) => r.included === null)).toBe(true);
    expect(report.resources.every((r) => r.additionalCostCents === 0)).toBe(true);
  });

  it('survives a database that has never seen the usage table', async () => {
    // A deployment that predates this release. An empty report is the truth
    // there; throwing would blank the whole billing panel.
    const db = {
      $queryRawUnsafe: vi.fn(async (sql: string) => {
        if (sql.includes('FROM usage_records')) throw new Error('relation does not exist');
        return [];
      }),
      $executeRawUnsafe: vi.fn(async () => 0),
    } as unknown as Parameters<typeof getCloudUsage>[1];

    const report = await getCloudUsage('org_1', db);
    expect(report.awaitingCollector).toBe(true);
  });
});
