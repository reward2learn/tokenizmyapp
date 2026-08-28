/**
 * Server-side SIWE helpers — nonce registry, message gates, signature verification.
 *
 * @see docs/google-oauth-appkit-setup.md Phase 4
 */
import { SiweMessage } from 'siwe';
import { verifyMessage } from 'viem';
import { SIWE_CHAIN_ID } from '@/lib/web3/crypto-billing-config';

export interface PendingSiweNonce {
  nonce: string;
  address: string;
  chainId: number;
  domain: string;
  expiresAt: number;
  used: boolean;
}

const pendingNonces = new Map<string, PendingSiweNonce>();
const usedNonces = new Set<string>();

const NONCE_TTL_MS = 15 * 60_000;

export function registerSiweNonce(entry: Omit<PendingSiweNonce, 'used'>): void {
  pruneExpiredNonces();
  pendingNonces.set(entry.nonce, { ...entry, used: false });
}

export function consumeSiweNonce(nonce: string): PendingSiweNonce | null {
  pruneExpiredNonces();
  if (usedNonces.has(nonce)) return null;
  const entry = pendingNonces.get(nonce);
  if (!entry || entry.used || entry.expiresAt < Date.now()) return null;
  entry.used = true;
  usedNonces.add(nonce);
  pendingNonces.delete(nonce);
  return entry;
}

function pruneExpiredNonces(): void {
  const now = Date.now();
  for (const [key, entry] of pendingNonces) {
    if (entry.expiresAt < now) pendingNonces.delete(key);
  }
}

export function looksLikeSiweMessage(message: unknown): message is string {
  if (typeof message !== 'string') return false;
  const normalized = normalizeSiweMessageBytes(message);
  return (
    normalized.includes('wants you to sign in with your Ethereum account:') &&
    /^Nonce: /m.test(normalized)
  );
}

/** Session-restoration payloads lack a fresh nonce line. */
export function hasFreshSiweNonceLine(message: string): boolean {
  return /^Nonce: /m.test(normalizeSiweMessageBytes(message));
}

export function normalizeSiweMessageBytes(message: string): string {
  return message.replace(/\r\n/g, '\n').trimStart();
}

const SIGNATURE_GATE = /^0x[a-fA-F0-9]{130,}$/;

export function isValidSignatureFormat(signature: unknown): signature is `0x${string}` {
  return typeof signature === 'string' && SIGNATURE_GATE.test(signature);
}

export interface VerifiedSiweResult {
  address: `0x${string}`;
  chainId: number;
  nonce: string;
}

export async function verifySiweSignature(
  message: string,
  signature: `0x${string}`,
): Promise<VerifiedSiweResult> {
  const normalized = normalizeSiweMessageBytes(message);
  const siweMessage = new SiweMessage(normalized);

  if (siweMessage.chainId !== SIWE_CHAIN_ID) {
    throw new Error(`SIWE chain must be ${SIWE_CHAIN_ID}`);
  }

  try {
    await siweMessage.verify({ signature });
  } catch {
    const ok = await verifyMessage({
      address: siweMessage.address as `0x${string}`,
      message: normalized,
      signature,
    });
    if (!ok) {
      throw new Error('Signature verification failed');
    }
  }

  return {
    address: siweMessage.address as `0x${string}`,
    chainId: siweMessage.chainId,
    nonce: siweMessage.nonce,
  };
}

/** Reset registries — tests only. */
export function resetSiweNonceRegistryForTests(): void {
  pendingNonces.clear();
  usedNonces.clear();
}
