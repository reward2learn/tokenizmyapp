/**
 * After AI Content Generation, ensure the tenant Home (`/`) page is a CEO
 * overview dashboard: ops KPIs for the selected month, then AI narrative.
 *
 * Tenant seed only installs a bare `hero` on home, so without this step `/`
 * stays an empty shell while Summary / Review routes hold the AI output.
 * Respects `content_locked` so CMS edits survive re-generation.
 */

import type { SheetPagesSqlClient } from '@/domain/ai-content/ensure-sheet-pages';
import { getTenantConfig } from '@shared/lib/config/tenant';

/** CEO overview landing — KPIs first, narrative below (no sheet data grid). */
export interface HomeHeroConfig {
  badge?: string;
  headline?: string;
  subtitle?: string;
  accent?: string;
}

const HOME_SECTIONS: { blockType: string; config: Record<string, unknown> }[] = [
  { blockType: 'hero', config: { badge: 'CEO Overview', minTier: 'public' } },
  { blockType: 'kpi_cards', config: { variant: 'ops', minTier: 'google' } },
  {
    blockType: 'doc_markdown',
    config: { source: 'executive-summary', title: 'Executive Summary', minTier: 'google' },
  },
  { blockType: 'review_blocks', config: { minTier: 'google' } },
  { blockType: 'action_checklist', config: { minTier: 'pin' } },
];

const DASHBOARD_SECTIONS: { blockType: string; config: Record<string, unknown> }[] = [
  {
    blockType: 'hero',
    config: {
      badge: 'Exit Viability Review',
      headline: 'Business Review',
      subtitle:
        'Financial overview — revenue, margins, and action plan from the latest workbook.',
      minTier: 'public',
    },
  },
  { blockType: 'action_checklist', config: { minTier: 'pin' } },
  { blockType: 'metric_grid', config: { minTier: 'google' } },
  { blockType: 'lever_accordion', config: { title: 'The 5 Levers', minTier: 'google' } },
];

async function upsertPageSections(
  db: SheetPagesSqlClient,
  slug: string,
  title: string,
  authTier: 'public' | 'google' | 'pin',
  sortOrder: number,
  navLabel: string,
  sections: { blockType: string; config: Record<string, unknown> }[],
  homeHero?: HomeHeroConfig | null,
): Promise<boolean> {
  const tenantSlug =
    getTenantConfig().slug || process.env.NEXT_PUBLIC_TENANT_SLUG || null;

  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS content_locked BOOLEAN DEFAULT false`,
    );
  } catch {
    // table may not exist yet
  }

  const pageId = crypto.randomUUID();
  await db.$executeRawUnsafe(
    `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
     VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, true, $7)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       nav_label = EXCLUDED.nav_label,
       show_in_nav = EXCLUDED.show_in_nav,
       tenant_slug = COALESCE(EXCLUDED.tenant_slug, app_pages.tenant_slug)`,
    pageId,
    slug,
    title,
    authTier,
    sortOrder,
    navLabel,
    tenantSlug,
  );

  const rows = (await db.$queryRawUnsafe(
    `SELECT id, COALESCE(content_locked, false) AS "contentLocked" FROM app_pages WHERE slug = $1 LIMIT 1`,
    slug,
  )) as { id: string; contentLocked: boolean }[];

  const row = rows[0];
  if (!row) return false;
  if (row.contentLocked) {
    console.log(`[ensure-landing-pages] ${slug} is content_locked — leaving CMS sections alone`);
    return true;
  }

  await db.$executeRawUnsafe(`DELETE FROM page_sections WHERE page_id = $1`, row.id);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]!;
    let config: Record<string, unknown> = { ...section.config };
    if (section.blockType === 'hero' && homeHero) {
      config = {
        ...config,
        ...(homeHero.badge ? { badge: homeHero.badge } : {}),
        ...(homeHero.headline ? { headline: homeHero.headline } : {}),
        ...(homeHero.subtitle ? { subtitle: homeHero.subtitle } : {}),
        ...(homeHero.accent ? { accent: homeHero.accent } : {}),
      };
    }
    await db.$executeRawUnsafe(
      `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
       VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb))`,
      crypto.randomUUID(),
      row.id,
      i,
      section.blockType,
      JSON.stringify(config),
    );
  }

  console.log(`[ensure-landing-pages] Upserted ${sections.length} section(s) on ${slug}`);
  return true;
}

export async function ensureTenantHomeSections(
  db: SheetPagesSqlClient,
  homeHero?: HomeHeroConfig | null,
): Promise<boolean> {
  return upsertPageSections(db, 'home', 'Home', 'public', 0, 'Home', HOME_SECTIONS, homeHero);
}

/** Dashboard page — AI hero + actions / metrics / levers from dashboard_data. */
export async function ensureDashboardSections(
  db: SheetPagesSqlClient,
  homeHero?: HomeHeroConfig | null,
): Promise<boolean> {
  return upsertPageSections(
    db,
    'dashboard',
    'Dashboard',
    'public',
    1,
    'Dashboard',
    DASHBOARD_SECTIONS,
    homeHero,
  );
}
