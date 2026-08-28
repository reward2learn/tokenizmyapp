/**
 * After AI generation, deliver content onto every seeded template page —
 * not only Executive Summary + Business Review.
 *
 * Interactive / admin pages are marked as live (no markdown). Narrative pages
 * get their snippets/sections wired. Sheet pages are created from the workbook.
 *
 * Unknown seeded slugs are classified from their page sections (or the in-memory
 * page catalog) and registered into the kind sets at runtime — no hard-coded
 * fallback that leaves custom template pages unclassified forever.
 */
import type { DbClient } from '@/lib/db';
import type { SheetPagesSqlClient } from '@/domain/ai-content/ensure-sheet-pages';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import { getFullCatalog } from '@/lib/page-catalog';

/** Local progress shape — avoids circular import with content-generator. */
export type PageProgress = (event: {
  step: 'extracting' | 'prompt' | 'openai' | 'parsing' | 'saving' | 'saving_exec' | 'saving_home' | 'seeding_tasks' | 'complete' | 'error';
  message: string;
  pct: number;
  detail?: unknown;
}) => void;

export type PageContentKind =
  | 'narrative'
  | 'dashboard'
  | 'tasks'
  | 'sheet'
  | 'live-data'
  | 'admin'
  | 'static';

export interface PageContentStatus {
  slug: string;
  title: string;
  kind: PageContentKind;
  /** Whether this generate run applied or verified content for the page. */
  status: 'ready' | 'updated' | 'skipped' | 'error';
  detail?: string;
}

/**
 * Admin / ops UI pages — never populated by Generate content.
 * Filtered out of delivery and out of "Currently Saved Content" listings.
 */
export const BYPASS_ADMIN_SLUGS = new Set([
  'admin',
  'config',
  'settings',
  'ops-admin',
  'ops-chat',
  'notes',
]);

/**
 * Mutable kind → slug sets. Seeded with known tenant catalog pages; unknown
 * seeded pages are added dynamically via registerSlug().
 *
 * - narrative  → AI docs / sections applied (Home, Summary, Review)
 * - dashboard  → dashboard_data + AI hero
 * - tasks      → AI / playbook task list
 * - sheet      → sheet-* workbook pages
 * - live-data  → workbook / KPI backed UI (no new markdown)
 * - admin      → interactive admin / chat UI (bypassed — not populated)
 * - static     → legal pages (Terms / Privacy) — content refreshed during seed
 *                from tenant + workbook + template capabilities; not AI-rewritten
 */
const KIND_SETS: Record<PageContentKind, Set<string>> = {
  narrative: new Set(['home', 'summary', 'review']),
  dashboard: new Set(['dashboard']),
  tasks: new Set(['tasks']),
  sheet: new Set(),
  'live-data': new Set(['ops-tracking']),
  admin: new Set([...BYPASS_ADMIN_SLUGS]),
  static: new Set(['terms-of-service', 'privacy-policy']),
};

export function isBypassedAdminSlug(slug: string): boolean {
  return BYPASS_ADMIN_SLUGS.has(slug);
}

const ALL_KINDS: PageContentKind[] = [
  'narrative',
  'dashboard',
  'tasks',
  'sheet',
  'live-data',
  'admin',
  'static',
];

const ADMIN_BLOCKS = new Set(['ops_admin_tabs', 'chat_panel']);
const DASHBOARD_BLOCKS = new Set(['metric_grid', 'lever_accordion']);
const LIVE_DATA_BLOCKS = new Set([
  'kpi_cards',
  'chart_financial',
  'pnl_table',
  'reports_rollup',
]);
const NARRATIVE_BLOCKS = new Set(['doc_markdown', 'review_blocks']);
const STATIC_DOC_SOURCES = new Set(['terms-of-service.html', 'privacy-policy.html']);

