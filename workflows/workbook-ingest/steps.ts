/**
 * Step functions for the workbook-ingest workflow.
 *
 * Each exported async function with the `'use step'` directive is a durable
 * step: its args and result are serialized to the event log, and it retries
 * (max 3, or per RetryableError) before the error bubbles to the workflow.
 */
import { FatalError, RetryableError, sleep } from 'workflow';
import { extractSheetsWithStats, type ExtractedSheet } from '../../src/domain/ai-workbook/extract-sheets';
import { analyzeSheets, type AnalysisHints } from '../../src/domain/ai-workbook/sheet-analysis';
import {
  comprehendOnce,
  ComprehendHttpError,
  ComprehendValidationError,
  type ComprehensionResult,
  type WorkbookComprehension,
} from '../../src/domain/ai-workbook/comprehend';
import { writeProgressChunk, closeProgressStream } from './progress';
import type { WorkbookFileInput } from './types';
import { withPgClient, executeOne, queryRows } from './db';
import type { Client } from 'pg';

/** Detect the file signatures of real spreadsheet files (zip/xlsx, BIFF/xls). */
function hasSpreadsheetMagic(data: Uint8Array): boolean {
  const b = data;
  // PK\x03\x04 (zip → xlsx) or PK\x05\x06 (empty zip)
  if (b[0] === 0x50 && b[1] === 0x4b) return true;
  // D0 CF 11 E0 A1 B1 1A E1 (OLE2 compound → .xls)
  if (
    b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0 &&
    b[4] === 0xa1 && b[5] === 0xb1 && b[6] === 0x1a && b[7] === 0xe1
  ) {
    return true;
  }
  return false;
}

/**
 * Convert raw upload bytes into xlsx buffers.
 *
 * Uint8Array is serializable across the workflow boundary; Buffer is not
 * guaranteed in workflow step sandboxes, so we keep Uint8Array everywhere
 * and hand it directly to `xlsx.read({ type: 'buffer' })`.
 *
 * SheetJS is lenient with arbitrary text (it parses plain text as a 1-column
 * sheet), so we validate the magic bytes BEFORE parsing to catch uploads of
 * the wrong file type with a clean FatalError.
 */
export async function loadWorkbookStep(files: WorkbookFileInput[]): Promise<Uint8Array[]> {
  'use step';

  if (!Array.isArray(files) || files.length === 0) {
    throw new FatalError('No workbook files were provided.');
  }

  return files.map((f) => {
    if (!f || typeof f.name !== 'string' || !(f.data instanceof Uint8Array)) {
      throw new FatalError('Invalid file entry: expected { name, data: Uint8Array }.');
    }
    if (f.data.byteLength === 0) {
      throw new FatalError(`Workbook "${f.name}" is empty.`);
    }
    if (!hasSpreadsheetMagic(f.data)) {
      throw new FatalError(
        `Workbook "${f.name}" is not a readable .xlsx/.xls file (unexpected file signature).`,
      );
    }
    return f.data;
  });
}

