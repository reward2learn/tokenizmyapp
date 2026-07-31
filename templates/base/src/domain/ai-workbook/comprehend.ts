/**
 * Workbook Comprehension — bundle-lean OpenAI call
 *
 * This module contains ONLY the comprehension request path: Zod schemas,
 * prompt building (hints-aware), a single-attempt OpenAI call with typed
 * errors, and response parsing.
 *
 * Bundle constraints:
 *   - NO application aliases (`@/...`) — only `zod` + relative imports.
 *   - No DB / secrets / Prisma — the API key is passed in explicitly.
 *   - Safe to bundle into Vercel Workflow step bundles (workflows/*).
 *
 * The sync pipeline wrapper (`comprehendWorkbook` in workbook-comprehension.ts)
 * keeps its own key resolution + 2-attempt retry loop for the non-workflow
 * path; this module is the shared single-attempt core.
 */
import { z } from 'zod';
import type { RenderedSheet } from './extract-sheets';
import { SHEET_CATEGORIES } from './extract-sheets';
import type { AnalysisHints } from './sheet-analysis';

// ── Zod validation schema for the AI structured output ─────────────

export const MetricSchema = z.object({
  /** Period in YYYY-MM (annual totals may use YYYY-12). */
  period: z.string().regex(/^\d{4}-\d{2}$/),
  dataType: z.enum(['actual', 'forecast']),
  scenario: z.enum(['actual', 'conservative', 'realistic', 'aspirational']),
  revenue: z.number().nullable().optional(),
  ebitda: z.number().nullable().optional(),
  netIncome: z.number().nullable().optional(),
  guests: z.number().nullable().optional(),
  staffCost: z.number().nullable().optional(),
});
export type AiMetric = z.infer<typeof MetricSchema>;

export const SheetComprehensionSchema = z.object({
  /** Exact tab name as it appears in the workbook. */
  tabName: z.string(),
  category: z.enum(SHEET_CATEGORIES),
  /** Human-readable title for the dynamic page. */
  title: z.string(),
  /** One-paragraph comprehension of what this sheet contains. */
  summary: z.string(),
  /** Detected period, e.g. "June 2026" — null when not detectable. */
  periodHint: z.string().nullable().optional(),
  /** Column headers (first meaningful row). */
  columns: z.array(z.string()).optional(),
  rowCount: z.number().int().nonnegative().optional(),
  /** Per-period metrics found on THIS sheet. */
  metrics: z.array(MetricSchema).optional(),
});
export type AiSheetComprehension = z.infer<typeof SheetComprehensionSchema>;

export const WorkbookComprehensionSchema = z.object({
  workbook: z.object({
    title: z.string(),
    company: z.string().nullable().optional(),
    period: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    summary: z.string(),
  }),
  sheets: z.array(SheetComprehensionSchema),
  /**
   * Normalized financial projections consolidated across ALL sheets.
   * This is the source for the financial_projections table.
   */
  projections: z.array(MetricSchema),
  /**
   * Template suggestion from the available template catalog
   * (TEMPLATE_CATALOG ids, e.g. "financial-analytics", "restaurant").
   */
  template: z
    .object({
      id: z.string(),
      confidence: z.number().min(0).max(1).optional(),
      reason: z.string().optional(),
    })
    .optional(),
});
export type WorkbookComprehension = z.infer<typeof WorkbookComprehensionSchema>;

export interface ComprehensionResult {
  comprehension: WorkbookComprehension;
  model: string;
  promptLength: number;
}

// ── Typed errors (mapped to the workflow retry policy by the caller) ─

export class ComprehendError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ComprehendError';
  }
}

/** HTTP-level failure (non-2xx). Carries status + optional Retry-After. */
export class ComprehendHttpError extends ComprehendError {
  readonly status: number;
  /** Retry-After header value in seconds, when present. */
  readonly retryAfterSeconds: number | null;

  constructor(status: number, message: string, retryAfterSeconds: number | null = null) {
    super(message);
    this.name = 'ComprehendHttpError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Response could not be parsed/validated (JSON or Zod). */
export class ComprehendValidationError extends ComprehendError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ComprehendValidationError';
  }
}

// ── Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  'You are a precise financial analyst and workbook interpreter. ' +
  'You read raw spreadsheet dumps and return ONLY valid JSON matching the requested schema exactly. ' +
  'Never invent data that is not present in the sheets — leave metrics null when absent.';

/** Render the deterministic ANALYZE hints as a prompt section. */
function renderHintsSection(hints: AnalysisHints): string {
  const wb = hints.workbook;
  const lines: string[] = [
    `- Workbook: ${wb.sheetCount} sheet(s), ${wb.totalRows} total rows, ` +
      `${Math.round(wb.overallNumericRatio * 100)}% numeric cells.`,
  ];
  if (wb.currencyGuess) lines.push(`- Currency guess: ${wb.currencyGuess}`);
  if (wb.periodGuess) lines.push(`- Period guess: ${wb.periodGuess}`);
  for (const s of hints.sheets) {
    const parts = [
      `"${s.tabName}": ${s.rowCount} rows × ${s.colCount} cols, ` +
        `${Math.round(s.numericRatio * 100)}% numeric`,
    ];
    if (s.currencyHints.length > 0) parts.push(`currency [${s.currencyHints.join(',')}]`);
    if (s.periodHints.length > 0) parts.push(`periods [${s.periodHints.join(', ')}]`);
    if (s.labelHints.length > 0) parts.push(`labels [${s.labelHints.join(', ')}]`);
    if (s.likelyCategory) parts.push(`category-guess ${s.likelyCategory}`);
    lines.push(`  - Sheet ${parts.join('; ')}`);
  }
  return lines.join('\n');
}

