import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { SessionClaims } from '@/lib/auth/jwt';

const signSessionMock = vi.fn(async (payload: SessionClaims) => JSON.stringify(payload));

vi.mock('@/lib/auth/jwt', () => ({
  signSession: (...args: unknown[]) => signSessionMock(...args),
}));

import { extendSessionWithWallet, stripWalletFromSession } from '@/lib/auth/wallet-session';

const baseSession: SessionClaims = {
  sub: 'user-1',
  tier: 'google',
  email: 'a@example.com',
  groups: [],
  permissions: [],
};

describe('wallet-session helpers', () => {
  beforeEach(() => {
    signSessionMock.mockClear();
  });

  it('extendSessionWithWallet adds wallet claims', async () => {
    const token = await extendSessionWithWallet(
      baseSession,
      '0xAbC000000000000000000000000000000000001',
      11_155_111,
    );
    const parsed = JSON.parse(token) as SessionClaims;
    expect(parsed.walletAddress).toBe(
      '0xAbC000000000000000000000000000000000001'.toLowerCase(),
    );
    expect(parsed.walletChainId).toBe(11_155_111);
    expect(parsed.walletLinkedAt).toBeTypeOf('number');
    expect(parsed.sub).toBe('user-1');
  });

  it('stripWalletFromSession removes wallet claims', async () => {
    const withWallet: SessionClaims = {
      ...baseSession,
      walletAddress: '0xabc',
      walletChainId: 11_155_111,
      walletLinkedAt: 1,
    };
    const token = await stripWalletFromSession(withWallet);
    const parsed = JSON.parse(token) as SessionClaims;
    expect(parsed.walletAddress).toBeUndefined();
    expect(parsed.walletChainId).toBeUndefined();
    expect(parsed.sub).toBe('user-1');
  });
});
