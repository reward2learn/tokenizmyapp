/**
 * AI Content Generator
 *
 * Orchestrates:
 *   1. Read the Excel workbook
 *   2. Extract structured data
 *   3. Build the generation prompt
 *   4. Call the configured AI provider (Config > AI Provider — OpenAI, Vercel
 *      AI Gateway, or OpenCode Zen) to generate Business Review + Executive Summary
 *   5. Parse the AI response
 *   6. Save results to the database (knowledge_snippets + business_review_parts)
 *   7. Upsert sheet-* AppPages from workbook analysis so Populate Sheet Pages
 *      can attach them to navigation
 *
 * Reports progress at each stage via an optional callback so callers can
 * surface real-time status (SSE, progress bars, notifications).
 *
 * This eliminates the need for manual Markdown file uploads.
 */

import { extractExcelData, extractExcelDataFromBuffers } from '@/domain/excel/excel-extractor';
import { buildGenerationPrompt, buildDashboardPrompt } from '@/domain/ai-content/prompt-builder';
import { buildSeededPromptContext } from '@/domain/ai-content/seeded-prompt-context';
import { resolveActiveAiConfig, type ActiveAiConfig } from '@/lib/ai-providers';
import type { DbClient } from '@/lib/db';
import { withTimeout } from '@/lib/with-timeout';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import { parseReviewParts } from '@/domain/ai-content/parse-review-parts';
import type { ReviewPart } from '@/domain/ai-content/parse-review-parts';
import { meterAiUsage, requireCreditsForTenant, CREDIT_FLOORS } from '@/domain/billing/credit-service';
import {
  aggregateAiUsageSummaries,
  toAiUsageSummary,
  type AiUsageSummary,
} from '@/lib/billing/ai-usage-summary';
import { analyzeWorkbook } from '@/domain/excel/workbook-analyzer';
import { generateLegalDocuments } from '@/domain/legal/legal-doc-generator';
import { resolveWorkbookBuffers } from '@/domain/ai-content/ensure-sheet-pages';

// ── Progress reporting ──────────────────────────────────

export type ProgressStep =
  | 'extracting'
  | 'prompt'
  | 'openai'
  | 'parsing'
  | 'saving'
  | 'saving_exec'
  | 'saving_home'
  | 'seeding_tasks'
  | 'complete'
  | 'error';

export interface ProgressEvent {
  /** Machine-readable step identifier */
  step: ProgressStep;
  /** Human-readable status message shown in the UI notification bar */
  message: string;
  /** Estimated completion percentage 0–100 */
  pct: number;
  /** Optional detail payload (result on 'complete', error info on 'error') */
  detail?: unknown;
}

export type ProgressCallback = (event: ProgressEvent) => void;

// ── Types ──────────────────────────────────────────────

export interface AiGeneratedContent {
  businessReview: string;
  executiveSummary: string;
  promptLength: number;
  responseLength: number;
  model: string;
  /** Which configured provider actually generated this (see Config > AI
   *  Provider / Edit App / Edit Tenant) — surfaced in the UI so the status
   *  and progress display never implies OpenAI when a different provider
   *  is active. */
  providerId: string;
  providerLabel: string;
}

export interface GenerationResult {
  success: boolean;
  content?: AiGeneratedContent;
  error?: string;
  /** Aggregated metering across all document + dashboard AI calls in this run. */
  usage?: AiUsageSummary | null;
}

export interface SavedResult {
  businessReviewParts: { slug: string; title: string }[];
  executiveSummarySaved: boolean;
  /** sheet-* pages upserted for Populate Sheet Pages (empty if workbook unavailable). */
  sheetPages?: { slug: string; title: string }[];
  /** Per seeded template page — what this run delivered. */
  pages?: import('@/domain/ai-content/ensure-template-pages').PageContentStatus[];
  /** CMS doc_markdown sections updated via aiRegenerate placeholders. */
  cmsPlaceholders?: import('@/domain/ai-content/cms-placeholder-service').CmsPlaceholderUpdateResult[];
}

// ── AI Call ─────────────────────────────────────────────

// ── AI provider error classification ─────────────────────────────

