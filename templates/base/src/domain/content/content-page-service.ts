/**
 * Content Page Service — legal page CRUD (Phase 10B).
 * Uses the same idempotent ensure-table pattern as tenant-service.
 * ZenStack model accessor: db.contentPage (ContentPage @@map content_pages).
 */
import type { DbClient } from '@/lib/db';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const CONTENT_PAGES_DDL = `
CREATE TABLE IF NOT EXISTS content_pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'html',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT
);`;

export interface ContentPageDto {
  id: string;
  slug: string;
  title: string;
  body: string;
  format: string;
  isPublished: boolean;
  updatedAt: Date;
  updatedBy: string | null;
}

export interface ContentPageInput {
  slug: string;
  title: string;
  body: string;
  format?: string;
  isPublished?: boolean;
  updatedBy?: string | null;
}

export type ContentPagePatch = Partial<Omit<ContentPageInput, 'slug'>>;

/** Shape returned by Prisma/ZenStack findMany/findUnique/create/update. */
type ContentPageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  format: string;
  isPublished: boolean;
  updatedAt: Date;
  updatedBy: string | null;
};

export async function ensureContentPagesTable(db: DbClient): Promise<void> {
  await db.$executeRawUnsafe(CONTENT_PAGES_DDL);

  const migrationCols = [
    "ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'html'",
    'ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE',
    'ADD COLUMN IF NOT EXISTS updated_by TEXT',
  ];
  for (const col of migrationCols) {
    try {
      await db.$executeRawUnsafe(`ALTER TABLE content_pages ${col}`);
    } catch {
      // column may already exist — ignore
    }
  }
}

// ── Legal HTML fallback helpers ─────────────────────────

interface LegalFallback {
  title: string;
  body: string;
}

function readLegalFallback(filename: string, fallbackTitle: string): LegalFallback {
  try {
    const safeName = filename.replace(/\.\./g, '').replace(/[/\\]/g, '');
    const path = resolve(process.cwd(), 'legal', safeName);
    if (!existsSync(path)) return { title: fallbackTitle, body: '<p>Content not available.</p>' };
    const html = readFileSync(path, 'utf8');
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : fallbackTitle;
    const body = articleMatch ? articleMatch[1].trim() : html;
    return { title, body };
  } catch {
    return { title: fallbackTitle, body: '<p>Content not available.</p>' };
  }
}

/** Default legal pages seeded from the bundled legal/ HTML files. */
const DEFAULT_PAGES: Array<{ slug: string; filename: string; fallbackTitle: string }> = [
  { slug: 'terms', filename: 'terms-of-service.html', fallbackTitle: 'Terms of Service' },
  { slug: 'privacy', filename: 'privacy-policy.html', fallbackTitle: 'Privacy Policy' },
];

// ── Service ─────────────────────────────────────────────

export class ContentPageService {
  constructor(private readonly db: DbClient) {}

  async list(): Promise<ContentPageDto[]> {
    await ensureContentPagesTable(this.db);
    const rows = await this.db.contentPage.findMany({
      orderBy: { slug: 'asc' },
    });
    return (rows as ContentPageRow[]).map((r) => this.toDto(r));
  }

  async getBySlug(slug: string): Promise<ContentPageDto | null> {
    await ensureContentPagesTable(this.db);
    const row = await this.db.contentPage.findUnique({ where: { slug } });
    return row ? this.toDto(row) : null;
  }

  async create(data: ContentPageInput): Promise<ContentPageDto> {
    await ensureContentPagesTable(this.db);
    const row = await this.db.contentPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        body: data.body,
        format: data.format ?? 'html',
        isPublished: data.isPublished ?? true,
        updatedBy: data.updatedBy ?? null,
      },
    });
    return this.toDto(row);
  }

  async update(slug: string, patch: ContentPagePatch): Promise<ContentPageDto> {
    await ensureContentPagesTable(this.db);
    const existing = await this.db.contentPage.findUnique({ where: { slug } });
    if (!existing) throw new Error('Content page not found');
    const data: Record<string, unknown> = {};
    if (patch.title !== undefined) data.title = patch.title;
    if (patch.body !== undefined) data.body = patch.body;
    if (patch.format !== undefined) data.format = patch.format;
    if (patch.isPublished !== undefined) data.isPublished = patch.isPublished;
    if (patch.updatedBy !== undefined) data.updatedBy = patch.updatedBy;
    const row = await this.db.contentPage.update({
      where: { slug },
      data,
    });
    return this.toDto(row);
  }

  async delete(slug: string): Promise<void> {
    await ensureContentPagesTable(this.db);
    const existing = await this.db.contentPage.findUnique({ where: { slug } });
    if (!existing) throw new Error('Content page not found');
    await this.db.contentPage.delete({ where: { slug } });
  }

  /**
   * Seed default "terms" and "privacy" pages from the bundled legal/ HTML files
   * when they do not already exist. Returns the number of pages seeded.
   */
  async seedDefaults(): Promise<number> {
    await ensureContentPagesTable(this.db);
    let seeded = 0;
    for (const def of DEFAULT_PAGES) {
      const existing = await this.db.contentPage.findUnique({ where: { slug: def.slug } });
      if (existing) continue;
      const fallback = readLegalFallback(def.filename, def.fallbackTitle);
      await this.db.contentPage.create({
        data: {
          slug: def.slug,
          title: fallback.title,
          body: fallback.body,
          format: 'html',
          isPublished: true,
        },
      });
      seeded += 1;
    }
    return seeded;
  }

  private toDto(row: ContentPageRow): ContentPageDto {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      body: row.body,
      format: row.format,
      isPublished: row.isPublished,
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    };
  }
}
