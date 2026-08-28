/**
 * SIWE config for factory AppKit — maps to /api/auth/wallet/* (Phase 2 completes verify).
 *
 * @see docs/google-oauth-appkit-setup.md Phase 3
 */
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe';
import { SIWE_CHAIN_ID } from '@/lib/web3/crypto-billing-config';

let siweAppReady = false;
let siweAppReadyResolvers: Array<() => void> = [];

/** Gates getNonce until AppKit providers finish init (Correction A companion). */
export function signalSiweAppReady(): void {
  siweAppReady = true;
  for (const resolve of siweAppReadyResolvers) resolve();
  siweAppReadyResolvers = [];
}

function waitForSiweAppReady(): Promise<void> {
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
      data?: { nonce?: string };
      nonce?: string;
    };
    const nonce = payload.data?.nonce ?? payload.nonce;
    if (!nonce) throw new Error('Invalid nonce response');
    return nonce;
  },

  createMessage: ({ address, ...args }) => formatMessage(args, address),

  verifyMessage: async ({ message, signature }) => {
    if (!hasFreshNonceLine(message)) {
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tokenizmyapp:wallet-linked'));
    }
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
