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
 *
 * Reports progress at each stage via an optional callback so callers can
 * surface real-time status (SSE, progress bars, notifications).
 *
 * This eliminates the need for manual Markdown file uploads.
 */

import { extractExcelData, extractExcelDataFromBuffers } from '@/domain/excel/excel-extractor';
import { buildGenerationPrompt, buildDashboardPrompt } from '@/domain/ai-content/prompt-builder';
import { resolveActiveAiConfig, type ActiveAiConfig } from '@/lib/ai-providers';
import type { DbClient } from '@/lib/db';
import { withTimeout } from '@/lib/with-timeout';
import { getCurrentAppId } from '@shared/lib/config/tenant';
import { parseReviewParts } from '@/domain/ai-content/parse-review-parts';
import type { ReviewPart } from '@/domain/ai-content/parse-review-parts';

// ── Progress reporting ──────────────────────────────────

export type ProgressStep =
  | 'extracting'
  | 'prompt'
  | 'openai'
  | 'parsing'
  | 'saving'
  | 'saving_exec'
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
}

export interface SavedResult {
  businessReviewParts: { slug: string; title: string }[];
  executiveSummarySaved: boolean;
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
  onProgress?: ProgressCallback,
): Promise<string> {
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

  return parsed[documentType] ?? '';
}

interface DashboardData {
  actionPhases: unknown;
  targetRows: unknown;
  levers: unknown;
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
): Promise<DashboardData | null> {
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
          content: 'You are a precise financial analyst. You ALWAYS return only valid JSON with exactly the keys requested. Return ONLY a JSON object with keys "actionPhases", "targetRows", and "levers".',
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

  const parsed = JSON.parse(reply);
  if (!parsed.actionPhases || !parsed.targetRows || !parsed.levers) return null;
  return parsed as DashboardData;
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
 */
export async function generateAndSave(
  db: DbClient,
  onProgress?: ProgressCallback,
  source?: string | Buffer | Buffer[],
  model?: string,
  additionalContext?: string,
  overridePrompt?: string,
): Promise<GenerationResult & { saved?: SavedResult; prompt?: string }> {
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

    // ── 2. Build prompt ─────────────────────────────────
    onProgress?.({
      step: 'prompt',
      message: 'Building comprehensive AI prompt from financial data...',
      pct: 20,
    });

    const prompt = overridePrompt ?? buildGenerationPrompt(data, additionalContext);
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

    // ── 4. Call AI for all three documents CONCURRENTLY ──
    // These three prompts are fully independent (none depends on another's
    // output), so running them sequentially inside one serverless function
    // just sums three ~30-90s calls — comfortably enough to blow past the
    // route's 120s maxDuration on a live deploy (seen in production as a
    // Vercel FUNCTION_INVOCATION_TIMEOUT). Firing them together bounds wall
    // clock to the slowest single call instead of the sum of all three.
    onProgress?.({
      step: 'openai',
      message: `Generating Business Review, Executive Summary, and Dashboard data concurrently via ${ai.provider.label}...`,
      pct: 40,
    });

    const dashboardPromise = generateDashboardData(data, additionalContext, ai)
      .catch((err) => {
        // Non-critical — dashboard just shows hardcoded fallbacks if this fails.
        console.error('[content-generator] Dashboard data generation failed:', err);
        return null;
      });

    const [businessReview, executiveSummary] = await Promise.all([
      callAiProviderForDocument(prompt, ai, 'businessReview', onProgress),
      callAiProviderForDocument(prompt, ai, 'executiveSummary', onProgress),
    ]);

    const content: AiGeneratedContent = {
      businessReview,
      executiveSummary,
      promptLength: prompt.length,
      responseLength: businessReview.length + executiveSummary.length,
      model: ai.model,
      providerId: ai.provider.id,
      providerLabel: ai.provider.label,
    };

    const dashboardData = await dashboardPromise;
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

    // ── 8. Complete ─────────────────────────────────────
    const result: GenerationResult & { saved?: SavedResult; prompt?: string } = {
      success: true,
      prompt,
      content,
      saved: {
        businessReviewParts: savedParts,
        executiveSummarySaved: execSummarySaved,
      },
    };

    onProgress?.({
      step: 'complete',
      message: `✅ Generation complete via ${content.providerLabel} — ${savedParts.length} review parts + executive summary saved to database`,
      pct: 100,
      detail: {
        businessReviewParts: savedParts,
        executiveSummarySaved: execSummarySaved,
        contentLengths: {
          businessReview: content.businessReview.length,
          executiveSummary: content.executiveSummary.length,
        },
        model: content.model,
        providerId: content.providerId,
        providerLabel: content.providerLabel,
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
