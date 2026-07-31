/**
 * Default Route Resolver
 *
 * Resolves the configured default landing route (the navigation item marked
 * is_default = TRUE) directly against the database.
 *
 * Used by:
 *  - app/page.tsx (root landing redirect — server component)
 *  - app/api/default-route (public JSON endpoint)
 *
 * IMPORTANT: this must NEVER self-fetch over HTTP. The old implementation
 * called fetch(`${VERCEL_URL}/api/default-route`) from the root page — the
 * deployment URL is behind Vercel SSO/deployment protection, so the fetch
 * was redirected to the SSO login, res.ok was false, and the app always
 * fell back to "/dashboard" regardless of the configured default.
 */

import { PrismaClient } from '@/generated/prisma';

const FALLBACK_PATH = '/dashboard';

/**
 * @returns the configured default nav path (is_default = TRUE, visible),
 *          or "/dashboard" when nothing is configured or unavailable.
 */
export async function getDefaultRoutePath(): Promise<string> {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return FALLBACK_PATH;

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const rows = await prisma.$queryRawUnsafe<{ path: string }[]>(
      `SELECT path FROM navigation_items WHERE is_default = TRUE AND is_visible = TRUE LIMIT 1`,
    );
    const path = rows.length > 0 ? rows[0].path : '';
    // Guard: never redirect to the root itself (self-loop) or to external URLs.
    if (!path || path === '/' || path.startsWith('http')) return FALLBACK_PATH;
    return path;
  } catch {
    return FALLBACK_PATH;
  } finally {
    await prisma.$disconnect();
  }
}
