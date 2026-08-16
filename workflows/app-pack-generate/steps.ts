/**
 * Step functions for the app-pack-generate workflow.
 *
 * Each exported async function with the `'use step'` directive is a durable
 * step: its args and result are serialized to the event log, and it retries
 * before the error bubbles to the workflow.
 */
import { FatalError } from 'workflow';
import {
  decomposePackFromPrompt,
  generateAppDefinition,
  mockDecomposePack,
  mockGenerateAppDefinition,
} from '../../src/domain/app-pack/app-pack-generator';
import {
  compileAppArtifacts,
  type CompiledAppArtifacts,
} from '../../src/domain/app-pack/app-pack-compiler';
import {
  materializeAppPack,
  type MaterializeCounts,
  type MaterializeInput,
} from '../../src/domain/app-pack/app-pack-materializer';
import {
  applyPackSchema,
  type PackSchemaApplyResult,
} from '../../src/domain/app-pack/app-pack-schema-apply';
import type { AppPackAppDefinition, AppPackDecomposition } from '../../src/domain/app-pack/app-pack-schema';
import { writeProgressChunk, closeProgressStream } from './progress';
import type { AppPackGenerateInput, ProgressChunk } from './types';
import { withPgClient, queryRows } from './db';

/** Deterministic fallback pack id if the route didn't supply one. */
export function defaultPackId(prompt: string): string {
  return `pack-${prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'custom'}`;
}

/**
 * Stage 1: decompose the admin's requirement into per-department app briefs.
 * Deterministic in mock mode.
 */
export async function decomposePackStep(
  input: AppPackGenerateInput,
): Promise<AppPackDecomposition> {
  'use step';
  if (input.mock) {
    return mockDecomposePack();
  }
  // Knowledge grounding is loaded separately (loadKnowledgeBaseStep); the
  // generator call is wrapped so step retries are safe.
  const decomposition = await decomposePackFromPrompt(input.prompt, input.tenantSlug);
  if (!decomposition.apps.length) {
    throw new FatalError('AI decomposition returned zero apps — please rephrase the requirement.');
  }
  return decomposition;
}

/** Load knowledge snippets from the tenant DB to ground the generation. */
export async function loadKnowledgeBaseStep(dbUrl: string): Promise<string> {
  'use step';
  try {
    return await withPgClient(dbUrl, async (db) => {
      const rows = await queryRows<{ key: string; content: string; category: string }>(
        db,
        `SELECT key, content, category FROM knowledge_snippets ORDER BY category, key LIMIT 200;`,
      );
      if (!rows.length) return '';
      return rows
        .map((r) => `[${r.category}] ${r.key}:\n${r.content.slice(0, 2000)}`)
        .join('\n\n---\n\n');
    });
  } catch {
    // Knowledge grounding is best-effort; generation still works without it.
    return '';
  }
}

/**
 * Stage 2: generate the full definition of one app (W3 schema, models, use
 * cases, pages, nav, UX workflow, knowledge snippets). CEO Overview (last
 * brief) gets the decomposition's purpose + cross-department KPIs.
 */
export async function generateAppStep(
  input: AppPackGenerateInput,
  decomposition: AppPackDecomposition,
  knowledgeBase: string,
  index: number,
): Promise<AppPackAppDefinition> {
  'use step';
  const b = decomposition.apps[index];
  if (!b) {
    throw new FatalError(`App brief at index ${index} missing from decomposition.`);
  }
  const isCeo = index === decomposition.apps.length - 1;
  if (input.mock) {
    return mockGenerateAppDefinition(b);
  }
  return generateAppDefinition(
    b,
    isCeo ? decomposition.ceoOverview.purpose : '',
    isCeo ? decomposition.ceoOverview.kpis : [],
    decomposition.apps,
    input.tenantSlug,
    knowledgeBase,
  );
}

/** Stage 3: deterministic compilation of definitions → artifacts + DB rows. */
export async function compileAppPackStep(
  decomposition: AppPackDecomposition,
  definitions: AppPackAppDefinition[],
): Promise<CompiledAppArtifacts[]> {
  'use step';
  return definitions.map((def) => compileAppArtifacts(def));
}

/** Stage 4: persist pages/nav/snippets/security groups into the tenant DB. */
export async function materializeAppPackStep(
  input: AppPackGenerateInput,
  decomposition: AppPackDecomposition,
  definitions: AppPackAppDefinition[],
  artifacts: CompiledAppArtifacts[],
): Promise<MaterializeCounts> {
  'use step';
  const packId = input.packId ?? defaultPackId(input.prompt);
  const materializeInput: MaterializeInput = {
    packId,
    tenantSlug: input.tenantSlug,
    decomposition,
    apps: artifacts,
    definitions,
  };
  return withPgClient(input.dbUrl, (db) => materializeAppPack(db, materializeInput));
}

/**
 * Stage 5: apply the pack's consolidated ZenStack schema to the tenant DB so
 * the generated models become real tables (additive DDL — never drops data).
 */
export async function applyPackSchemaStep(
  input: AppPackGenerateInput,
  definitions: AppPackAppDefinition[],
): Promise<PackSchemaApplyResult> {
  'use step';
  return withPgClient(input.dbUrl, (db) => applyPackSchema(db, definitions));
}

/** Emit one progress chunk from a step context. */
export async function emitProgressStep(
  writable: WritableStream<ProgressChunk | string>,
  chunk: ProgressChunk,
): Promise<void> {
  'use step';
  await writeProgressChunk(writable, chunk);
}

export async function closeProgressStep(
  writable: WritableStream<ProgressChunk | string>,
): Promise<void> {
  'use step';
  await closeProgressStream(writable);
}
