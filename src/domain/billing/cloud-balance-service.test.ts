import { describe, expect, it, vi } from 'vitest';
import { creditCloudBalance } from '@/domain/billing/cloud-balance-service';

function makeDb() {
  const refs = new Set<string>();
  let balance = 0;
  return {
    balance: () => balance,
    $executeRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('CREATE TABLE')) return 0;
      if (sql.includes('cloud_topup_refs') && sql.includes('INSERT')) {
        refs.add(String(args[0]));
        return 0;
      }
      if (sql.includes('cloud_balances')) {
        balance += Number(args[2]) || 0;
        return 0;
      }
      return 0;
    }),
    $queryRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      if (sql.includes('cloud_topup_refs')) {
        return refs.has(String(args[0])) ? [{ payment_ref: args[0] }] : [];
      }
      if (sql.includes('cloud_balances')) {
        return [{ balance_cents: balance, auto_top_up_threshold: null, auto_top_up_amount: null }];
      }
      return [];
    }),
  } as unknown as Parameters<typeof creditCloudBalance>[3] & { balance: () => number };
}

describe('creditCloudBalance', () => {
  it('credits once and is idempotent on paymentRef', async () => {
    const db = makeDb();
    const first = await creditCloudBalance('org_1', 2500, 'cs_1', db);
    expect(first.alreadyCredited).toBe(false);
    expect(first.balanceCents).toBe(2500);

    const second = await creditCloudBalance('org_1', 2500, 'cs_1', db);
    expect(second.alreadyCredited).toBe(true);
    expect(second.balanceCents).toBe(2500);
  });

  it('rejects non-positive amounts', async () => {
    const db = makeDb();
    await expect(creditCloudBalance('org_1', 0, 'cs_x', db)).rejects.toThrow(/positive/);
  });
});
