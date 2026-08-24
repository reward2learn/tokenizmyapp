/**
 * Persist `sheet-*` AppPages from workbook analysis so Populate Sheet Pages
 * can attach them to navigation after AI Content Generation.
 *
 * Uses the deterministic analyzer (same as seed-runner) — no second AI call.
 * Respects `app_pages.content_locked` so CMS edits survive re-generation.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  analyzeWorkbook,
  generatePagesFromAnalysis,
} from '@/domain/excel/workbook-analyzer';
import type { PageDefinition } from '@/lib/page-catalog';
import { setDynamicPages } from '@/lib/page-catalog';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { resolveRegistryTenantSlug } from '@shared/lib/cms-scope';
import { toStoragePageSlug } from '@shared/lib/page-slug';

export type SheetPagesSqlClient = {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
};

function workbookPathOnDisk(): string | null {
  const candidates = [
    resolve(process.cwd(), '../June 2026 - Red Ruby PT.TAMAN BINTANG BALI.xlsx'),
    resolve(process.cwd(), 'June 2026 - Red Ruby PT.TAMAN BINTANG BALI.xlsx'),
    resolve(process.cwd(), 'sources', 'workbook.xlsx'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

/** Resolve one or more workbook buffers from the same source shapes generateAndSave accepts. */
export function resolveWorkbookBuffers(source?: string | Buffer | Buffer[]): Buffer[] {
  if (Array.isArray(source)) {
    return source.filter((b) => Buffer.isBuffer(b) && b.length > 0);
  }
  if (Buffer.isBuffer(source)) return [source];
  if (typeof source === 'string') {
    if (!existsSync(source)) return [];
    return [readFileSync(source)];
  }
  const diskPath = workbookPathOnDisk();
  if (diskPath) return [readFileSync(diskPath)];
  return [];
}

async function upsertPageDefinition(
  db: SheetPagesSqlClient,
  page: PageDefinition,
  sortOrder: number,
  tenantSlug: string | null,
  appId: string,
): Promise<boolean> {
  const storageSlug = appId ? toStoragePageSlug(page.slug, appId) : page.slug;
  const pageId = crypto.randomUUID();
  await db.$executeRawUnsafe(
    `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug, app_id)
     VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5, $6, $7, $8, $9)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       auth_tier = EXCLUDED.auth_tier,
       sort_order = EXCLUDED.sort_order,
       nav_label = EXCLUDED.nav_label,
       show_in_nav = EXCLUDED.show_in_nav,
       tenant_slug = COALESCE(EXCLUDED.tenant_slug, app_pages.tenant_slug),
       app_id = COALESCE(EXCLUDED.app_id, app_pages.app_id)`,
    pageId,
    storageSlug,
    page.title,
    page.authTier,
    sortOrder,
    page.navLabel ?? page.title,
    page.showInNav !== false,
    tenantSlug,
    appId || null,
  );

  const idRows = (await db.$queryRawUnsafe(
    `SELECT id, COALESCE(content_locked, false) AS "contentLocked" FROM app_pages WHERE slug = $1 LIMIT 1`,
    storageSlug,
  )) as { id: string; contentLocked: boolean }[];

  const row = idRows[0];
  if (!row) return false;

  if (row.contentLocked) {
    return true; // page exists; leave CMS sections alone
  }

  await db.$executeRawUnsafe(`DELETE FROM page_sections WHERE page_id = $1`, row.id);

  for (let i = 0; i < page.sections.length; i++) {
    const section = page.sections[i]!;
    await db.$executeRawUnsafe(
      `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
       VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb))`,
      crypto.randomUUID(),
      row.id,
      i,
      section.blockType,
      JSON.stringify(section.config ?? {}),
    );
  }

  return true;
}

/**
 * Analyze workbook buffer(s), upsert `sheet-*` (+ workbook overview) pages,
 * and register them in the in-memory catalog for this process.
 */
export async function ensureSheetPagesFromWorkbook(
  db: SheetPagesSqlClient,
  source?: string | Buffer | Buffer[],
): Promise<{ slug: string; title: string }[]> {
  const buffers = resolveWorkbookBuffers(source);
  if (buffers.length === 0) {
    console.warn('[ensure-sheet-pages] No workbook buffers available — skipping sheet page creation');
    return [];
  }

  const merged: PageDefinition[] = [];
  for (let wi = 0; wi < buffers.length; wi++) {
    const buf = buffers[wi]!;
    const label = buffers.length > 1 ? `workbook ${wi + 1}` : undefined;
    const analysis = analyzeWorkbook(buf, label);
    const pages = generatePagesFromAnalysis(analysis);
    if (wi === 0) {
      merged.push(...pages);
    } else {
      // Avoid duplicate workbook overview from secondary files
      merged.push(...pages.filter((p) => p.slug.startsWith('sheet-')));
    }
  }

  // Dedupe by slug (first wins)
  const bySlug = new Map<string, PageDefinition>();
  for (const page of merged) {
    if (!bySlug.has(page.slug)) bySlug.set(page.slug, page);
  }
  const pages = Array.from(bySlug.values());

  setDynamicPages(pages.filter((p) => p.slug.startsWith('sheet-') || p.slug === 'workbook'));

  const deploymentSlug = getTenantConfig().slug || process.env.NEXT_PUBLIC_TENANT_SLUG || null;
  const appId = getCurrentAppId();
  const tenantSlug = deploymentSlug
    ? resolveRegistryTenantSlug(deploymentSlug, appId)
    : null;

  // Ensure CMS lock column exists (idempotent) before we read it.
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE app_pages ADD COLUMN IF NOT EXISTS content_locked BOOLEAN DEFAULT false`,
    );
  } catch {
    // Table may not exist yet — INSERT below will surface a clearer error.
  }

  const created: { slug: string; title: string }[] = [];
  let sortOrder = 100;

  for (const page of pages) {
    try {
      const ok = await upsertPageDefinition(db, page, sortOrder++, tenantSlug, appId);
      if (ok && page.slug.startsWith('sheet-')) {
        created.push({ slug: page.slug, title: page.title });
      }
    } catch (err) {
      console.warn(
        `[ensure-sheet-pages] Failed to upsert page "${page.slug}":`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log(`[ensure-sheet-pages] Upserted ${created.length} sheet-* page(s) for Populate Sheet Pages`);
  return created;
}
