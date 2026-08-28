import { describe, expect, it } from 'vitest';
import {
  isValidEvmAddress,
  resolveSiweNonceAddress,
  SIWE_PLACEHOLDER_ADDRESS,
} from '@/lib/web3/evm-address';

describe('evm-address', () => {
  it('accepts valid hex addresses', () => {
    expect(isValidEvmAddress('0xabcdef0000000000000000000000000000000001')).toBe(true);
  });

  it('rejects AppKit template placeholders', () => {
    expect(isValidEvmAddress('<<AccountAddress>>')).toBe(false);
  });

  it('falls back to the SIWE placeholder for invalid input', () => {
    expect(resolveSiweNonceAddress('<<AccountAddress>>')).toBe(SIWE_PLACEHOLDER_ADDRESS);
    expect(resolveSiweNonceAddress(undefined)).toBe(SIWE_PLACEHOLDER_ADDRESS);
  });
});
