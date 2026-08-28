/**
 * Link the connected AppKit wallet to the factory JWT session via factory SIWE.
 *
 * ReownAuthentication (Google/email) signs against api.web3modal.org — that
 * provisions the embedded wallet but does not extend redruby.session. This
 * module performs the factory nonce → sign server message → verify flow.
 */
import { SIWE_CHAIN_ID } from '@/lib/web3/crypto-billing-config';
import { waitForSiweAppReady } from '@/lib/web3/siwe-config';
import { getWagmiConfig } from '@/lib/web3/wagmi-store';

/** Fresh nonce + wallet prompt when verify fails (stale message / rejected mid-flow). */
const MAX_LINK_SIGN_ATTEMPTS = 2;

function apiBase(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_HOST?.trim() || 'http://localhost:3000';
}

function isUserRejectedSignature(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = 'code' in err ? (err as { code?: unknown }).code : undefined;
  if (code === 4001 || code === 'ACTION_REJECTED') return true;
  const message = err instanceof Error ? err.message : String(err);
  return /user rejected|user denied|rejected the request/i.test(message);
}

async function switchToSiweChain(
  wagmiConfig: NonNullable<ReturnType<typeof getWagmiConfig>>,
  currentChainId: number | undefined,
): Promise<void> {
  if (currentChainId === SIWE_CHAIN_ID) return;

  const { switchChain } = await import('wagmi/actions');
  try {
    await switchChain(wagmiConfig, { chainId: SIWE_CHAIN_ID });
    await new Promise((resolve) => setTimeout(resolve, 600));
  } catch {
    throw new Error('Switch to Sepolia in your wallet to link for crypto payments.');
  }
}

async function fetchServerSiweMessage(address: string): Promise<string> {
  const params = new URLSearchParams({
    address,
    chainId: String(SIWE_CHAIN_ID),
  });

  const nonceResponse = await fetch(`${apiBase()}/api/auth/wallet/nonce?${params}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!nonceResponse.ok) {
    const body = (await nonceResponse.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Failed to start wallet link.');
  }

  const noncePayload = (await nonceResponse.json()) as {
    success?: boolean;
    data?: { message?: string };
    error?: string;
  };

  const message = noncePayload.data?.message;
  if (!message) {
    throw new Error('Invalid nonce response from server.');
  }
  return message;
}

async function verifyFactorySiwe(message: string, signature: string): Promise<string> {
  const verifyResponse = await fetch(`${apiBase()}/api/auth/wallet/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, signature }),
  });

  if (!verifyResponse.ok) {
    const body = (await verifyResponse.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Wallet signature verification failed.');
  }

  const verifyPayload = (await verifyResponse.json()) as {
    success?: boolean;
    data?: { address?: string; success?: boolean };
  };

  if (verifyPayload.success !== true) {
    throw new Error('Wallet signature verification failed.');
  }

  return verifyPayload.data?.address ?? '';
}

export async function linkFactoryWalletSession(): Promise<{ address: string }> {
  await waitForSiweAppReady();

  const wagmiConfig = getWagmiConfig();
  if (!wagmiConfig) {
    throw new Error('Social wallet is not configured for this deployment.');
  }

  const { getAccount, signMessage } = await import('wagmi/actions');
  const account = getAccount(wagmiConfig);
  if (!account.address) {
    throw new Error('Connect your wallet before linking.');
  }

  await switchToSiweChain(wagmiConfig, account.chainId);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_LINK_SIGN_ATTEMPTS; attempt++) {
    try {
      // Fresh nonce every attempt so a failed verify never reuses a spent/stale message.
      const message = await fetchServerSiweMessage(account.address);
      const signature = await signMessage(wagmiConfig, { message });
      const verifiedAddress = await verifyFactorySiwe(message, signature);
      return { address: verifiedAddress || account.address };
    } catch (err) {
      if (isUserRejectedSignature(err)) {
        throw new Error('Signature request was rejected. Try linking again when ready.');
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      // Verification failed (or transient) — loop once more for a new sign modal.
    }
  }

  throw lastError ?? new Error('Wallet signature verification failed.');
}
