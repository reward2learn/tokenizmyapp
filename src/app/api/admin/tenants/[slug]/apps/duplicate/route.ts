/**
 * Duplicate App API — clone an existing suite app (identity + content).
 *
 * POST /api/admin/tenants/[slug]/apps/duplicate
 *
 * Body: {
 *   sourceAppId: string;      // existing app in the suite to clone
 *   appId: string;            // new app id (must be unique in the suite)
 *   name: string;             // new display name
 *   department?: string;      // defaults to the source app's department
 *   templateId?: string;      // defaults to the source app's template
 *   copyContent?: boolean;    // default true — clone the source app's seeded
 *                             // content rows (pages, nav, snippets, business
 *                             // data) into the new app's scope
 * }
 *
 * What is cloned:
 *   - The appPack entry: template, department, brand colors, metadata.
 *     Deployment state (vercelProjectId/appUrl/dbUrl/deployHookUrl) is NOT
 *     copied — the duplicate gets its own project on its own Deploy action.
 *   - App-scoped content rows in the tenant's database (dedicated DB when
 *     configured, otherwise the root DB): knowledge snippets, business review
 *     parts, tasks (+ assignments), levers, action items, monthly targets,
 *     daily metrics, actuals, financial projections, z-reports, app pages
 *     (slug-remapped for pack pages, skipped on global-slug collision),
 *     page sections, and navigation items (path-remapped).
 *   - NOT copied: user accounts, security groups, roles (shared catalogs),
 *     chat conversations, app_settings (recreated by seed/deploy).
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { addTenantColumnsIfMissing } from '@/domain/tenant/tenant-seed-service';
import { getTemplate } from '@/domain/tenant/template-catalog';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// ── Helpers ────────────────────────────────────────────────

function getAppPack(tenant: Record<string, unknown>): AppPackConfig | null {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

async function saveAppPack(db: ReturnType<typeof createRawClient>, slug: string, appPack: AppPackConfig): Promise<void> {
  await db.$executeRawUnsafe(
    `UPDATE tenants SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{config,appPack}', $1::jsonb), updated_at = CURRENT_TIMESTAMP WHERE slug = $2;`,
    JSON.stringify(appPack),
    slug,
  );
}

/** Validate an app id: lowercase alphanumerics + hyphens, 1–50 chars. */
function isValidAppId(appId: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,49}$/.test(appId);
}

// ── Content copy ───────────────────────────────────────────

/**
 * Copy the source app's seeded/business rows into the new app's scope.
 *
 * Tables with a uuid/cuid TEXT id get fresh ids; autoincrement tables omit
 * the id column; composite-key tables (PK includes app_id) copy directly.
 * Tasks/pages/nav use a deterministic 'dup:' id prefix so child rows
 * (task_assignments, page_sections) can remap their FK references in SQL.
 *
 * Returns per-table copied row counts. Each table is best-effort — a missing
 * table or column (pre-migration tenant DB) is non-fatal, matching the seed
 * service's self-healing style.
 */
