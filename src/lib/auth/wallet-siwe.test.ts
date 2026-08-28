import { describe, expect, it, beforeEach } from 'vitest';
import {
  consumeSiweNonce,
  hasFreshSiweNonceLine,
  isValidSignatureFormat,
  looksLikeSiweMessage,
  normalizeSiweMessageBytes,
  registerSiweNonce,
  resetSiweNonceRegistryForTests,
} from '@/lib/auth/wallet-siwe';
import { sessionWalletMatches } from '@/lib/auth/wallet-session';
import type { SessionClaims } from '@/lib/auth/jwt';

describe('wallet-siwe registry', () => {
  beforeEach(() => {
    resetSiweNonceRegistryForTests();
  });

  it('registers and consumes a nonce once', () => {
    registerSiweNonce({
      nonce: 'abc123',
      address: '0xAbC000000000000000000000000000000000001',
      chainId: 11_155_111,
      domain: 'localhost',
      expiresAt: Date.now() + 60_000,
    });

    const first = consumeSiweNonce('abc123');
    expect(first?.nonce).toBe('abc123');
    expect(consumeSiweNonce('abc123')).toBeNull();
  });
});

describe('wallet-siwe message helpers', () => {
  it('detects fresh nonce lines', () => {
    expect(hasFreshSiweNonceLine('Hello\nNonce: abc\n')).toBe(true);
    expect(hasFreshSiweNonceLine('Hello\n')).toBe(false);
  });

  it('validates signature format gate', () => {
    expect(isValidSignatureFormat(`0x${'a'.repeat(130)}`)).toBe(true);
    expect(isValidSignatureFormat('not-a-signature')).toBe(false);
  });

  it('normalizes line endings with trimStart only', () => {
    expect(normalizeSiweMessageBytes('\r\nNonce: x')).toBe('Nonce: x');
  });

  it('rejects non-SIWE bodies', () => {
    expect(looksLikeSiweMessage('{"foo":1}')).toBe(false);
  });
});

describe('sessionWalletMatches', () => {
  it('matches case-insensitively', () => {
    const session = {
      sub: 'u1',
      tier: 'google',
      walletAddress: '0xABC',
    } as SessionClaims;
    expect(sessionWalletMatches(session, '0xabc')).toBe(true);
    expect(sessionWalletMatches(session, '0xdef')).toBe(false);
  });
});
