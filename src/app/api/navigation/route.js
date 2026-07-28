/**
 * Public Navigation API
 *
 * GET /api/navigation
 *   Returns the navigation tree (visible items only, filtered by auth tier + groups).
 *   No auth required — used by the app shell drawer.
 *
 * Query params:
 *   tier — current user's auth tier (public|pin|google) — defaults to public
 *   groups — comma-separated group codes the user belongs to
 */
import { PrismaClient } from '@/generated/prisma';
import { jsonOk } from '@/lib/api/response';
import { ensureNavigationTable, seedMissingNavigationFromCatalog } from '@/lib/navigation/db';
export const dynamic = 'force-dynamic';
function getClient() {
    const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!url)
        throw new Error('POSTGRES_URL is not set');
    return new PrismaClient({ datasources: { db: { url } } });
}
const TIER_RANK = { public: 0, pin: 1, google: 2 };
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier') || 'public';
    const groupsParam = searchParams.get('groups') || '';
    const userGroups = groupsParam.split(',').map((g) => g.trim()).filter(Boolean);
    const userTierRank = TIER_RANK[tier] ?? 0;
    // If no DB is configured, return empty nav (graceful fallback for dev/demo)
    const dbUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!dbUrl) {
        return jsonOk({ items: [] });
    }
    const prisma = getClient();
    try {
        await ensureNavigationTable(prisma);
        const seeded = await seedMissingNavigationFromCatalog(prisma);
        if (seeded > 0)
            console.log(`[navigation] Seeded ${seeded} new item(s) from page catalog`);
        const rows = await prisma.$queryRawUnsafe(`SELECT id, parent_id AS "parentId", sort_order AS "sortOrder", title, path, icon,
              auth_tier AS "authTier", required_groups AS "requiredGroups",
              is_visible AS "isVisible", is_dynamic AS "isDynamic", is_default AS "isDefault"
       FROM navigation_items
       WHERE is_visible = TRUE
       ORDER BY sort_order ASC`);
        // Filter by tier + group access
        const filtered = [];
        for (const r of rows) {
            const itemTierRank = TIER_RANK[String(r.authTier ?? 'public')] ?? 0;
            if (itemTierRank > userTierRank)
                continue;
            const reqGroups = String(r.requiredGroups ?? '');
            if (reqGroups) {
                const groups = reqGroups.split(',').map((g) => g.trim()).filter(Boolean);
                if (groups.length > 0 && !groups.some((g) => userGroups.includes(g)) && !userGroups.includes('platform-admin')) {
                    continue;
                }
            }
            filtered.push({
                id: r.id,
                parentId: r.parentId,
                sortOrder: Number(r.sortOrder ?? 0),
                title: r.title,
                path: r.path,
                icon: r.icon,
                authTier: r.authTier,
                requiredGroups: r.requiredGroups,
                isVisible: Boolean(r.isVisible),
                isDynamic: Boolean(r.isDynamic),
                isDefault: Boolean(r.isDefault),
                children: [],
            });
        }
        // Build tree
        const itemMap = new Map();
        const roots = [];
        for (const item of filtered)
            itemMap.set(item.id, item);
        for (const item of filtered) {
            if (item.parentId && itemMap.has(item.parentId)) {
                itemMap.get(item.parentId).children.push(item);
            }
            else {
                roots.push(item);
            }
        }
        return jsonOk({ items: roots });
    }
    catch (err) {
        console.error('[navigation] Failed to read:', err);
        // Empty envelope — app shell falls back to static page-catalog
        return jsonOk({ items: [] });
    }
    finally {
        await prisma.$disconnect();
    }
}