/** Register a slug under a kind (moves it out of any other kind set). */
export function registerSlug(slug: string, kind: PageContentKind): void {
  for (const k of ALL_KINDS) {
    if (k !== kind) KIND_SETS[k].delete(slug);
  }
  KIND_SETS[kind].add(slug);
}

/** Lookup only — does not register. */
function lookupKind(slug: string): PageContentKind | null {
  if (slug.startsWith('sheet-')) return 'sheet';
  for (const kind of ALL_KINDS) {
    if (KIND_SETS[kind].has(slug)) return kind;
  }
  return null;
}

/**
 * Infer kind from block types (and optional doc_markdown sources).
 * Order matters: narrative wins over live-data when both kpi + doc_markdown exist (Home).
 */
export function inferKindFromBlocks(
  slug: string,
  blockTypes: string[],
  docSources: string[] = [],
): PageContentKind {
  if (slug.startsWith('sheet-') || blockTypes.includes('sheet_viewer')) {
    return 'sheet';
  }
  if (blockTypes.some((b) => ADMIN_BLOCKS.has(b))) {
    return 'admin';
  }
  if (
    docSources.some((s) => STATIC_DOC_SOURCES.has(s)) &&
    !blockTypes.includes('review_blocks')
  ) {
    return 'static';
  }
  if (blockTypes.some((b) => NARRATIVE_BLOCKS.has(b))) {
    return 'narrative';
  }
  if (blockTypes.some((b) => DASHBOARD_BLOCKS.has(b))) {
    return 'dashboard';
  }
  if (blockTypes.some((b) => LIVE_DATA_BLOCKS.has(b))) {
    return 'live-data';
  }
  if (blockTypes.length === 0 && (slug === 'tasks' || slug.includes('task'))) {
    return 'tasks';
  }
  if (blockTypes.length === 0 && ['admin', 'config', 'settings'].includes(slug)) {
    return 'admin';
  }
  // Default for custom template pages with unknown/empty sections: narrative
  // so Generate content still delivers and reports them.
  return 'narrative';
}

/** Seed KIND_SETS from the in-memory page catalog (static + dynamic pages). */
function registerFromCatalog(): void {
  for (const page of Object.values(getFullCatalog())) {
    if (lookupKind(page.slug)) continue;
    const blockTypes = page.sections.map((s) => s.blockType);
    const docSources = page.sections
      .filter((s) => s.blockType === 'doc_markdown')
      .map((s) => String((s.config as { source?: string }).source ?? ''));
    registerSlug(page.slug, inferKindFromBlocks(page.slug, blockTypes, docSources));
  }
}

async function loadPageBlockTypes(
  db: DbClient,
  slug: string,
): Promise<{ blockTypes: string[]; docSources: string[] }> {
  try {
    const page = await db.appPage.findUnique({
      where: { slug },
      select: {
        sections: { select: { blockType: true, config: true } },
      },
    });
    if (page?.sections) {
      const blockTypes = page.sections.map((s: { blockType: string }) => String(s.blockType));
      const docSources = page.sections
        .filter((s: { blockType: string }) => String(s.blockType) === 'doc_markdown')
        .map((s: { blockType: string; config: { source?: string } | null }) => {
          const cfg = s.config as { source?: string } | null;
          return String(cfg?.source ?? '');
        });
      return { blockTypes, docSources };
    }
  } catch {
    // fall through to raw
  }
  try {
    const rows = (await (db as unknown as SheetPagesSqlClient).$queryRawUnsafe(
      `SELECT ps.block_type AS "blockType", ps.config AS config
       FROM page_sections ps
       JOIN app_pages ap ON ap.id = ps.page_id
       WHERE ap.slug = $1
       ORDER BY ps.sort_order ASC`,
      slug,
    )) as { blockType: string; config: unknown }[];
    const blockTypes = (rows ?? []).map((r) => String(r.blockType));
    const docSources = (rows ?? [])
      .filter((r) => String(r.blockType) === 'doc_markdown')
      .map((r) => {
        const cfg =
          typeof r.config === 'string'
            ? (JSON.parse(r.config) as { source?: string })
            : (r.config as { source?: string } | null);
        return String(cfg?.source ?? '');
      });
    return { blockTypes, docSources };
  } catch {
    return { blockTypes: [], docSources: [] };
  }
}