/** EXTRACT: serialize every sheet to text + structural stats. */
export async function extractSheetsStep(buffers: Uint8Array[]): Promise<ExtractedSheet[]> {
  'use step';

  const all: ExtractedSheet[] = [];
  for (const buf of buffers) {
    let extracted: ExtractedSheet[];
    try {
      extracted = extractSheetsWithStats(buf);
    } catch (err) {
      throw new FatalError(
        `Workbook is not a readable .xlsx file: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    all.push(...extracted);
  }

  if (all.length === 0) {
    throw new FatalError('Workbook contains no readable sheets.');
  }
  return all;
}

/** ANALYZE: deterministic pre-pass producing structured hints. */
export async function analyzeSheetsStep(sheets: ExtractedSheet[]): Promise<AnalysisHints> {
  'use step';

  return analyzeSheets(sheets);
}

/**
 * COMPREHEND: one OpenAI call (gpt-4o, json_object, Zod-validated) with the
 * deterministic ANALYSIS hints injected into the prompt.
 *
 * Retry policy (§4.2 of the roadmap):
 *   - 429            → RetryableError({ retryAfter }) using Retry-After header (fallback 1s)
 *   - 5xx / network  → plain Error → SDK auto-retry (max 3)
 *   - missing key    → FatalError (permanent, no retry storm)
 *   - schema rejected → plain Error → SDK auto-retries (model output is stochastic
 *                      at temperature 0.2); run fails with a clear message after
 *                      the SDK's retry budget is exhausted.
 */
export async function comprehendWorkbookStep(
  sheets: ExtractedSheet[],
  hints: AnalysisHints,
  model = 'gpt-4o',
  openaiApiKey?: string | null,
): Promise<ComprehensionResult> {
  'use step';

  const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new FatalError(
      'OpenAI API key not configured. Set it in Config > OpenAI Key (via the reseed route) or set OPENAI_API_KEY env var.',
    );
  }

  const blocks = sheets.map(({ tabName, text }) => ({ tabName, text }));

  try {
    return await comprehendOnce(blocks, { model, hints, apiKey });
  } catch (err) {
    if (err instanceof ComprehendHttpError) {
      if (err.status === 429) {
        const retryAfterSeconds = err.retryAfterSeconds ?? 1;
        throw new RetryableError(err.message, { retryAfter: `${retryAfterSeconds}s` });
      }
      // 5xx etc → plain Error → SDK auto-retry (max 3)
      throw err;
    }
    if (err instanceof ComprehendValidationError) {
      // Schema/JSON rejection — the model may produce valid output on retry.
      throw err;
    }
    throw err;
  }
}

/**
 * Emit a progress chunk to the run's writable stream (SSE payload).
 * Must be a step: workflow functions cannot interact with the stream directly.
 */
export async function emitProgressStep(
  writable: WritableStream<import('./types').ProgressChunk>,
  chunk: import('./types').ProgressChunk,
): Promise<void> {
  'use step';

  await writeProgressChunk(writable, chunk);
}

/**
 * Close the run's writable stream, signaling completion to stream readers.
 * Must be a step: workflow functions cannot interact with the stream directly.
 */
export async function closeProgressStep(
  writable: WritableStream<import('./types').ProgressChunk>,
): Promise<void> {
  'use step';

  await closeProgressStream(writable);
}

// ── Phase 3: POPULATE steps ────────────────────────────────────────

/**
 * Upsert financial projections from the AI comprehension.
 * Idempotent: ON CONFLICT (period, data_type, scenario) DO UPDATE.
 */
export async function populateProjectionsStep(
  comprehension: WorkbookComprehension,
  dbUrl: string,
): Promise<number> {
  'use step';

  let count = 0;
  await withPgClient(dbUrl, async (db) => {
    for (const metric of comprehension.projections) {
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

      await executeOne(
        db,
        `INSERT INTO financial_projections (period, year, month, data_type, scenario, revenue, ebitda, net_income, guests, staff_cost, pnl_lines)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
         ON CONFLICT (period, data_type, scenario)
         DO UPDATE SET
           revenue = EXCLUDED.revenue,
           ebitda = EXCLUDED.ebitda,
           net_income = EXCLUDED.net_income,
           guests = EXCLUDED.guests,
           staff_cost = EXCLUDED.staff_cost,
           pnl_lines = EXCLUDED.pnl_lines;`,
        [metric.period, year, month, metric.dataType, metric.scenario, revenue, ebitda, netIncome, guests, staffCost, pnlLines],
      );
      count++;
    }
  });
  return count;
}

/** Normalize a sheet tab name into a URL-safe slug. */
function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Page blocks per sheet category (mirrors pipeline.ts CATEGORY_BLOCKS). */
const SHEET_CATEGORY_BLOCKS: Record<string, { blockType: string; title: string }[]> = {
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

/**
 * Create/update dynamic app pages + page sections for each comprehended sheet.
 *
 * §7.1 FIX: ON CONFLICT (slug) DO UPDATE ... RETURNING id ensures we always
 * have the correct page ID (new or existing). Page sections are deleted and
 * re-inserted scoped to that id — no orphan FK references.
 */
export async function upsertSheetPagesStep(
  comprehension: WorkbookComprehension,
  dbUrl: string,
): Promise<Array<{ slug: string; title: string }>> {
  'use step';

  const created: Array<{ slug: string; title: string }> = [];
  let sortOrder = 100;

  await withPgClient(dbUrl, async (db) => {
    for (const sheet of comprehension.sheets) {
      const slug = `sheet-${normalizeSlug(sheet.tabName)}`;
      const blocks = SHEET_CATEGORY_BLOCKS[sheet.category] ?? SHEET_CATEGORY_BLOCKS.other;

      // §7.1 fix: RETURNING id gives us the real page ID on insert OR conflict.
      const pageRows = await queryRows<{ id: string }>(
        db,
        `INSERT INTO app_pages (id, slug, title, auth_tier, sort_order, nav_label, show_in_nav)
         VALUES (gen_random_uuid()::TEXT, $1, $2, 'google', $3, $4, true)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           auth_tier = EXCLUDED.auth_tier,
           sort_order = EXCLUDED.sort_order,
           nav_label = EXCLUDED.nav_label,
           show_in_nav = EXCLUDED.show_in_nav
         RETURNING id;`,
        [slug, sheet.title, sortOrder++, sheet.title],
      );
      const pageId = pageRows[0]?.id;
      if (!pageId) continue;

      // Replace sections for this page (idempotent on retry).
      await executeOne(db, `DELETE FROM page_sections WHERE page_id = $1;`, [pageId]);

      const summaryMarkdown = [
        `# ${sheet.title}`,
        '',
        sheet.summary,
        sheet.periodHint ? `\n**Period**: ${sheet.periodHint}` : '',
        `**Rows**: ${sheet.rowCount ?? '—'}  |  **Columns**: ${(sheet.columns ?? []).length || '—'}`,
        '',
      ].filter((l) => l !== '').join('\n');

      // doc_markdown block
      await executeOne(
        db,
        `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
         VALUES (gen_random_uuid()::TEXT, $1, 0, 'doc_markdown', $2::jsonb);`,
        [pageId, JSON.stringify({ title: 'About this sheet', markdown: summaryMarkdown })],
      );

      // Category-specific blocks
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]!;
        await executeOne(
          db,
          `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
           VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4::jsonb);`,
          [pageId, i + 1, block.blockType, JSON.stringify({ sheet: sheet.tabName, title: block.title })],
        );
      }

      created.push({ slug, title: sheet.title });
    }
  });

  return created;
}

