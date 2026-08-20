/**
 * Tenant Seed Service — seeds template defaults when a tenant is created.
 *
 * Creates: AppPage + PageSection rows, NavigationItem rows, AppSetting row,
 * and default security groups with template-specific permissions.
 *
 * All INSERT statements use raw SQL with proper type casting for enum columns.
 * The migrate function (addTenantColumnsIfMissing) is called upfront to
 * add tenant-isolation columns that the factory DB schema doesn't include yet.
 */
// Using raw Prisma client (any) for compatibility
import { getTemplate, type TemplateDefinition } from '@/domain/tenant/template-catalog';
import { DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/functional-roles';

/**
 * Resolve the "Default Admin Email" configured in the tenant edit wizard's
 * Admin & Authentication step (metadata.config.auth.adminEmail, falling back
 * to the older metadata.config.adminEmail field), or the platform default.
 */
export function resolveTenantAdminEmail(metadata: Record<string, unknown> | null | undefined): string {
  const config = (metadata?.config ?? {}) as Record<string, unknown>;
  const auth = (config.auth ?? {}) as Record<string, unknown>;
  return (auth.adminEmail as string) || (config.adminEmail as string) || DEFAULT_PLATFORM_ADMIN_EMAIL;
}

interface SeedTenantInput {
  /** Parent tenant slug — always the tenant, never a "{parent}__{appId}" combined key. */
  slug: string;
  displayName: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  /** Suite-mode app id — when set, rows are also stamped with app_id so a
   *  specific app's data is distinguishable from the tenant's own baseline
   *  and from sibling apps (matters most when seeding falls back to a shared
   *  DB instead of the app's own dedicated one — see suite-provisioning.ts). */
  appId?: string;
  /** Default Admin Email from the tenant wizard's Admin & Authentication step
   *  (metadata.config.auth.adminEmail) — seeded as a platform-admin
   *  user_accounts row so there's always a default admin identity, not just
   *  an app_config value nobody can sign in with an unclaimed account for.
   *  Falls back to DEFAULT_PLATFORM_ADMIN_EMAIL via resolveTenantAdminEmail(). */
  adminEmail?: string;
  /** Override the DB to use a tenant-specific connection */
  db?: PrismaClient | null
  /** Skip AppPage/PageSection/NavigationItem seeding — for a tenant-level
   *  seed run against a SUITE tenant, where page/nav content is each app's
   *  own responsibility (seeded via its own per-app Seed action). app_pages
   *  is keyed by a GLOBAL slug, not (tenant, app) — an unscoped tenant-level
   *  seed would upsert every app's already-seeded pages to app_id = NULL,
   *  silently clobbering the per-app scoping. Only genuinely tenant-wide
   *  data (branding, admin account, security groups) still gets seeded. */
  skipContent?: boolean;
}

/**
 * Add missing tenant-isolation columns to factory tables.
 *
 * Uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS so it is idempotent.
 * Creates indexes on the new tenant_slug columns.
 *
 * Expected to run once at seed time before tenant defaults are inserted.
 */
export async function addTenantColumnsIfMissing(db: PrismaClient): Promise<void> {
  const statements: string[] = [
    // app_pages — nav display metadata + tenant/app isolation
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS nav_label TEXT;`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT true;`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS app_id TEXT;`,

    // navigation_items — tenant isolation + active toggle
    `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,
    `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS app_id TEXT;`,
    `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,

    // user_accounts — tenant/app isolation (also ensures the table exists at
    // all for tenant databases that never had ensureSecurityTables() run
    // against them — that function targets the platform's own root DB only,
    // not a tenant's dedicated one, so a fresh tenant DB has no user_accounts
    // table until this creates it).
    `CREATE TABLE IF NOT EXISTS user_accounts (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      sub TEXT NOT NULL UNIQUE,
      email TEXT,
      name TEXT,
      tier TEXT NOT NULL DEFAULT 'google',
      role_code TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_seen_at TIMESTAMP WITHOUT TIME ZONE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    `ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,
    `ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS app_id TEXT;`,

    // security_groups / user_groups — also ensures these tables exist at all
    // for tenant databases that never had ensureSecurityTables() run against
    // them (that function targets the platform's own root DB only, same gap
    // as user_accounts above). Without this, a tenant's own dedicated
    // database has nowhere to persist tenant-scoped security groups created
    // via the admin console, and the group never reaches the tenant's live
    // app (which only ever reads its own dedicated DB). Must run after
    // user_accounts above — user_groups references it by FK.
    `CREATE TABLE IF NOT EXISTS security_groups (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      is_system BOOLEAN NOT NULL DEFAULT false,
      permissions TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    `ALTER TABLE security_groups ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,
    `ALTER TABLE security_groups ADD COLUMN IF NOT EXISTS app_id TEXT;`,
    `CREATE INDEX IF NOT EXISTS idx_security_groups_tenant_app ON security_groups (tenant_slug, app_id);`,
    `CREATE TABLE IF NOT EXISTS user_groups (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES user_accounts (id) ON DELETE CASCADE,
      group_id TEXT NOT NULL REFERENCES security_groups (id) ON DELETE CASCADE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, group_id)
    );`,
    `CREATE INDEX IF NOT EXISTS idx_user_groups_user ON user_groups (user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_groups_group ON user_groups (group_id);`,

    // roles — tenant/app isolation (also ensures the table exists at all for
    // tenant databases provisioned before this table was part of the schema)
    `CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      is_platform_admin BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    `ALTER TABLE roles ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,
    `ALTER TABLE roles ADD COLUMN IF NOT EXISTS app_id TEXT;`,

    // Indexes on tenant_slug columns for query performance
    `CREATE INDEX IF NOT EXISTS idx_app_pages_tenant_slug ON app_pages(tenant_slug);`,
    `CREATE INDEX IF NOT EXISTS idx_app_pages_tenant_app ON app_pages(tenant_slug, app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_navigation_items_tenant_slug ON navigation_items(tenant_slug);`,
    `CREATE INDEX IF NOT EXISTS idx_navigation_items_tenant_app ON navigation_items(tenant_slug, app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_accounts_tenant_slug ON user_accounts(tenant_slug);`,
    `CREATE INDEX IF NOT EXISTS idx_user_accounts_tenant_app ON user_accounts(tenant_slug, app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_roles_tenant_app ON roles(tenant_slug, app_id);`,

    // business_review_parts / levers / action_items / tasks / knowledge_snippets /
    // financial_projections / daily_z_reports / monthly_targets / monthly_actual_inputs /
    // monthly_actual_departments / daily_metrics — app-scoped seeded/business data.
    // app_id is NOT NULL DEFAULT '' (never nullable) so composite unique/PK
    // constraints below actually dedupe the common single-app case — Postgres
    // treats NULL as distinct from NULL in unique constraints, so a nullable
    // app_id would silently stop deduping upserts for every non-suite tenant.
    `ALTER TABLE business_review_parts ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE levers ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE action_items ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE knowledge_snippets ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE financial_projections ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE daily_z_reports ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE monthly_targets ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE monthly_actual_inputs ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE monthly_actual_departments ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT '';`,

    `CREATE INDEX IF NOT EXISTS idx_business_review_parts_app_id ON business_review_parts(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_levers_app_id ON levers(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_action_items_app_id ON action_items(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_app_id ON tasks(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_knowledge_snippets_app_id ON knowledge_snippets(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_financial_projections_app_id ON financial_projections(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_daily_z_reports_app_id ON daily_z_reports(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_monthly_targets_app_id ON monthly_targets(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_monthly_actual_inputs_app_id ON monthly_actual_inputs(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_monthly_actual_departments_app_id ON monthly_actual_departments(app_id);`,
    `CREATE INDEX IF NOT EXISTS idx_daily_metrics_app_id ON daily_metrics(app_id);`,

    // Reusable helper: find a unique/PK constraint matching an exact old
    // column set and swap it for a new one that includes app_id. Constraint
    // names on these tables were whatever `prisma db push` auto-generated
    // (this app has no migration files), so they can't be hardcoded — this
    // discovers the name dynamically. Safe to re-run: once the old constraint
    // is gone, the second call becomes a no-op (duplicate_object is caught).
    `CREATE OR REPLACE FUNCTION _rrfpa_migrate_key(
       p_table text, p_old_cols text[], p_new_cols text[], p_is_pk boolean, p_new_name text
     ) RETURNS void AS $$
     DECLARE
       cname text;
     BEGIN
       SELECT tc.constraint_name INTO cname
       FROM information_schema.table_constraints tc
       WHERE tc.table_name = p_table
         AND tc.constraint_type = (CASE WHEN p_is_pk THEN 'PRIMARY KEY' ELSE 'UNIQUE' END)
         AND (
           SELECT array_agg(kcu.column_name ORDER BY kcu.ordinal_position)
           FROM information_schema.key_column_usage kcu
           WHERE kcu.constraint_name = tc.constraint_name AND kcu.table_name = p_table
         ) = p_old_cols
       LIMIT 1;

       IF cname IS NOT NULL THEN
         EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', p_table, cname);
       END IF;

       BEGIN
         IF p_is_pk THEN
           EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I PRIMARY KEY (%s)', p_table, p_new_name, array_to_string(p_new_cols, ', '));
         ELSE
           EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I UNIQUE (%s)', p_table, p_new_name, array_to_string(p_new_cols, ', '));
         END IF;
       EXCEPTION WHEN duplicate_table THEN NULL;
       WHEN others THEN NULL;
       END;
     END;
     $$ LANGUAGE plpgsql;`,

    `SELECT _rrfpa_migrate_key('business_review_parts', ARRAY['part_key'], ARRAY['part_key','app_id'], false, 'business_review_parts_part_key_app_id_key');`,
    `SELECT _rrfpa_migrate_key('business_review_parts', ARRAY['slug'], ARRAY['slug','app_id'], false, 'business_review_parts_slug_app_id_key');`,
    `SELECT _rrfpa_migrate_key('levers', ARRAY['num'], ARRAY['num','app_id'], false, 'levers_num_app_id_key');`,
    `SELECT _rrfpa_migrate_key('knowledge_snippets', ARRAY['key'], ARRAY['key','app_id'], false, 'knowledge_snippets_key_app_id_key');`,
    `SELECT _rrfpa_migrate_key('financial_projections', ARRAY['period','data_type','scenario'], ARRAY['period','data_type','scenario','app_id'], false, 'financial_projections_period_data_type_scenario_app_id_key');`,
    `SELECT _rrfpa_migrate_key('daily_z_reports', ARRAY['report_date','department'], ARRAY['report_date','department','app_id'], false, 'daily_z_reports_report_date_department_app_id_key');`,
    `SELECT _rrfpa_migrate_key('monthly_targets', ARRAY['month'], ARRAY['month','app_id'], false, 'monthly_targets_month_app_id_key');`,
    `SELECT _rrfpa_migrate_key('daily_metrics', ARRAY['date'], ARRAY['date','app_id'], false, 'daily_metrics_date_app_id_key');`,
    `SELECT _rrfpa_migrate_key('monthly_actual_inputs', ARRAY['period'], ARRAY['period','app_id'], true, 'monthly_actual_inputs_pkey_appid');`,
    `SELECT _rrfpa_migrate_key('monthly_actual_departments', ARRAY['period','department'], ARRAY['period','department','app_id'], true, 'monthly_actual_departments_pkey_appid');`,
  ];

  for (const sql of statements) {
    try {
      await db.$executeRawUnsafe(sql);
    } catch (err) {
      // Individual column adds may fail if a table doesn't exist yet;
      // this is non-fatal — the seed continues with the columns it has.
      console.warn(`[tenant-seed] Migration warning (non-fatal):`, (err as Error).message);
    }
  }
}

/**
 * Fully wipe every previously-seeded row for a tenant (all pages, page
 * sections, and nav items — across every app in the tenant's database)
 * before re-seeding. seedTenantDefaults() on its own only clears nav items
 * scoped to the exact tenant_slug/app_id it's about to reinsert — safe for
 * a single app's own re-seed, but not enough for a "clean and rebuild
 * everything" tenant-level re-seed: every app in a suite independently
 * inserts its OWN copy of the template's default nav items (Home,
 * Dashboard, ...), so re-seeding one app leaves every other app's copies in
 * place and repeated tenant-level seeds compound duplicates. Call this
 * first, then seedTenantDefaults(), for a guaranteed clean slate.
 */
export async function cleanTenantSeed(db: PrismaClient, tenantSlug: string): Promise<void> {
  await addTenantColumnsIfMissing(db);
  try {
    await db.$executeRawUnsafe(
      `DELETE FROM page_sections WHERE page_id IN (SELECT id FROM app_pages WHERE tenant_slug = $1);`,
      tenantSlug,
    );
  } catch (err) {
    console.warn(`[tenant-seed] cleanTenantSeed: could not clear page_sections:`, (err as Error).message);
  }
  try {
    await db.$executeRawUnsafe(`DELETE FROM app_pages WHERE tenant_slug = $1;`, tenantSlug);
  } catch (err) {
    console.warn(`[tenant-seed] cleanTenantSeed: could not clear app_pages:`, (err as Error).message);
  }
  try {
    await db.$executeRawUnsafe(`DELETE FROM navigation_items WHERE tenant_slug = $1;`, tenantSlug);
  } catch (err) {
    console.warn(`[tenant-seed] cleanTenantSeed: could not clear navigation_items:`, (err as Error).message);
  }
  console.log(`[tenant-seed] cleanTenantSeed: cleared existing pages/sections/nav for "${tenantSlug}"`);
}

/**
 * Generate a random ID string compatible with Prisma's String @id fields.
 */
function genRandomId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // Fallback - crypto not available, use timestamp-based UUID
  }
  // Fallback
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${random}`;
}

export async function seedTenantDefaults(input: SeedTenantInput): Promise<{
  pages: number;
  navItems: number;
  settings: boolean;
  adminSeeded: boolean;
  errors: string[];
}> {
  const template = getTemplate(input.template);
  const db = input.db!;

  // Ensure tenant-isolation columns exist before inserting data
  await addTenantColumnsIfMissing(db);

  // ── 1. Seed AppSetting (brand config) ─────────────────
  // id matches app-settings-service.ts's buildRowId() convention so
  // getAppSettings(db, tenantSlug, appId) can actually find this row.
  const settingsRowId = input.appId ? `${input.slug}__${input.appId}` : input.slug;
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO app_settings (id, web_search_enabled, tenant_slug, app_id, tenant_display_name, tenant_template,
          tenant_metadata, brand_logo_text, brand_logo_url, brand_primary_color, brand_secondary_color, updated_at)
       VALUES ($1, false, $2, $3, $4, $5, '{}'::jsonb, '', '', $6, $7, NOW())
       ON CONFLICT (id) DO UPDATE
         SET tenant_slug = $2, app_id = $3, tenant_display_name = $4, tenant_template = $5,
             brand_primary_color = $6, brand_secondary_color = $7, updated_at = NOW();`,
      settingsRowId, input.slug, input.appId ?? '', input.displayName, input.template,
      input.primaryColor, input.secondaryColor,
    );
    console.log(`[tenant-seed] AppSetting seeded for ${settingsRowId}`);
  } catch (err) {
    console.error(`[tenant-seed] Failed to seed AppSetting:`, err);
  }

  // ── 2. Seed AppPage + PageSection ─────────────────────
  // Skipped for a tenant-level seed against a suite tenant — see
  // SeedTenantInput.skipContent.
  let pageCount = 0;
  const errors: string[] = [];

  for (const tplPage of input.skipContent ? [] : template.defaultPages) {
    try {
      // Upsert page — include a generated ID for FK references.
      // NOTE: `slug` is a GLOBAL unique constraint, not composite with
      // tenant/app — two apps sharing the same template and the same shared
      // DB (dedicated-DB provisioning failure fallback) can still collide
      // here. Stamping app_id below is correct for the normal case (each
      // app in its own dedicated DB) but doesn't fully solve that fallback.
      const pageId_ = genRandomId();
      await db.$executeRawUnsafe(
        `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug, app_id)
         VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, true, $7, $8)
         ON CONFLICT (slug) DO UPDATE
           SET id = COALESCE(app_pages.id, $1), title = $3, auth_tier = CAST($4 AS "AuthTier"), sort_order = $5,
               nav_label = $6, show_in_nav = true, tenant_slug = $7, app_id = $8;`,
        pageId_,
        tplPage.slug,
        tplPage.title,
        tplPage.authTier,
        pageCount, // sort_order reflects page definition order in the template
        tplPage.navLabel ?? null,
        input.slug,
        input.appId ?? null,
      );

      // Look up the actual page ID from DB to handle ON CONFLICT upserts
      // (when a page already exists, the upsert keeps the old ID, not our generated one)
      const pageIdRows = (await db.$queryRawUnsafe(
        `SELECT id FROM app_pages WHERE slug = $1 LIMIT 1;`,
        tplPage.slug,
      )) as { id: string }[];

      if (pageIdRows.length === 0) {
        console.warn(`[tenant-seed] Page "${tplPage.slug}" not found after insert — skipping sections`);
        pageCount++;
        continue;
      }

      const pageId = pageIdRows[0].id;

      // Remove any existing sections for this page (FK cascade-safe deletion)
      await db.$executeRawUnsafe(
        `DELETE FROM page_sections WHERE page_id = $1;`,
        pageId,
      );

      // Insert sections with generated deterministic IDs
      for (let i = 0; i < tplPage.blockTypes.length; i++) {
        const blockType = tplPage.blockTypes[i];
        const sectionId = `${tplPage.slug}:section:${i}`;
        // doc_markdown requires a content source — the summary page renders the
        // executive summary snippet (same source the root catalog uses).
        const config =
          blockType === 'doc_markdown'
            ? { source: 'executive-summary', minTier: tplPage.authTier }
            : { minTier: tplPage.authTier };
        await db.$executeRawUnsafe(
          `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`,
          sectionId,
          pageId,
          i,
          blockType,
          JSON.stringify(config),
        );
      }

      pageCount++;
      console.log(`[tenant-seed] Page "${tplPage.slug}" seeded with ${tplPage.blockTypes.length} sections`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[tenant-seed] Failed to seed page ${tplPage.slug}:`, msg);
      errors.push(`page ${tplPage.slug}: ${msg.slice(0, 200)}`);
    }
  }

  // ── 3. Seed NavigationItem ────────────────────────────
  // Skipped for a tenant-level seed against a suite tenant (see
  // SeedTenantInput.skipContent) — an unscoped clear here would otherwise
  // wipe every app's already-seeded nav items, not just the tenant's own.
  let navCount = 0;

  if (!input.skipContent) {
    // Clear existing nav items before re-seeding — scoped to this specific app
    // when appId is set, so re-seeding one suite app never wipes a sibling
    // app's (or the tenant's own) nav items when they share a database.
    try {
      if (input.appId) {
        await db.$executeRawUnsafe(
          `DELETE FROM navigation_items WHERE tenant_slug = $1 AND app_id = $2;`,
          input.slug, input.appId,
        );
      } else {
        await db.$executeRawUnsafe(`DELETE FROM navigation_items WHERE tenant_slug = $1;`, input.slug);
      }
    } catch (err) {
      console.warn(`[tenant-seed] Could not clear navigation_items:`, (err as Error).message);
    }
  }

  for (let i = 0; i < (input.skipContent ? 0 : template.defaultNavItems.length); i++) {
    const navItem = template.defaultNavItems[i];
    try {
      // Include generated ID and tenant_slug/app_id; cast auth_tier to the AuthTier enum
      // Provide explicit created_at and updated_at to satisfy NOT NULL constraints
      const navId = genRandomId();
      await db.$executeRawUnsafe(
        `INSERT INTO navigation_items (id, title, path, icon, auth_tier, sort_order, tenant_slug, app_id, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CAST($5 AS "AuthTier"), $6, $7, $8, $9, NOW(), NOW());`,
        navId,
        navItem.title,
        navItem.path,
        navItem.icon,
        navItem.authTier,
        i, // sort_order reflects nav definition order in the template
        input.slug,
        input.appId ?? null,
        navItem.path === '/', // the Home '/' item is the default landing route on initial provisioning
      );
      navCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[tenant-seed] Failed to seed nav item ${navItem.title}:`, msg);
      errors.push(`nav ${navItem.title}: ${msg.slice(0, 200)}`);
    }
  }

  // ── 4. Seed default admin UserAccount + platform-admin role ──
  // Without this, user_accounts stays empty until someone actually signs in —
  // there's no default admin identity to grant access ahead of time. The
  // account is tenant-wide (app_id left null) even when this seed run is for
  // one specific app, so re-seeding N apps in a suite converges on the same
  // single admin row instead of creating N duplicates.
  let adminSeeded = false;
  const adminEmail = input.adminEmail || DEFAULT_PLATFORM_ADMIN_EMAIL;
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO roles (id, code, name, is_platform_admin, tenant_slug, app_id, created_at)
       VALUES (gen_random_uuid()::TEXT, 'platform-admin', 'Platform Admin', true, $1, NULL, NOW())
       ON CONFLICT (code) DO UPDATE
         SET name = 'Platform Admin', is_platform_admin = true, tenant_slug = $1;`,
      input.slug,
    );

    // sub is a stable placeholder until the admin's first real Google
    // sign-in claims this row (security-service.ts upsertUserAccount matches
    // by email on sub conflict and rewrites sub to the real OAuth subject).
    const placeholderSub = `pending:${adminEmail}`;
    await db.$executeRawUnsafe(
      `INSERT INTO user_accounts (id, sub, email, name, tier, role_code, tenant_slug, app_id, is_active, created_at, updated_at)
       VALUES (gen_random_uuid()::TEXT, $1, $2, 'Platform Admin', 'google', 'platform-admin', $3, NULL, true, NOW(), NOW())
       ON CONFLICT (sub) DO UPDATE
         SET email = $2, role_code = 'platform-admin', tenant_slug = $3, is_active = true, updated_at = NOW();`,
      placeholderSub,
      adminEmail,
      input.slug,
    );
    adminSeeded = true;
    console.log(`[tenant-seed] Default admin account seeded: ${adminEmail}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[tenant-seed] Failed to seed default admin account:`, msg);
    errors.push(`admin account: ${msg.slice(0, 200)}`);
  }

  if (errors.length > 0) {
    console.error(`[tenant-seed] Errors: ${errors.join('; ')}`);
  }
  console.log(`[tenant-seed] Seeded ${pageCount} pages, ${navCount} nav items for ${input.slug}`);
  return { pages: pageCount, navItems: navCount, settings: true, adminSeeded, errors };
}

/**
 * Seed the default security groups from the template definition.
 * Templates currently share the same default groups; this is a hook
 * for future template-specific permission sets.
 *
 * Uses gen_random_uuid() for the id since the DB column has no default.
 */
export async function seedTemplateSecurityGroups(
  db: PrismaClient,
  templateId: string,
): Promise<number> {
  const groups = [
    {
      code: 'platform-admin',
      name: 'Platform Admin',
      description: 'Full administrative access.',
      isSystem: true,
      permissions: ['*'],
    },
    {
      code: 'ops-admin',
      name: 'Ops Admin',
      description: 'Operations & cost management.',
      isSystem: false,
      permissions: ['metrics:read', 'metrics:write', 'tasks:read', 'tasks:write',
        'pos:use', 'conversations:read', 'conversations:write', 'settings:write'],
    },
    {
      code: 'finance',
      name: 'Finance',
      description: 'Financial reporting.',
      isSystem: false,
      permissions: ['financials:read', 'financials:write'],
    },
    {
      code: 'viewer',
      name: 'Viewer',
      description: 'Read-only access.',
      isSystem: false,
      permissions: ['metrics:read', 'financials:read', 'tasks:read', 'conversations:read'],
    },
  ];

  let count = 0;
  for (const g of groups) {
    try {
      // Use gen_random_uuid() for id; include updated_at to avoid NOT NULL violation
      await db.$executeRawUnsafe(
        `INSERT INTO security_groups (id, code, name, description, is_system, permissions, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
         ON CONFLICT (code) DO UPDATE
           SET name = $2, description = $3, is_system = $4, permissions = $5;`,
        g.code, g.name, g.description, g.isSystem, g.permissions,
      );
      count++;
    } catch (err) {
      console.error(`[tenant-seed] Failed to seed group ${g.code}:`, err);
    }
  }

  return count;
}

/**
 * Seed template-specific brand colors into the app_settings table.
 * This is called after the app_settings row exists.
 */
export async function seedTemplateBranding(
  slug: string,
  db: PrismaClient,
  input: { primaryColor: string; secondaryColor: string },
): Promise<void> {
  try {
    await db.$executeRawUnsafe(
      `UPDATE app_settings
       SET brand_primary_color = $1, brand_secondary_color = $2, updated_at = NOW()
       WHERE id = $3;`,
      input.primaryColor,
      input.secondaryColor,
      slug,
    );
    console.log(`[tenant-seed] Branding updated: primary=${input.primaryColor}, secondary=${input.secondaryColor}`);
  } catch (err) {
    console.error('[tenant-seed] Failed to seed branding:', err);
  }
}

/**
 * Seed a tenant's `knowledge_snippets` with a starter brief about its own app.
 *
 * ## Why provisioning is the right moment
 *
 * The AI assistant reads `knowledge_snippets` to build its system prompt, and a
 * freshly provisioned tenant's table is empty by definition. That emptiness is
 * what made the old hardcoded fallback so damaging: with nothing of its own to
 * say, every new app introduced itself as the one business whose data happened
 * to be compiled into the shared code.
 *
 * Writing a few honest rows here means an app knows what it is from its first
 * request, and the code fallback becomes the rare path rather than the default.
 *
 * ## What gets written
 *
 * Only what is actually known: the app's purpose (from its template), the
 * industry metrics that matter, and — for AI-generated templates — the
 * administrator's own brief, which is a first-hand description of the business
 * and the single most useful thing the assistant can be told. No invented
 * figures. An assistant that says "no data has been loaded yet" is useful; one
 * that recites numbers nobody entered is not.
 *
 * Rows are upserted by key, so re-provisioning refreshes the brief without
 * disturbing knowledge the tenant has since added under other keys.
 */
export async function seedTenantKnowledge(
  db: PrismaClient,
  input: {
    slug: string;
    displayName: string;
    templateId: string;
    appId?: string;
    /** The administrator's brief, when the app came from a custom template. */
    brief?: string | null;
  },
): Promise<number> {
  const { resolveTemplate } = await import('@/domain/tenant/custom-template-service');
  const { resolveAssistantProfile } = await import('@/domain/tenant/template-assistant-profiles');

  let template: TemplateDefinition;
  try {
    // Resolves custom templates against the platform root DB — `db` here is the
    // tenant's own database and does not hold the template catalog.
    template = await resolveTemplate(input.templateId);
  } catch (err) {
    console.warn(`[tenant-seed] Could not resolve template "${input.templateId}" for knowledge seed:`, err);
    template = getTemplate(input.templateId);
  }

  const profile = resolveAssistantProfile(template);
  const appId = input.appId ?? '';

  const snippets: { key: string; category: string; content: string }[] = [
    {
      key: 'app_overview',
      category: 'overview',
      content:
        `${input.displayName} is a ${template.label} application covering ${profile.domain}. ` +
        `${template.description} ` +
        'No business data has been loaded into this workspace yet — an administrator can add it ' +
        'through the admin section or by uploading a workbook under Config.',
    },
    {
      key: 'assistant_capabilities',
      category: 'overview',
      content: `This assistant can: ${profile.capabilities.join('; ')}.`,
    },
  ];

  if (profile.keyMetrics.length > 0) {
    snippets.push({
      key: 'domain_metrics',
      category: 'metrics',
      content:
        `The metrics that matter for ${profile.domain}: ${profile.keyMetrics.join(', ')}. ` +
        `Monetary amounts are reported in ${profile.currency} unless the data says otherwise.`,
    });
  }

  const brief = input.brief?.trim();
  if (brief) {
    snippets.push({
      key: 'business_brief',
      category: 'overview',
      // Capped: a long brief would crowd the rest of the prompt, and the
      // builder truncates snippets at 1500 chars anyway.
      content: `What the administrator described when this app was created:\n\n${brief.slice(0, 1500)}`,
    });
  }

  let written = 0;
  for (const snippet of snippets) {
    try {
      await db.$executeRawUnsafe(
        // knowledge_snippets has no updated_at column — it is one of the few
        // models without @updatedAt. `id` IS supplied explicitly: @default(cuid())
        // is generated by the Prisma client, so the column has no database
        // default and a raw INSERT must provide one.
        `INSERT INTO knowledge_snippets (id, key, category, content, app_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (key, app_id) DO UPDATE
           SET category = $3, content = $4;`,
        `${input.slug}__${appId}__${snippet.key}`,
        snippet.key,
        snippet.category,
        snippet.content,
        appId,
      );
      written += 1;
    } catch (err) {
      // Best-effort, exactly like the other seed steps: a tenant that fails to
      // get its brief still deploys, and falls back to the neutral profile.
      console.warn(`[tenant-seed] Failed to seed knowledge snippet "${snippet.key}":`, err);
    }
  }

  console.log(`[tenant-seed] Seeded ${written}/${snippets.length} knowledge snippets for ${input.slug}`);
  return written;
}