async function copyAppContent(
  db: { $executeRawUnsafe: (sql: string, ...params: unknown[]) => Promise<number> },
  tenantSlug: string,
  sourceAppId: string,
  newAppId: string,
): Promise<Record<string, number>> {
  const copied: Record<string, number> = {};

  const run = async (table: string, sql: string, ...params: unknown[]): Promise<void> => {
    try {
      const n = await db.$executeRawUnsafe(sql, ...params);
      copied[table] = n;
    } catch (err) {
      console.warn(`[app-duplicate] Copy skipped for "${table}":`, err instanceof Error ? err.message : err);
      copied[table] = 0;
    }
  };

  // 1. Direct app_id tables with uuid/cuid TEXT ids — fresh ids, new app_id.
  const uuidTables: { table: string; columns: string[] }[] = [
    { table: 'knowledge_snippets', columns: ['key', 'content', 'category'] },
    { table: 'business_review_parts', columns: ['part_key', 'slug', 'title', 'sort_order', 'auth_tier', 'markdown'] },
    { table: 'levers', columns: ['num', 'name', 'impact', 'description'] },
    { table: 'action_items', columns: ['priority', 'label', 'completed', 'sort_order'] },
  ];
  for (const { table, columns } of uuidTables) {
    await run(
      table,
      `INSERT INTO "${table}" (id, ${columns.join(', ')}, app_id)
       SELECT gen_random_uuid()::text, ${columns.join(', ')}, $1
       FROM "${table}" WHERE app_id = $2;`,
      newAppId,
      sourceAppId,
    );
  }

  // 2. Tasks — deterministic 'dup:' ids so assignments can remap task_id.
  await run(
    'tasks',
    `INSERT INTO tasks (id, title, description, priority, status, due_date, sort_order, created_at, updated_at, app_id)
     SELECT 'dup:' || id, title, description, priority, status, due_date, sort_order, created_at, updated_at, $1
     FROM tasks WHERE app_id = $2;`,
    newAppId,
    sourceAppId,
  );
  await run(
    'task_assignments',
    `INSERT INTO task_assignments (id, task_id, role_id, assigned)
     SELECT 'dup:' || id, 'dup:' || task_id, role_id, assigned
     FROM task_assignments WHERE task_id IN (SELECT id FROM tasks WHERE app_id = $1);`,
    sourceAppId,
  );
  await run(
    'task_user_assignments',
    `INSERT INTO task_user_assignments (id, task_id, user_account_id, assigned)
     SELECT 'dup:' || id, 'dup:' || task_id, user_account_id, assigned
     FROM task_user_assignments WHERE task_id IN (SELECT id FROM tasks WHERE app_id = $1);`,
    sourceAppId,
  );

  // 3. Autoincrement-id tables — omit id, let the sequence assign fresh ids.
  const autoTables: { table: string; columns: string[] }[] = [
    {
      table: 'financial_projections',
      columns: ['period', 'year', 'month', 'data_type', 'scenario', 'revenue', 'ebitda', 'net_income', 'guests', 'staff_cost', 'pnl_lines'],
    },
    {
      table: 'daily_z_reports',
      columns: [
        'report_date', 'department', 'report_time', 'operator', 'report_no', 'pos_group',
        'period_start', 'period_end', 'item_sales_qty', 'item_sales_amount', 'item_discount_qty',
        'item_discount_amount', 'bill_discount_qty', 'bill_discount_amount', 'foc_items_qty',
        'foc_items_amount', 'foc_bill_qty', 'foc_bill_amount', 'total_sales', 'estimated_sales',
        'cash_qty', 'cash_amount', 'bca_qty', 'bca_amount', 'gojek_pay_qty', 'gojek_pay_amount',
        'mandiri_qty', 'mandiri_amount', 'total_card_qty', 'total_card_amount', 'total_cash_qty',
        'total_cash_amount', 'refund_qty', 'refund_amount', 'pre_send_void_qty', 'pre_send_void_amount',
        'post_send_void_qty', 'post_send_void_amount', 'tot_collection_qty', 'tot_collection_amount',
        'tax_10_amount', 'service_7_amount', 'nett_sales', 'bills_pending_qty', 'bills_pending_amount',
        'total_bills', 'avg_bills', 'total_covers', 'avg_covers', 'begin_receipt_no', 'end_receipt_no',
        'group_beverage_qty', 'group_beverage_amount', 'group_food_qty', 'group_food_amount',
        'group_total_qty', 'group_total_amount', 'group_foc_beverage_qty', 'group_foc_beverage_amount',
        'group_foc_food_qty', 'group_foc_food_amount', 'dine_in_qty', 'dine_in_amount', 'gofood_qty',
        'gofood_amount', 'total_ctgry_qty', 'total_ctgry_amount', 'bill_disc_20_qty', 'bill_disc_20_amount',
        'total_item_discount_qty', 'total_item_discount_amount', 'raw_text', 'entry_source',
        'receipt_images', 'corrected_at', 'correction_field', 'correction_reason', 'created_at',
      ],
    },
    { table: 'daily_metrics', columns: ['date', 'revenue', 'guests_count', 'avg_spend', 'staff_count', 'staff_cost', 'food_cost', 'beverage_cost', 'gofood_revenue', 'direct_orders', 'notes', 'created_at'] },
    { table: 'monthly_targets', columns: ['month', 'target_revenue', 'target_ebitda', 'target_guests', 'target_avg_spend', 'target_staff_cost_pct'] },
  ];
  for (const { table, columns } of autoTables) {
    await run(
      table,
      `INSERT INTO "${table}" (${columns.join(', ')}, app_id)
       SELECT ${columns.join(', ')}, $1
       FROM "${table}" WHERE app_id = $2;`,
      newAppId,
      sourceAppId,
    );
  }

  // 4. Composite-key tables (PK already includes app_id — no id column).
  await run(
    'monthly_actual_inputs',
    `INSERT INTO monthly_actual_inputs (period, inputs, updated_at, app_id)
     SELECT period, inputs, updated_at, $1 FROM monthly_actual_inputs WHERE app_id = $2;`,
    newAppId,
    sourceAppId,
  );
  await run(
    'monthly_actual_departments',
    `INSERT INTO monthly_actual_departments (period, department, inputs, receipt_images, notes, updated_at, app_id)
     SELECT period, department, inputs, receipt_images, notes, updated_at, $1
     FROM monthly_actual_departments WHERE app_id = $2;`,
    newAppId,
    sourceAppId,
  );

  // 5. App pages — remap pack-style slugs (slug contains the source appId),
  //    skip on global-slug collision (factory pages like 'dashboard' are
  //    shared rows across same-template apps; ON CONFLICT DO NOTHING).
  await run(
    'app_pages',
    `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug, app_id)
     SELECT 'dup:' || id, REPLACE(slug, $1, $2), title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug, $2
     FROM app_pages WHERE app_id = $1 AND tenant_slug = $3
     ON CONFLICT (slug) DO NOTHING;`,
    sourceAppId,
    newAppId,
    tenantSlug,
  );

  // 6. Page sections — only for pages that were actually copied (join on the
  //    deterministic 'dup:' page id).
  await run(
    'page_sections',
    `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
     SELECT 'dup:' || ps.id, 'dup:' || ps.page_id, ps.sort_order, ps.block_type, ps.config
     FROM page_sections ps
     JOIN app_pages op ON op.id = ps.page_id AND op.app_id = $1 AND op.tenant_slug = $2
     JOIN app_pages np ON np.id = 'dup:' || op.id;`,
    sourceAppId,
    tenantSlug,
  );

  // 7. Navigation items — new ids, remapped parent ids and paths (pack paths
  //    embed the source appId; factory paths are shared and stay as-is).
  await run(
    'navigation_items',
    `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, tenant_slug, app_id, is_active, required_groups, is_visible, is_dynamic, is_default, created_at, updated_at)
     SELECT 'dup:' || id,
            CASE WHEN parent_id IS NOT NULL THEN 'dup:' || parent_id ELSE NULL END,
            sort_order, title, REPLACE(path, $1, $2), icon, auth_tier, tenant_slug, $2,
            is_active, required_groups, is_visible, is_dynamic, is_default, created_at, updated_at
     FROM navigation_items WHERE app_id = $1 AND tenant_slug = $3
     ON CONFLICT (id) DO NOTHING;`,
    sourceAppId,
    newAppId,
    tenantSlug,
  );

  return copied;
}

