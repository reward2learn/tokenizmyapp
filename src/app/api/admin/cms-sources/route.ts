/**
 * CMS source options for block config pickers (doc_markdown, sheet_viewer, pack_table).
 *
 * GET /api/admin/cms-sources — requires pages:read
 */

import { read } from 'xlsx';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import { requireRead, requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { PrismaClient } from '@/generated/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getClient() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return new PrismaClient({ datasources: { db: { url } } });
}

const INTERNAL_SNIPPET_PREFIXES = ['workbook_'] as const;

function snippetKeyToSource(key: string): string {
  if (key === 'executive_summary') return 'executive-summary';
  return key.replace(/_/g, '-');
}

export async function GET(request: Request) {
  const auth = await requireWriteAuth(request);
  if (!auth.ok) return auth.response;
  const guard = await requireRead('pages', request);
  if (!guard.ok) return guard.response;

  const appId = getCurrentAppId();
  const prisma = getClient();
  try {
    const snippetRows = await prisma.$queryRawUnsafe<{ key: string }[]>(
      `SELECT key FROM knowledge_snippets
       WHERE COALESCE(app_id, '') = $1
       ORDER BY key ASC`,
      appId,
    );
    const docSources = snippetRows
      .map((r) => r.key)
      .filter((key) => !INTERNAL_SNIPPET_PREFIXES.some((p) => key.startsWith(p)))
      .map(snippetKeyToSource);

    const staticSources = ['executive-summary', 'terms-of-service.html', 'privacy-policy.html'];
    const docSourceSet = new Set([...staticSources, ...docSources]);

    let workbookSheets: string[] = [];
    try {
      const cached = await prisma.knowledgeSnippet.findUnique({
        where: { key_appId: { key: 'workbook_data', appId } },
      });
      if (cached?.content) {
        const wb = read(Buffer.from(cached.content, 'base64'), { type: 'buffer' });
        workbookSheets = (wb.SheetNames ?? []).filter((n): n is string => typeof n === 'string');
      }
    } catch {
      workbookSheets = [];
    }

    const packTableRows = await prisma.$queryRawUnsafe<{ tableName: string | null }[]>(
      appId
        ? `SELECT DISTINCT config->>'table' AS "tableName"
           FROM page_sections ps
           JOIN app_pages p ON p.id = ps.page_id
           WHERE ps.block_type = 'pack_table'
             AND COALESCE(p.app_id, '') = $1
             AND config->>'table' IS NOT NULL
             AND config->>'table' <> ''`
        : `SELECT DISTINCT config->>'table' AS "tableName"
           FROM page_sections
           WHERE block_type = 'pack_table'
             AND config->>'table' IS NOT NULL
             AND config->>'table' <> ''`,
      ...(appId ? [appId] : []),
    );
    const packTables = packTableRows
      .map((r) => r.tableName)
      .filter((t): t is string => typeof t === 'string' && t.length > 0);

    return jsonOk({
      docSources: [...docSourceSet].sort(),
      workbookSheets,
      packTables: [...new Set(packTables)].sort(),
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  } finally {
    await prisma.$disconnect();
  }
}
