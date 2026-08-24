/**
 * CMS AI placeholders — doc_markdown sections marked `aiRegenerate` in config.
 *
 * On each Generate Content run:
 *   1. Read the section's current markdown from CMS (inline config or snippet source)
 *   2. Ask the AI to produce fresh copy in the same Markdown structure
 *   3. Write the result back to page_sections.config (same path as the CMS API)
 */

import type { ExcelData } from '@/domain/excel/excel-extractor';
import { buildDataSummary } from '@/domain/ai-content/prompt-builder';
import type { ActiveAiConfig } from '@/lib/ai-providers';
import type { DbClient } from '@/lib/db';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import { meterAiUsage } from '@/domain/billing/credit-service';
import { isBypassedAdminSlug } from '@/domain/ai-content/ensure-template-pages';

export interface CmsAiPlaceholder {
  sectionId: string;
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  sectionTitle: string;
  sortOrder: number;
  config: Record<string, unknown>;
  currentMarkdown: string;
  aiRegenerate: boolean;
}

export interface CmsPlaceholderUpdateResult {
  sectionId: string;
  pageSlug: string;
  pageTitle: string;
  status: 'updated' | 'skipped' | 'error';
  detail?: string;
}

type SectionRow = {
  id: string;
  pageId: string;
  sortOrder: number;
  blockType: string;
  config: unknown;
  pageSlug: string;
  pageTitle: string;
  contentLocked: boolean;
};

/** Map CMS source aliases to knowledge_snippets.key */
export function sourceToSnippetKey(source: string): string {
  if (source === 'executive-summary') return 'executive_summary';
  return source.replace(/-/g, '_');
}

function parseConfig(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}