// ── POST: Duplicate App ────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    const body = await request.json() as {
      sourceAppId: string;
      appId: string;
      name: string;
      department?: string;
      templateId?: string;
      copyContent?: boolean;
    };

    const { sourceAppId, appId, name, department, templateId, copyContent = true } = body;

    if (!sourceAppId || !appId || !name) {
      return jsonError('Missing required fields: sourceAppId, appId, name', 400);
    }
    if (!isValidAppId(appId)) {
      return jsonError('appId must be lowercase alphanumerics + hyphens (1–50 chars)', 400);
    }
    if (templateId) {
      try {
        getTemplate(templateId);
      } catch {
        return jsonError(`Unknown template: ${templateId}`, 400);
      }
    }

    await ensureTenantsTable(db);
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0];
    const appPack = getAppPack(tenant);
    if (!appPack) return jsonError('Tenant is not in suite mode', 400);

    const source = appPack.apps.find((a) => a.appId === sourceAppId);
    if (!source) return jsonError(`Source app "${sourceAppId}" not found in suite`, 404);
    if (appPack.apps.some((a) => a.appId === appId)) {
      return jsonError(`App "${appId}" already exists in suite`, 409);
    }

    // Clone the appPack entry — identity + brand from the source, but never
    // deployment state (the duplicate gets its own Vercel project + hook).
    const newApp: SuiteAppInstance = {
      appId,
      name,
      department: department?.trim() || source.department,
      templateId: templateId ?? source.templateId,
      status: 'pending',
      vercelProjectId: null,
      appUrl: null,
      dbUrl: null,
      primaryColor: source.primaryColor,
      secondaryColor: source.secondaryColor,
      deployHookUrl: null,
      metadata: source.metadata ? { ...source.metadata } : undefined,
    };

    appPack.apps.push(newApp);
    await saveAppPack(db, slug, appPack);

    // Clone content rows into the tenant's own dedicated DB (all suite apps
    // share it), falling back to the root DB when no dedicated DB exists.
    let copied: Record<string, number> = {};
    if (copyContent) {
      const tenantDbUrl = tenant.db_url as string | null;
      const dedicatedClient = tenantDbUrl
        ? new PrismaClient({ datasources: { db: { url: tenantDbUrl } } })
        : null;
      try {
        const copyDb = dedicatedClient ?? db;
        // Self-healing — a tenant DB may predate the app_id columns.
        try {
          await addTenantColumnsIfMissing(copyDb);
        } catch {
          // Best-effort — individual table copies guard themselves.
        }
        copied = await copyAppContent(copyDb, slug, sourceAppId, appId);
      } finally {
        if (dedicatedClient) await dedicatedClient.$disconnect();
      }
    }

    console.log(`[app-duplicate] Duplicated "${sourceAppId}" → "${appId}" for tenant "${slug}" (${Object.values(copied).reduce((s, n) => s + n, 0)} rows copied)`);

    return jsonOk({
      duplicated: true,
      app: newApp,
      totalApps: appPack.apps.length,
      copied,
    });
  } catch (err) {
    return jsonError('Failed to duplicate app: ' + (err as Error).message, 500);
  }
}