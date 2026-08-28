/**
 * SIWE config for factory AppKit — maps to /api/auth/wallet/* (Phase 2 completes verify).
 *
 * @see docs/google-oauth-appkit-setup.md Phase 3
 */
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe';
import { SIWE_CHAIN_ID } from '@/lib/web3/crypto-billing-config';

let siweAppReady = false;
let siweAppReadyResolvers: Array<() => void> = [];
/** Server-built EIP-4361 message from the latest getNonce call (Correction B). */
let pendingServerSiweMessage: string | null = null;

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

export const factorySiweClient = createSIWEConfig({
  getNonce: async (address?: string) => {
    await waitForSiweAppReady();

    const params = new URLSearchParams();
    if (address) params.set('address', address);
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
    const message = payload.data?.message ?? payload.message;
    const nonce = payload.data?.nonce ?? payload.nonce;
    if (!nonce) throw new Error('Invalid nonce response');
    pendingServerSiweMessage = message ?? null;
    return nonce;
  },

  createMessage: ({ address, ...args }) => {
    if (pendingServerSiweMessage) {
      const serverMessage = pendingServerSiweMessage;
      pendingServerSiweMessage = null;
      return serverMessage;
    }
    return formatMessage(args, address);
  },

  verifyMessage: async ({ message, signature }) => {
    // ReownAuthentication session restoration — no factory nonce to verify.
    if (!hasFreshNonceLine(message)) {
      return true;
    }

    // Web3Modal / Reown auth uses CAIP chain ids — not a factory SIWE link.
    if (/^Chain ID: eip155:/m.test(message)) {
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
      console.warn('[siwe] Verify endpoint returned', response.status);
      return false;
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: { success?: boolean };
    };
    return payload.success === true && (payload.data?.success ?? true);
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
});

/** Passed to createAppKit({ siweConfig }) — an AppKitSIWEClient instance. */
export const factorySiweConfig = factorySiweClient;
