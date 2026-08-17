/**
 * ZenStack / Prisma DB client for tokenizmyapp factory.
 * Do not use dotenv/config here; POSTGRES_URL must be set by the host (Vercel / vercel dev).
 */
import { PrismaClient } from '@/generated/prisma';
import { enhance } from '@zenstackhq/runtime';

export interface DbSession {
  tier: 'public' | 'pin' | 'google';
  sub?: string;
}

/** Policy-aware client; avoid Enhanced<> which hits TS recursion limits with Auth. */
export type DbClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  __redrubyPrisma?: PrismaClient;
};

/**
 * How many connections this process may hold open to the root database.
 *
 * On Vercel each invocation is its own short-lived process against the Neon
 * pooler, so 1 is correct: a larger pool per lambda multiplies across every
 * concurrent invocation and exhausts Neon's connection budget.
 *
 * A local dev server is the opposite — one long-lived process serving every
 * request. A limit of 1 there means the app can run exactly ONE query at a
 * time, so the handful of requests a single page fires (navigation,
 * brand-config, conversations, list-pin-users) queue behind each other and the
 * ones at the back die on the 10s pool timeout:
 *
 *     Timed out fetching a new connection from the connection pool.
 *     code: 'P2024', meta: { connection_limit: 1, timeout: 10 }
 *
 * That is not a slow database; it is self-inflicted serialisation. It is why
 * PIN sign-in appeared broken locally while working in production.
 *
 * `POSTGRES_CONNECTION_LIMIT` overrides both, for a deployment that knows
 * better than this heuristic.
 */
function connectionLimit(): number {
  const override = Number(process.env.POSTGRES_CONNECTION_LIMIT);
  if (Number.isInteger(override) && override > 0) return override;
  // VERCEL is set on deployments and by `vercel dev`; absent for `next dev`.
  return process.env.VERCEL ? 1 : 10;
}

function getPostgresUrl(): string {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('POSTGRES_URL is not set');
  }
  // Append PgBouncer params if not already present — disables prepared statements
  // which avoids "cached plan must not change result type" on Neon pooler.
  if (!url.includes('pgbouncer=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}pgbouncer=true&connection_limit=${connectionLimit()}`;
  }
  return url;
}

export function getBasePrisma(): PrismaClient {
  if (!globalForPrisma.__redrubyPrisma) {
    globalForPrisma.__redrubyPrisma = new PrismaClient({
      datasources: { db: { url: getPostgresUrl() } },
    });
  }
  return globalForPrisma.__redrubyPrisma;
}

/** Request-scoped ZenStack client; pass session tier for @@allow policies. */
export function createClient(session: DbSession = { tier: 'public' }) {
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
export function createBaseClient(): DbClient {
  return createClient({ tier: 'public' });
}

/** Raw Prisma client without ZenStack enhancement — for bootstrap operations. */
export function createRawClient() {
  return getBasePrisma();
}

/**
 * Same shape as createClient(), but connects to an explicit URL instead of the
 * process-global root DB — for tenants that have their own dedicated database
 * (tenants.db_url). Returns a fresh, non-singleton connection; callers MUST
 * call $disconnect() on it when done to avoid leaking connections.
 */
export function createClientForUrl(url: string, session: DbSession = { tier: 'public' }) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  return enhance(prisma, {
    user: {
      id: session.sub ?? session.tier,
      tier: session.tier,
      ...(session.sub !== undefined ? { sub: session.sub } : {}),
    },
  });
}
