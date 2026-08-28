/**
 * Unlink the wallet from the factory JWT and disconnect AppKit.
 */
function apiBase(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_HOST?.trim() || 'http://localhost:3000';
}

export async function unlinkFactoryWalletSession(): Promise<void> {
  const response = await fetch(`${apiBase()}/api/auth/wallet/signout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Failed to unlink wallet from your account.');
  }
}

export async function disconnectAppKitWallet(): Promise<void> {
  const { getAppKit } = await import('@/lib/web3/appkit-client');
  const pending = getAppKit();
  if (!pending) return;

  const appkit = await pending;
  await appkit.disconnect();
}

export async function disconnectFactoryWallet(): Promise<void> {
  await unlinkFactoryWalletSession();
  try {
    await disconnectAppKitWallet();
  } catch {
    // JWT unlink succeeded — AppKit may already be disconnected.
  }
}
