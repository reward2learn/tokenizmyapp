/**
 * After AI Content Generation, ensure the tenant Home (`/`) page is a CEO
 * overview dashboard: ops KPIs + primary sheet viewer, then AI narrative.
 *
 * Tenant seed only installs a bare `hero` on home, so without this step `/`
 * stays an empty shell while Summary / Review routes hold the AI output.
 * Respects `content_locked` so CMS edits survive re-generation.
 */

import type { SheetPagesSqlClient } from '@/domain/ai-content/ensure-sheet-pages';
import { getTenantConfig } from '@shared/lib/config/tenant';

/** CEO overview landing — KPIs + primary sheet first, narrative below. */
/** CEO overview landing — KPIs + primary sheet first, narrative below. */
const HOME_SECTIONS: { blockType: string; config: Record<string, unknown> }[] = [
  { blockType: 'hero', config: { badge: 'CEO Overview', minTier: 'public' } },
  { blockType: 'kpi_cards', config: { variant: 'ops', minTier: 'google' } },
  { blockType: 'sheet_viewer', config: { sheet: 'TB', title: 'Trial Balance', minTier: 'google' } },
  {
    blockType: 'doc_markdown',
    config: { source: 'executive-summary', title: 'Executive Summary', minTier: 'google' },
  },
  { blockType: 'review_blocks', config: { minTier: 'google' } },
  { blockType: 'action_checklist', config: { minTier: 'pin' } },
];

export async function ensureTenantHomeSections(
  db: SheetPagesSqlClient,
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
     VALUES ($1, 'home', 'Home', CAST('public' AS "AuthTier"), 0, 'Home', true, $2)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       nav_label = EXCLUDED.nav_label,
       show_in_nav = EXCLUDED.show_in_nav,
       tenant_slug = COALESCE(EXCLUDED.tenant_slug, app_pages.tenant_slug)`,
    pageId,
    tenantSlug,
  );

  const rows = (await db.$queryRawUnsafe(
    `SELECT id, COALESCE(content_locked, false) AS "contentLocked" FROM app_pages WHERE slug = 'home' LIMIT 1`,
  )) as { id: string; contentLocked: boolean }[];

  const row = rows[0];
  if (!row) return false;
  if (row.contentLocked) {
    console.log('[ensure-landing-pages] home is content_locked — leaving CMS sections alone');
    return true;
  }

  await db.$executeRawUnsafe(`DELETE FROM page_sections WHERE page_id = $1`, row.id);

  for (let i = 0; i < HOME_SECTIONS.length; i++) {
    const section = HOME_SECTIONS[i]!;
    await db.$executeRawUnsafe(
      `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
       VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb))`,
      crypto.randomUUID(),
      row.id,
      i,
      section.blockType,
      JSON.stringify(section.config),
    );
  }

  console.log(`[ensure-landing-pages] Upserted ${HOME_SECTIONS.length} section(s) on home`);
  return true;
}
