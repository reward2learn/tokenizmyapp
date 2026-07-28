/**
 * GET /api/config/vercel-token
 *
 * Returns the status of the Vercel OAuth token configuration.
 * Secret is stored encrypted in the DB via the secrets table.
 */
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk } from '@/lib/api/response';
import { getSecret } from '@/lib/secrets';
export const dynamic = 'force-dynamic';
export async function GET(request) {
    const guard = await requireWriteAuth(request);
    if (!guard.ok)
        return guard.response;
    const secret = await getSecret('VERCEL_OAUTH');
    let status = 'not_configured';
    let tokenInfo = null;
    if (secret) {
        try {
            const { decrypt } = await import('@/lib/crypto');
            const decrypted = decrypt(secret.encrypted, secret.iv, secret.authTag);
            const data = JSON.parse(decrypted);
            if (data.expiresAt && Date.now() > data.expiresAt) {
                status = 'expired';
                tokenInfo = `Token expired at ${new Date(data.expiresAt).toLocaleString()}`;
            }
            else {
                status = 'configured';
                const remaining = data.expiresAt ? Math.round((data.expiresAt - Date.now()) / 1000 / 60) : null;
                tokenInfo = remaining ? `Token valid for ~${remaining} minutes` : 'Token configured';
            }
        }
        catch {
            status = 'not_configured';
        }
    }
    const clientIdConfigured = Boolean(process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID);
    const clientSecretConfigured = Boolean(process.env.VERCEL_APP_CLIENT_SECRET);
    return jsonOk({
        status,
        tokenInfo,
        clientIdConfigured,
        clientSecretConfigured,
        oauthUrl: clientIdConfigured ? '/api/auth/vercel/authorize' : null,
    });
}
