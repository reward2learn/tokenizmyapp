/**
 * SIWE verify — extends redruby.session JWT with walletAddress / walletChainId.
 *
 * POST /api/auth/wallet/verify
 */
import { z } from 'zod';
import {
  consumeSiweNonce,
  hasFreshSiweNonceLine,
  isValidSignatureFormat,
  looksLikeSiweMessage,
  verifySiweSignature,
} from '@/lib/auth/wallet-siwe';
import { extendSessionWithWallet, sessionWalletMatches } from '@/lib/auth/wallet-session';
import { getSessionFromRequest, setSessionCookie } from '@/lib/auth/session';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_VERIFY_PER_WINDOW = 5;
const verifyHits = new Map<string, number[]>();

const bodySchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (verifyHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_VERIFY_PER_WINDOW) {
    verifyHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  verifyHits.set(ip, hits);
  return false;
}

export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return jsonError('Rate limit exceeded. Try again later.', 429);
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError('Sign in to the app before linking a wallet.', 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      `Validation failed: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      400,
    );
  }

  const { message, signature } = parsed.data;

  if (!looksLikeSiweMessage(message)) {
    return jsonError('Invalid SIWE message format', 400);
  }

  if (!hasFreshSiweNonceLine(message)) {
    if (sessionWalletMatches(session, session.walletAddress)) {
      return jsonOk({ success: true, sessionRestoration: true, address: session.walletAddress });
    }
    return jsonOk({ success: true, sessionRestoration: true });
  }

  if (!isValidSignatureFormat(signature)) {
    return jsonError('Invalid signature format', 400);
  }

  let verified: Awaited<ReturnType<typeof verifySiweSignature>>;
  try {
    verified = await verifySiweSignature(message, signature);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Signature verification failed', 400);
  }

  const nonceEntry = consumeSiweNonce(verified.nonce);
  if (!nonceEntry) {
    return jsonError('Invalid or expired nonce', 400);
  }

  if (verified.address.toLowerCase() !== nonceEntry.address.toLowerCase()) {
    const placeholder = '0x0000000000000000000000000000000000000000';
    if (nonceEntry.address !== placeholder) {
      return jsonError('Wallet address does not match nonce request', 400);
    }
  }

  try {
    const token = await extendSessionWithWallet(session, verified.address, verified.chainId);
    const response = jsonOk({
      success: true,
      address: verified.address,
      chainId: verified.chainId,
    });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('[wallet/verify]', err);
    return jsonError('Failed to update session', 500);
  }
}
