/**
 * Media Service — image + video asset upload & management (Phase 10C).
 * Uses the same ensure-table pattern as content-page-service.
 * ZenStack model accessor: db.mediaAsset (MediaAsset @@map media_assets).
 *
 * Upload strategy:
 *  - If BLOB_READ_WRITE_TOKEN env var is set → upload to Vercel Blob via `@vercel/blob` put().
 *  - Otherwise → base64 data URL fallback (small files < 1 MB only).
 *
 * `@vercel/blob` is imported dynamically via a variable specifier so the package
 * is an optional peer dependency — the build does not fail when it is absent.
 */
import type { DbClient } from '@/lib/db';

const MEDIA_ASSETS_DDL = `
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  uploaded_by TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage TEXT NOT NULL DEFAULT 'vercel-blob',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  duration DOUBLE PRECISION,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const MIGRATION_COLS = [
  'ADD COLUMN IF NOT EXISTS thumbnail_url TEXT',
  'ADD COLUMN IF NOT EXISTS alt_text TEXT',
  'ADD COLUMN IF NOT EXISTS width INTEGER',
  'ADD COLUMN IF NOT EXISTS height INTEGER',
  'ADD COLUMN IF NOT EXISTS duration DOUBLE PRECISION',
  "ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'",
];

/** Minimal type for the dynamically-imported @vercel/blob module. */
interface VercelBlobModule {
  put: (
    pathname: string,
    body: File | Blob | ArrayBuffer | string,
    options: { access: 'public'; token: string; addRandomSuffix?: boolean },
  ) => Promise<{ url: string; pathname: string; contentType: string; downloadUrl: string }>;
  del: (urls: string[], options: { token: string }) => Promise<unknown>;
}

export interface MediaAssetDto {
  id: string;
  uploadedBy: string;
  filename: string;
  mimeType: string;
  size: number;
  storage: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  tags: string[];
  createdAt: Date;
}

export interface UploadMeta {
  altText?: string;
  tags?: string[];
  width?: number;
  height?: number;
  duration?: number;
}

export interface MediaListFilter {
  /** Filter by MIME-type prefix, e.g. "image/" or "video/". */
  mimeTypePrefix?: string;
  /** Return assets that have any of these tags. */
  tags?: string[];
}

type MediaAssetRow = {
  id: string;
  uploadedBy: string;
  filename: string;
  mimeType: string;
  size: number;
  storage: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  tags: string[];
  createdAt: Date;
};

const MAX_BASE64_SIZE = 1024 * 1024; // 1 MB

export async function ensureMediaAssetsTable(db: DbClient): Promise<void> {
  await db.$executeRawUnsafe(MEDIA_ASSETS_DDL);
  for (const col of MIGRATION_COLS) {
    try {
      await db.$executeRawUnsafe(`ALTER TABLE media_assets ${col}`);
    } catch {
      // column may already exist — ignore
    }
  }
}

/** Dynamically import @vercel/blob using a variable specifier to avoid build-time resolution. */
async function importBlob(): Promise<VercelBlobModule> {
  const specifier: string = '@vercel/blob';
  return (await import(specifier)) as unknown as VercelBlobModule;
}

function buildBlobPathname(filename: string): string {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `media/${stamp}-${rand}-${safe}`;
}

export class MediaService {
  constructor(private readonly db: DbClient) {}

  async upload(file: File, uploadedBy: string, meta?: UploadMeta): Promise<MediaAssetDto> {
    await ensureMediaAssetsTable(this.db);

    const mimeType = file.type || 'application/octet-stream';
    const size = file.size;
    const filename = file.name || 'untitled';

    let storage: string;
    let url: string;

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      const blob = await importBlob();
      const result = await blob.put(buildBlobPathname(filename), file, {
        access: 'public',
        token: blobToken,
      });
      storage = 'vercel-blob';
      url = result.url;
    } else {
      if (size > MAX_BASE64_SIZE) {
        throw new Error(
          'File too large for base64 fallback (max 1 MB). Set BLOB_READ_WRITE_TOKEN to upload larger files via Vercel Blob.',
        );
      }
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      url = `data:${mimeType};base64,${base64}`;
      storage = 'base64';
    }

    const row = await this.db.mediaAsset.create({
      data: {
        uploadedBy,
        filename,
        mimeType,
        size,
        storage,
        url,
        thumbnailUrl: null,
        altText: meta?.altText ?? null,
        width: meta?.width ?? null,
        height: meta?.height ?? null,
        duration: meta?.duration ?? null,
        tags: meta?.tags ?? [],
      },
    });
    return this.toDto(row);
  }

  async list(filter?: MediaListFilter): Promise<MediaAssetDto[]> {
    await ensureMediaAssetsTable(this.db);

    const where: Record<string, unknown> = {};
    if (filter?.mimeTypePrefix) {
      where.mimeType = { startsWith: filter.mimeTypePrefix };
    }
    if (filter?.tags && filter.tags.length > 0) {
      where.tags = { hasSome: filter.tags };
    }

    const rows = await this.db.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return (rows as MediaAssetRow[]).map((r) => this.toDto(r));
  }

  async getById(id: string): Promise<MediaAssetDto | null> {
    await ensureMediaAssetsTable(this.db);
    const row = await this.db.mediaAsset.findUnique({ where: { id } });
    return row ? this.toDto(row) : null;
  }

  async delete(id: string): Promise<void> {
    await ensureMediaAssetsTable(this.db);
    const existing = await this.db.mediaAsset.findUnique({ where: { id } });
    if (!existing) throw new Error('Media asset not found');

    if (existing.storage === 'vercel-blob') {
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken) {
        try {
          const blob = await importBlob();
          await blob.del([existing.url], { token: blobToken });
        } catch (err) {
          console.error('[media] Vercel Blob delete failed:', err);
        }
      }
    }

    await this.db.mediaAsset.delete({ where: { id } });
  }

  private toDto(row: MediaAssetRow): MediaAssetDto {
    return {
      id: row.id,
      uploadedBy: row.uploadedBy,
      filename: row.filename,
      mimeType: row.mimeType,
      size: row.size,
      storage: row.storage,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
      altText: row.altText,
      width: row.width,
      height: row.height,
      duration: row.duration,
      tags: row.tags,
      createdAt: row.createdAt,
    };
  }
}
