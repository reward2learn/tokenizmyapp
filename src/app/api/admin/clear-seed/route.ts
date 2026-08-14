/**
 * Clear / Inspect Seeded Data API
 *
 * GET /api/admin/clear-seed?tenantSlug=...&appId=...
 *   Row counts per seed table. tenantSlug (platform-admin only) targets that
 *   tenant's own dedicated database; omitted, targets the current app's own
 *   database (the historical, self-clear-only behavior). appId further scopes
 *   counts to a single app within that tenant's shared database.
 *
 * POST /api/admin/clear-seed
 *   Deletes seeded content from the database.
 *
 *   Body (full clear):
 *     { "confirm": "CLEAR ALL SEEDED DATA", "tenantSlug"?: "redrubybali", "appId"?: "hr" }
 *     Deletes ALL seed tables.
 *
 *   Body (targeted clear):
 *     { "tables": ["business_review_parts", "knowledge_snippets"], "confirm": "CLEAR SELECTED", "tenantSlug"?: "...", "appId"?: "..." }
 *     Deletes only the specified tables (must include confirm string "CLEAR SELECTED").
 *
 *   `tenantSlug` (platform-admin only) targets that tenant's own dedicated
 *   database instead of the current app's own. Every app in a suite shares
 *   one tenant database — pass `appId` to scope the clear to just that app's
 *   rows (all 16 tables now carry or join to an app_id column); omit it to
 *   clear every app sharing the tenant's database, as before.
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
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';

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
  z.object({ mode: z.literal('all'), confirm: z.literal('CLEAR ALL SEEDED DATA'), tenantSlug: z.string().max(50).optional(), appId: z.string().max(50).optional() }),
  z.object({
    mode: z.literal('selected'),
    tables: z.array(z.enum(tableNames)).min(1),
    confirm: z.literal('CLEAR SELECTED'),
    tenantSlug: z.string().max(50).optional(),
    appId: z.string().max(50).optional(),
  }),
]);

export type ClearMode = 'all' | 'selected';

/** Tables with a direct app_id column — every business-data + factory table
 *  as of the app_id scoping migration (see tenant-seed-service.ts). */
const DIRECT_APP_ID_TABLES = new Set<string>([
  'app_pages', 'navigation_items', 'roles', 'tasks', 'action_items', 'levers',
  'monthly_targets', 'daily_metrics', 'monthly_actual_departments',
  'monthly_actual_inputs', 'business_review_parts', 'knowledge_snippets',
  'financial_projections', 'daily_z_reports',
]);

/** Tables scoped to an app only indirectly, via a join to a directly-scoped
 *  parent table (no app_id column of their own). */
const JOINED_APP_ID_CLAUSE: Record<string, string> = {
  page_sections: `page_id IN (SELECT id FROM app_pages WHERE app_id = $1)`,
  task_assignments: `task_id IN (SELECT id FROM tasks WHERE app_id = $1)`,
};

/** Build the WHERE clause (no leading "WHERE") + params for scoping a table
 *  by appId, or null when the table can't be scoped this way (row-count/
 *  delete then falls back to unscoped — same as omitting appId entirely). */
function appIdWhere(table: string, appId: string | undefined): { clause: string; params: unknown[] } | null {
  if (!appId) return null;
  if (DIRECT_APP_ID_TABLES.has(table)) return { clause: 'app_id = $1', params: [appId] };
  if (table in JOINED_APP_ID_CLAUSE) return { clause: JOINED_APP_ID_CLAUSE[table]!, params: [appId] };
  return null;
}

/** Resolve the target DB connection for this request — the selected tenant's
 *  own dedicated database when a platform admin passes tenantSlug, otherwise
 *  the current app's own (self-clear, the historical behavior). */
async function resolveClient(tenantSlug: string | undefined, isPlatformAdmin: boolean): Promise<PrismaClient | { error: NextResponse }> {
  let prisma: PrismaClient;
  if (tenantSlug && isPlatformAdmin) {
    const dbUrl = await resolveTenantDbUrl(tenantSlug);
    if (!dbUrl) return { error: jsonError(`Tenant "${tenantSlug}" has no database configured`, 400) };
    prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  } else {
    const connStr = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!connStr) return { error: jsonError('POSTGRES_URL not configured', 500) };
    prisma = new PrismaClient({ datasources: { db: { url: connStr } } });
  }
  // Self-healing — a tenant's dedicated DB may predate the app_id columns on
  // these tables (only added by a Seed/Sync action, or here). Without this,
  // a never-re-seeded tenant's counts/deletes silently no-op per table.
  try {
    await addTenantColumnsIfMissing(prisma);
  } catch {
    // Best-effort — individual table operations below still guard themselves.
  }
  return prisma;
}

// ── GET: row-count overview ────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const { searchParams } = new URL(request.url);
  const tenantSlug = isPlatformAdmin ? (searchParams.get('tenantSlug') ?? undefined) : undefined;
  const appId = isPlatformAdmin ? (searchParams.get('appId') ?? undefined) : undefined;

  const clientOrError = await resolveClient(tenantSlug, isPlatformAdmin);
  if ('error' in clientOrError) return clientOrError.error;
  const prisma = clientOrError;

  try {
    const counts: Record<string, number> = {};
    for (const table of tableNames) {
      try {
        const scope = appIdWhere(table, appId);
        const sql = scope
          ? `SELECT COUNT(*) AS count FROM "${table}" WHERE ${scope.clause}`
          : `SELECT COUNT(*) AS count FROM "${table}"`;
        const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(sql, ...(scope?.params ?? []));
        counts[table] = Number(rows[0]?.count ?? 0);
      } catch (err) {
        console.warn(`[clear-seed] Count failed for "${table}":`, err instanceof Error ? err.message : err);
        counts[table] = -1; // table missing or inaccessible
      }
    }
    const total = Object.values(counts).reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
    return jsonOk({ counts, total, tenantSlug: tenantSlug ?? null, appId: appId ?? null });
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
        const scope = appIdWhere(table, parsed.data.appId);
        const sql = scope
          ? `DELETE FROM "${table}" WHERE ${scope.clause}`
          : `DELETE FROM "${table}"`;
        const result = await prisma.$executeRawUnsafe(sql, ...(scope?.params ?? []));
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

    console.log(`[clear-seed] Cleared (${parsed.data.tenantSlug ?? 'self'}${parsed.data.appId ? `/${parsed.data.appId}` : ''}):`, JSON.stringify(deleted));

    return jsonOk({
      deleted,
      message: parsed.data.mode === 'all'
        ? (parsed.data.appId ? `All seeded data for app "${parsed.data.appId}" has been cleared.` : 'All seeded data has been cleared.')
        : `Selected tables cleared: ${parsed.data.tables.join(', ')}`,
    });
  } catch (err) {
    return jsonError(`Clear failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  } finally {
    await prisma.$disconnect();
  }
}
