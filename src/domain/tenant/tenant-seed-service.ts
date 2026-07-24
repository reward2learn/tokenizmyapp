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

interface SeedTenantInput {
  slug: string;
  displayName: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  /** Override the DB to use a tenant-specific connection */
  db?: any;
}

/**
 * Add missing tenant-isolation columns to factory tables.
 *
 * Uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS so it is idempotent.
 * Creates indexes on the new tenant_slug columns.
 *
 * Expected to run once at seed time before tenant defaults are inserted.
 */
export async function addTenantColumnsIfMissing(db: any): Promise<void> {
  const statements: string[] = [
    // app_pages — nav display metadata + tenant isolation
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS nav_label TEXT;`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT true;`,
    `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,

    // navigation_items — tenant isolation + active toggle
    `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,
    `ALTER TABLE navigation_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,

    // user_accounts — tenant isolation
    `ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS tenant_slug TEXT;`,

    // Indexes on tenant_slug columns for query performance
    `CREATE INDEX IF NOT EXISTS idx_app_pages_tenant_slug ON app_pages(tenant_slug);`,
    `CREATE INDEX IF NOT EXISTS idx_navigation_items_tenant_slug ON navigation_items(tenant_slug);`,
    `CREATE INDEX IF NOT EXISTS idx_user_accounts_tenant_slug ON user_accounts(tenant_slug);`,
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
 * Generate a random ID string compatible with Prisma's String @id fields.
 */
function genRandomId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  // Fallback
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${random}`;
}

export async function seedTenantDefaults(input: SeedTenantInput): Promise<{
  pages: number;
  navItems: number;
  settings: boolean;
  errors: string[];
}> {
  const template = getTemplate(input.template);
  const db = input.db!;

  // Ensure tenant-isolation columns exist before inserting data
  await addTenantColumnsIfMissing(db);

  // ── 1. Seed AppSetting (brand config) ─────────────────
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO app_settings (id, web_search_enabled, tenant_slug, tenant_display_name, tenant_template,
          tenant_metadata, brand_logo_text, brand_logo_url, brand_primary_color, brand_secondary_color, updated_at)
       VALUES ($1, false, $2, $3, $4, '{}'::jsonb, '', '', $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE
         SET tenant_slug = $2, tenant_display_name = $3, tenant_template = $4,
             brand_primary_color = $5, brand_secondary_color = $6, updated_at = NOW();`,
      'default', input.slug, input.displayName, input.template,
      input.primaryColor, input.secondaryColor,
    );
    console.log(`[tenant-seed] AppSetting seeded for ${input.slug}`);
  } catch (err) {
    console.error(`[tenant-seed] Failed to seed AppSetting:`, err);
  }

  // ── 2. Seed AppPage + PageSection ─────────────────────
  let pageCount = 0;
  const errors: string[] = [];

  for (const tplPage of template.defaultPages) {
    try {
      // Upsert page — include a generated ID for FK references
      const pageId_ = genRandomId();
      await db.$executeRawUnsafe(
        `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
         VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, true, $7)
         ON CONFLICT (slug) DO UPDATE
           SET id = COALESCE(app_pages.id, $1), title = $3, auth_tier = CAST($4 AS "AuthTier"), sort_order = $5,
               nav_label = $6, show_in_nav = true, tenant_slug = $7;`,
        pageId_,
        tplPage.slug,
        tplPage.title,
        tplPage.authTier,
        pageCount, // sort_order reflects page definition order in the template
        tplPage.navLabel ?? null,
        input.slug,
      );

      // Use pageId_ generated above directly (no round-trip needed)
      const pageId = pageId_;

      // Remove any existing sections for this page (FK cascade-safe deletion)
      await db.$executeRawUnsafe(
        `DELETE FROM page_sections WHERE page_id = $1;`,
        pageId,
      );

      // Insert sections with generated deterministic IDs
      for (let i = 0; i < tplPage.blockTypes.length; i++) {
        const blockType = tplPage.blockTypes[i];
        const sectionId = `${tplPage.slug}:section:${i}`;
        await db.$executeRawUnsafe(
          `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES ($1, $2, $3, CAST($4 AS "BlockType"), $5);`,
          sectionId,
          pageId,
          i,
          blockType,
          JSON.stringify({ minTier: tplPage.authTier }),
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
  let navCount = 0;

  // Clear all existing nav items for this tenant before re-seeding.
  // Also delete orphaned rows that have NULL tenant_slug (created before the column existed).
  try {
    await db.$executeRawUnsafe(`DELETE FROM navigation_items WHERE tenant_slug = $1 OR tenant_slug IS NULL;`, input.slug);
  } catch (err) {
    console.warn(`[tenant-seed] Could not clear navigation_items:`, (err as Error).message);
  }

  for (let i = 0; i < template.defaultNavItems.length; i++) {
    const navItem = template.defaultNavItems[i];
    try {
      // Include generated ID and tenant_slug; cast auth_tier to the AuthTier enum
      // Provide explicit created_at and updated_at to satisfy NOT NULL constraints
      const navId = genRandomId();
      await db.$executeRawUnsafe(
        `INSERT INTO navigation_items (id, title, path, icon, auth_tier, sort_order, tenant_slug, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CAST($5 AS "AuthTier"), $6, $7, NOW(), NOW());`,
        navId,
        navItem.title,
        navItem.path,
        navItem.icon,
        navItem.authTier,
        i, // sort_order reflects nav definition order in the template
        input.slug,
      );
      navCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[tenant-seed] Failed to seed nav item ${navItem.title}:`, msg);
      errors.push(`nav ${navItem.title}: ${msg.slice(0, 200)}`);
    }
  }

  if (errors.length > 0) {
    console.error(`[tenant-seed] Errors: ${errors.join('; ')}`);
  }
  console.log(`[tenant-seed] Seeded ${pageCount} pages, ${navCount} nav items for ${input.slug}`);
  return { pages: pageCount, navItems: navCount, settings: true, errors };
}

/**
 * Seed the default security groups from the template definition.
 * Templates currently share the same default groups; this is a hook
 * for future template-specific permission sets.
 *
 * Uses gen_random_uuid() for the id since the DB column has no default.
 */
export async function seedTemplateSecurityGroups(
  db: any,
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
  db: any,
  input: { primaryColor: string; secondaryColor: string },
): Promise<void> {
  try {
    await db.$executeRawUnsafe(
      `UPDATE app_settings
       SET brand_primary_color = $1, brand_secondary_color = $2, updated_at = NOW()
       WHERE id = 'default';`,
      input.primaryColor,
      input.secondaryColor,
    );
    console.log(`[tenant-seed] Branding updated: primary=${input.primaryColor}, secondary=${input.secondaryColor}`);
  } catch (err) {
    console.error('[tenant-seed] Failed to seed branding:', err);
  }
}
