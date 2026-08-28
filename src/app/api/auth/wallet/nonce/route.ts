/**
 * SIWE nonce — server-generated EIP-4361 message (Correction B).
 *
 * GET /api/auth/wallet/nonce
 * Phase 2 completes verify + JWT wallet claim extension.
 */
import { randomBytes } from 'node:crypto';
import { SiweMessage } from 'siwe';
import { SIWE_CHAIN_ID, SIWE_STATEMENT } from '@/lib/web3/crypto-billing-config';
import { registerSiweNonce } from '@/lib/auth/wallet-siwe';
import { resolveSiweNonceAddress } from '@/lib/web3/evm-address';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const nonceHits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (nonceHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    nonceHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  nonceHits.set(ip, hits);
  return false;
}

function requestOrigin(request: Request): string {
  const origin = request.headers.get('origin')?.trim();
  if (origin) return origin;
  const host = request.headers.get('host')?.trim();
  if (host) return `https://${host}`;
  return 'http://localhost:3000';
}

function requestDomain(request: Request): string {
  const host = request.headers.get('host')?.trim();
  if (host) return host.split(':')[0] ?? host;
  return 'localhost';
}

export async function GET(request: Request): Promise<Response> {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return jsonError('Rate limit exceeded. Try again later.', 429);
  }

  const url = new URL(request.url);
  const address = resolveSiweNonceAddress(url.searchParams.get('address'));
  const chainId = SIWE_CHAIN_ID;
  const nonce = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();

  let message: string;
  try {
    const siweMessage = new SiweMessage({
      domain: requestDomain(request),
      address,
      statement: SIWE_STATEMENT,
      uri: requestOrigin(request),
      version: '1',
      chainId,
      nonce,
      expirationTime: expiresAt,
    });
    message = siweMessage.prepareMessage();
  } catch (err) {
    console.error('[wallet/nonce] invalid SIWE message params:', err);
    return jsonError('Invalid wallet address for SIWE nonce', 400);
  }

  await registerSiweNonce({
    nonce,
    address: address.toLowerCase(),
    chainId,
    domain: requestDomain(request),
    expiresAt: Date.now() + 15 * 60_000,
  });

  return jsonOk({ message, nonce, expiresAt, chainId });
}
