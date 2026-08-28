/**
 * Wallet SIWE session probe — reads linked wallet from JWT claims.
 *
 * GET /api/auth/wallet/session
 */
import { getSessionFromRequest } from '@/lib/auth/session';
import { jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const session = await getSessionFromRequest(request);
  return jsonOk({
    address: session?.walletAddress ?? null,
    chainId: session?.walletChainId ?? null,
    authenticated: Boolean(session),
    sub: session?.sub ?? null,
  });
}