/** Upsert knowledge snippets (full comprehension + per-sheet markdown). */
export async function saveSnippetsStep(
  comprehension: WorkbookComprehension,
  model: string,
  dbUrl: string,
): Promise<number> {
  'use step';

  let count = 0;
  await withPgClient(dbUrl, async (db) => {
    // Raw comprehension JSON (used by AI chat / reprocess).
    await executeOne(
      db,
      `INSERT INTO knowledge_snippets (id, key, category, content)
       VALUES (gen_random_uuid()::TEXT, $1, 'document', $2)
       ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`,
      [
        'workbook_comprehension',
        JSON.stringify({ model, comprehendedAt: new Date().toISOString(), comprehension }),
      ],
    );
    count++;

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
      ].filter((l) => l !== '').join('\n');

      await executeOne(
        db,
        `INSERT INTO knowledge_snippets (id, key, category, content)
         VALUES (gen_random_uuid()::TEXT, $1, 'sheet', $2)
         ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`,
        [key, markdown],
      );
      count++;
    }
  });

  return count;
}

/**
 * Deterministic template-fit scoring (§5.5).
 *
 * Scores the AI-suggested template against the comprehended sheet categories.
 * No external imports — all template data is hardcoded to keep the bundle lean.
 */
export async function selectTemplateStep(comprehension: WorkbookComprehension) {
  'use step';

  type TemplateScore = { id: string; score: number; reason: string };

  const aiTemplate = comprehension.template;
  const aiConfidence = aiTemplate?.confidence ?? 0.5;
  const sheetCategories = comprehension.sheets.map((s) => s.category);

  // Category profile per template (which sheet categories match best).
  const templateProfiles: Record<string, { categories: string[]; keywords: string[] }> = {
    'financial-analytics': {
      categories: ['profit_loss', 'balance_sheet', 'break_even', 'variance', 'trial_balance', 'summary_pl', 'summary_bs'],
      keywords: ['financial', 'pnl', 'profit', 'loss', 'balance', 'break even', 'bep', 'variance'],
    },
    restaurant: {
      categories: ['daily_sales', 'cost_of_sales', 'profit_loss', 'break_even', 'month_on_month'],
      keywords: ['restaurant', 'kitchen', 'menu', 'food', 'beverage', 'covers', 'guests'],
    },
    hotel: {
      categories: ['daily_sales', 'profit_loss', 'month_on_month', 'cost_of_sales'],
      keywords: ['hotel', 'rooms', 'occupancy', 'revpar', 'housekeeping'],
    },
    'ecommerce-retail': {
      categories: ['daily_sales', 'profit_loss', 'cost_of_sales', 'variance'],
      keywords: ['ecommerce', 'retail', 'online', 'sku', 'cart', 'conversion'],
    },
    healthcare: {
      categories: ['profit_loss', 'balance_sheet', 'cost_of_sales'],
      keywords: ['health', 'patient', 'clinic', 'medical', 'pharmacy'],
    },
    'supply-chain': {
      categories: ['profit_loss', 'cost_of_sales', 'variance', 'balance_sheet'],
      keywords: ['supply', 'logistics', 'inventory', 'warehouse', 'shipping'],
    },
    'real-estate': {
      categories: ['profit_loss', 'balance_sheet', 'summary_bs'],
      keywords: ['real estate', 'property', 'lease', 'rent', 'mortgage'],
    },
    education: {
      categories: ['profit_loss', 'month_on_month'],
      keywords: ['education', 'student', 'tuition', 'course', 'enrollment'],
    },
    'professional-services': {
      categories: ['profit_loss', 'balance_sheet', 'cost_of_sales'],
      keywords: ['consulting', 'services', 'billing', 'client', 'project'],
    },
    manufacturing: {
      categories: ['profit_loss', 'cost_of_sales', 'balance_sheet', 'variance'],
      keywords: ['manufacturing', 'production', 'factory', 'bill of materials', 'work order'],
    },
  };

  function categoryOverlap(tmplId: string): number {
    const profile = templateProfiles[tmplId];
    if (!profile) return 0;
    const matches = sheetCategories.filter((c) => profile.categories.includes(c));
    return sheetCategories.length > 0 ? matches.length / sheetCategories.length : 0;
  }

  function keywordMatch(tmplId: string): number {
    const profile = templateProfiles[tmplId];
    if (!profile) return 0;
    const text = [
      comprehension.workbook.title,
      comprehension.workbook.summary,
      comprehension.workbook.company ?? '',
    ].join(' ').toLowerCase();
    const matches = profile.keywords.filter((kw) => text.includes(kw));
    return profile.keywords.length > 0 ? matches.length / profile.keywords.length : 0;
  }

  // Score the AI-suggested template.
  const suggestedScore = aiTemplate?.id
    ? aiConfidence * (categoryOverlap(aiTemplate.id) * 0.7 + keywordMatch(aiTemplate.id) * 0.3)
    : -1;

  // Score all templates for alternatives.
  const allScores: TemplateScore[] = Object.keys(templateProfiles).map((id) => ({
    id,
    score: categoryOverlap(id) * 0.7 + keywordMatch(id) * 0.3,
    reason: `${Math.round(categoryOverlap(id) * 100)}% category match, ${Math.round(keywordMatch(id) * 100)}% keyword match`,
  }));
  allScores.sort((a, b) => b.score - a.score);

  const recommended = suggestedScore > allScores[0]!.score ? aiTemplate!.id! : allScores[0]!.id;
  const recommendedScore = recommended === aiTemplate?.id ? suggestedScore : allScores[0]!.score;

  return {
    recommended,
    aiSuggestion: aiTemplate?.id ?? null,
    aiConfidence,
    score: Math.round(recommendedScore * 100) / 100,
    reason: allScores[0]!.reason,
    alternatives: allScores.filter((s) => s.id !== recommended).slice(0, 3).map((s) => ({ id: s.id, score: Math.round(s.score * 100) / 100 })),
  };
}

