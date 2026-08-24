/**
 * Workbook cache lookup (knowledge_snippets.workbook_data).
 *
 * Historically writers disagreed on `appId`:
 *   - seed-runner → ''
 *   - workbook-upload → tenant slug (e.g. "redrubybali")
 *   - suite deployments → NEXT_PUBLIC_APP_ID or "{slug}_{appId}"
 *
 * Sheet-data routes used to query only getCurrentAppId() (usually ''), so a
 * workbook uploaded via Config > Source on a tenant deploy returned 404 even
 * though AI Content Generation found it via the fallback chain below.
 *
 * Keep this list in sync with resolveWorkbook() in api/admin/ai-content.
 *
 * Also: process-local parsed WorkBook cache (Fluid Compute reuses instances).
 * Callers must not permanently mutate a cached workbook — use
 * withWorksheetOverlay() before applying custom-column overlays.
 */

import { createHash } from 'node:crypto';
import { read, type WorkBook, type WorkSheet } from 'xlsx';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';

export const WORKBOOK_DATA_KEY = 'workbook_data';
/** JSON metadata for the last successfully cached workbook upload (filename, size, …). */
export const WORKBOOK_META_KEY = 'workbook_meta';

export type WorkbookCacheClient = {
  knowledgeSnippet: {
    findUnique: (args: {
      where: { key_appId: { key: string; appId: string } };
    }) => Promise<{ content: string; appId: string } | null>;
  };
};

export type CachedWorkbook = {
  /** Base64 workbook bytes */
  content: string;
  /** The appId key the row was actually stored under — use this for writes. */
  appId: string;
};

export type CachedWorkbookFileMeta = {
  fileName: string;
  sizeBytes: number;
};

export type WorkbookCacheMeta = {
  files: CachedWorkbookFileMeta[];
  uploadedAt: string;
};

/** Build meta JSON for the knowledge_snippets.workbook_meta row. */
export function buildWorkbookCacheMeta(
  files: Array<{ fileName: string; sizeBytes: number }>,
  uploadedAt: Date = new Date(),
): WorkbookCacheMeta {
  return {
    files: files.map((f) => ({
      fileName: f.fileName || 'workbook.xlsx',
      sizeBytes: Math.max(0, f.sizeBytes),
    })),
    uploadedAt: uploadedAt.toISOString(),
  };
}

export function parseWorkbookCacheMeta(raw: string | null | undefined): WorkbookCacheMeta | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    const filesRaw = obj.files;
    if (!Array.isArray(filesRaw) || filesRaw.length === 0) return null;
    const files: CachedWorkbookFileMeta[] = [];
    for (const entry of filesRaw) {
      if (!entry || typeof entry !== 'object') continue;
      const e = entry as Record<string, unknown>;
      const fileName = typeof e.fileName === 'string' ? e.fileName : null;
      const sizeBytes = typeof e.sizeBytes === 'number' ? e.sizeBytes : Number(e.sizeBytes);
      if (!fileName || !Number.isFinite(sizeBytes)) continue;
      files.push({ fileName, sizeBytes });
    }
    if (files.length === 0) return null;
    const uploadedAt =
      typeof obj.uploadedAt === 'string' && obj.uploadedAt
        ? obj.uploadedAt
        : new Date().toISOString();
    return { files, uploadedAt };
  } catch {
    return null;
  }
}

/** Approximate decoded byte length from a base64 payload. */
export function base64DecodedByteLength(base64: string): number {
  const len = base64.length;
  if (len === 0) return 0;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((len * 3) / 4) - padding);
}

/** TTL for in-memory parsed workbooks (Fluid Compute instance reuse). */
const PARSED_TTL_MS = 5 * 60 * 1000;
const PARSED_MAX_ENTRIES = 8;

type ParsedWorkbookEntry = {
  wb: WorkBook;
  appId: string;
  contentHash: string;
  cellFormula: boolean;
  expiresAt: number;
};

const parsedWorkbookCache = new Map<string, ParsedWorkbookEntry>();

/**
 * Candidate appId keys, most-specific first.
 * Mirrors ai-content's resolveWorkbook DB fallback order.
 */
export function workbookCacheAppIdCandidates(): string[] {
  const tenantSlug = getTenantConfig().slug;
  const appId = getCurrentAppId();
  const combined = tenantSlug && appId ? `${tenantSlug}_${appId}` : null;

  const candidates: string[] = [];
  if (combined) candidates.push(combined);
  if (tenantSlug && tenantSlug !== 'tokenizmyapp') candidates.push(tenantSlug);
  if (appId) candidates.push(appId);
  candidates.push('');
  if (tenantSlug === 'tokenizmyapp') candidates.push('tokenizmyapp');

  return [...new Set(candidates)];
}

/**
 * Find the cached workbook_data snippet, trying historical appId keys.
 * Returns null when nothing is cached for any candidate.
 */