/** Marker embedded in quota-exhausted error messages so callers can map them to HTTP 402. */
export const OPENAI_QUOTA_MARKER = '[openai-no-credits]';

/**
 * Build an error for a failed AI provider call. Quota exhaustion gets an
 * actionable message with the masked key, so the UI can tell the operator
 * to add credits or switch providers. Different providers signal this
 * differently: OpenAI uses 429 + insufficient_quota/credit_balance_exhausted;
 * Vercel AI Gateway and OpenCode Zen return 402 directly when a hard billing
 * limit is hit.
 */
function buildAiProviderError(status: number, errBody: string, apiKey: string, provider: ActiveAiConfig['provider']): Error {
  let code = '';
  let type = '';
  try {
    const parsed = JSON.parse(errBody) as { error?: { code?: string; type?: string } };
    code = parsed.error?.code ?? '';
    type = parsed.error?.type ?? '';
  } catch {
    // non-JSON body — keep the raw message
  }
  const isQuota =
    status === 402 ||
    (status === 429 &&
      (code === 'insufficient_quota' || type === 'insufficient_quota' || errBody.includes('credit_balance_exhausted')));
  if (isQuota) {
    const maskedKey = apiKey ? `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}` : 'unknown';
    return new Error(
      `${OPENAI_QUOTA_MARKER} ${provider.label} account has no credits remaining (API key ${maskedKey}). ` +
      `Add credits at ${provider.docsUrl}, or switch providers/keys in Config > AI Provider.`,
    );
  }
  return new Error(`${provider.label} API error (${status}): ${errBody}`);
}

/**
 * Call the active AI provider to generate a single document (business
 * review OR executive summary). Keeps each response within the model's
 * 16384 output-token limit. All three supported providers (OpenAI, Vercel
 * AI Gateway, OpenCode Zen) expose an OpenAI-compatible Chat Completions
 * endpoint, so this request shape works unchanged across them.
 */
async function callAiProviderForDocument(
  prompt: string,
  ai: ActiveAiConfig,
  documentType: 'businessReview' | 'executiveSummary' | 'dashboardData',
  tenantSlug: string,
  onProgress?: ProgressCallback,
): Promise<{ text: string; usage: AiUsageSummary | null }> {
  const docLabel = documentType === 'businessReview' ? 'Business Review' : documentType === 'executiveSummary' ? 'Executive Summary' : 'Dashboard Data';

  onProgress?.({
    step: 'openai',
    message: `Calling ${ai.provider.label} — generating ${docLabel} (${ai.model})...`,
    pct: documentType === 'businessReview' ? 40 : 55,
  });

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
            'You are a precise financial analyst and business writer. You ALWAYS return only valid JSON with exactly the key requested.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nGenerate ONLY the "${documentType}" document as a JSON object with a single key "${documentType}" containing the full Markdown string. Do NOT include the other document.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 16384,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'Unknown error');
    throw buildAiProviderError(response.status, errBody, ai.apiKey, ai.provider);
  }

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content ?? '';
  const providerUsage = result.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
  const tokens = {
    promptTokens: providerUsage?.prompt_tokens ?? 0,
    completionTokens: providerUsage?.completion_tokens ?? 0,
  };

  let usage: AiUsageSummary | null = null;
  // Meter platform-key usage (BYOK is never charged — the tenant pays the
  // provider directly). Non-blocking: metering must never break generation;
  // the pre-flight gate in generateAndSave() is the enforcement point.
  if (ai.keySource === 'env') {
    try {
      const meter = await meterAiUsage({
        tenantSlug,
        model: ai.model,
        promptTokens: tokens.promptTokens,
        completionTokens: tokens.completionTokens,
        keySource: ai.keySource,
        refType: 'content_generation',
        refId: documentType,
      });
      usage = toAiUsageSummary(meter, tokens, { model: ai.model });
    } catch (err) {
      console.warn('[content-generator] Metering failed (non-blocking):', err instanceof Error ? err.message : err);
      usage = toAiUsageSummary(null, tokens, { model: ai.model });
    }
  }

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(reply);
  } catch {
    const jsonMatch = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error(
        'AI response was not valid JSON. Raw response: ' + reply.slice(0, 500),
      );
    }
  }

  return { text: parsed[documentType] ?? '', usage };
}