/** Best-effort register dynamic pages in the runtime catalog. */
export async function registerDynamicPagesStep(
  comprehension: WorkbookComprehension,
): Promise<number> {
  'use step';

  // setDynamicPages is a runtime-side effect; in the workflow context the
  // catalog rebuilds from DB app_pages on next request. Best-effort.
  try {
    const { setDynamicPages } = await import('../../src/lib/page-catalog');
    const pages = comprehension.sheets.map((sheet) => ({
      slug: `sheet-${normalizeSlug(sheet.tabName)}`,
      title: sheet.title,
      authTier: 'google' as const,
      navLabel: sheet.title,
      showInNav: true,
      sections: [
        {
          blockType: 'doc_markdown' as const,
          config: {
            source: `sheet_${normalizeSlug(sheet.tabName)}`,
            title: sheet.title,
          },
        },
        ...(SHEET_CATEGORY_BLOCKS[sheet.category] ?? SHEET_CATEGORY_BLOCKS.other).map((b) => ({
          blockType: b.blockType as 'doc_markdown' | 'sheet_viewer' | 'pnl_table' | 'chart_financial' | 'kpi_cards',
          config: { sheet: sheet.tabName, title: b.title },
        })),
      ],
    }));
    setDynamicPages(pages);
    return pages.length;
  } catch {
    // Runtime catalog unavailable in workflow context — non-critical.
    return 0;
  }
}

