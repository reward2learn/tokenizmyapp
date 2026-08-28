/**
 * Server-side SIWE helpers — nonce registry, message gates, signature verification.
 *
 * @see docs/google-oauth-appkit-setup.md Phase 4
 */
import { SiweMessage } from 'siwe';
import { createPublicClient, http, recoverMessageAddress, verifyMessage } from 'viem';
import { base, mainnet, sepolia } from 'viem/chains';
import type { Chain } from 'viem';
import { SIWE_CHAIN_ID, resolveRpcUrl } from '@/lib/web3/crypto-billing-config';
import { isSiwePlaceholderAddress } from '@/lib/web3/evm-address';
import {
  consumeSiweNonce,
  registerSiweNonce,
  resetSiweNonceRegistryForTests,
  type PendingSiweNonce,
} from '@/lib/auth/siwe-nonce-store';

export type { PendingSiweNonce };
export { consumeSiweNonce, registerSiweNonce, resetSiweNonceRegistryForTests };

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

/**
 * Standard 65-byte EOA signatures — coerce yParity/v into 27/28.
 * Wallets sometimes return 0/1; some connectors emit garbage like 0x20 (32),
 * which makes viem throw "Invalid yParityOrV value" instead of failing closed.
 *
 * Never apply this before EIP-1271: Safe/smart accounts validate the exact
 * bytes (e.g. v=0x1f). Normalizing breaks on-chain isValidSignature.
 */
export function normalizeEoaSignature(signature: `0x${string}`): `0x${string}` {
  const hex = signature.slice(2);
  if (hex.length !== 130) return signature;

  let v = Number.parseInt(hex.slice(128, 130), 16);
  if (Number.isNaN(v)) return signature;

  if (v === 0 || v === 1) {
    v += 27;
  } else if (v === 27 || v === 28) {
    // already Ethereum legacy recovery id
  } else if (v >= 35) {
    // EIP-155 transaction-style v — extract yParity
    v = ((v - 35) % 2) + 27;
  } else {
    // Non-standard (e.g. 32) — LSB is the only recoverable signal
    v = (v % 2) + 27;
  }

  return `0x${hex.slice(0, 128)}${v.toString(16).padStart(2, '0')}` as `0x${string}`;
}

/** Both legacy recovery ids — used when a single normalized v still fails. */
function eoaSignatureCandidates(signature: `0x${string}`): `0x${string}`[] {
  const normalized = normalizeEoaSignature(signature);
  const hex = normalized.slice(2);
  if (hex.length !== 130) return [normalized];

  const v27 = `0x${hex.slice(0, 128)}1b` as `0x${string}`;
  const v28 = `0x${hex.slice(0, 128)}1c` as `0x${string}`;
  return normalized === v27 ? [v27, v28] : normalized === v28 ? [v28, v27] : [normalized, v27, v28];
}

function isSmartAccountSignature(signature: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(signature) && signature.length > 132;
}

function chainForId(chainId: number): Chain | null {
  switch (chainId) {
    case 11_155_111:
      return sepolia;
    case 1:
      return mainnet;
    case 8453:
      return base;
    default:
      return null;
  }
}

/** SIWE chain first, then common deployment homes for Reown/Safe smart accounts. */
function eip1271ChainIds(preferred: number): number[] {
  return [...new Set([preferred, SIWE_CHAIN_ID, 1, 8453])];
}

/**
 * EIP-1271 / EIP-6492 via a public client. Uses the RAW signature — never
 * normalize v first (Safe rejects coerced recovery ids with GS026).
 */
async function verifyViaEip1271(
  address: `0x${string}`,
  message: string,
  signature: `0x${string}`,
  chainId: number,
): Promise<boolean> {
  const chain = chainForId(chainId);
  const rpcUrl = resolveRpcUrl(chainId);
  if (!chain || !rpcUrl) return false;

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  try {
    return await client.verifyMessage({ address, message, signature });
  } catch {
    return false;
  }
}

async function verifySignatureForAddress(
  address: `0x${string}`,
  message: string,
  signature: `0x${string}`,
): Promise<boolean> {
  if (isSmartAccountSignature(signature)) {
    for (const chainId of eip1271ChainIds(SIWE_CHAIN_ID)) {
      if (await verifyViaEip1271(address, message, signature, chainId)) return true;
    }
    return false;
  }

  for (const candidate of eoaSignatureCandidates(signature)) {
    try {
      const siweResult = await new SiweMessage(message).verify({ signature: candidate });
      if (siweResult.success) return true;
    } catch {
      // try viem / next candidate
    }
    try {
      if (await verifyMessage({ address, message, signature: candidate })) return true;
    } catch {
      // Invalid yParityOrV / recover failures → next candidate
    }
  }
  return false;
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

  const messageAddress = siweMessage.address as `0x${string}`;
  let verifiedAddress = messageAddress;

  if (isSiwePlaceholderAddress(messageAddress)) {
    try {
      verifiedAddress = await recoverMessageAddress({
        message: normalized,
        signature: normalizeEoaSignature(signature),
      });
    } catch {
      throw new Error('Signature verification failed');
    }
  }

  const okEoa = await verifySignatureForAddress(verifiedAddress, normalized, signature);
  if (okEoa) {
    return {
      address: verifiedAddress,
      chainId: siweMessage.chainId,
      nonce: siweMessage.nonce,
    };
  }

  // Reown social wallets are often Safe-style smart accounts: the SIWE address is
  // the contract, but the 65-byte signature is from the owner EOA (non-standard v).
  // EOA recover won't match — fall back to EIP-1271 with the RAW signature bytes.
  if (!isSiwePlaceholderAddress(messageAddress)) {
    for (const chainId of eip1271ChainIds(siweMessage.chainId)) {
      if (await verifyViaEip1271(messageAddress, normalized, signature, chainId)) {
        return {
          address: messageAddress,
          chainId: siweMessage.chainId,
          nonce: siweMessage.nonce,
        };
      }
    }
  }

  throw new Error('Signature verification failed');
}
