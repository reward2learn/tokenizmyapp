/**
 * Regenerate Terms of Service + Privacy Policy knowledge snippets for a
 * tenant (and each suite app) from the factory admin console.
 *
 * Writes into each app's dedicated DB when configured; otherwise the tenant
 * or platform DB. Uses stored workbook_data when present so generated docs
 * stay workbook-aware.
 */
import { PrismaClient } from '@/generated/prisma';
import { analyzeWorkbook } from '@/domain/excel/workbook-analyzer';
import { generateLegalDocuments } from '@/domain/legal/legal-doc-generator';
import { resolveTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';
import { createRawClient } from '@/lib/db';

export interface LegalDocsAppResult {
  appId: string;
  ok: boolean;
  businessName?: string;
  error?: string;
}

function clientForUrl(url: string): PrismaClient {
  return new PrismaClient({ datasources: { db: { url } } });
}

async function ensureKnowledgeTable(db: PrismaClient): Promise<void> {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS knowledge_snippets (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'document',
      content TEXT NOT NULL DEFAULT '',
      app_id TEXT NOT NULL DEFAULT ''
    )
  `);
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE knowledge_snippets ADD COLUMN IF NOT EXISTS app_id TEXT NOT NULL DEFAULT ''`,
    );
  } catch {
    /* column exists */
  }
  try {
    await db.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS knowledge_snippets_key_app_id_key ON knowledge_snippets (key, app_id)`,
    );
  } catch {
    /* index exists or duplicates */
  }
}

async function loadWorkbookAnalysis(db: PrismaClient, appId: string) {
  const rows = (await db.$queryRawUnsafe(
    `SELECT content FROM knowledge_snippets
     WHERE key = 'workbook_data' AND COALESCE(app_id, '') = COALESCE($1, '')
     LIMIT 1`,
    appId,
  )) as { content: string }[];
  const b64 = rows[0]?.content?.trim();
  if (!b64) return null;
  try {
    const buf = Buffer.from(b64, 'base64');
    return analyzeWorkbook(buf);
  } catch {
    return null;
  }
}

async function upsertLegalSnippet(
  db: PrismaClient,
  key: 'terms_of_service' | 'privacy_policy',
  content: string,
  appId: string,
): Promise<void> {
  await db.$executeRawUnsafe(
    `INSERT INTO knowledge_snippets (id, key, category, content, app_id)
     VALUES (gen_random_uuid()::text, $1, 'document', $2, $3)
     ON CONFLICT (key, app_id) DO UPDATE SET content = EXCLUDED.content, category = 'document'`,
    key,
    content,
    appId,
  );
}

async function regenerateForAppDb(opts: {
  dbUrl: string;
  appId: string;
  businessName: string;
  tenantSlug: string;
  description: string;
  appUrl: string;
  templateId: string;
}): Promise<LegalDocsAppResult> {
  const db = clientForUrl(opts.dbUrl);
  try {
    await ensureKnowledgeTable(db);
    const analysis = await loadWorkbookAnalysis(db, opts.appId);
    const legal = generateLegalDocuments(analysis, undefined, {
      businessName: opts.businessName,
      tenantSlug: opts.tenantSlug,
      description: opts.description,
      appUrl: opts.appUrl,
      templateId: opts.templateId,
    });
    await upsertLegalSnippet(db, 'terms_of_service', legal.termsMarkdown, opts.appId);
    await upsertLegalSnippet(db, 'privacy_policy', legal.privacyMarkdown, opts.appId);
    return { appId: opts.appId || '(tenant)', ok: true, businessName: legal.context.businessName };
  } catch (err) {
    return {
      appId: opts.appId || '(tenant)',
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}

export async function regenerateTenantLegalDocs(tenantSlug: string): Promise<{
  results: LegalDocsAppResult[];
  updated: number;
  failed: number;
}> {
  const root = createRawClient();
  const rows = (await root.$queryRawUnsafe(
    `SELECT slug, display_name, template, vercel_url, metadata, db_url
     FROM tenants WHERE slug = $1 LIMIT 1`,
    tenantSlug,
  )) as Record<string, unknown>[];
  if (!rows[0]) throw new Error('Tenant not found');

  const tenant = rows[0];
  const metadata = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (metadata.config ?? {}) as Record<string, unknown>;
  const appPack = cfg.appPack as { apps?: Array<{ appId: string; vercelUrl?: string; templateId?: string }> } | undefined;
  const displayName = String(tenant.display_name ?? tenantSlug);
  const description =
    (typeof cfg.description === 'string' && cfg.description) ||
    `${displayName} business operations application`;
  const vercelUrl = typeof tenant.vercel_url === 'string' ? tenant.vercel_url : '';
  const templateId = String(tenant.template ?? 'default');

  const targets: Array<{ appId: string; appUrl: string; templateId: string }> = [];
  if (appPack?.apps?.length) {
    for (const app of appPack.apps) {
      targets.push({
        appId: app.appId,
        appUrl: app.vercelUrl || vercelUrl || `https://${tenantSlug}-${app.appId}.vercel.app`,
        templateId: app.templateId || templateId,
      });
    }
  } else {
    targets.push({
      appId: '',
      appUrl: vercelUrl || `https://${tenantSlug}.vercel.app`,
      templateId,
    });
  }

  const results: LegalDocsAppResult[] = [];
  for (const target of targets) {
    const dbUrl = await resolveTenantDbUrl(tenantSlug, target.appId || null);
    const result = await regenerateForAppDb({
      dbUrl,
      appId: target.appId,
      businessName: displayName,
      tenantSlug,
      description,
      appUrl: target.appUrl.startsWith('http') ? target.appUrl : `https://${target.appUrl}`,
      templateId: target.templateId,
    });
    results.push(result);
  }

  return {
    results,
    updated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  };
}
