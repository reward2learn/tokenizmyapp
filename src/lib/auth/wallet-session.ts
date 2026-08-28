import { signSession, type SessionClaims } from '@/lib/auth/jwt';

/** Re-issue JWT preserving auth claims and adding wallet linkage. */
export async function extendSessionWithWallet(
  session: SessionClaims,
  walletAddress: string,
  walletChainId: number,
): Promise<string> {
  const { iat, exp, ...claims } = session;
  return signSession({
    ...claims,
    walletAddress: walletAddress.toLowerCase(),
    walletChainId,
    walletLinkedAt: Math.floor(Date.now() / 1000),
  });
}

/** Remove wallet claims while keeping the app login session. */
export async function stripWalletFromSession(session: SessionClaims): Promise<string> {
  const {
    walletAddress: _wa,
    walletChainId: _wc,
    walletLinkedAt: _wl,
    iat,
    exp,
    ...claims
  } = session;
  return signSession(claims);
}

export function sessionWalletMatches(
  session: SessionClaims | null | undefined,
  address: string | null | undefined,
): boolean {
  if (!session?.walletAddress || !address) return false;
  return session.walletAddress.toLowerCase() === address.toLowerCase();
}