export function buildComprehensionPrompt(
  blocks: RenderedSheet[],
  hints?: AnalysisHints,
): string {
  const sheetBlocks = blocks
    .map(
      (b) =>
        `===== SHEET: ${b.tabName} =====\n${b.text}\n`,
    )
    .join('\n');

  const hintsSection = hints
    ? `DETERMINISTIC PRE-ANALYSIS (generated by code — use as strong priors, but ALWAYS verify against the actual dump; category-guess is not authoritative):
${renderHintsSection(hints)}

`
    : '';

  return `Analyze the following workbook. Every sheet of the workbook is dumped below as "R<row>: <cells>".

TASKS:
1. Understand the workbook as a whole (company, period, currency, purpose).
2. For EACH sheet: identify its category, a human-readable title, a short comprehension summary, detected period (e.g. "June 2026"), column headers, row count, and any per-period financial metrics (revenue, EBITDA, net income, guests, staff cost) you can read from the sheet.
3. Consolidate ALL period-level financial data across the whole workbook into a single "projections" array: one entry per (period YYYY-MM, dataType actual|forecast, scenario actual|conservative|realistic|aspirational). Use the best source for each period (e.g. a P&L statement for actuals, a BEP table or budget sheet for forecasts). Annual totals use YYYY-12. Only include entries where at least one metric is present.
4. Suggest the most appropriate app template id from this available catalog: financial-analytics, restaurant, hotel, education, ecommerce-retail, healthcare, manufacturing, professional-services, real-estate, supply-chain (confidence 0..1).

RULES:
- periods: YYYY-MM only (e.g. "2026-06", "2025-12" for annual).
- dataType "actual" for reported/actual figures, "forecast" for projections/budgets.
- scenario: "actual" for actuals; "conservative" for base forecasts; "realistic"/"aspirational" when the sheet explicitly labels scenarios.
- Amounts are full IDR integers (no "K" shorthand). Round to integers.
- Leave a metric null when the sheet does not contain it for that period.
- category must be one of: ${SHEET_CATEGORIES.join(', ')}.

${hintsSection}WORKBOOK DUMP:
${sheetBlocks}`;
}

export function stripCodeFence(reply: string): string {
  const match = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1]! : reply;
}

// ── Single-attempt OpenAI call ──────────────────────────────────────

export interface ComprehendOptions {
  model?: string;
  /** Deterministic pre-analysis hints injected into the prompt. */
  hints?: AnalysisHints;
  /** OpenAI API key (resolved by the caller — no DB access here). */
  apiKey: string;
  /** Override the API base URL (defaults to OpenAI). */
  baseUrl?: string;
}

/**
 * ONE OpenAI call to comprehend the workbook. No retry loop — the caller
 * (sync pipeline or workflow step) owns retry policy.
 *
 * Throws:
 *   - ComprehendHttpError (status 429 carries retryAfterSeconds)
 *   - ComprehendValidationError (bad JSON / Zod rejection)
 *   - ComprehendError (network etc. — wrapped from fetch failures)
 */
export async function comprehendOnce(
  blocks: RenderedSheet[],
  options: ComprehendOptions,
): Promise<ComprehensionResult> {
  const { model = 'gpt-4o', hints, apiKey, baseUrl = 'https://api.openai.com/v1' } = options;
  if (blocks.length === 0) {
    throw new ComprehendValidationError('Workbook contains no readable sheets');
  }

  const prompt = buildComprehensionPrompt(blocks, hints);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 16384,
        response_format: { type: 'json_object' },
      }),
    });
  } catch (err) {
    throw new ComprehendError(
      `OpenAI request failed: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'Unknown error');
    let retryAfterSeconds: number | null = null;
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
      const parsed = Number(retryAfter);
      if (Number.isFinite(parsed) && parsed >= 0) retryAfterSeconds = parsed;
    }
    throw new ComprehendHttpError(
      response.status,
      `OpenAI API error (${response.status}): ${errBody}`,
      retryAfterSeconds,
    );
  }

  let result: { choices?: Array<{ message?: { content?: string } }> };
  try {
    result = (await response.json()) as typeof result;
  } catch (err) {
    throw new ComprehendValidationError(
      `OpenAI response was not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const reply: string = result.choices?.[0]?.message?.content ?? '';

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(reply));
  } catch {
    throw new ComprehendValidationError('AI response was not valid JSON: ' + reply.slice(0, 500));
  }

  let comprehension: WorkbookComprehension;
  try {
    comprehension = WorkbookComprehensionSchema.parse(parsed);
  } catch (err) {
    const first = err instanceof z.ZodError ? err.issues[0] : null;
    const detail = first
      ? `${first.path.join('.') || 'root'}: ${first.message}`
      : String(err);
    throw new ComprehendValidationError(`AI response failed schema validation: ${detail}`, {
      cause: err,
    });
  }

  return { comprehension, model, promptLength: prompt.length };
}
