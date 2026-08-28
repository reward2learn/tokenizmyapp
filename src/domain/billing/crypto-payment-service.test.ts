import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usdcAmountFromCents } from '@/lib/web3/crypto-billing-config';

describe('usdcAmountFromCents', () => {
  it('converts USD cents to 6-decimal USDC atomic units', () => {
    expect(usdcAmountFromCents(2500)).toBe(25_000_000n);
    expect(usdcAmountFromCents(5000)).toBe(50_000_000n);
    expect(usdcAmountFromCents(10000)).toBe(100_000_000n);
  });

  it('rejects invalid amounts', () => {
    expect(() => usdcAmountFromCents(0)).toThrow();
    expect(() => usdcAmountFromCents(-100)).toThrow();
  });
});

describe('verifyUsdcTransfer', () => {
  beforeEach(() => {
    vi.stubEnv('CRYPTO_TREASURY_ADDRESS', '0x0000000000000000000000000000000000000abc');
    vi.stubEnv('CRYPTO_PAYMENTS_ENABLED', 'true');
  });

  it('finds a matching Transfer log', async () => {
    const { verifyUsdcTransfer } = await import('@/domain/billing/crypto-payment-service');

    const treasury = '0x0000000000000000000000000000000000000abc';
    const from = '0x1111111111111111111111111111111111111111';
    const amount = 25_000_000n;
    const usdcContract = '0x1c7D4B196Cb0C7B01d743Fcb1Fa41d66781d0590';

    const mockClient = {
      getTransactionReceipt: vi.fn(async () => ({
        status: 'success',
        logs: [
          {
            address: usdcContract,
            data: '0x00000000000000000000000000000000000000000000000000000000017d7840',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x0000000000000000000000001111111111111111111111111111111111111111',
              '0x0000000000000000000000000000000000000000000000000000000000000abc',
            ],
            logIndex: 2,
          },
        ],
      })),
    };

    const result = await verifyUsdcTransfer(
      11_155_111,
      '0x' + 'a'.repeat(64),
      { from, to: treasury, amount, usdcContract },
      mockClient as never,
    );

    expect(result.from).toBe(from.toLowerCase());
    expect(result.to).toBe(treasury.toLowerCase());
    expect(result.value).toBe(amount);
    expect(result.logIndex).toBe(2);
  });
});
