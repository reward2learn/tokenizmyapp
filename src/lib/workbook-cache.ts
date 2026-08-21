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
 */

import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';

export const WORKBOOK_DATA_KEY = 'workbook_data';

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

  // Deduplicate while preserving order
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
 * Canonical appId for NEW writes (upload / seed). Prefer suite app id when
 * set; otherwise empty string for single-app tenants — not the tenant slug.
 */
export function canonicalWorkbookAppId(): string {
  return getCurrentAppId();
}
