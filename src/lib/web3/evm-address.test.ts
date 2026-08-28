import { describe, expect, it } from 'vitest';
import {
  isValidEvmAddress,
  resolveSiweNonceAddress,
  siweMessageUsesPlaceholderAddress,
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

  it('detects placeholder account lines in SIWE messages', () => {
    const placeholderMsg = `tokenizmyapp.vercel.app wants you to sign in with your Ethereum account:
${SIWE_PLACEHOLDER_ADDRESS}

URI: https://tokenizmyapp.vercel.app
Version: 1
Chain ID: 11155111
Nonce: abc123
Issued At: 2026-01-01T00:00:00.000Z`;
    expect(siweMessageUsesPlaceholderAddress(placeholderMsg)).toBe(true);

    const realMsg = placeholderMsg.replace(SIWE_PLACEHOLDER_ADDRESS, '0xabcdef0000000000000000000000000000000001');
    expect(siweMessageUsesPlaceholderAddress(realMsg)).toBe(false);
  });
});
