/**
 * Shared types for the workbook-ingest workflow.
 *
 * These are type-only (erased at compile time) — safe to share between the
 * workflow orchestrator, steps, and the route layer without serialization
 * concerns.
 */
import type { AnalysisHints, SheetHints } from '../../src/domain/ai-workbook/sheet-analysis';
import type { RenderedSheet } from '../../src/domain/ai-workbook/extract-sheets';
import type { WorkbookComprehension } from '../../src/domain/ai-workbook/comprehend';

/** One uploaded workbook file, as received by the API route. */
export interface WorkbookFileInput {
  name: string;
  /** Raw file bytes (xlsx). Uint8Array is serializable across the workflow boundary. */
  data: Uint8Array;
  /** Original byte size (defensive metadata). */
  size: number;
}

export interface WorkbookIngestInput {
  files: WorkbookFileInput[];
  /** OpenAI model for the COMPREHEND step. */
  model?: string;
  /** When true, skips the final AI content-generation stage. */
  skipContentGeneration?: boolean;
  /** OpenAI API key — resolved by the route from DB secrets (Config > OpenAI Key) or left undefined for env fallback. */
  openaiApiKey?: string | null;
  /** Database connection string for the target tenant (resolved by the route from tenants.db_url or root POSTGRES_URL). */
  dbUrl: string;
}

/** Progress chunk written to the run's writable stream (SSE payloads). */
export interface ProgressChunk {
  step: string;
  message: string;
  pct: number;
  detail?: Record<string, unknown>;
}

/**
 * Stage result of the workflow run.
 *
 * Phases extend the union as they land:
 *   Phase 1: 'analyzed' (EXTRACT + ANALYZE)
 *   Phase 2: 'comprehended' (COMPREHEND — OpenAI)
 *   Phase 3+: 'populated', 'generated', 'complete'
 */
export type WorkbookIngestStage = 'analyzed' | 'comprehended' | 'populated' | 'complete';

export interface WorkbookIngestResult {
  stage: WorkbookIngestStage;
  /** Human-readable summary of what the run did. */
  message: string;
  /** Number of sheets extracted across all files. */
  sheetCount: number;
  /** Deterministic analysis hints (pre-pass). */
  hints: AnalysisHints;
  /** Extracted sheet texts (EXTRACT output, for the COMPREHEND step). */
  sheets: RenderedSheet[];
  /** AI comprehension (present when stage >= 'comprehended'). */
  comprehension?: WorkbookComprehension;
  /** OpenAI model used for comprehension. */
  model?: string;
  /** Number of financial projections upserted. */
  projectionsCount?: number;
  /** List of app pages created/updated. */
  pagesCreated?: Array<{ slug: string; title: string }>;
  /** Template fit from scoring (§5.5). */
  templateFit?: { recommended: string; aiSuggestion: string | null; aiConfidence: number; score: number; reason: string; alternatives: Array<{ id: string; score: number }> };
  /** Whether AI content generation (BR/ES/Dashboard) was produced. */
  contentGenerated?: boolean;
  /** Number of Business Review parts generated. */
  brParts?: number;
  /** Whether the Executive Summary was saved. */
  esSaved?: boolean;
  /** Whether Dashboard Data was saved. */
  dashboardSaved?: boolean;
}

export type { AnalysisHints, SheetHints, RenderedSheet, WorkbookComprehension };
