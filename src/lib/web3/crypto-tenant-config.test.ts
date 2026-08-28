import { describe, expect, it } from 'vitest';
import {
  buildCryptoPaymentEnvVars,
  isValidTreasuryAddress,
  normalizeTreasuryAddress,
  readTenantCryptoConfig,
} from '@/lib/web3/crypto-tenant-config';

describe('crypto-tenant-config', () => {
  it('reads disabled defaults when unset', () => {
    expect(readTenantCryptoConfig({})).toEqual({
      cryptoPaymentsEnabled: false,
      cryptoTreasuryAddress: '',
    });
  });

  it('normalizes a valid treasury address', () => {
    expect(
      normalizeTreasuryAddress('0xAbC0000000000000000000000000000000000Def'),
    ).toBe('0xabc0000000000000000000000000000000000def');
  });

  it('rejects malformed treasury addresses', () => {
    expect(isValidTreasuryAddress('not-an-address')).toBe(false);
    expect(isValidTreasuryAddress('')).toBe(true);
    expect(
      isValidTreasuryAddress('0xabc0000000000000000000000000000000000def'),
    ).toBe(true);
  });

  it('builds enable env with treasury', () => {
    expect(
      buildCryptoPaymentEnvVars({
        cryptoPaymentsEnabled: true,
        cryptoTreasuryAddress: '0xAbC0000000000000000000000000000000000Def',
      }),
    ).toEqual({
      CRYPTO_PAYMENTS_ENABLED: 'true',
      NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: 'true',
      CRYPTO_TREASURY_ADDRESS: '0xabc0000000000000000000000000000000000def',
    });
  });

  it('builds disable env without inventing a treasury', () => {
    expect(buildCryptoPaymentEnvVars({ cryptoPaymentsEnabled: false })).toEqual({
      CRYPTO_PAYMENTS_ENABLED: 'false',
      NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: 'false',
    });
  });
});
