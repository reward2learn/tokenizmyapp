/**
 * AI Workbook Comprehension — sync pipeline entrypoint.
 *
 * Re-exports the bundle-lean comprehension core (schemas, prompt, single-attempt
 * OpenAI call) from ./comprehend and keeps the sync-only wrapper
 * `comprehendWorkbook` with its own key resolution (DB secrets → env) and
 * 2-attempt retry loop.
 *
 * The workflow pipeline (workflows/workbook-ingest) imports from ./comprehend
 * DIRECTLY to keep step bundles free of the DB/Prisma graph — do not add
 * `@/`-alias imports to the workflow-reachable path.
 */
import { resolveOpenAiKey } from '@/lib/openai';
import { renderAllSheetsForAi } from './extract-sheets';
import {
  comprehendOnce,
  type AiMetric,
  type AiSheetComprehension,
  type ComprehensionResult,
  type WorkbookComprehension,
} from './comprehend';

export { SHEET_CATEGORIES, renderAllSheetsForAi, renderSheetForAi } from './extract-sheets';
export type { AiSheetCategory, RenderedSheet } from './extract-sheets';
export {
  MetricSchema,
  SheetComprehensionSchema,
  WorkbookComprehensionSchema,
  comprehendOnce,
  buildComprehensionPrompt,
  stripCodeFence,
  ComprehendError,
  ComprehendHttpError,
  ComprehendValidationError,
  type ComprehensionResult,
  type ComprehendOptions,
} from './comprehend';
export type { AiMetric, AiSheetComprehension, WorkbookComprehension };

/**
 * Call OpenAI to comprehend the workbook (sync path — 2 attempts).
 * Throws on failure (caller decides fallback).
 */
export async function comprehendWorkbook(
  buffers: Uint8Array[],
  model = 'gpt-4o',
): Promise<ComprehensionResult> {
  const apiKey = await resolveOpenAiKey();
  if (!apiKey) {
    throw new Error(
      'OpenAI API key not configured. Set it in Config > OpenAI Key or via OPENAI_API_KEY env var.',
    );
  }

  const blocks = buffers.flatMap((buf) => renderAllSheetsForAi(buf));

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await comprehendOnce(blocks, { model, apiKey });
    } catch (err) {
      lastError = err;
      if (attempt === 2) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
