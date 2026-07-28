import { SignJWT, jwtVerify } from 'jose';
export const COOKIE_NAME = 'redruby.session';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
/** True when the session is a platform admin by claim or platform-admin group membership. */
export function sessionIsPlatformAdmin(session) {
    if (!session)
        return false;
    if (session.platformAdmin)
        return true;
    return (session.groups ?? []).includes('platform-admin');
}
function getJwtSecret() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key)
        throw new Error('ENCRYPTION_KEY not set');
    // Match legacy auth-lib.js: first 32 chars of hex string as UTF-8 key material
    return new TextEncoder().encode(key.slice(0, 32));
}
export async function signSession(payload) {
    const tier = payload.tier ?? payload.authMethod;
    if (!tier || (tier !== 'pin' && tier !== 'google')) {
        throw new Error('Session requires tier pin or google');
    }
    return new SignJWT({ ...payload, tier, authMethod: tier })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(getJwtSecret());
}
export async function verifySession(token) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        const tier = (payload.tier ?? payload.authMethod);
        if (!tier || (tier !== 'pin' && tier !== 'google'))
            return null;
        return { ...payload, tier, sub: String(payload.sub) };
    }
    catch {
        return null;
    }
}
