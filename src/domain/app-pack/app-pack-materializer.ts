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
 *   - knowledge_snippets.key is UNIQUE → packId-prefixed keys
 *   - security_groups.code is UNIQUE → upsert, never delete (referenced)
 */

import type { Client } from 'pg';
import type { AppPackAppDefinition, AppPackDecomposition } from './app-pack-schema';
import { compileAppRows, compileCeoRows, type CompiledAppArtifacts } from './app-pack-compiler';

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
        `INSERT INTO knowledge_snippets (id, key, content, category) VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`,
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
      `INSERT INTO knowledge_snippets (id, key, content, category) VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category;`,
      [snip.id, snip.key, snip.content, snip.category],
    );
    counts.snippets++;
  }
  counts.apps++;

  return counts;
}
