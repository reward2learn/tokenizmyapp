/**
 * ZenStack / Prisma DB client for tokenizmyapp factory.
 * Do not use dotenv/config here; POSTGRES_URL must be set by the host (Vercel / vercel dev).
 */
import { PrismaClient } from '@/generated/prisma';
import { enhance } from '@zenstackhq/runtime';
const globalForPrisma = globalThis;
function getPostgresUrl() {
    const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!url) {
        throw new Error('POSTGRES_URL is not set');
    }
    // Append PgBouncer params if not already present — disables prepared statements
    // which avoids "cached plan must not change result type" on Neon pooler.
    if (!url.includes('pgbouncer=')) {
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}pgbouncer=true&connection_limit=1`;
    }
    return url;
}
export function getBasePrisma() {
    if (!globalForPrisma.__redrubyPrisma) {
        globalForPrisma.__redrubyPrisma = new PrismaClient({
            datasources: { db: { url: getPostgresUrl() } },
        });
    }
    return globalForPrisma.__redrubyPrisma;
}
/** Request-scoped ZenStack client; pass session tier for @@allow policies. */
export function createClient(session = { tier: 'public' }) {
    const prisma = getBasePrisma();
    return enhance(prisma, {
        user: {
            id: session.sub ?? session.tier,
            tier: session.tier,
            ...(session.sub !== undefined ? { sub: session.sub } : {}),
        },
    });
}
/** Policy-aware client for bootstrap/migration & admin ops. */
export function createBaseClient() {
    return createClient({ tier: 'public' });
}
/** Raw Prisma client without ZenStack enhancement — for bootstrap operations. */
export function createRawClient() {
    return getBasePrisma();
}
