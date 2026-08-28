import { describe, expect, it, beforeEach } from 'vitest';
import {
  consumeSiweNonce,
  hasFreshSiweNonceLine,
  isValidSignatureFormat,
  looksLikeSiweMessage,
  normalizeEoaSignature,
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

  it('registers and consumes a nonce once', async () => {
    await registerSiweNonce({
      nonce: 'abc123',
      address: '0xAbC000000000000000000000000000000000001',
      chainId: 11_155_111,
      domain: 'localhost',
      expiresAt: Date.now() + 60_000,
    });

    const first = await consumeSiweNonce('abc123');
    expect(first?.nonce).toBe('abc123');
    expect(await consumeSiweNonce('abc123')).toBeNull();
  });

  it('claims a never-registered nonce after a fresh Issued At', async () => {
    const { claimSiweNonceAfterVerify } = await import('@/lib/auth/siwe-nonce-store');
    const claimed = await claimSiweNonceAfterVerify({
      nonce: 'fresh-claim-1',
      address: '0xAbC000000000000000000000000000000000001',
      chainId: 11_155_111,
      domain: 'tokenizmyapp.vercel.app',
      issuedAtMs: Date.now() - 1_000,
    });
    expect(claimed?.nonce).toBe('fresh-claim-1');
    expect(
      await claimSiweNonceAfterVerify({
        nonce: 'fresh-claim-1',
        address: '0xAbC000000000000000000000000000000000001',
        chainId: 11_155_111,
        domain: 'tokenizmyapp.vercel.app',
        issuedAtMs: Date.now() - 1_000,
      }),
    ).toBeNull();
  });

  it('force-claims a pre-registered nonce whose expires_at already passed', async () => {
    const { claimSiweNonceAfterVerify } = await import('@/lib/auth/siwe-nonce-store');
    await registerSiweNonce({
      nonce: 'stale-expiry',
      address: '0xAbC000000000000000000000000000000000001',
      chainId: 11_155_111,
      domain: 'tokenizmyapp.vercel.app',
      expiresAt: Date.now() - 60_000,
    });
    expect(await consumeSiweNonce('stale-expiry')).toBeNull();
    const claimed = await claimSiweNonceAfterVerify({
      nonce: 'stale-expiry',
      address: '0xAbC000000000000000000000000000000000001',
      chainId: 11_155_111,
      domain: 'tokenizmyapp.vercel.app',
      issuedAtMs: Date.now() - 1_000,
    });
    expect(claimed?.nonce).toBe('stale-expiry');
  });
});

describe('wallet-siwe message helpers', () => {
  it('detects fresh nonce lines', () => {
    expect(hasFreshSiweNonceLine('Hello\nNonce: abc\n')).toBe(true);
    expect(hasFreshSiweNonceLine('Hello\n')).toBe(false);
  });

  it('parses Issued At and domain', async () => {
    const { parseSiweIssuedAtMs, parseSiweDomain } = await import('@/lib/auth/wallet-siwe');
    const message = `tokenizmyapp.vercel.app wants you to sign in with your Ethereum account:
0xAbC000000000000000000000000000000000001

URI: https://tokenizmyapp.vercel.app
Version: 1
Chain ID: 11155111
Nonce: abc
Issued At: 2026-08-28T08:53:43.472Z`;
    expect(parseSiweDomain(message)).toBe('tokenizmyapp.vercel.app');
    expect(parseSiweIssuedAtMs(message)).toBe(Date.parse('2026-08-28T08:53:43.472Z'));
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

  it('coerces non-standard yParityOrV (e.g. 0x20) to 27/28', () => {
    const rAndS = 'a'.repeat(128);
    // v = 0x20 (32) → LSB 0 → 27 (0x1b)
    expect(normalizeEoaSignature(`0x${rAndS}20`)).toBe(`0x${rAndS}1b`);
    // v = 0x00 → 27
    expect(normalizeEoaSignature(`0x${rAndS}00`)).toBe(`0x${rAndS}1b`);
    // v = 0x01 → 28
    expect(normalizeEoaSignature(`0x${rAndS}01`)).toBe(`0x${rAndS}1c`);
    // v = 0x1c stays
    expect(normalizeEoaSignature(`0x${rAndS}1c`)).toBe(`0x${rAndS}1c`);
    // v = 0x1f (Safe-style) → LSB 1 → 28 — EOA path only; EIP-1271 must keep raw 1f
    expect(normalizeEoaSignature(`0x${rAndS}1f`)).toBe(`0x${rAndS}1c`);
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
