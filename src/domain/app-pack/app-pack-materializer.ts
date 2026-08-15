/**
 * App Pack — Materializer
 *
 * Persists a compiled app pack into the tenant DB via raw pg (workflow steps
 * use short-lived connections, same as workbook-ingest). All writes are
 * idempotent: rows are scoped by packId prefix and replaced on re-run.
 *
 * DB constraints (from zenstack/schema.zmodel):
 *   - app_pages.slug is UNIQUE (global) → flat packId-prefixed slugs
 *   - page_sections.block_type is a BlockType ENUM → cast required
 *   - knowledge_snippets (key, app_id) is UNIQUE → packId-prefixed keys, app_id ''
 *   - security_groups.code is UNIQUE → upsert, never delete (referenced)
 */

import type { Client } from 'pg';
import type { AppPackAppDefinition, AppPackDecomposition } from './app-pack-schema';
import { compileAppRows, compileCeoRows, type CompiledAppArtifacts } from './app-pack-compiler';

// ── Idempotent DDL — ensures the target DB has the tables the materializer
// writes to. Tenant databases (per-tenant Neon branches) are provisioned empty
// and may not have run the ZenStack migrations or the root seed-runner DDL, so
// the materializer guarantees its own schema instead of assuming it exists.
// Column shapes mirror zenstack/schema.zmodel + the shared seed DDL.

const APP_PACK_ENUM_DDL = [
  `DO $$ BEGIN CREATE TYPE "AuthTier" AS ENUM ('public', 'pin', 'google'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "BlockType" AS ENUM ('hero', 'metric_grid', 'chart_financial', 'lever_accordion', 'action_checklist', 'doc_markdown', 'pnl_table', 'z_report_form', 'costs_form', 'calendar_import', 'chat_panel', 'kpi_cards', 'ops_admin_tabs', 'review_blocks', 'reports_rollup', 'sheet_viewer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  // Newer block types may be missing from pre-existing enums.
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'ops_admin_tabs'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'review_blocks'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'reports_rollup'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'sheet_viewer'`,
  `ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'pack_table'`,
];

const APP_PACK_TABLE_DDL = [
  `CREATE TABLE IF NOT EXISTS security_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS app_pages (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    auth_tier "AuthTier" NOT NULL DEFAULT 'public',
    sort_order INTEGER NOT NULL DEFAULT 0,
    nav_label TEXT,
    show_in_nav BOOLEAN NOT NULL DEFAULT true,
    tenant_slug TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS page_sections (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES app_pages(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    block_type "BlockType" NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'
  )`,
  `CREATE INDEX IF NOT EXISTS page_sections_page_id_sort_order_idx ON page_sections(page_id, sort_order)`,
  `CREATE TABLE IF NOT EXISTS navigation_items (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES navigation_items(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT '',
    auth_tier TEXT NOT NULL DEFAULT 'public',
    tenant_slug TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    required_groups TEXT NOT NULL DEFAULT '',
    is_visible BOOLEAN NOT NULL DEFAULT true,
    is_dynamic BOOLEAN NOT NULL DEFAULT false,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS knowledge_snippets (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    app_id TEXT NOT NULL DEFAULT '',
    UNIQUE (key, app_id)
  )`,
];

/** Column backfills for DBs where the tables pre-date these columns. */
const APP_PACK_TABLE_ALTERS = [
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS nav_label TEXT`,
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS tenant_slug TEXT`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS tenant_slug TEXT`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE knowledge_snippets ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT ''`,
  `CREATE UNIQUE INDEX IF NOT EXISTS knowledge_snippets_key_app_id_key ON knowledge_snippets (key, app_id)`,
];

/** Run before materialization so writes never hit missing tables/columns. */
export async function ensureAppPackTables(client: Client): Promise<void> {
  for (const stmt of APP_PACK_ENUM_DDL) {
    await client.query(stmt);
  }
  for (const stmt of APP_PACK_TABLE_DDL) {
    await client.query(stmt);
  }
  for (const stmt of APP_PACK_TABLE_ALTERS) {
    try {
      await client.query(stmt);
    } catch {
      // Column may already exist or the table may be missing — ignore.
    }
  }
}

export interface MaterializeCounts {
  apps: number;
  pages: number;
  sections: number;
  nav: number;
  snippets: number;
  groups: number;
}

export interface MaterializeInput {
  packId: string;
  tenantSlug: string;
  decomposition: AppPackDecomposition;
  /** App definitions in generation order; CEO Overview must be last. */
  apps: CompiledAppArtifacts[];
  /** Raw app definitions (for rows/UX), same order as `apps`. */
  definitions: AppPackAppDefinition[];
}

/** Upsert the per-app security group (code = app_<appId>). Never deletes. */
async function upsertSecurityGroups(client: Client, apps: CompiledAppArtifacts[]): Promise<number> {
  let count = 0;
  for (const app of apps) {
    await client.query(
      `INSERT INTO security_groups (id, code, name, description, is_system, permissions, created_at)
       VALUES ($1, $2, $3, $4, false, ARRAY[]::text[], NOW())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`,
      [`sg_${app.appId}`, app.securityGroupCode, app.securityGroupName, `Members can access the ${app.appName} app.`],
    );
    count++;
  }
  return count;
}

