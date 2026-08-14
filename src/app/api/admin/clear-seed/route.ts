/**
 * Clear / Inspect Seeded Data API
 *
 * GET /api/admin/clear-seed?tenantSlug=...
 *   Row counts per seed table. tenantSlug (platform-admin only) targets that
 *   tenant's own dedicated database; omitted, targets the current app's own
 *   database (the historical, self-clear-only behavior).
 *
 * POST /api/admin/clear-seed
 *   Deletes seeded content from the database.
 *
 *   Body (full clear):
 *     { "confirm": "CLEAR ALL SEEDED DATA", "tenantSlug"?: "redrubybali" }
 *     Deletes ALL seed tables.
 *
 *   Body (targeted clear):
 *     { "tables": ["business_review_parts", "knowledge_snippets"], "confirm": "CLEAR SELECTED", "tenantSlug"?: "..." }
 *     Deletes only the specified tables (must include confirm string "CLEAR SELECTED").
 *
 *   `tenantSlug` (platform-admin only) targets that tenant's own dedicated
 *   database instead of the current app's own — every app in a suite shares
 *   one tenant database, so this clears every app's data in these tables
 *   (none of them have an app_id column to scope by more narrowly).
 *
 *   Preserves operational data: conversations, user accounts, security
 *   groups, secrets, app settings, and PDF jobs.
 *
 *   Returns: { deleted: Record<string, number> } — counts per table
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const tableNames = [
  'page_sections',
  'app_pages',
  'task_assignments',
  'tasks',
  'roles',
  'action_items',
  'levers',
  'monthly_targets',
  'daily_metrics',
  'monthly_actual_departments',
  'monthly_actual_inputs',
  'business_review_parts',
  'knowledge_snippets',
  'financial_projections',
  'navigation_items',
  'daily_z_reports',
] as const;

const clearSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('all'), confirm: z.literal('CLEAR ALL SEEDED DATA'), tenantSlug: z.string().max(50).optional() }),
  z.object({
    mode: z.literal('selected'),
    tables: z.array(z.enum(tableNames)).min(1),
    confirm: z.literal('CLEAR SELECTED'),
    tenantSlug: z.string().max(50).optional(),
  }),
]);

export type ClearMode = 'all' | 'selected';

/** Resolve the target DB connection for this request — the selected tenant's
 *  own dedicated database when a platform admin passes tenantSlug, otherwise
 *  the current app's own (self-clear, the historical behavior). */
async function resolveClient(tenantSlug: string | undefined, isPlatformAdmin: boolean): Promise<PrismaClient | { error: NextResponse }> {
  if (tenantSlug && isPlatformAdmin) {
    const dbUrl = await resolveTenantDbUrl(tenantSlug);
    if (!dbUrl) return { error: jsonError(`Tenant "${tenantSlug}" has no database configured`, 400) };
    return new PrismaClient({ datasources: { db: { url: dbUrl } } });
  }
  const connStr = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connStr) return { error: jsonError('POSTGRES_URL not configured', 500) };
  return new PrismaClient({ datasources: { db: { url: connStr } } });
}

// ── GET: row-count overview ────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const { searchParams } = new URL(request.url);
  const tenantSlug = isPlatformAdmin ? (searchParams.get('tenantSlug') ?? undefined) : undefined;

  const clientOrError = await resolveClient(tenantSlug, isPlatformAdmin);
  if ('error' in clientOrError) return clientOrError.error;
  const prisma = clientOrError;

  try {
    const counts: Record<string, number> = {};
    for (const table of tableNames) {
      try {
        const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*) AS count FROM "${table}"`);
        counts[table] = Number(rows[0]?.count ?? 0);
      } catch (err) {
        console.warn(`[clear-seed] Count failed for "${table}":`, err instanceof Error ? err.message : err);
        counts[table] = -1; // table missing or inaccessible
      }
    }
    const total = Object.values(counts).reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
    return jsonOk({ counts, total, tenantSlug: tenantSlug ?? null });
  } catch (err) {
    return jsonError(`Count failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  } finally {
    await prisma.$disconnect();
  }
}

// ── POST: clear ─────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError('Invalid JSON body', 400); }

  const parsed = clearSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      'Send { "mode": "all", "confirm": "CLEAR ALL SEEDED DATA" } or ' +
      '{ "mode": "selected", "tables": [...], "confirm": "CLEAR SELECTED" }',
      400,
    );
  }

  const tablesToDelete: readonly string[] = parsed.data.mode === 'all'
    ? tableNames
    : parsed.data.tables;

  const clientOrError = await resolveClient(parsed.data.tenantSlug, true);
  if ('error' in clientOrError) return clientOrError.error;
  const prisma = clientOrError;

  try {
    const deleted: Record<string, number> = {};

    // Delete in reverse-dependency order
    const orderedTables = tableNames.filter((t) => tablesToDelete.includes(t));
    for (const table of orderedTables) {
      try {
        const result = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
        deleted[table] = Number(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[clear-seed] Table "${table}" delete failed: ${message}`);
        deleted[table] = -1;
      }
    }

    // Clear in-memory catalogs so nav and review reflect the empty DB — only
    // meaningful for a self-clear; a remote tenant's own deployment has its
    // own separate process memory this can't reach.
    if (!parsed.data.tenantSlug) {
      const { setDynamicPages, setDynamicReviewParts } = await import('@/lib/page-catalog');
      setDynamicPages([]);
      setDynamicReviewParts([]);
    }

    console.log(`[clear-seed] Cleared (${parsed.data.tenantSlug ?? 'self'}):`, JSON.stringify(deleted));

    return jsonOk({
      deleted,
      message: parsed.data.mode === 'all'
        ? 'All seeded data has been cleared.'
        : `Selected tables cleared: ${parsed.data.tables.join(', ')}`,
    });
  } catch (err) {
    return jsonError(`Clear failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  } finally {
    await prisma.$disconnect();
  }
}
