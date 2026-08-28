/**
 * Wallet unlink — clears wallet JWT claims, keeps app login session.
 *
 * POST /api/auth/wallet/signout
 */
import { getSessionFromRequest, setSessionCookie } from '@/lib/auth/session';
import { stripWalletFromSession } from '@/lib/auth/wallet-session';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError('Not signed in', 401);
  }

  if (!session.walletAddress) {
    return jsonOk({ success: true, alreadyUnlinked: true });
  }

  try {
    const token = await stripWalletFromSession(session);
    const response = jsonOk({ success: true });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('[wallet/signout]', err);
    return jsonError('Failed to update session', 500);
  }
}