export async function materializeAppPack(client: Client, input: MaterializeInput): Promise<MaterializeCounts> {
  const { packId, tenantSlug, decomposition, apps, definitions } = input;
  const counts: MaterializeCounts = { apps: 0, pages: 0, sections: 0, nav: 0, snippets: 0, groups: 0 };

  // Guarantee the target tables exist (tenant DBs may be provisioned empty).
  await ensureAppPackTables(client);

  // 1. Security groups for every app.
  counts.groups = await upsertSecurityGroups(client, apps);

  // 2. Pages + sections — scoped replace (pack pages only).
  const pageSlugPrefix = `${packId}-%`;
  await client.query(`DELETE FROM app_pages WHERE slug LIKE $1 AND tenant_slug = $2;`, [pageSlugPrefix, tenantSlug]);

  // Nav — scoped replace (pack nav items only). Nav ids are deterministic
  // (nav_<packId>_<appId>[_<seg>]) and the PK, so a re-run of the same packId
  // would otherwise fail with a duplicate-key violation.
  await client.query(`DELETE FROM navigation_items WHERE id LIKE $1 AND tenant_slug = $2;`, [`nav_${packId}_%`, tenantSlug]);

  const defs = [...definitions];
  // CEO Overview def is last in decomposition.apps order (guaranteed by generator).
  const ceoDef = defs[defs.length - 1];
  const deptDefs = defs.slice(0, -1);

  for (const def of deptDefs) {
    const rows = compileAppRows(def, tenantSlug, packId);
    for (const page of rows.pages) {
      await client.query(
        `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
         VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, $7, $8);`,
        [page.id, page.slug, page.title, page.authTier, 0, page.navLabel, page.showInNav, tenantSlug],
      );
      counts.pages++;
      for (let i = 0; i < page.sections.length; i++) {
        await client.query(
          `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`,
          [`${page.id}:section:${i}`, page.id, i, page.sections[i].blockType, JSON.stringify(page.sections[i].config)],
        );
        counts.sections++;
      }
    }
    // Nav for this app.
    for (const item of rows.nav) {
      await client.query(
        `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, tenant_slug,
                                       is_active, required_groups, is_visible, is_dynamic, is_default, created_at, updated_at)
         VALUES ($1, NULL, $2, $3, $4, $5, CAST('pin' AS "AuthTier"), $6, true, $7, true, $8, false, NOW(), NOW());`,
        [item.id, item.sortOrder, item.title, item.path, item.icon, tenantSlug, item.requiredGroups, item.isDynamic],
      );
      counts.nav++;
    }
    // Snippets for this app.
    for (const snip of rows.snippets) {
      await client.query(
        `INSERT INTO knowledge_snippets (id, key, content, category, app_id) VALUES ($1, $2, $3, $4, '')
         ON CONFLICT (key, app_id) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`,
        [snip.id, snip.key, snip.content, snip.category],
      );
      counts.snippets++;
    }
    counts.apps++;
  }

  // 3. CEO Overview (last app): pages + nav + cross-department snippets.
  const ceoRows = compileCeoRows(decomposition, ceoDef, tenantSlug, packId);
  const rootSlug = `${packId}-${ceoDef.appId}`;
  await client.query(
    `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
     VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, $7, $8);`,
    [`page_${packId}_${ceoDef.appId}`, rootSlug, ceoDef.appName, 'pin', 0, null, false, tenantSlug],
  );
  counts.pages++;
  await client.query(
    `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
     VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`,
    [`page_${packId}_${ceoDef.appId}:section:0`, `page_${packId}_${ceoDef.appId}`, 0, 'hero', JSON.stringify({ title: ceoDef.appName })],
  );
  counts.sections++;

  for (const def of [ceoDef]) {
    const rows = compileAppRows(def, tenantSlug, packId);
    for (const page of rows.pages.slice(1)) {
      // CEO pages beyond the root.
      await client.query(
        `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
         VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, $7, $8);`,
        [page.id, page.slug, page.title, page.authTier, 0, page.navLabel, page.showInNav, tenantSlug],
      );
      counts.pages++;
      for (let i = 0; i < page.sections.length; i++) {
        await client.query(
          `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`,
          [`${page.id}:section:${i}`, page.id, i, page.sections[i].blockType, JSON.stringify(page.sections[i].config)],
        );
        counts.sections++;
      }
    }
    for (const item of rows.nav) {
      await client.query(
        `INSERT INTO navigation_items (id, parent_id, sort_order, title, path, icon, auth_tier, tenant_slug,
                                       is_active, required_groups, is_visible, is_dynamic, is_default, created_at, updated_at)
         VALUES ($1, NULL, $2, $3, $4, $5, CAST('pin' AS "AuthTier"), $6, true, $7, true, $8, false, NOW(), NOW());`,
        [item.id, item.sortOrder, item.title, item.path, item.icon, tenantSlug, item.requiredGroups, item.isDynamic],
      );
      counts.nav++;
    }
  }
  for (const snip of ceoRows.snippets) {
    await client.query(
      `INSERT INTO knowledge_snippets (id, key, content, category, app_id) VALUES ($1, $2, $3, $4, '')
       ON CONFLICT (key, app_id) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`,
      [snip.id, snip.key, snip.content, snip.category],
    );
    counts.snippets++;
  }
  counts.apps++;

  return counts;
}