/**
 * Classify a page. Unknown slugs are inferred from DB sections (or catalog)
 * and registered into KIND_SETS so later lookups hit the set.
 */
export async function classifyPage(
  db: DbClient,
  slug: string,
): Promise<PageContentKind> {
  const known = lookupKind(slug);
  if (known) {
    if (known === 'sheet' || slug.startsWith('sheet-')) {
      registerSlug(slug, 'sheet');
      return 'sheet';
    }
    return known;
  }

  const { blockTypes, docSources } = await loadPageBlockTypes(db, slug);
  const kind = inferKindFromBlocks(slug, blockTypes, docSources);
  registerSlug(slug, kind);
  return kind;
}

async function listSeededPages(
  db: DbClient,
): Promise<{ slug: string; title: string }[]> {
  try {
    const appId = getCurrentAppId();
    const rows = await db.appPage.findMany({
      where: appId
        ? { OR: [{ appId }, { appId: null }, { appId: '' }] }
        : undefined,
      select: { slug: true, title: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (rows.length > 0) return rows;
  } catch {
    // fall through to raw
  }
  try {
    const rows = (await (db as unknown as SheetPagesSqlClient).$queryRawUnsafe(
      `SELECT slug, title FROM app_pages ORDER BY sort_order ASC`,
    )) as { slug: string; title: string }[];
    return rows ?? [];
  } catch {
    return [];
  }
}

/**
 * Walk every seeded app page and ensure the content path for that page is
 * populated for this generation run. Emits progress per page.
 */
export async function deliverContentToSeededPages(
  db: DbClient,
  opts: {
    onProgress?: PageProgress;
    source?: string | Buffer | Buffer[];
    homeHero?: { badge?: string; headline?: string; subtitle?: string; accent?: string } | null;
    executiveSummarySaved: boolean;
    reviewPartCount: number;
    dashboardSaved: boolean;
    tasksSeeded: boolean;
    sheetPages: { slug: string; title: string }[];
  },
): Promise<PageContentStatus[]> {
  // Pull catalog + dynamic pages into KIND_SETS first, then fill gaps from DB.
  registerFromCatalog();
  for (const sp of opts.sheetPages) {
    registerSlug(sp.slug, 'sheet');
  }

  let pages = (await listSeededPages(db)).filter((p) => !isBypassedAdminSlug(p.slug));
  const sheetSlugSet = new Set(opts.sheetPages.map((p) => p.slug));
  const results: PageContentStatus[] = [];

  if (pages.length === 0) {
    pages = [
      { slug: 'home', title: 'Home' },
      { slug: 'dashboard', title: 'Dashboard' },
      { slug: 'summary', title: 'Executive Summary' },
      { slug: 'review', title: 'Business Review' },
      { slug: 'tasks', title: 'Tasks' },
      { slug: 'ops-tracking', title: 'Ops Tracking' },
      ...opts.sheetPages,
    ].filter((p) => !isBypassedAdminSlug(p.slug));
  }

  // Register any seeded slug not already in a set (custom template pages).
  // Admin bypass slugs are already filtered out of `pages`.
  for (const page of pages) {
    if (!lookupKind(page.slug)) {
      await classifyPage(db, page.slug);
    } else if (page.slug.startsWith('sheet-')) {
      registerSlug(page.slug, 'sheet');
    }
  }

  const deliverable = pages.filter((p) => {
    const known = lookupKind(p.slug);
    return known !== 'admin' && known !== 'static' && !isBypassedAdminSlug(p.slug);
  });

  const total = deliverable.length;
  for (let i = 0; i < deliverable.length; i++) {
    const page = deliverable[i]!;
    const kind = await classifyPage(db, page.slug);
    // Belt-and-suspenders: never populate admin/static surfaces.
    if (kind === 'admin' || kind === 'static' || isBypassedAdminSlug(page.slug)) {
      continue;
    }
    opts.onProgress?.({
      step: 'saving',
      message: `Delivering content to page ${i + 1}/${total}: ${page.title} (${page.slug})…`,
      pct: Math.min(99, 90 + Math.round(((i + 1) / Math.max(total, 1)) * 8)),
      detail: { page: page.slug, pageIndex: i + 1, pageTotal: total, kind },
    });

    try {
      switch (kind) {
        case 'narrative': {
          if (page.slug === 'summary') {
            results.push({
              slug: page.slug,
              title: page.title,
              kind,
              status: opts.executiveSummarySaved ? 'updated' : 'skipped',
              detail: opts.executiveSummarySaved
                ? 'Executive summary markdown'
                : 'No executive summary generated',
            });
          } else if (page.slug === 'review') {
            results.push({
              slug: page.slug,
              title: page.title,
              kind,
              status: opts.reviewPartCount > 0 ? 'updated' : 'skipped',
              detail:
                opts.reviewPartCount > 0
                  ? `${opts.reviewPartCount} review part(s)`
                  : 'No review parts generated',
            });
          } else if (page.slug === 'home') {
            const { ensureTenantHomeSections } = await import(
              '@/domain/ai-content/ensure-landing-pages'
            );
            await ensureTenantHomeSections(db as unknown as SheetPagesSqlClient, opts.homeHero);
            results.push({
              slug: page.slug,
              title: page.title,
              kind,
              status: 'updated',
              detail: 'Hero, KPIs, exec summary, review blocks',
            });
          } else {
            results.push({
              slug: page.slug,
              title: page.title,
              kind,
              status: 'ready',
              detail: 'Registered narrative page (custom / shared content)',
            });
          }
          break;
        }
        case 'dashboard': {
          const { ensureDashboardSections } = await import(
            '@/domain/ai-content/ensure-landing-pages'
          );
          await ensureDashboardSections(db as unknown as SheetPagesSqlClient, opts.homeHero);
          results.push({
            slug: page.slug,
            title: page.title,
            kind,
            status: opts.dashboardSaved ? 'updated' : 'ready',
            detail: opts.dashboardSaved
              ? 'Dashboard data + hero/actions/levers'
              : 'Layout ready (dashboard data fallback)',
          });
          break;
        }
        case 'tasks': {
          results.push({
            slug: page.slug,
            title: page.title,
            kind,
            status: opts.tasksSeeded ? 'updated' : 'ready',
            detail: opts.tasksSeeded ? 'AI task list seeded' : 'Playbook tasks',
          });
          break;
        }
        case 'sheet': {
          results.push({
            slug: page.slug,
            title: page.title,
            kind,
            status: sheetSlugSet.has(page.slug) ? 'updated' : 'ready',
            detail: 'Workbook sheet viewer + summary',
          });
          break;
        }
        case 'live-data': {
          results.push({
            slug: page.slug,
            title: page.title,
            kind,
            status: 'ready',
            detail: 'Live financial projections / KPIs (from workbook seed)',
          });
          break;
        }
        default: {
          const _exhaustive: never = kind;
          void _exhaustive;
        }
      }
    } catch (err) {
      results.push({
        slug: page.slug,
        title: page.title,
        kind,
        status: 'error',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (const sp of opts.sheetPages) {
    if (!results.some((r) => r.slug === sp.slug)) {
      registerSlug(sp.slug, 'sheet');
      results.push({
        slug: sp.slug,
        title: sp.title,
        kind: 'sheet',
        status: 'updated',
        detail: 'Workbook sheet viewer + summary',
      });
    }
  }

  return results;
}