// ── Phase 5: GENERATE steps (OpenAI → BR / ES / Dashboard) ───────

/** Parse Business Review markdown into part sections (lightweight inline parser). */
function parseReviewParts(markdown: string): Array<{ slug: string; partKey: string; title: string; sortOrder: number; markdown: string }> {
  const parts: Array<{ slug: string; partKey: string; title: string; sortOrder: number; markdown: string }> = [];
  const headerRe = /^#{2,3}\s+Part\s+([A-Z]):\s*(.+)$/m;
  const sections = markdown.split(/\n(?=#{2,3}\s+Part\s+[A-Z]:)/);
  let sortOrder = 0;
  for (const section of sections) {
    const match = headerRe.exec(section);
    if (!match) continue;
    const [, letter, rawTitle] = match;
    const title = (rawTitle ?? section.split('\n')[0]?.replace(/^#{2,3}\s+Part\s+[A-Z]:\s*/, '') ?? '').trim();
    const slug = `part-${(letter ?? 'a').toLowerCase()}`;
    const partKey = `part_${(letter ?? 'a').toLowerCase()}`;
    parts.push({ slug, partKey, title, sortOrder: sortOrder++, markdown: section.trim() });
  }
  return parts;
}

/**
 * Generate the Business Review from comprehension data.
 * Saves parsed parts to business_review_parts via pg.
 */
export async function generateBusinessReviewStep(
  comprehension: WorkbookComprehension,
  apiKey: string,
  dbUrl: string,
  model = 'gpt-4o',
): Promise<number> {
  'use step';

  const prompt = buildGenPrompt(comprehension, 'businessReview');

  let markdown: string;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise financial analyst and business writer. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 16384,
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(reply);
    markdown = parsed.businessReview ?? '';
  } catch (err) {
    throw new Error(`Business Review generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!markdown.trim()) return 0;

  const parts = parseReviewParts(markdown);
  let saved = 0;
  await withPgClient(dbUrl, async (db) => {
    for (const part of parts) {
      await executeOne(db,
        `INSERT INTO business_review_parts (id, slug, part_key, title, sort_order, auth_tier, markdown)
         VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4, 'google', $5)
         ON CONFLICT (slug) DO UPDATE SET
           part_key = EXCLUDED.part_key,
           title = EXCLUDED.title,
           sort_order = EXCLUDED.sort_order,
           markdown = EXCLUDED.markdown;`,
        [part.slug, part.partKey, part.title, part.sortOrder, part.markdown],
      );
      saved++;
    }
  });

  return saved;
}

/**
 * Generate the Executive Summary from comprehension data.
 * Saves to knowledge_snippets via pg.
 */
export async function generateExecutiveSummaryStep(
  comprehension: WorkbookComprehension,
  apiKey: string,
  dbUrl: string,
  model = 'gpt-4o',
): Promise<boolean> {
  'use step';

  const prompt = buildGenPrompt(comprehension, 'executiveSummary');

  let markdown: string;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise financial analyst and business writer. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 16384,
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(reply);
    markdown = parsed.executiveSummary ?? '';
  } catch (err) {
    throw new Error(`Executive Summary generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!markdown.trim()) return false;

  await withPgClient(dbUrl, async (db) => {
    await executeOne(db,
      `INSERT INTO knowledge_snippets (id, key, category, content)
       VALUES (gen_random_uuid()::TEXT, 'executive_summary', 'document', $1)
       ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`,
      [markdown],
    );
  });

  return true;
}

/**
 * Generate the Dashboard Data from comprehension data.
 * Saves to knowledge_snippets via pg.
 */
export async function generateDashboardStep(
  comprehension: WorkbookComprehension,
  apiKey: string,
  dbUrl: string,
  model = 'gpt-4o',
): Promise<boolean> {
  'use step';

  const prompt = buildGenPrompt(comprehension, 'dashboardData');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise financial analyst. Return ONLY valid JSON with keys "actionPhases", "targetRows", and "levers".' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 16384,
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content ?? '';
    if (!reply) return false;
    const parsed = JSON.parse(reply);
    if (!parsed.actionPhases && !parsed.targetRows && !parsed.levers) return false;

    await withPgClient(dbUrl, async (db) => {
      await executeOne(db,
        `INSERT INTO knowledge_snippets (id, key, category, content)
         VALUES (gen_random_uuid()::TEXT, 'dashboard_data', 'document', $1)
         ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;`,
        [JSON.stringify(parsed)],
      );
    });
    return true;
  } catch {
    // Dashboard is non-critical — swallow errors
    return false;
  }
}

/**
 * Build a generation prompt from the workbook comprehension.
 * No external dependencies — pure computation from the comprehension state.
 */
function buildGenPrompt(
  comprehension: WorkbookComprehension,
  target: 'businessReview' | 'executiveSummary' | 'dashboardData',
): string {
  const { workbook, sheets, projections } = comprehension;
  const context = [
    `# Generated Content: ${target === 'businessReview' ? 'Business Review' : target === 'executiveSummary' ? 'Executive Summary' : 'Dashboard Data'}`,
    '',
    `## Workbook Summary`,
    `**Title**: ${workbook.title}`,
    `**Company**: ${workbook.company ?? 'N/A'}`,
    `**Period**: ${workbook.period ?? 'N/A'}`,
    `**Currency**: ${workbook.currency ?? 'IDR'}`,
    workbook.summary,
    '',
    `## Sheet Inventory (${sheets.length} sheets)`,
    ...sheets.map((s) => `- **${s.tabName}** (${s.category}): ${s.title} — ${s.summary}${s.periodHint ? ` [${s.periodHint}]` : ''}`),
    '',
    `## Consolidated Financial Projections`,
    '```json',
    JSON.stringify(projections, null, 2),
    '```',
  ].join('\n');

  if (target === 'businessReview') {
    return `${context}\n\nGenerate ONLY a "businessReview" document as a JSON object with a single key "businessReview" containing a comprehensive Markdown business review. Include sections for each part of the business: Part A: Revenue & Sales, Part B: Costs & Margins, Part C: Profitability & EBITDA, Part D: Break-Even Analysis, Part E: Trends & Projections, Part F: Risks & Recommendations. Use ## Part X: Title headers. Include data tables from the projections.`;
  }
  if (target === 'executiveSummary') {
    return `${context}\n\nGenerate ONLY an "executiveSummary" document as a JSON object with a single key "executiveSummary" containing a concise Markdown executive summary (1-2 pages) highlighting the key financial metrics, trends, risks, and actionable recommendations from the workbook data.`;
  }
  return `${context}\n\nGenerate ONLY a JSON object with keys "actionPhases" (array of {phase, description}), "targetRows" (array of {label, value, unit}), and "levers" (array of {name, impact, actions[]}) based on the financial data. Focus on actionable operational recommendations.`;
}
