/**
 * AI Workbook Pipeline — AI-first workbook ingestion.
 *
 *  1. EXTRACT   — every sheet serialized to text (no deterministic parsing)
 *  2. COMPREHEND — OpenAI analyzes all sheets → structured JSON (Zod-validated)
 *  3. POPULATE  — comprehension drives the database:
 *                   • financial_projections (upsert by period/data_type/scenario)
 *                   • one dynamic AppPage per comprehended sheet (block type by
 *                     category, same `sheet-<slug>` convention as the analyzer)
 *                   • knowledge_snippets (per-sheet comprehension + raw JSON)
 *  4. GENERATE  — triggers the existing AI Content generation pipeline
 *                 (Business Review → Executive Summary → Dashboard Data) with
 *                 the comprehension injected as context.
 *
 * The deterministic parsers (financial-excel, workbook-analyzer) remain as a
 * fallback when the AI step fails or the mode is explicitly 'deterministic'.
 */
import type { DbClient } from '@/lib/db';
import type { PrismaClient } from '@/generated/prisma';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import type { PageDefinition, PageSectionDefinition } from '@/lib/page-catalog';
import { setDynamicPages } from '@/lib/page-catalog';
import {
  comprehendWorkbook,
  renderAllSheetsForAi,
  type WorkbookComprehension,
  type AiSheetCategory,
} from '@/domain/ai-workbook/workbook-comprehension';
import { generateAndSave } from '@/domain/ai-content/content-generator';
import type { ProgressCallback } from '@/domain/ai-content/content-generator';

// ── Block type mapping per comprehended sheet category ─────────────

const CATEGORY_BLOCKS: Record<AiSheetCategory, { blockType: string; title: string }[]> = {
  daily_sales: [
    { blockType: 'sheet_viewer', title: 'Daily Sales — Data' },
    { blockType: 'chart_financial', title: 'Daily Sales — Trends' },
  ],
  profit_loss: [
    { blockType: 'pnl_table', title: 'Profit & Loss — Statement' },
    { blockType: 'chart_financial', title: 'Profit & Loss — Trends' },
  ],
  balance_sheet: [{ blockType: 'sheet_viewer', title: 'Balance Sheet — Data' }],
  trial_balance: [{ blockType: 'sheet_viewer', title: 'Trial Balance — Data' }],
  general_ledger: [{ blockType: 'sheet_viewer', title: 'General Ledger — Data' }],
  cost_of_sales: [{ blockType: 'sheet_viewer', title: 'Cost of Sales — Data' }],
  month_on_month: [{ blockType: 'chart_financial', title: 'Month on Month — Comparison' }],
  break_even: [
    { blockType: 'kpi_cards', title: 'Break-Even — KPIs' },
    { blockType: 'chart_financial', title: 'Break-Even — Trend' },
  ],
  variance: [{ blockType: 'chart_financial', title: 'Monthly Variance — Analysis' }],
  summary_pl: [
    { blockType: 'chart_financial', title: 'Multi-Year P&L — Trend' },
    { blockType: 'pnl_table', title: 'Multi-Year P&L — Statement' },
  ],
  summary_bs: [{ blockType: 'sheet_viewer', title: 'Multi-Year Balance Sheet — Data' }],
  other: [{ blockType: 'sheet_viewer', title: 'Sheet Data' }],
};

function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── DB population ──────────────────────────────────────────────────

async function upsertProjectionRaw(
  db: PrismaClient,
  metric: {
    period: string;
    dataType: 'actual' | 'forecast';
    scenario: 'actual' | 'conservative' | 'realistic' | 'aspirational';
    revenue?: number | null;
    ebitda?: number | null;
    netIncome?: number | null;
    guests?: number | null;
    staffCost?: number | null;
  },
): Promise<void> {
  const year = Number(metric.period.slice(0, 4));
  const month = Number(metric.period.slice(5, 7));
  const revenue = Math.round(metric.revenue ?? 0);
  const ebitda = Math.round(metric.ebitda ?? 0);
  const netIncome = Math.round(metric.netIncome ?? 0);
  const guests = Math.round(metric.guests ?? 0);
  const staffCost = Math.round(metric.staffCost ?? 0);
  const pnlLines = JSON.stringify([
    { key: 'revenue', label: 'Revenue', value: revenue },
    { key: 'ebitda', label: 'EBITDA', value: ebitda },
    { key: 'net_income', label: 'Net Income', value: netIncome },
    { key: 'staff_cost', label: 'Staff Cost', value: staffCost },
    { key: 'guests', label: 'Guests', value: guests },
  ]);

  await db.$executeRaw`
    INSERT INTO financial_projections (period, year, month, data_type, scenario, revenue, ebitda, net_income, guests, staff_cost, pnl_lines, app_id)
    VALUES (${metric.period}, ${year}, ${month}, ${metric.dataType}, ${metric.scenario}, ${revenue}, ${ebitda}, ${netIncome}, ${guests}, ${staffCost}, ${pnlLines}::jsonb, ${getCurrentAppId()})
    ON CONFLICT (period, data_type, scenario, app_id)
    DO UPDATE SET
      revenue = EXCLUDED.revenue,
      ebitda = EXCLUDED.ebitda,
      net_income = EXCLUDED.net_income,
      guests = EXCLUDED.guests,
      staff_cost = EXCLUDED.staff_cost,
      pnl_lines = EXCLUDED.pnl_lines;
  `;
}

