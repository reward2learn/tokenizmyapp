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

/**
 * Race a promise against a timeout.  Returns the promise result or throws
 * after `ms` milliseconds.  Used to prevent `appkit.disconnect()` from
 * hanging the entire disconnect flow (stale Reown Cloud sessions, etc.).
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/** Maximum time to wait for AppKit disconnect before giving up. */
const DISCONNECT_TIMEOUT_MS = 8_000;

export async function disconnectAppKitWallet(): Promise<void> {
  const { getAppKit } = await import('@/lib/web3/appkit-client');
  const pending = getAppKit();
  if (!pending) return;

  const appkit = await pending;
  // appkit.disconnect() can hang indefinitely when the Reown Cloud session
  // is stale or the embedded wallet provider was never fully initialized.
  // Wrap in a timeout so the thunk can settle and Redux can reset.
  await withTimeout(appkit.disconnect(), DISCONNECT_TIMEOUT_MS);
}

export async function disconnectFactoryWallet(): Promise<void> {
  await unlinkFactoryWalletSession();
  try {
    await disconnectAppKitWallet();
  } catch {
    // JWT unlink succeeded — AppKit may already be disconnected or timed out.
    // The important part (JWT wallet claims stripped) is already done.
  }
}
