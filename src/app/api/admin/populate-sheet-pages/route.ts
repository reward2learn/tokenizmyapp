import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureNavigationTable } from '@/lib/navigation/db';
import { isPlatformApp } from '@shared/lib/config/tenant';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const bodySchema = z.object({
  parentId: z.string().optional(),
  parentTitle: z.string().optional(),
});

/**
 * POST /api/admin/populate-sheet-pages
 *
 * Syncs navigation_items for all app_pages with slug LIKE 'sheet-%'.
 * Pages become children of the specified parent (or an "Excel" folder
 * created if none is provided).
 *
 * Idempotent — existing nav items are skipped.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  // Platform admins may populate any tenant; on a tenant deploy the local
  // write-auth session is enough (there is no separate platform registry).
  // Blocking with "platform admin only" made Populate Sheet Pages a no-op on
  // every provisioned app (e.g. tokenizmyapp-ceo-overview).
  // On the platform console, require platform-admin. On a tenant deploy the
  // local write-auth session is enough — blocking "platform admin only" made
  // Populate Sheet Pages a no-op on every provisioned app.
  if (isPlatformApp() && !sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError('Invalid JSON', 400); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError('Validation error: ' + JSON.stringify(parsed.error.flatten()), 400);

  const { parentId, parentTitle } = parsed.data;
  const prisma = getClient();

  try {
    await ensureNavigationTable(prisma);

    // Find or create the parent folder
    let folderId = parentId ?? null;
    if (!folderId) {
      const folderName = parentTitle || 'Excel';
      const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM navigation_items WHERE title = $1 AND parent_id IS NULL LIMIT 1`,
        folderName,
      );
      if (existing[0]) {
        folderId = existing[0].id;
      } else {
        const created = await prisma.$queryRawUnsafe<{ id: string }[]>(
          `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic, updated_at)
           VALUES (gen_random_uuid()::TEXT, NULL, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM navigation_items WHERE parent_id IS NULL),
           $1, '/excel', 'Folder', CAST('google' AS "AuthTier"), '', true, true, CURRENT_TIMESTAMP)
           RETURNING id`,
          folderName,
        );
        folderId = created[0]?.id ?? null;
      }
    }

    if (!folderId) {
      return jsonError('Could not find or create parent navigation folder', 500);
    }

    // Sync sheet page nav items
    const sheets = await prisma.$queryRawUnsafe<{ slug: string; title: string }[]>(
      `SELECT slug, title FROM app_pages WHERE slug LIKE 'sheet-%' ORDER BY slug`,
    );

    let created = 0;
    let navSort = 0;
    for (const sheet of sheets) {
      // Skip if already present under this parent
      const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM navigation_items WHERE path = $1 AND parent_id = $2 LIMIT 1`,
        `/${sheet.slug}`, folderId,
      );
      if (existing.length === 0) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, required_groups, is_visible, is_dynamic, updated_at)
           VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, 'Description', CAST('google' AS "AuthTier"), '', true, true, CURRENT_TIMESTAMP)`,
          folderId, navSort++, sheet.title, `/${sheet.slug}`,
        );
        created++;
      }
    }

    return jsonOk({ created, parentId: folderId, totalSheets: sheets.length });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