export interface HomeHeroPayload {
  badge?: string;
  headline?: string;
  subtitle?: string;
  accent?: string;
}

export interface AiTaskPayload {
  title: string;
  priority?: string;
  ownerCodes?: string[];
  dueOffsetDays?: number;
  description?: string | null;
}

interface DashboardData {
  actionPhases: unknown;
  targetRows: unknown;
  levers: unknown;
  homeHero?: HomeHeroPayload | null;
  tasks?: AiTaskPayload[] | null;
}

/**
 * Generate structured dashboard JSON (action plan, targets, levers) — kept
 * separate from callAiProviderForDocument because this returns raw JSON,
 * not a markdown document keyed by documentType. Called concurrently with
 * the business review / executive summary calls in generateAndSave(), not
 * sequentially after them, to keep total wall-clock time bounded by the
 * slowest single call.
 */
async function generateDashboardData(
  data: import('@/domain/excel/excel-extractor').ExcelData,
  additionalContext: string | undefined,
  ai: ActiveAiConfig,
  tenantSlug: string,
): Promise<{ data: DashboardData; usage: AiUsageSummary | null } | null> {
  const dashboardPrompt = buildDashboardPrompt(data, additionalContext);

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
          content: 'You are a precise financial analyst. You ALWAYS return only valid JSON with exactly the keys requested. Return ONLY a JSON object with keys "actionPhases", "targetRows", "levers", "homeHero", and "tasks".',
        },
        {
          role: 'user',
          content: dashboardPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 16384,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) return null;

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content ?? '';
  if (!reply) return null;

  const providerUsage = result.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
  const tokens = {
    promptTokens: providerUsage?.prompt_tokens ?? 0,
    completionTokens: providerUsage?.completion_tokens ?? 0,
  };

  let usage: AiUsageSummary | null = null;
  // Meter platform-key usage (BYOK is never charged). Non-blocking — the
  // dashboard call is already best-effort (returns null on failure), and
  // metering must never break generation.
  if (ai.keySource === 'env') {
    try {
      const meter = await meterAiUsage({
        tenantSlug,
        model: ai.model,
        promptTokens: tokens.promptTokens,
        completionTokens: tokens.completionTokens,
        keySource: ai.keySource,
        refType: 'content_generation',
        refId: 'dashboardData',
      });
      usage = toAiUsageSummary(meter, tokens, { model: ai.model });
    } catch (err) {
      console.warn('[content-generator] Dashboard metering failed (non-blocking):', err instanceof Error ? err.message : err);
      usage = toAiUsageSummary(null, tokens, { model: ai.model });
    }
  }

  const parsed = JSON.parse(reply);
  if (!parsed.actionPhases || !parsed.targetRows || !parsed.levers) return null;
  return {
    data: {
      actionPhases: parsed.actionPhases,
      targetRows: parsed.targetRows,
      levers: parsed.levers,
      homeHero: parsed.homeHero ?? null,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : null,
    } as DashboardData,
    usage,
  };
}

// ── Content parsing helpers ─────────────────────────────
// (parseReviewParts imported from parse-review-parts.ts)
// ── DB save helpers ─────────────────────────────────────

async function saveExecutiveSummary(
  db: DbClient,
  markdown: string,
): Promise<boolean> {
  try {
    await db.knowledgeSnippet.upsert({
      where: { key_appId: { key: 'executive_summary', appId: getCurrentAppId() } },
      create: {
        key: 'executive_summary',
        category: 'document',
        content: markdown,
        appId: getCurrentAppId(),
      },
      update: {
        content: markdown,
        category: 'document',
      },
    });
    return true;
  } catch (err) {
    console.error('[ai-content] Failed to save executive summary:', err);
    return false;
  }
}