async function upsertSheetPages(
  db: PrismaClient,
  comprehension: WorkbookComprehension,
): Promise<{ slug: string; title: string }[]> {
  const created: { slug: string; title: string }[] = [];
  let sortOrder = 100;

  for (const sheet of comprehension.sheets) {
    const slug = `sheet-${normalizeSlug(sheet.tabName)}`;
    const blocks = CATEGORY_BLOCKS[sheet.category] ?? CATEGORY_BLOCKS.other;
    const summaryMarkdown = [
      `# ${sheet.title}`,
      '',
      sheet.summary,
      sheet.periodHint ? `\n**Period**: ${sheet.periodHint}` : '',
      `**Rows**: ${sheet.rowCount ?? '—'}  |  **Columns**: ${(sheet.columns ?? []).length || '—'}`,
      '',
    ]
      .filter((l) => l !== '')
      .join('\n');

    // §7.1 FIX: use RETURNING id so we always have the real page ID
    // (new OR existing — handles slug collision without orphan FK references).
    const pageRows = await db.$queryRaw<{ id: string }[]>`
      INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav, tenant_slug)
      VALUES (${crypto.randomUUID()}, ${slug}, ${sheet.title}, 'google', ${sortOrder++}, ${sheet.title}, true, ${process.env.NEXT_PUBLIC_TENANT_SLUG || null})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        auth_tier = EXCLUDED.auth_tier,
        sort_order = EXCLUDED.sort_order,
        nav_label = EXCLUDED.nav_label,
        show_in_nav = EXCLUDED.show_in_nav,
        tenant_slug = COALESCE(EXCLUDED.tenant_slug, app_pages.tenant_slug)
      RETURNING id;
    `;
    const pageId = pageRows[0]?.id;
    if (!pageId) continue;

    // Replace the page's sections with the comprehension-driven block set.
    await db.$executeRaw`DELETE FROM page_sections WHERE page_id = ${pageId};`;
    await db.$executeRaw`
      INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
      VALUES (${crypto.randomUUID()}, ${pageId}, 0, 'doc_markdown', ${JSON.stringify({
        title: 'About this sheet',
        markdown: summaryMarkdown,
      })}::jsonb);
    `;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]!;
      await db.$executeRaw`
        INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
        VALUES (${crypto.randomUUID()}, ${pageId}, ${i + 1}, ${block.blockType}, ${JSON.stringify({
        sheet: sheet.tabName,
        title: block.title,
      })}::jsonb);
      `;
    }

    created.push({ slug, title: sheet.title });
  }
  return created;
}

async function saveComprehensionSnippets(
  db: PrismaClient,
  comprehension: WorkbookComprehension,
  model: string,
): Promise<void> {
  // Raw comprehension JSON (used by AI chat / reprocess).
  await db.knowledgeSnippet.upsert({
    where: { key_appId: { key: 'workbook_comprehension', appId: getCurrentAppId() } },
    create: {
      key: 'workbook_comprehension',
      category: 'document',
      content: JSON.stringify({ model, comprehendedAt: new Date().toISOString(), comprehension }),
      appId: getCurrentAppId(),
    },
    update: {
      content: JSON.stringify({ model, comprehendedAt: new Date().toISOString(), comprehension }),
    },
  });

  // One human-readable snippet per sheet.
  for (const sheet of comprehension.sheets) {
    const key = `sheet_${normalizeSlug(sheet.tabName)}`;
    const markdown = [
      `# ${sheet.title}`,
      '',
      sheet.summary,
      '',
      `**Category**: ${sheet.category}`,
      sheet.periodHint ? `**Period**: ${sheet.periodHint}` : '',
    ]
      .filter((l) => l !== '')
      .join('\n');
    await db.knowledgeSnippet.upsert({
      where: { key_appId: { key, appId: getCurrentAppId() } },
      create: { key, category: 'sheet', content: markdown, appId: getCurrentAppId() },
      update: { content: markdown },
    });
  }
}

/** Insert the comprehended sheet pages into the in-memory runtime catalog. */
function registerDynamicPages(comprehension: WorkbookComprehension): PageDefinition[] {
  const pages: PageDefinition[] = comprehension.sheets.map((sheet) => ({
    slug: `sheet-${normalizeSlug(sheet.tabName)}`,
    title: sheet.title,
    authTier: 'google',
    navLabel: sheet.title,
    showInNav: true,
    sections: [
      { blockType: 'doc_markdown', config: { source: `sheet_${normalizeSlug(sheet.tabName)}`, title: sheet.title } },
      ...CATEGORY_BLOCKS[sheet.category].map((b) => ({
        blockType: b.blockType as PageSectionDefinition['blockType'],
        config: { sheet: sheet.tabName, title: b.title },
      })),
    ],
  }));
  setDynamicPages(pages);
  return pages;
}

