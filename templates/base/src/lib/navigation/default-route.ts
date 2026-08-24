/**
 * Default Route Resolver
 *
 * Resolves the configured default landing route (the navigation item marked
 * is_default = TRUE) directly against the database.
 *
 * Used by:
 *  - app/api/auth (logout redirect)
 *
 * IMPORTANT: this must NEVER self-fetch over HTTP. The old implementation
 * called fetch(`${VERCEL_URL}/api/default-route`) from the root page — the
 * deployment URL is behind Vercel SSO/deployment protection, so the fetch
 * was redirected to the SSO login, res.ok was false, and the app always
 * fell back to the default path regardless of the configured default.
 */

import { PrismaClient } from '@/generated/prisma';
import {
  ensureNavigationTable,
  normalizeAppId,
  normalizeTenantSlug,
  type NavigationScope,
} from '@/lib/navigation/db';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';

/**
 * Where to land when nothing is configured.
 *
 * '/' is the landing page. It used to be '/dashboard', which meant every
 * deployment without an explicit default nav item sent everyone — including
 * anonymous visitors — into the app and, for most of them, straight into a
 * sign-in wall. A tenant that has configured a default still gets it; this is
 * only the answer to "nothing is set up".
 */
const FALLBACK_PATH = '/';

/**
 * @returns the configured default nav path (is_default = TRUE, visible),
 *          or "/" (the landing page) when nothing is configured or the
 *          database is unavailable.
 */
export async function getDefaultRoutePath(scope?: NavigationScope): Promise<string> {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return FALLBACK_PATH;

  const appId = normalizeAppId(scope?.appId ?? getCurrentAppId());
  const tenantSlug = normalizeTenantSlug(scope?.tenantSlug ?? getTenantConfig().slug) || null;

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await ensureNavigationTable(prisma);
    const rows = await prisma.$queryRawUnsafe<{ path: string }[]>(
      `SELECT path FROM navigation_items
       WHERE is_default = TRUE AND is_visible = TRUE
         AND COALESCE(app_id, '') = $1
         AND ($2::text IS NULL OR tenant_slug IS NULL OR tenant_slug = $2)
       LIMIT 1`,
      appId,
      tenantSlug,
    );
    const path = rows.length > 0 ? rows[0].path : '';
    // Guard: never return an empty or external URL. The '/' path is VALID —
    // it is the Home page route and the root page renders it directly
    // (no redirect), so a self-loop cannot occur.
    if (!path || path.startsWith('http')) return FALLBACK_PATH;
    return path;
  } catch {
    return FALLBACK_PATH;
  } finally {
    await prisma.$disconnect();
  }
}