async function listDocMarkdownSections(db: DbClient): Promise<SectionRow[]> {
  const appId = getCurrentAppId();
  try {
    const pages = await db.appPage.findMany({
      where: appId ? { OR: [{ appId }, { appId: null }, { appId: '' }] } : undefined,
      select: {
        id: true,
        slug: true,
        title: true,
        contentLocked: true,
        sections: {
          where: { blockType: 'doc_markdown' },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, sortOrder: true, blockType: true, config: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const rows: SectionRow[] = [];
    for (const page of pages) {
      if (isBypassedAdminSlug(page.slug)) continue;
      for (const section of page.sections) {
        rows.push({
          id: section.id,
          pageId: page.id,
          sortOrder: section.sortOrder,
          blockType: section.blockType,
          config: section.config,
          pageSlug: page.slug,
          pageTitle: page.title,
          contentLocked: page.contentLocked ?? false,
        });
      }
    }
    return rows;
  } catch {
    // Raw SQL fallback (tenant DB without ZenStack models)
    const rows = (await (db as unknown as { $queryRawUnsafe: (...args: unknown[]) => Promise<unknown> }).$queryRawUnsafe(
      `SELECT ps.id, ps.page_id AS "pageId", ps.sort_order AS "sortOrder",
              ps.block_type AS "blockType", ps.config,
              ap.slug AS "pageSlug", ap.title AS "pageTitle",
              COALESCE(ap.content_locked, false) AS "contentLocked"
       FROM page_sections ps
       JOIN app_pages ap ON ap.id = ps.page_id
       WHERE ps.block_type = 'doc_markdown'
       ORDER BY ap.sort_order ASC, ps.sort_order ASC`,
    )) as SectionRow[];
    return rows ?? [];
  }
}

/** Resolve effective markdown for a doc_markdown section config. */
export async function resolveSectionMarkdown(
  db: DbClient,
  config: Record<string, unknown>,
): Promise<string> {
  const parsed = parseBlockConfig('doc_markdown', config);
  if (parsed.markdown && parsed.markdown.trim().length > 0) {
    return parsed.markdown;
  }
  const source = parsed.source?.trim();
  if (!source) return '';

  const snippetKey = sourceToSnippetKey(source);
  const appId = getCurrentAppId();
  try {
    const snippet = await db.knowledgeSnippet.findUnique({
      where: { key_appId: { key: snippetKey, appId } },
    });
    if (snippet?.content) return snippet.content;
  } catch {
    // fall through
  }

  if (snippetKey === 'executive_summary') {
    try {
      const snippet = await db.knowledgeSnippet.findUnique({
        where: { key_appId: { key: 'executive_summary', appId: '' } },
      });
      if (snippet?.content) return snippet.content;
    } catch {
      // ignore
    }
  }

  return '';
}

/** Load doc_markdown sections; include all on first run when `onlyMarked` is false. */
export async function listCmsAiPlaceholders(
  db: DbClient,
  opts?: { onlyMarked?: boolean },
): Promise<CmsAiPlaceholder[]> {
  const onlyMarked = opts?.onlyMarked ?? true;
  const rows = await listDocMarkdownSections(db);
  const placeholders: CmsAiPlaceholder[] = [];

  for (const row of rows) {
    const config = parseConfig(row.config);
    const parsed = parseBlockConfig('doc_markdown', config);
    const aiRegenerate = parsed.aiRegenerate === true;
    if (onlyMarked && !aiRegenerate) continue;

    const currentMarkdown = await resolveSectionMarkdown(db, config);
    placeholders.push({
      sectionId: row.id,
      pageId: row.pageId,
      pageSlug: row.pageSlug,
      pageTitle: row.pageTitle,
      sectionTitle: parsed.title ?? row.pageTitle,
      sortOrder: row.sortOrder,
      config,
      currentMarkdown,
      aiRegenerate,
    });
  }

  return placeholders;
}

/** Format CMS placeholders for inclusion in the main generation prompt. */
export function buildCmsPlaceholdersContext(placeholders: CmsAiPlaceholder[]): string {
  if (placeholders.length === 0) return '';

  const lines = [
    '## CMS page placeholders (preserve structure on regeneration)',
    '',
    'These doc_markdown sections are authored in the page CMS. When regenerating,',
    'keep the same heading hierarchy, table layout, and tone unless the data requires change.',
    '',
  ];

  for (const p of placeholders) {
    lines.push(`### Page: ${p.pageTitle} (\`/${p.pageSlug}\`) — section "${p.sectionTitle}"`);
    if (p.currentMarkdown.trim()) {
      const body =
        p.currentMarkdown.length > 3_000
          ? `${p.currentMarkdown.slice(0, 3_000)}\n…(truncated)`
          : p.currentMarkdown;
      lines.push(body);
    } else {
      lines.push('_(no markdown yet — generate appropriate content for this page)_');
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function saveSectionMarkdown(
  db: DbClient,
  placeholder: CmsAiPlaceholder,
  markdown: string,
  markAiRegenerate: boolean,
): Promise<void> {
  const nextConfig = {
    ...placeholder.config,
    markdown,
    ...(markAiRegenerate ? { aiRegenerate: true } : {}),
  };
  const validated = parseBlockConfig('doc_markdown', nextConfig) as Record<string, unknown>;

  try {
    await (db as unknown as { $executeRawUnsafe: (...args: unknown[]) => Promise<unknown> }).$executeRawUnsafe(
      `UPDATE page_sections SET config = CAST($1 AS jsonb) WHERE id = $2 AND page_id = $3`,
      JSON.stringify(validated),
      placeholder.sectionId,
      placeholder.pageId,
    );
    await (db as unknown as { $executeRawUnsafe: (...args: unknown[]) => Promise<unknown> }).$executeRawUnsafe(
      `UPDATE app_pages SET content_locked = true WHERE id = $1`,
      placeholder.pageId,
    );
  } catch {
    // Prisma model path
    await db.pageSection.update({
      where: { id: placeholder.sectionId },
      data: { config: validated },
    });
    await db.appPage.update({
      where: { id: placeholder.pageId },
      data: { contentLocked: true },
    });
  }
}

async function callAiForSectionMarkdown(
  placeholder: CmsAiPlaceholder,
  excelData: ExcelData,
  additionalContext: string | undefined,
  ai: ActiveAiConfig,
  tenantSlug: string,
): Promise<string> {
  const dataSummary = buildDataSummary(excelData);
  const structureHint = placeholder.currentMarkdown.trim()
    ? `CURRENT MARKDOWN (preserve structure, headings, tables, and tone — update figures and narrative with fresh data):\n\n${placeholder.currentMarkdown}`
    : `No existing markdown. Write appropriate content for the "${placeholder.sectionTitle}" section on the "${placeholder.pageTitle}" page.`;

  const userPrompt = [
    `Regenerate the Markdown for a CMS page section.`,
    ``,
    `Page: ${placeholder.pageTitle} (/${placeholder.pageSlug})`,
    `Section title: ${placeholder.sectionTitle}`,
    ``,
    structureHint,
    ``,
    `## Workbook data summary`,
    dataSummary,
    additionalContext ? `\n## Additional context\n${additionalContext}` : '',
    ``,
    `Return ONLY a JSON object with a single key "markdown" containing the full Markdown string.`,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch(ai.provider.chatCompletionsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ai.apiKey}`,
    },
    body: JSON.stringify({
      model: ai.model,
      messages: [
        {
          role: 'system',
          content:
            'You are a precise business writer. Return only valid JSON with key "markdown". Use proper Markdown tables and headers.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`${ai.provider.label} API error (${response.status}): ${errBody}`);
  }

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content ?? '';

  {
    const usage = result.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
    try {
      await meterAiUsage({
        tenantSlug,
        model: ai.model,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        keySource: ai.keySource,
        refType: 'content_generation',
        refId: `cms_placeholder:${placeholder.pageSlug}`,
      });
    } catch {
      // non-blocking
    }
  }

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(reply) as Record<string, string>;
  } catch {
    const jsonMatch = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!jsonMatch) throw new Error('AI response was not valid JSON');
    parsed = JSON.parse(jsonMatch[1]!) as Record<string, string>;
  }

  return parsed.markdown ?? '';
}

export interface ApplyCmsPlaceholdersOpts {
  ai: ActiveAiConfig;
  tenantSlug: string;
  excelData: ExcelData;
  additionalContext?: string;
  executiveSummary?: string;
  /** When true, also process unmarked doc_markdown sections (first generation). */
  includeUnmarked?: boolean;
  onProgress?: (message: string, detail?: unknown) => void;
}

/**
 * Refresh CMS doc_markdown placeholders and seed summary/home inline copy.
 * Writes directly to page_sections (same data the CMS API persists).
 */
export async function applyCmsPlaceholderUpdates(
  db: DbClient,
  opts: ApplyCmsPlaceholdersOpts,
): Promise<CmsPlaceholderUpdateResult[]> {
  const results: CmsPlaceholderUpdateResult[] = [];
  const placeholders = await listCmsAiPlaceholders(db, {
    onlyMarked: !opts.includeUnmarked,
  });

  // Also pick up unmarked summary/home doc_markdown on every run when we have exec summary
  const allSections = await listDocMarkdownSections(db);
  const bySectionId = new Map(placeholders.map((p) => [p.sectionId, p]));

  for (const row of allSections) {
    if (bySectionId.has(row.id)) continue;
    const config = parseConfig(row.config);
    const parsed = parseBlockConfig('doc_markdown', config);
    const shouldBootstrap =
      opts.includeUnmarked ||
      (row.pageSlug === 'summary' && Boolean(opts.executiveSummary)) ||
      (row.pageSlug === 'home' && parsed.source === 'executive-summary' && Boolean(opts.executiveSummary));

    if (!shouldBootstrap) continue;

    const currentMarkdown = await resolveSectionMarkdown(db, config);
    bySectionId.set(row.id, {
      sectionId: row.id,
      pageId: row.pageId,
      pageSlug: row.pageSlug,
      pageTitle: row.pageTitle,
      sectionTitle: parsed.title ?? row.pageTitle,
      sortOrder: row.sortOrder,
      config,
      currentMarkdown,
      aiRegenerate: parsed.aiRegenerate === true,
    });
  }

  const workList = [...bySectionId.values()];
  if (workList.length === 0) return results;

  opts.onProgress?.(`Updating ${workList.length} CMS placeholder section(s)…`, {
    count: workList.length,
  });

  for (let i = 0; i < workList.length; i++) {
    const placeholder = workList[i]!;
    opts.onProgress?.(
      `CMS placeholder ${i + 1}/${workList.length}: ${placeholder.pageTitle} (${placeholder.pageSlug})…`,
      { sectionId: placeholder.sectionId },
    );

    try {
      let markdown = '';

      // Fast path: summary / exec-summary sourced sections use the generated executive summary
      if (
        opts.executiveSummary &&
        (placeholder.pageSlug === 'summary' ||
          parseBlockConfig('doc_markdown', placeholder.config).source === 'executive-summary')
      ) {
        markdown = opts.executiveSummary;
      } else if (placeholder.aiRegenerate || opts.includeUnmarked) {
        markdown = await callAiForSectionMarkdown(
          placeholder,
          opts.excelData,
          opts.additionalContext,
          opts.ai,
          opts.tenantSlug,
        );
      } else {
        results.push({
          sectionId: placeholder.sectionId,
          pageSlug: placeholder.pageSlug,
          pageTitle: placeholder.pageTitle,
          status: 'skipped',
          detail: 'Not marked aiRegenerate',
        });
        continue;
      }

      if (!markdown.trim()) {
        results.push({
          sectionId: placeholder.sectionId,
          pageSlug: placeholder.pageSlug,
          pageTitle: placeholder.pageTitle,
          status: 'skipped',
          detail: 'Empty markdown from AI',
        });
        continue;
      }

      await saveSectionMarkdown(db, placeholder, markdown, true);
      results.push({
        sectionId: placeholder.sectionId,
        pageSlug: placeholder.pageSlug,
        pageTitle: placeholder.pageTitle,
        status: 'updated',
        detail: `${markdown.length} chars saved to CMS`,
      });
    } catch (err) {
      results.push({
        sectionId: placeholder.sectionId,
        pageSlug: placeholder.pageSlug,
        pageTitle: placeholder.pageTitle,
        status: 'error',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
