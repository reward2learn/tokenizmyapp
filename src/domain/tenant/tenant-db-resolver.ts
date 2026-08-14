/**
 * Tenant DB Resolver — a tenant with its own dedicated Neon database
 * (tenants.db_url) must be read/written there, not in the platform's root
 * database. The tenant's own live deployed app reads from that same URL via
 * its own POSTGRES_URL env var — any admin route that instead defaults to
 * the root DB (via createRawClient()/createClient()) silently shows/writes
 * a different, stale copy scoped only by a tenant_slug column.
 *
 * Suite apps go one level deeper: each app in a suite gets its OWN dedicated
 * database (SuiteAppInstance.dbUrl, stored inside tenants.metadata, keyed by
 * appId) — separate from the parent tenant's own dbUrl. When appId is given,
 * that app's own dbUrl takes priority over the parent's.
 *
 * The `tenants` registry row itself always lives in the root DB — this only
 * resolves the tenant/app's DATA (nav items, pages, brand config, seed data).
 */
import { createRawClient } from '@/lib/db';

interface AppPackRow {
  apps?: Array<{ appId: string; dbUrl?: string | null }>;
}

export async function resolveTenantDbUrl(
  tenantSlug: string | null | undefined,
  appId?: string | null,
): Promise<string> {
  const fallback = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '';
  if (!tenantSlug) return fallback;
  try {
    const db = createRawClient();
    const rows = await db.$queryRawUnsafe<{ db_url: string | null; metadata: unknown }[]>(
      `SELECT db_url, metadata FROM tenants WHERE slug = $1 LIMIT 1;`,
      tenantSlug,
    );
    const row = rows[0];
    if (!row) return fallback;

    if (appId) {
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      const config = (meta.config ?? {}) as Record<string, unknown>;
      const appPack = config.appPack as AppPackRow | undefined;
      const app = appPack?.apps?.find((a) => a.appId === appId);
      if (app?.dbUrl) return app.dbUrl;
    }

    return row.db_url || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Like resolveTenantDbUrl, but returns null when there's no dedicated
 * database to route to (i.e. the resolved URL is just the default root
 * connection) — for callers that use a pooled/singleton client
 * (@/lib/db.ts createClient()) by default and should only pay for a fresh,
 * non-singleton connection when a tenant/app genuinely has its own database.
 */
export async function resolveDedicatedTenantDbUrl(
  tenantSlug: string | null | undefined,
  appId?: string | null,
): Promise<string | null> {
  const fallback = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '';
  const resolved = await resolveTenantDbUrl(tenantSlug, appId);
  return resolved && resolved !== fallback ? resolved : null;
}