async function saveBusinessReviewParts(
  db: DbClient,
  parts: ReviewPart[],
  onProgress?: ProgressCallback,
): Promise<{ slug: string; title: string }[]> {
  const saved: { slug: string; title: string }[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    try {
      await db.businessReviewPart.upsert({
        where: { slug_appId: { slug: part.slug, appId: getCurrentAppId() } },
        create: {
          slug: part.slug,
          partKey: part.partKey,
          title: part.title,
          sortOrder: part.sortOrder,
          authTier: 'google',
          markdown: part.markdown,
          appId: getCurrentAppId(),
        },
        update: {
          title: part.title,
          sortOrder: part.sortOrder,
          markdown: part.markdown,
        },
      });
      saved.push({ slug: part.slug, title: part.title });
    } catch (err) {
      console.error(
        `[ai-content] Failed to save review part ${part.slug}:`,
        err,
      );
    }

    const pctBase = 75;
    const pctRange = 95 - pctBase;
    onProgress?.({
      step: 'saving',
      message: `Saving Business Review — part ${i + 1} of ${parts.length} (${part.title})...`,
      pct: Math.round(pctBase + (pctRange * (i + 1)) / parts.length),
      detail: { saved: saved.length, total: parts.length, current: part.title },
    });
  }

  return saved;
}

// ── Orchestrator ────────────────────────────────────────

/**
 * Run the full pipeline: extract → prompt → AI → parse → save.
 *
 * @param db         ZenStack/Prisma client for DB writes
 * @param onProgress Optional callback called at each stage with a ProgressEvent.
 *                    The caller can forward these to an SSE stream or progress bar.
 * @param source     Optional explicit file path (string) OR in-memory workbook Buffer.
 *                   When omitted auto-detects the file on disk or falls back to DB cache.
 * @param model      Optional model override — defaults to the model configured for the active AI provider
 * @param tenantSlug Optional tenant slug for credit metering/gating. Defaults to
 *                   NEXT_PUBLIC_TENANT_SLUG (the root config app is itself a
 *                   tenant in the registry) or 'tokenizmyapp' when unset.
 */
