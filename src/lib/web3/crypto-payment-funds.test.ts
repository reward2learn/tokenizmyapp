import { describe, expect, it } from 'vitest';
import {
  evaluatePaymentFunds,
  FALLBACK_GAS_WEI,
  formatUsdcAtomic,
  isTreasurySameAsWallet,
} from '@/lib/web3/crypto-payment-funds';
import { normalizeChainId } from '@/lib/web3/normalize-chain-id';

describe('normalizeChainId', () => {
  it('parses CAIP-2 eip155 ids used by AppKit', () => {
    expect(normalizeChainId('eip155:8453')).toBe(8453);
    expect(normalizeChainId('EIP155:11155111')).toBe(11_155_111);
  });

  it('accepts numeric ids', () => {
    expect(normalizeChainId(8453)).toBe(8453);
    expect(normalizeChainId(8453n)).toBe(8453);
  });

  it('rejects garbage', () => {
    expect(normalizeChainId('base')).toBeNull();
    expect(normalizeChainId('8453abc')).toBeNull();
    expect(normalizeChainId(null)).toBeNull();
  });
});

describe('evaluatePaymentFunds', () => {
  it('allows pay when USDC covers the required amount', () => {
    const result = evaluatePaymentFunds({
      usdcBalance: 25_000_000n,
      nativeBalance: FALLBACK_GAS_WEI,
      requiredUsdc: 25_000_000n,
      estimatedGasWei: FALLBACK_GAS_WEI,
    });
    expect(result.canPay).toBe(true);
    expect(result.status).toBe('ready');
    expect(result.usdcShortfall).toBe(0n);
  });

  it('blocks when USDC is short', () => {
    const result = evaluatePaymentFunds({
      usdcBalance: 1_000_000n,
      nativeBalance: FALLBACK_GAS_WEI,
      requiredUsdc: 25_000_000n,
      estimatedGasWei: FALLBACK_GAS_WEI,
    });
    expect(result.canPay).toBe(false);
    expect(result.status).toBe('insufficient_usdc');
    expect(result.usdcShortfall).toBe(24_000_000n);
  });

  it('does not block on low gas by default (sponsored social wallets)', () => {
    const result = evaluatePaymentFunds({
      usdcBalance: 25_000_000n,
      nativeBalance: 0n,
      requiredUsdc: 25_000_000n,
      estimatedGasWei: FALLBACK_GAS_WEI,
    });
    expect(result.canPay).toBe(true);
    expect(result.status).toBe('ready');
    expect(result.gasShortfall).toBe(FALLBACK_GAS_WEI);
  });

  it('blocks on low gas when requireNativeGas is set', () => {
    const result = evaluatePaymentFunds({
      usdcBalance: 25_000_000n,
      nativeBalance: 0n,
      requiredUsdc: 25_000_000n,
      estimatedGasWei: FALLBACK_GAS_WEI,
      requireNativeGas: true,
    });
    expect(result.canPay).toBe(false);
    expect(result.status).toBe('insufficient_gas');
  });
});

describe('formatUsdcAtomic', () => {
  it('formats 6-decimal USDC', () => {
    expect(formatUsdcAtomic(25_000_000n)).toBe('25.00');
  });
});

describe('isTreasurySameAsWallet', () => {
  it('detects misconfigured treasury = payer', () => {
    expect(
      isTreasurySameAsWallet(
        '0xAEd5d9f6A4eC4E8aA6a4f3976Fc5C205BcFa0070',
        '0xaed5d9f6a4ec4e8aa6a4f3976fc5c205bcfa0070',
      ),
    ).toBe(true);
    expect(
      isTreasurySameAsWallet(
        '0x0000000000000000000000000000000000000abc',
        '0xaed5d9f6a4ec4e8aa6a4f3976fc5c205bcfa0070',
      ),
    ).toBe(false);
  });
});