// ── Orchestrator ───────────────────────────────────────────────────

export interface AiPipelineResult {
  success: boolean;
  comprehension?: WorkbookComprehension;
  model: string;
  projectionsCount: number;
  pagesCreated: { slug: string; title: string }[];
  contentGenerated: boolean;
  error?: string;
}

export interface AiPipelineOptions {
  buffers: Buffer[];
  db: DbClient;
  model?: string;
  /** When true, skips the final AI content-generation stage (BR/ES/dashboard). */
  skipContentGeneration?: boolean;
  onProgress?: ProgressCallback;
}

export async function runAiWorkbookPipeline(
  options: AiPipelineOptions,
): Promise<AiPipelineResult> {
  const { buffers, db, model = 'gpt-4o', skipContentGeneration = false, onProgress } = options;

  const emit: ProgressCallback = (e) => onProgress?.(e);

  try {
    // ── 1. EXTRACT ─────────────────────────────────────────
    emit({ step: 'extracting', message: 'Extracting workbook sheets for AI comprehension...', pct: 5 });
    const blocks = buffers.flatMap((buf) => renderAllSheetsForAi(buf));
    if (blocks.length === 0) {
      return { success: false, model, projectionsCount: 0, pagesCreated: [], contentGenerated: false, error: 'Workbook contains no readable sheets' };
    }

    // ── 2. COMPREHEND ──────────────────────────────────────
    emit({ step: 'openai', message: `AI comprehending ${blocks.length} sheet(s) (${model})...`, pct: 25 });
    const { comprehension, model: usedModel } = await comprehendWorkbook(buffers, model);

    emit({
      step: 'parsing',
      message: `Comprehension complete — ${comprehension.sheets.length} sheets understood, ${comprehension.projections.length} projections, template "${comprehension.template?.id ?? 'none'}"`,
      pct: 50,
      detail: {
        sheets: comprehension.sheets.length,
        projections: comprehension.projections.length,
        template: comprehension.template?.id ?? null,
      },
    });

    // ── 3. POPULATE ────────────────────────────────────────
    emit({ step: 'saving', message: 'Populating financial projections from AI comprehension...', pct: 60 });
    let projectionsCount = 0;
    for (const metric of comprehension.projections) {
      await upsertProjectionRaw(db as unknown as PrismaClient, metric);
      projectionsCount++;
    }

    emit({ step: 'saving', message: 'Creating dynamic pages for comprehended sheets...', pct: 70 });
    const pagesCreated = await upsertSheetPages(db as unknown as PrismaClient, comprehension);
    const pageDefs = registerDynamicPages(comprehension);

    emit({ step: 'saving', message: 'Saving comprehension snippets...', pct: 80 });
    await saveComprehensionSnippets(db as unknown as PrismaClient, comprehension, usedModel);

    // ── 4. GENERATE (existing AI content pipeline) ─────────
    let contentGenerated = false;
    if (!skipContentGeneration) {
      emit({ step: 'openai', message: 'Running AI Content generation (Business Review → Executive Summary → Dashboard Data)...', pct: 85 });
      const context = [
        `# AI Workbook Comprehension (${usedModel})`,
        '',
        `**Workbook**: ${comprehension.workbook.title}`,
        `**Company**: ${comprehension.workbook.company ?? '—'}`,
        `**Period**: ${comprehension.workbook.period ?? '—'}`,
        `**Currency**: ${comprehension.workbook.currency ?? 'IDR'}`,
        '',
        comprehension.workbook.summary,
        '',
        '## Sheets',
        ...comprehension.sheets.map(
          (s) => `### ${s.title} (${s.tabName})\n${s.summary}${s.periodHint ? `\nPeriod: ${s.periodHint}` : ''}`,
        ),
        '',
        '## Consolidated projections',
        JSON.stringify(comprehension.projections, null, 2),
        '',
        `Template suggestion: ${comprehension.template?.id ?? 'none'} (${comprehension.template?.confidence ?? 'n/a'}) — ${comprehension.template?.reason ?? ''}`,
      ].join('\n');

      const gen = await generateAndSave(
        db,
        emit,
        buffers,
        model,
        context,
      );
      contentGenerated = gen.success === true;
    }

    emit({
      step: 'complete',
      message: `✅ AI workbook pipeline complete — ${projectionsCount} projections, ${pagesCreated.length} sheet pages, content generated: ${contentGenerated}`,
      pct: 100,
      detail: { projectionsCount, pagesCreated, contentGenerated, pageDefs: pageDefs.length },
    });

    return {
      success: true,
      comprehension,
      model: usedModel,
      projectionsCount,
      pagesCreated,
      contentGenerated,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emit({ step: 'error', message: `❌ AI workbook pipeline error: ${message}`, pct: 0, detail: { error: message } });
    return { success: false, model, projectionsCount: 0, pagesCreated: [], contentGenerated: false, error: message };
  }
}