export async function findCachedWorkbook(
  prisma: WorkbookCacheClient,
  key: string = WORKBOOK_DATA_KEY,
): Promise<CachedWorkbook | null> {
  for (const appId of workbookCacheAppIdCandidates()) {
    const row = await prisma.knowledgeSnippet.findUnique({
      where: { key_appId: { key, appId } },
    });
    if (row?.content) {
      return { content: row.content, appId: row.appId };
    }
  }
  return null;
}

/**
 * Resolve display metadata for the last cached workbook.
 * Falls back to a generic filename when `workbook_meta` was never written
 * (uploads before this feature).
 */
export async function findCachedWorkbookInfo(
  prisma: WorkbookCacheClient,
): Promise<{
  appId: string;
  sizeBytes: number;
  meta: WorkbookCacheMeta;
} | null> {
  const cached = await findCachedWorkbook(prisma);
  if (!cached) return null;

  const metaRow = await prisma.knowledgeSnippet.findUnique({
    where: { key_appId: { key: WORKBOOK_META_KEY, appId: cached.appId } },
  });
  const parsed = parseWorkbookCacheMeta(metaRow?.content);
  const sizeBytes = base64DecodedByteLength(cached.content);

  if (parsed) {
    return { appId: cached.appId, sizeBytes, meta: parsed };
  }

  return {
    appId: cached.appId,
    sizeBytes,
    meta: buildWorkbookCacheMeta([
      { fileName: 'workbook.xlsx', sizeBytes },
    ]),
  };
}

/**
 * Canonical appId for NEW writes (upload / seed). Prefer suite app id when
 * set; otherwise empty string for single-app tenants — not the tenant slug.
 */
export function canonicalWorkbookAppId(): string {
  return getCurrentAppId();
}

/** Cheap content fingerprint for cache keys (length + head/tail sample). */
export function workbookContentHash(contentBase64: string): string {
  const len = contentBase64.length;
  const head = contentBase64.slice(0, 2048);
  const tail = len > 2048 ? contentBase64.slice(-2048) : '';
  return createHash('sha256').update(`${len}\0${head}\0${tail}`).digest('hex');
}

function parsedCacheKey(appId: string, contentHash: string, cellFormula: boolean): string {
  return `${appId}:${contentHash}:${cellFormula ? 'f1' : 'f0'}`;
}

function pruneParsedWorkbookCache(now: number): void {
  for (const [key, entry] of parsedWorkbookCache) {
    if (entry.expiresAt <= now) parsedWorkbookCache.delete(key);
  }
  while (parsedWorkbookCache.size > PARSED_MAX_ENTRIES) {
    const oldest = parsedWorkbookCache.keys().next().value;
    if (oldest === undefined) break;
    parsedWorkbookCache.delete(oldest);
  }
}

/**
 * Decode + SheetJS-parse the cached workbook, reusing an in-process parse when
 * the content hash matches (Fluid Compute warm instances).
 *
 * Do not permanently mutate the returned workbook — use withWorksheetOverlay.
 */
export function getParsedWorkbook(
  contentBase64: string,
  opts: { cellFormula: boolean; appId: string },
): WorkBook {
  const now = Date.now();
  const contentHash = workbookContentHash(contentBase64);
  const key = parsedCacheKey(opts.appId, contentHash, opts.cellFormula);
  const hit = parsedWorkbookCache.get(key);
  if (hit && hit.expiresAt > now) {
    hit.expiresAt = now + PARSED_TTL_MS;
    return hit.wb;
  }

  const buf = Buffer.from(contentBase64, 'base64');
  const wb = read(buf, { type: 'buffer', cellFormula: opts.cellFormula });
  parsedWorkbookCache.set(key, {
    wb,
    appId: opts.appId,
    contentHash,
    cellFormula: opts.cellFormula,
    expiresAt: now + PARSED_TTL_MS,
  });
  pruneParsedWorkbookCache(now);
  return wb;
}

/** Drop parsed entries after workbook_data is rewritten (cell update / upload). */
export function invalidateParsedWorkbookCache(appId?: string): void {
  if (appId === undefined) {
    parsedWorkbookCache.clear();
    return;
  }
  for (const [key, entry] of parsedWorkbookCache) {
    if (entry.appId === appId || key.startsWith(`${appId}:`)) {
      parsedWorkbookCache.delete(key);
    }
  }
}

/**
 * Shallow-clone a worksheet onto the workbook for the duration of `fn`, then
 * restore the original sheet so the process-local parse cache stays clean.
 */
export function withWorksheetOverlay<T>(
  wb: WorkBook,
  sheetName: string,
  fn: (ws: WorkSheet) => T,
): T {
  const original = wb.Sheets[sheetName];
  if (!original) {
    throw new Error(`Worksheet "${sheetName}" not found`);
  }
  const clone: WorkSheet = { ...original };
  wb.Sheets[sheetName] = clone;
  try {
    return fn(clone);
  } finally {
    wb.Sheets[sheetName] = original;
  }
}
