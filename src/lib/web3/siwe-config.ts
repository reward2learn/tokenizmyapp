/**
 * SIWE helpers for factory wallet link — signalSiweAppReady / waitForSiweAppReady.
 *
 * Previously exported factorySiweConfig (AppKit SIWE callbacks) and
 * factorySiweClient (mapToSIWX source). Those are no longer used — factory SIWE
 * link goes through linkFactoryWalletSession (direct nonce→sign→verify) instead
 * of AppKit's SIWE callback system. Passing factorySiweConfig to createAppKit()
 * caused ReownAuthentication to use the factory nonce format (hex) instead of
 * JWT, resulting in 401s from the Reown Cloud API.
 *
 * @see docs/factory-reown-siwe-wallet-link.md
 * @see docs/google-oauth-appkit-setup.md
 */
import { SIWE_CHAIN_ID, SIWE_STATEMENT } from '@/lib/web3/crypto-billing-config';
import { isValidEvmAddress, siweMessageUsesPlaceholderAddress } from '@/lib/web3/evm-address';

let siweAppReady = false;
let siweAppReadyResolvers: Array<() => void> = [];

/** Gates getNonce until AppKit providers finish init (Correction A companion). */
export function signalSiweAppReady(): void {
  siweAppReady = true;
  for (const resolve of siweAppReadyResolvers) resolve();
  siweAppReadyResolvers = [];
}

/** Wait until AppKit init + factory SIWX mapping are applied (Correction A). */
export function waitForSiweAppReady(): Promise<void> {
  if (siweAppReady) return Promise.resolve();
  return new Promise((resolve) => {
    siweAppReadyResolvers.push(resolve);
  });
}

function apiBase(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_HOST?.trim() || 'http://localhost:3000';
}

/** Fresh SIWE messages must include a Nonce line — restoration payloads do not. */
function hasFreshNonceLine(message: string): boolean {
  return /^Nonce: /m.test(message);
}

/**
 * Factory SIWE config — used by linkFactoryWalletSession for nonce→sign→verify.
 *
 * These callbacks are NOT passed to createAppKit(). They exist so that
 * linkFactoryWalletSession can call them directly if needed, and so that
 * the SIWE flow is documented in one place.
 */
export const factorySiweConfig = {
  getNonce: async (address?: string) => {
    await waitForSiweAppReady();

    // AppKit SIWX may call getNonce with `<<AccountAddress>>` before the wallet exists.
    // Mint a local nonce only — do NOT clear a prior server message (Correction B race).
    if (!isValidEvmAddress(address)) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    const params = new URLSearchParams();
    params.set('address', address);
    params.set('chainId', String(SIWE_CHAIN_ID));

    const response = await fetch(`${apiBase()}/api/auth/wallet/nonce?${params}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to generate SIWE nonce');
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { nonce?: string; message?: string };
      nonce?: string;
      message?: string;
    };
    const nonce = payload.data?.nonce ?? payload.nonce;
    if (!nonce) throw new Error('Invalid nonce response');
    return nonce;
  },

  createMessage: ({ address, ...args }: { address: string; [key: string]: unknown }) => {
    // Placeholder / pre-wallet SIWX probes only — never for a real link address.
    if (!isValidEvmAddress(address)) {
      const { formatMessage } = require('@reown/appkit-siwe');
      return formatMessage(args, address);
    }
    throw new Error(
      'Missing server SIWE message. Reconnect the wallet and try linking again.',
    );
  },

  verifyMessage: async ({ message, signature }: { message: string; signature: string }) => {
    // ReownAuthentication session restoration — no factory nonce to verify.
    if (!hasFreshNonceLine(message)) {
      return true;
    }

    // Web3Modal / Reown auth uses CAIP chain ids — not a factory SIWE link.
    if (/^Chain ID: eip155:/m.test(message)) {
      return true;
    }

    // AppKit social-auth SIWX uses a placeholder account line — not factory wallet link.
    if (siweMessageUsesPlaceholderAddress(message)) {
      return true;
    }

    const sigGate = /^0x[a-fA-F0-9]{130,}$/;
    if (!sigGate.test(signature)) {
      console.warn('[siwe] Signature failed format gate');
      return false;
    }

    const response = await fetch(`${apiBase()}/api/auth/wallet/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message, signature }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      // Throw so AppKit SIWX re-prompts a fresh signature instead of failing closed.
      throw new Error(body.error ?? `Wallet verify failed (${response.status})`);
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { success?: boolean };
    };
    const ok = payload.success === true && (payload.data?.success ?? true);
    if (!ok) {
      throw new Error('Wallet signature verification failed.');
    }
    return true;
  },

  onSignIn: () => {
    // Session refresh is handled by wallet-listener-middleware after linkWalletSession.
  },

  getSession: async () => {
    const response = await fetch(`${apiBase()}/api/auth/wallet/session`, {
      credentials: 'include',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      data?: { address?: string | null; chainId?: number | null };
      address?: string | null;
      chainId?: number | null;
    };
    const address = payload.data?.address ?? payload.address;
    const chainId = payload.data?.chainId ?? payload.chainId;
    if (!address) return null;
    return {
      address,
      chainId: chainId ?? SIWE_CHAIN_ID,
    };
  },

  signOut: async () => {
    await fetch(`${apiBase()}/api/auth/wallet/signout`, {
      method: 'POST',
      credentials: 'include',
    });
    return true;
  },
};
