/**
 * App Pack Generate Workflow — Vercel Workflow SDK orchestrator.
 *
 * Derives a complete application pack from a single admin prompt:
 *
 *   Stage 1  — DECOMPOSE   requirement → per-department app briefs (+ CEO)
 *   Stage 2  — GENERATE    each brief → full app definition (W3 schema,
 *                          ZenStack models, use cases, pages, nav, UX
 *                          workflow, knowledge snippets) via OpenAI
 *   Stage 3  — COMPILE     definitions → zmodel + page catalog + DB rows
 *   Stage 4  — MATERIALIZE persist pages/nav/snippets/security groups into
 *                          the tenant DB
 *
 * Progress is streamed via getWritable() → SSE route.
 */
import { getWritable } from 'workflow';
import {
  decomposePackStep,
  loadKnowledgeBaseStep,
  generateAppStep,
  compileAppPackStep,
  materializeAppPackStep,
  emitProgressStep,
  closeProgressStep,
  defaultPackId,
} from './steps';
import type { AppPackGenerateInput, AppPackGenerateResult, ProgressChunk } from './types';

export async function handleAppPackGenerate(
  input: AppPackGenerateInput,
): Promise<AppPackGenerateResult> {
  'use workflow';

  const writable = getWritable<ProgressChunk>();
  const packId = input.packId ?? defaultPackId(input.prompt);
  const model = input.model ?? 'gpt-5.5';
  const name = input.name ?? packId;
  const mode = input.mock ? 'mock' : 'ai';

  await emitProgressStep(writable, {
    step: 'started',
    message: `App pack generation started — "${name}" (${mode}, model ${model}).`,
    pct: 2,
  });

  // ── 1. DECOMPOSE ──────────────────────────────────────────
  const decomposition = await decomposePackStep(input);

  await emitProgressStep(writable, {
    step: 'decomposing',
    message: `Decomposed requirement into ${decomposition.apps.length} app(s): ` +
      decomposition.apps.map((a) => a.name).join(', ') + '.',
    pct: 15,
    detail: {
      apps: decomposition.apps.map((a) => ({ id: a.id, name: a.name, department: a.department })),
      ceoKpis: decomposition.ceoOverview.kpis,
    },
  });

  // ── 1b. KNOWLEDGE GROUNDING (best-effort) ─────────────────
  const knowledgeBase = await loadKnowledgeBaseStep(input.dbUrl);

  // ── 2. GENERATE each app definition ───────────────────────
  const definitions = [];
  for (let i = 0; i < decomposition.apps.length; i++) {
    const def = await generateAppStep(input, decomposition, knowledgeBase, i);
    definitions.push(def);
    await emitProgressStep(writable, {
      step: 'generating',
      message: `Generated "${def.appName}" — ${def.models.length} model(s), ` +
        `${def.useCases.length} use case(s), ${def.pages.length} page(s), ` +
        `${def.knowledgeSnippets.length} knowledge snippet(s).`,
      pct: 25 + Math.round(((i + 1) / decomposition.apps.length) * 55),
      detail: {
        appId: def.appId,
        models: def.models.map((m) => m.name),
        w3cStandard: def.w3cStandard,
      },
    });
  }

  // ── 3. COMPILE ────────────────────────────────────────────
  const artifacts = await compileAppPackStep(decomposition, definitions);

  // ── 4. MATERIALIZE ────────────────────────────────────────
  const counts = await materializeAppPackStep(input, decomposition, definitions, artifacts);

  await emitProgressStep(writable, {
    step: 'materializing',
    message: `Materialized ${counts.apps} app(s) — ${counts.pages} pages, ` +
      `${counts.sections} sections, ${counts.nav} nav items, ` +
      `${counts.snippets} knowledge snippets, ${counts.groups} security group(s).`,
    pct: 96,
    detail: { counts },
  });

  await closeProgressStep(writable);

  return {
    stage: 'complete',
    packId,
    name,
    tenantSlug: input.tenantSlug,
    mock: !!input.mock,
    model,
    ceoPurpose: decomposition.ceoOverview.purpose,
    ceoKpis: decomposition.ceoOverview.kpis,
    apps: definitions.map((def) => ({
      appId: def.appId,
      appName: def.appName,
      department: def.department,
      w3cStandard: def.w3cStandard,
      models: def.models.length,
      useCases: def.useCases.length,
      pages: def.pages.length,
      knowledgeSnippets: def.knowledgeSnippets.length,
      uxStages: def.uxWorkflow.length,
    })),
    counts,
    zmodel: artifacts.map((a) => a.zmodel).join('\n\n'),
  };
}
