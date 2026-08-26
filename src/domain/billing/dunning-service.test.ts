import { describe, expect, it, vi } from 'vitest';
import {
  ensureDunningTables,
  formatCountdown,
  DUNNING_MAX_ATTEMPTS,
  DUNNING_MAX_NOTICES,
} from '@/domain/billing/dunning-service';

describe('formatCountdown', () => {
  it('formats days hours and minutes', () => {
    const ms = ((2 * 24 + 3) * 60 + 15) * 60_000;
    expect(formatCountdown(ms)).toBe('2d:03h:15m');
  });

  it('clamps negative remaining to zero', () => {
    expect(formatCountdown(-1)).toBe('0d:00h:00m');
  });
});

describe('dunning constants', () => {
  it('matches the product policy of 3 attempts and 3 notices', () => {
    expect(DUNNING_MAX_ATTEMPTS).toBe(3);
    expect(DUNNING_MAX_NOTICES).toBe(3);
  });
});

describe('ensureDunningTables', () => {
  it('runs one DDL statement per executeRawUnsafe call', async () => {
    const executeRawUnsafe = vi.fn().mockResolvedValue(0);
    await ensureDunningTables({
      $executeRawUnsafe: executeRawUnsafe,
      $queryRawUnsafe: vi.fn(),
    } as never);

    expect(executeRawUnsafe).toHaveBeenCalledTimes(3);
    for (const [sql] of executeRawUnsafe.mock.calls) {
      expect(String(sql).split(';').filter((s) => s.trim()).length).toBeLessThanOrEqual(1);
    }
  });
});
