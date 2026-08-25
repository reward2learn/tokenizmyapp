/**
 * Navigation Items CRUD API
 *
 * GET    /api/admin/navigation   — list all items (flat, with parentId)
 * POST   /api/admin/navigation   — create a new item
 * PUT    /api/admin/navigation   — update / reorder items (batch)
 * DELETE /api/admin/navigation?ids=... — delete one or more items
 *
 * Also exposed publicly (read-only) at GET /api/navigation for the app shell.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureNavigationTable, reconcileNavigation, resolveNavigationScope } from '@/lib/navigation/db';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient(url: string) {
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

// ── Schemas ─────────────────────────────────────────────

const authTierSchema = z
  .string()
  .max(50)
  .regex(/^(public|pin|google)(,(public|pin|google))*$/, 'Invalid auth tier list')
  .optional();

const createSchema = z.object({
  parentId: z.string().nullable().optional(),
  title: z.string().min(1).max(100),
  path: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  authTier: authTierSchema,
  requiredGroups: z.string().max(500).optional(),
  isVisible: z.boolean().optional(),
  // isDynamic is accepted but ignored — admin-created items are always dynamic
  isDynamic: z.boolean().optional(),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

const updateSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    parentId: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
    title: z.string().min(1).max(100).optional(),
    path: z.string().max(500).optional(),
    icon: z.string().max(50).optional(),
    authTier: authTierSchema,
    requiredGroups: z.string().max(500).optional(),
    isVisible: z.boolean().optional(),
    isDynamic: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  })),
  tenantSlug: z.string().max(50).optional(),
  appId: z.string().max(50).optional(),
});

// ── GET ─────────────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  // Allow any PIN/Google user to read navigation items

  // Cross-tenant browsing is a platform-admin-only capability; ignored for
  // any other caller so a tenant's own admin panel keeps seeing everything.
  const { searchParams } = new URL(request.url);
  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const scope = resolveNavigationScope({
    isPlatformAdmin,
    tenantSlug: searchParams.get('tenantSlug'),
    appId: searchParams.get('appId'),
  });
  const { tenantSlug, appId } = scope;

  // Tenants with their own dedicated database must be read there — the
  // tenant's own live app reads/writes that same DB via its own POSTGRES_URL,
  // never the platform root DB, even though the root `tenants` table also has
  // rows scoped by tenant_slug (stale leftovers once a tenant has its own DB).
  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await ensureNavigationTable(prisma);
    const {
      deleted,
      seeded,
      hierarchyUpdated,
    } = await reconcileNavigation(prisma, scope);
    if (seeded > 0) console.log(`[navigation] Seeded ${seeded} new item(s) from page catalog`);
    if (deleted > 0) console.log(`[navigation] Removed ${deleted} duplicate nav item(s)`);
    if (hierarchyUpdated > 0) {
      console.log(`[navigation] Applied default hierarchy to ${hierarchyUpdated} item(s)`);
    }

    const [scopeAppId, scopeTenantSlug] = [
      (appId ?? '').trim(),
      (tenantSlug ?? '').trim() || null,
    ];
    const items = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT id, parent_id AS "parentId", sort_order AS "sortOrder", title, path, icon,
              auth_tier AS "authTier", required_groups AS "requiredGroups",
              is_visible AS "isVisible", is_dynamic AS "isDynamic", is_default AS "isDefault",
              tenant_slug AS "tenantSlug", app_id AS "appId",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM navigation_items
       WHERE COALESCE(app_id, '') = $1
         AND ($2::text IS NULL OR tenant_slug IS NULL OR tenant_slug = $2)
       ORDER BY sort_order ASC`,
      scopeAppId,
      scopeTenantSlug,
    );
    // Build a tree structure for the UI
    const itemMap = new Map<string, Record<string, unknown>>();
    const roots: Record<string, unknown>[] = [];
    for (const item of items) {
      itemMap.set(item.id as string, { ...item, children: [] });
    }
    for (const item of itemMap.values()) {
      const parentId = item.parentId as string | null;
      if (parentId && itemMap.has(parentId)) {
        (itemMap.get(parentId)!.children as unknown[]).push(item);
      } else {
        roots.push(item);
      }
    }
    return jsonOk({ items: roots, flatItems: items });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

// ── POST (create) ──────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError('Invalid JSON', 400); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);

  const { parentId, title, path, icon, authTier, requiredGroups, isVisible, tenantSlug, appId } = parsed.data;

  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await ensureNavigationTable(prisma);
    await prisma.$executeRawUnsafe(
      `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic, tenant_slug, app_id, updated_at)
       VALUES (gen_random_uuid()::text, $1, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM navigation_items WHERE parent_id IS NULL), $2, $3, $4, $5, $6, $7, TRUE, $8, $9, CURRENT_TIMESTAMP)`,
      parentId ?? null, title, path ?? '', icon ?? '', authTier ?? 'public', requiredGroups ?? '', isVisible ?? true,
      tenantSlug ?? null, appId ?? null,
    );
    return jsonOk({ created: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

// ── PUT (batch update / reorder) ──────────────────────

export async function PUT(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError('Invalid JSON', 400); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);

  const { tenantSlug, appId } = parsed.data;
  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await ensureNavigationTable(prisma);
    for (const item of parsed.data.items) {
      const sets: string[] = ['updated_at = CURRENT_TIMESTAMP'];
      const params: unknown[] = [];
      let idx = 1;
      if (item.parentId !== undefined) { sets.push(`parent_id = $${idx++}`); params.push(item.parentId); }
      if (item.sortOrder !== undefined) { sets.push(`sort_order = $${idx++}`); params.push(item.sortOrder); }
      if (item.title !== undefined) { sets.push(`title = $${idx++}`); params.push(item.title); }
      if (item.path !== undefined) { sets.push(`path = $${idx++}`); params.push(item.path); }
      if (item.icon !== undefined) { sets.push(`icon = $${idx++}`); params.push(item.icon); }
      if (item.authTier !== undefined) { sets.push(`auth_tier = $${idx++}`); params.push(item.authTier); }
      if (item.requiredGroups !== undefined) { sets.push(`required_groups = $${idx++}`); params.push(item.requiredGroups); }
      if (item.isVisible !== undefined) { sets.push(`is_visible = $${idx++}`); params.push(item.isVisible); }
      if (item.isDynamic !== undefined) { sets.push(`is_dynamic = $${idx++}`); params.push(item.isDynamic); }
      if (item.isDefault !== undefined) {
        // Clear any existing default first — scoped to this tenant when this
        // connection is a shared DB (dedicated-DB connections only ever hold
        // one tenant's rows, so the scoping is a no-op there, not a hazard).
        if (tenantSlug) {
          await prisma.$executeRawUnsafe(`UPDATE navigation_items SET is_default = FALSE WHERE tenant_slug = $1`, tenantSlug);
        } else {
          await prisma.$executeRawUnsafe(`UPDATE navigation_items SET is_default = FALSE`);
        }
        sets.push(`is_default = $${idx++}`);
        params.push(item.isDefault);
      }
      params.push(item.id);
      await prisma.$executeRawUnsafe(
        `UPDATE navigation_items SET ${sets.join(', ')} WHERE id = $${idx}`,
        ...params,
      );
    }
    return jsonOk({ updated: parsed.data.items.length });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}

// ── DELETE ─────────────────────────────────────────────

export async function DELETE(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) return jsonError('Query param "ids" required (comma-separated)', 400);
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return jsonError('No valid IDs provided', 400);
  const tenantSlug = searchParams.get('tenantSlug');
  const appId = searchParams.get('appId');

  const dbUrl = await resolveTenantDbUrl(tenantSlug, appId);
  const prisma = getClient(dbUrl);
  try {
    await ensureNavigationTable(prisma);
    // Set children's parent_id to null first, then delete
    await prisma.$executeRawUnsafe(
      `UPDATE navigation_items SET parent_id = NULL WHERE parent_id = ANY($1::text[])`,
      ids,
    );
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM navigation_items WHERE id = ANY($1::text[])`,
      ids,
    );
    return jsonOk({ deleted: Number(result) });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
