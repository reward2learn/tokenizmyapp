/**
 * Workbook Ingest Workflow — Vercel Workflow SDK orchestrator.
 *
 * Durable replacement for the synchronous AI workbook pipeline
 * (src/domain/ai-workbook/pipeline.ts). Phases:
 *
 *   Phase 1 (this file)  — LOAD → EXTRACT → ANALYZE
 *   Phase 2              — COMPREHEND (OpenAI step)          [roadmap P2]
 *   Phase 3              — POPULATE (projections/pages)      [roadmap P3]
 *   Phase 4              — GENERATE (BR/ES/Dashboard)        [roadmap P5]
 *
 * Progress is streamed via getWritable() → SSE route (Phase 4).
 */
import { sleep, getWritable } from 'workflow';
import {
  loadWorkbookStep,
  extractSheetsStep,
  analyzeSheetsStep,
  comprehendWorkbookStep,
  selectTemplateStep,
  populateProjectionsStep,
  upsertSheetPagesStep,
  registerDynamicPagesStep,
  saveSnippetsStep,
  generateBusinessReviewStep,
  generateExecutiveSummaryStep,
  generateDashboardStep,
  emitProgressStep,
  closeProgressStep,
} from './steps';
import type { ProgressChunk, WorkbookIngestInput, WorkbookIngestResult } from './types';

export async function handleWorkbookIngest(
  input: WorkbookIngestInput,
): Promise<WorkbookIngestResult> {
  'use workflow';

  const writable = getWritable<ProgressChunk>();
  const model = input.model ?? 'gpt-4o';
  const dbUrl = input.dbUrl;

  const started: ProgressChunk = {
    step: 'started',
    message: `Workbook ingest started — ${input.files.length} file(s), model ${model}`,
    pct: 0,
  };
  await emitProgressStep(writable, started);

  // ── 1. LOAD ────────────────────────────────────────────────
  const buffers = await loadWorkbookStep(input.files);

  await emitProgressStep(writable, {
    step: 'loading',
    message: `Loaded ${buffers.length} file(s) — validating .xlsx contents…`,
    pct: 15,
  });

  // ── 2. EXTRACT ─────────────────────────────────────────────
  const sheets = await extractSheetsStep(buffers);

  await emitProgressStep(writable, {
    step: 'extracting',
    message: `Extracted ${sheets.length} sheet(s) across ${buffers.length} file(s).`,
    pct: 45,
    detail: {
      sheets: sheets.length,
      tabNames: sheets.map((s) => s.tabName),
    },
  });

  // ── 3. ANALYZE (deterministic pre-pass) ────────────────────
  const hints = await analyzeSheetsStep(sheets);

  await emitProgressStep(writable, {
    step: 'analyzing',
    message: `Analyzed ${hints.sheets.length} sheet(s) — ${hints.workbook.totalRows} rows, ` +
      `${Math.round(hints.workbook.overallNumericRatio * 100)}% numeric, ` +
      `currency ${hints.workbook.currencyGuess ?? 'unknown'}, ` +
      `period ${hints.workbook.periodGuess ?? 'unknown'}.`,
    pct: 70,
    detail: {
      totalRows: hints.workbook.totalRows,
      overallNumericRatio: hints.workbook.overallNumericRatio,
      currencyGuess: hints.workbook.currencyGuess,
      periodGuess: hints.workbook.periodGuess,
    },
  });

  // ── 4. COMPREHEND (OpenAI, hints-injected prompt) ──────────
  const comprehension = await comprehendWorkbookStep(sheets, hints, model, input.openaiApiKey);

  await emitProgressStep(writable, {
    step: 'comprehending',
    message: `Comprehended ${comprehension.comprehension.sheets.length} sheet(s) — ` +
      `${comprehension.comprehension.projections.length} projections, ` +
      `template "${comprehension.comprehension.template?.id ?? 'none'}" (${model}).`,
    pct: 90,
    detail: {
      sheets: comprehension.comprehension.sheets.length,
      projections: comprehension.comprehension.projections.length,
      template: comprehension.comprehension.template?.id ?? null,
    },
  });

  // ── 4b. SELECT TEMPLATE (deterministic fit scoring, §5.5) ──────
  const templateFit = await selectTemplateStep(comprehension.comprehension);

  await emitProgressStep(writable, {
    step: 'populating',
    message: `Populating ${comprehension.comprehension.projections.length} projections into DB…`,
    pct: 92,
    detail: { projectionsCount: comprehension.comprehension.projections.length },
  });

  // ── 5. POPULATE PROJECTIONS ────────────────────────────────────
  const projectionsCount = await populateProjectionsStep(comprehension.comprehension, dbUrl);

  // ── 6. UPSERT SHEET PAGES (with §7.1 orphan fix) ───────────────
  const pagesCreated = await upsertSheetPagesStep(comprehension.comprehension, dbUrl);

  // ── 7. REGISTER DYNAMIC PAGES (best-effort runtime catalog) ────
  const pagesRegistered = await registerDynamicPagesStep(comprehension.comprehension);

  // ── 8. SAVE KNOWLEDGE SNIPPETS ─────────────────────────────────
  const snippetsCount = await saveSnippetsStep(comprehension.comprehension, model, dbUrl);

  // ── 9. GENERATE content (AI → BR / ES / Dashboard) ────────
  const apiKey = input.openaiApiKey || process.env.OPENAI_API_KEY;
  let brParts = 0;
  let esSaved = false;
  let dashboardSaved = false;

  if (apiKey && !input.skipContentGeneration) {
    await emitProgressStep(writable, {
      step: 'generating',
      message: 'Generating AI content (Business Review → Executive Summary → Dashboard Data)...',
      pct: 95,
    });

    brParts = await generateBusinessReviewStep(comprehension.comprehension, apiKey, dbUrl, model);
    await sleep('1s');

    esSaved = await generateExecutiveSummaryStep(comprehension.comprehension, apiKey, dbUrl, model);
    await sleep('1s');

    dashboardSaved = await generateDashboardStep(comprehension.comprehension, apiKey, dbUrl, model);
  }

  const contentGenerated = brParts > 0 || esSaved || dashboardSaved;

  await emitProgressStep(writable, {
    step: 'complete',
    message:
      `Workbook ingest complete — ${projectionsCount} projections, ${pagesCreated.length} sheet pages, ` +
      `${snippetsCount} snippets, content generated: ${contentGenerated}. ` +
      `Template: ${templateFit.recommended} (score ${templateFit.score}).`,
    pct: 100,
    detail: {
      projectionsCount,
      pagesCreated: pagesCreated.length,
      pagesRegistered,
      snippetsCount,
      contentGenerated,
      brParts,
      esSaved,
      dashboardSaved,
      template: templateFit.recommended,
      templateScore: templateFit.score,
    },
  });

  await closeProgressStep(writable);

  return {
    stage: 'complete',
    message:
      `Extracted ${sheets.length} sheet(s) from ${buffers.length} file(s), ` +
      `comprehended with ${model}, ` +
      `populated ${projectionsCount} projections + ${pagesCreated.length} sheet pages, ` +
      `content generated: ${contentGenerated} ` +
      `(template ${templateFit.recommended}).`,
    sheetCount: sheets.length,
    hints,
    sheets: sheets.map(({ tabName, text }) => ({ tabName, text })),
    comprehension: comprehension.comprehension,
    model,
    projectionsCount,
    pagesCreated,
    templateFit,
    contentGenerated,
    brParts,
    esSaved,
    dashboardSaved,
  };
}
