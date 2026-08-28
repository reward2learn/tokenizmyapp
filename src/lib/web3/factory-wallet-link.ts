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

function apiBase(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_HOST?.trim() || 'http://localhost:3000';
}

export async function linkFactoryWalletSession(): Promise<{ address: string }> {
  await waitForSiweAppReady();

  const wagmiConfig = getWagmiConfig();
  if (!wagmiConfig) {
    throw new Error('Social wallet is not configured for this deployment.');
  }

  const { getAccount, signMessage, switchChain } = await import('wagmi/actions');
  const account = getAccount(wagmiConfig);
  if (!account.address) {
    throw new Error('Connect your wallet before linking.');
  }

  if (account.chainId !== SIWE_CHAIN_ID) {
    try {
      await switchChain(wagmiConfig, { chainId: SIWE_CHAIN_ID });
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      throw new Error('Switch to Sepolia in your wallet to link for crypto payments.');
    }
  }

  const params = new URLSearchParams({
    address: account.address,
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

  const signature = await signMessage(wagmiConfig, { message });

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

  const address = verifyPayload.data?.address ?? account.address;

  return { address };
}
