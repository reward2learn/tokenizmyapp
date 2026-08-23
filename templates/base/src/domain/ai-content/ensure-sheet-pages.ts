/**
 * Persist `sheet-*` AppPages from workbook analysis (template schema).
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  analyzeWorkbook,
  generatePagesFromAnalysis,
} from '@/domain/excel/workbook-analyzer';
import type { PageDefinition } from '@/lib/page-catalog';
import { setDynamicPages } from '@/lib/page-catalog';

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
): Promise<boolean> {
  const pageId = crypto.randomUUID();
  await db.$executeRawUnsafe(
    `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order)
     VALUES ($1, $2, $3, CAST($4 AS "AuthTier"), $5)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       auth_tier = EXCLUDED.auth_tier,
       sort_order = EXCLUDED.sort_order`,
    pageId,
    page.slug,
    page.title,
    page.authTier,
    sortOrder,
  );

  const idRows = (await db.$queryRawUnsafe(
    `SELECT id FROM app_pages WHERE slug = $1 LIMIT 1`,
    page.slug,
  )) as { id: string }[];
  const row = idRows[0];
  if (!row) return false;

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

export async function ensureSheetPagesFromWorkbook(
  db: SheetPagesSqlClient,
  source?: string | Buffer | Buffer[],
): Promise<{ slug: string; title: string }[]> {
  const buffers = resolveWorkbookBuffers(source);
  if (buffers.length === 0) return [];

  const analysis = analyzeWorkbook(buffers[0]!);
  const pages = generatePagesFromAnalysis(analysis).filter((p) => p.slug.startsWith('sheet-'));
  if (pages.length === 0) return [];

  setDynamicPages(pages);

  const saved: { slug: string; title: string }[] = [];
  let sortOrder = 100;
  for (const page of pages) {
    const ok = await upsertPageDefinition(db, page, sortOrder++);
    if (ok) saved.push({ slug: page.slug, title: page.title });
  }
  return saved;
}
