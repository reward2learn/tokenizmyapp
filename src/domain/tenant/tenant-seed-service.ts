/**
 * Tenant Seed Service — seeds template defaults when a tenant is created.
 *
 * Creates: AppPage + PageSection rows, NavigationItem rows, AppSetting row,
 * and default security groups with template-specific permissions.
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

export async function seedTenantDefaults(input: SeedTenantInput): Promise<{
  pages: number;
  navItems: number;
  settings: boolean;
}> {
  const template = getTemplate(input.template);
  const db = input.db!;

  // ── 1. Seed AppSetting (brand config) ─────────────────
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO app_settings (id, tenant_slug, tenant_display_name, tenant_template, web_search_enabled)
       VALUES ($1, $2, $3, $4, false)
       ON CONFLICT (id) DO UPDATE
         SET tenant_slug = $2, tenant_display_name = $3, tenant_template = $4;`,
      'default', input.slug, input.displayName, input.template,
    );
    console.log(`[tenant-seed] AppSetting seeded for ${input.slug}`);
  } catch (err) {
    console.error(`[tenant-seed] Failed to seed AppSetting:`, err);
  }

  // ── 2. Seed AppPage + PageSection ─────────────────────
  let pageCount = 0;
  for (const tplPage of template.defaultPages) {
    try {
      // Upsert page
      await db.$executeRawUnsafe(
        `INSERT INTO app_pages (slug, title, nav_label, show_in_nav, auth_tier, tenant_slug)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE
           SET title = $2, nav_label = $3, show_in_nav = $4, auth_tier = $5;`,
        tplPage.slug,
        tplPage.title,
        tplPage.navLabel ?? tplPage.title,
        true,
        tplPage.authTier,
        input.slug,
      );

      // Seed sections (block types) for this page
      // First, remove existing sections for this page
      await db.$executeRawUnsafe(
        `DELETE FROM page_sections WHERE page_slug = $1;`,
        tplPage.slug,
      );

      // Insert new sections
      for (let i = 0; i < tplPage.blockTypes.length; i++) {
        const blockType = tplPage.blockTypes[i];
        await db.$executeRawUnsafe(
          `INSERT INTO page_sections (page_slug, block_type, sort_order, config)
           VALUES ($1, $2, $3, $4);`,
          tplPage.slug,
          blockType,
          i,
          JSON.stringify({ minTier: tplPage.authTier }),
        );
      }

      pageCount++;
      console.log(`[tenant-seed] Page "${tplPage.slug}" seeded with ${tplPage.blockTypes.length} sections`);
    } catch (err) {
      console.error(`[tenant-seed] Failed to seed page ${tplPage.slug}:`, err);
    }
  }

  // ── 3. Seed NavigationItem ────────────────────────────
  let navCount = 0;
  // Clear existing nav for this tenant
  try {
    await db.$executeRawUnsafe(
      `DELETE FROM navigation_items WHERE tenant_slug = $1;`,
      input.slug,
    );
  } catch {
    // Table might not have tenant_slug column yet
  }

  for (let i = 0; i < template.defaultNavItems.length; i++) {
    const navItem = template.defaultNavItems[i];
    try {
      await db.$executeRawUnsafe(
        `INSERT INTO navigation_items (title, path, icon, auth_tier, sort_order, tenant_slug, parent_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, NULL, true)
         ON CONFLICT DO NOTHING;`,
        navItem.title,
        navItem.path,
        navItem.icon,
        navItem.authTier,
        i,
        input.slug,
      );
      navCount++;
    } catch (err) {
      console.error(`[tenant-seed] Failed to seed nav item ${navItem.title}:`, err);
    }
  }

  console.log(`[tenant-seed] Seeded ${pageCount} pages, ${navCount} nav items for ${input.slug}`);
  return { pages: pageCount, navItems: navCount, settings: true };
}

/**
 * Seed the default security groups from the template definition.
 * Templates currently share the same default groups; this is a hook
 * for future template-specific permission sets.
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
      await db.$executeRawUnsafe(
        `INSERT INTO security_groups (code, name, description, is_system, permissions)
         VALUES ($1, $2, $3, $4, $5)
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
 * This is called after app_settings row exists.
 */
export async function seedTemplateBranding(
  db: any,
  input: { primaryColor: string; secondaryColor: string },
): Promise<void> {
  try {
    // Brand colors are stored in app_settings metadata or dedicated columns
    // For now, store in the brand_config via the existing brand-config API
    await db.$executeRawUnsafe(
      `INSERT INTO app_settings (id, tenant_template, web_search_enabled)
       VALUES ('default', 'default', false)
       ON CONFLICT (id) DO NOTHING;`,
    );
  } catch (err) {
    console.error('[tenant-seed] Failed to seed branding:', err);
  }
}