export async function generateAndSave(
  db: DbClient,
  onProgress?: ProgressCallback,
  source?: string | Buffer | Buffer[],
  model?: string,
  additionalContext?: string,
  overridePrompt?: string,
  tenantSlug?: string,
): Promise<GenerationResult & { saved?: SavedResult; prompt?: string }> {
  const tenant = tenantSlug ?? process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'tokenizmyapp';
  try {
    // ── 1. Extract Excel data ───────────────────────────
    onProgress?.({
      step: 'extracting',
      message: 'Reading Excel workbook and extracting financial data...',
      pct: 5,
    });

    const data = Array.isArray(source)
      ? extractExcelDataFromBuffers(source)
      : extractExcelData(source);

    onProgress?.({
      step: 'extracting',
      message: `Data extracted — ${data.profitAndLoss.length} P&L lines, ${data.bepMonthly.length} BEP months, ${data.summaryPl.length} years in multi-year summary`,
      pct: 15,
    });

    // ── 2. Build prompt (Excel extract + seeded DB inventory) ─
    onProgress?.({
      step: 'prompt',
      message: 'Building comprehensive AI prompt from financial data + seeded inventory...',
      pct: 20,
    });

    let seededContext = '';
    try {
      seededContext = await buildSeededPromptContext(db);
    } catch (err) {
      console.warn(
        '[generateAndSave] Could not load seeded prompt context:',
        err instanceof Error ? err.message : err,
      );
    }

    const mergedContext = [seededContext, additionalContext].filter(Boolean).join('\n\n');
    let cmsPlaceholderContext = '';
    try {
      const { listCmsAiPlaceholders, buildCmsPlaceholdersContext } = await import(
        '@/domain/ai-content/cms-placeholder-service'
      );
      const placeholders = await listCmsAiPlaceholders(db, { onlyMarked: true });
      cmsPlaceholderContext = buildCmsPlaceholdersContext(placeholders);
    } catch (err) {
      console.warn(
        '[generateAndSave] Could not load CMS placeholder context:',
        err instanceof Error ? err.message : err,
      );
    }
    const fullAdditionalContext = [mergedContext, cmsPlaceholderContext].filter(Boolean).join('\n\n');
    const prompt = overridePrompt ?? buildGenerationPrompt(data, fullAdditionalContext || undefined);
    const promptKb = (prompt.length / 1000).toFixed(0);

    onProgress?.({
      step: 'prompt',
      message: `AI prompt built — ${promptKb}K characters of structured financial data ready for the AI provider`,
      pct: 30,
    });

    // ── 3. Resolve active AI provider + API key ─────────
    onProgress?.({
      step: 'openai',
      message: 'Resolving AI provider...',
      pct: 35,
    });

    // Timeout-guarded — this does up to 3 sequential DB lookups (active
    // provider, its key, its model), and a stuck Postgres connection here
    // wouldn't show as an "External API" in Vercel's request trace (it's
    // not HTTP), making a real hang here indistinguishable from any other
    // cause without this. Fails fast instead of eating the function budget.
    const ai = await withTimeout(resolveActiveAiConfig(model), 15000, 'Resolving active AI provider');
    if (!ai) {
      const errorMsg =
        'No AI provider configured. Set one up in Config > AI Provider (OpenAI, Vercel AI Gateway, or OpenCode Zen).';
      onProgress?.({
        step: 'error',
        message: errorMsg,
        pct: 0,
        detail: { hint: 'Set your provider and API key in: Admin > Config > AI Provider' },
      });
      return { success: false, error: errorMsg, prompt };
    }

    // ── 3.5 Pre-flight credit gate (platform key only) ──
    // BYOK tenants (keySource === 'db') pay their provider directly and are
    // never gated. Platform-key usage is the enforcement point: an empty
    // balance throws with OPENAI_QUOTA_MARKER so the route maps it to the
    // existing 402 / ai_provider_no_credits SSE code path.
    if (ai.keySource === 'env') {
      const gate = await requireCreditsForTenant(
        tenant,
        undefined,
        undefined,
        CREDIT_FLOORS.contentGeneration,
      );
      if (!gate.ok) {
        throw new Error(
          `${OPENAI_QUOTA_MARKER} This organization has no AI credits remaining. Upgrade your plan or add credits in the Organization bar.`,
        );
      }
    }

    // ── 4. Call AI for all three documents CONCURRENTLY ──
    // These three prompts are fully independent (none depends on another's
    // output), so running them sequentially inside one serverless function
    // just sums three ~30-90s calls — comfortably enough to blow past the
    // route's 120s maxDuration on a live deploy (seen in production as a
    // Vercel FUNCTION_INVOCATION_TIMEOUT). Firing them together bounds wall
    // clock to the slowest single call instead of the sum of all three.
    onProgress?.({
      step: 'openai',
      message: `Generating content (Review, Summary, Dashboard) concurrently via ${ai.provider.label}…`,
      pct: 40,
    });

    const dashboardPromise = generateDashboardData(data, additionalContext, ai, tenant)
      .catch((err) => {
        // Non-critical — dashboard just shows hardcoded fallbacks if this fails.
        console.error('[content-generator] Dashboard data generation failed:', err);
        return null;
      });

    const [businessReviewResult, executiveSummaryResult] = await Promise.all([
      callAiProviderForDocument(prompt, ai, 'businessReview', tenant, onProgress),
      callAiProviderForDocument(prompt, ai, 'executiveSummary', tenant, onProgress),
    ]);

    const businessReview = businessReviewResult.text;
    const executiveSummary = executiveSummaryResult.text;

    const content: AiGeneratedContent = {
      businessReview,
      executiveSummary,
      promptLength: prompt.length,
      responseLength: businessReview.length + executiveSummary.length,
      model: ai.model,
      providerId: ai.provider.id,
      providerLabel: ai.provider.label,
    };

    const dashboardResult = await dashboardPromise;
    const dashboardData = dashboardResult?.data ?? null;
    if (dashboardData) {
      // Save to knowledge_snippets so the dashboard blocks can read it
      await db.knowledgeSnippet.upsert({
        where: { key_appId: { key: 'dashboard_data', appId: getCurrentAppId() } },
        create: {
          key: 'dashboard_data',
          category: 'document',
          content: JSON.stringify(dashboardData),
          appId: getCurrentAppId(),
        },
        update: {
          content: JSON.stringify(dashboardData),
          category: 'document',
        },
      });
    }

    const aggregatedUsage = aggregateAiUsageSummaries([
      businessReviewResult.usage,
      executiveSummaryResult.usage,
      dashboardResult?.usage,
    ]);

    onProgress?.({
      step: 'parsing',
      message: 'AI responses received — parsing into Business Review sections and Executive Summary...',
      pct: 70,
    });

    // ── 6. Parse into parts ─────────────────────────────
    const parts = parseReviewParts(content.businessReview);
    const bizReviewKb = (content.businessReview.length / 1000).toFixed(0);
    const execSumKb = (content.executiveSummary.length / 1000).toFixed(0);

    onProgress?.({
      step: 'parsing',
      message: `Parsed into ${parts.length} Business Review parts (${bizReviewKb}K chars) + Executive Summary (${execSumKb}K chars)`,
      pct: 75,
      detail: { partCount: parts.length, bizReviewKb, execSumKb },
    });

    // ── 7. Save to DB ───────────────────────────────────
    onProgress?.({
      step: 'saving',
      message: `Saving ${parts.length} Business Review ${parts.length === 1 ? 'part' : 'parts'} to database...`,
      pct: 78,
      detail: { total: parts.length, saved: 0 },
    });

    const savedParts = await saveBusinessReviewParts(db, parts, onProgress);

    // Register saved parts in the in-memory catalog so /review/part-* routes resolve immediately
    if (savedParts.length > 0) {
      const { setDynamicReviewParts } = await import('@/lib/page-catalog');
      setDynamicReviewParts(
        parts.map((p) => ({
          partSlug: p.slug,
          partKey: p.partKey,
          title: p.title,
          authTier: 'google' as const,
        })),
      );
    }

    onProgress?.({
      step: 'saving_exec',
      message: 'Saving Executive Summary to database...',
      pct: 95,
    });

    const execSummarySaved = await saveExecutiveSummary(
      db,
      content.executiveSummary,
    );

    // ── 7b. Persist sheet-* pages so Populate Sheet Pages can attach nav ──
    // Deterministic analyzer path (same as seed) — not a second AI call.
    // Failures are non-fatal: BR/ES already saved.
    onProgress?.({
      step: 'saving',
      message: 'Creating dynamic sheet pages from workbook for navigation...',
      pct: 88,
    });

    let sheetPages: { slug: string; title: string }[] = [];
    try {
      const { ensureSheetPagesFromWorkbook } = await import(
        '@/domain/ai-content/ensure-sheet-pages'
      );
      sheetPages = await ensureSheetPagesFromWorkbook(db, source);
    } catch (err) {
      console.warn(
        '[content-generator] Sheet page creation failed (non-fatal):',
        err instanceof Error ? err.message : err,
      );
    }

    // ── 7b2. Refresh Terms + Privacy from tenant / workbook / catalog ──
    try {
      const buffers = resolveWorkbookBuffers(source);
      const analysis = buffers[0] ? analyzeWorkbook(buffers[0]) : null;
      const legal = generateLegalDocuments(analysis);
      const appId = getCurrentAppId();
      await db.knowledgeSnippet.upsert({
        where: { key_appId: { key: 'terms_of_service', appId } },
        create: {
          key: 'terms_of_service',
          category: 'document',
          content: legal.termsMarkdown,
          appId,
        },
        update: { content: legal.termsMarkdown },
      });
      await db.knowledgeSnippet.upsert({
        where: { key_appId: { key: 'privacy_policy', appId } },
        create: {
          key: 'privacy_policy',
          category: 'document',
          content: legal.privacyMarkdown,
          appId,
        },
        update: { content: legal.privacyMarkdown },
      });
    } catch (err) {
      console.warn(
        '[content-generator] Legal doc generation failed (non-fatal):',
        err instanceof Error ? err.message : err,
      );
    }

    // ── 7c–7d. Seed Tasks, then deliver content onto EVERY seeded page ──
    let tasksSeeded = false;
    onProgress?.({
      step: 'seeding_tasks',
      message: 'Seeding Tasks page from AI task list…',
      pct: 90,
    });
    try {
      const { ensureTaskTables, seedTaskTracking, seedTasksFromAi } = await import(
        '@/domain/seed/seed-runner'
      );
      await ensureTaskTables(db);
      const aiTasks = dashboardData?.tasks ?? null;
      if (aiTasks && aiTasks.length > 0) {
        const n = await seedTasksFromAi(
          db as Parameters<typeof seedTasksFromAi>[0],
          aiTasks.map((t) => ({
            title: t.title,
            priority: t.priority,
            ownerCodes: t.ownerCodes,
            dueOffsetDays: t.dueOffsetDays,
            description: t.description,
          })),
        );
        tasksSeeded = n > 0;
        onProgress?.({
          step: 'seeding_tasks',
          message: `Seeded ${n} AI-generated task(s) onto /tasks`,
          pct: 91,
        });
      } else {
        await seedTaskTracking(db as Parameters<typeof seedTaskTracking>[0]);
      }
    } catch (err) {
      console.warn(
        '[content-generator] Task bootstrap failed (non-fatal):',
        err instanceof Error ? err.message : err,
      );
    }

    onProgress?.({
      step: 'saving_home',
      message: 'Delivering generated content to all seeded template pages…',
      pct: 92,
    });

    let pageStatuses: import('@/domain/ai-content/ensure-template-pages').PageContentStatus[] = [];
    try {
      const { deliverContentToSeededPages } = await import(
        '@/domain/ai-content/ensure-template-pages'
      );
      pageStatuses = await deliverContentToSeededPages(db, {
        onProgress,
        source,
        homeHero: dashboardData?.homeHero ?? null,
        executiveSummarySaved: execSummarySaved,
        reviewPartCount: savedParts.length,
        dashboardSaved: Boolean(dashboardData),
        tasksSeeded,
        sheetPages,
      });
    } catch (err) {
      console.warn(
        '[content-generator] Template page delivery failed (non-fatal):',
        err instanceof Error ? err.message : err,
      );
    }

    // ── 7e. Regenerate CMS doc_markdown placeholders (aiRegenerate) ──
    let cmsPlaceholderResults: import('@/domain/ai-content/cms-placeholder-service').CmsPlaceholderUpdateResult[] =
      [];
    try {
      const { applyCmsPlaceholderUpdates } = await import(
        '@/domain/ai-content/cms-placeholder-service'
      );
      cmsPlaceholderResults = await applyCmsPlaceholderUpdates(db, {
        ai,
        tenantSlug: tenant,
        excelData: data,
        additionalContext,
        executiveSummary: content.executiveSummary,
        includeUnmarked: true,
        onProgress: (message, detail) => {
          onProgress?.({
            step: 'saving',
            message,
            pct: 96,
            detail,
          });
        },
      });
    } catch (err) {
      console.warn(
        '[content-generator] CMS placeholder update failed (non-fatal):',
        err instanceof Error ? err.message : err,
      );
    }

    // ── 8. Complete ─────────────────────────────────────
    const updatedPages = pageStatuses.filter((p) => p.status === 'updated' || p.status === 'ready');
    const result: GenerationResult & { saved?: SavedResult; prompt?: string } = {
      success: true,
      prompt,
      content,
      usage: aggregatedUsage,
      saved: {
        businessReviewParts: savedParts,
        executiveSummarySaved: execSummarySaved,
        sheetPages,
        pages: pageStatuses,
        cmsPlaceholders: cmsPlaceholderResults,
      },
    };

    onProgress?.({
      step: 'complete',
      message: `✅ Generation complete via ${content.providerLabel} — ${savedParts.length} review parts + exec summary + ${updatedPages.length}/${pageStatuses.length || updatedPages.length} template page(s)`,
      pct: 100,
      detail: {
        businessReviewParts: savedParts,
        executiveSummarySaved: execSummarySaved,
        sheetPages,
        pages: pageStatuses,
        contentLengths: {
          businessReview: content.businessReview.length,
          executiveSummary: content.executiveSummary.length,
        },
        model: content.model,
        providerId: content.providerId,
        providerLabel: content.providerLabel,
        usage: aggregatedUsage,
      },
    });

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onProgress?.({
      step: 'error',
      message: `❌ Error: ${message}`,
      pct: 0,
      detail: { error: message },
    });
    return {
      success: false,
      error: message,
    };
  }
}
