/**
 * Regenerate one slice of knowledge_snippets.dashboard_data from the CMS
 * block settings drawer — without re-running the full Generate Content pipeline.
 *
 * Slices map to data-backed CMS blocks:
 *   actionPhases → action_checklist
 *   levers       → lever_accordion
 *   targetRows   → metric_grid
 */

import { extractExcelData, type ExcelData } from '@/domain/excel/excel-extractor';
import { buildDashboardPrompt } from '@/domain/ai-content/prompt-builder';
import { meterAiUsage } from '@/domain/billing/credit-service';
import { toAiUsageSummary, type AiUsageSummary } from '@/lib/billing/ai-usage-summary';
import type { ActiveAiConfig } from '@/lib/ai-providers';
import { resolveChatCompletionsUrl } from '@/lib/ai-providers';
import type { DbClient } from '@/lib/db';
import { findCachedWorkbook } from '@/lib/workbook-cache';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { getAssistantProfile } from '@shared/lib/config/template-profile';
import {
  DASHBOARD_SLICES,
  BLOCK_TO_DASHBOARD_SLICE,
  type DashboardSliceKey,
} from '@/lib/dashboard-slices';

export { DASHBOARD_SLICES, BLOCK_TO_DASHBOARD_SLICE, type DashboardSliceKey };

export interface DashboardDataDocument {
  actionPhases: unknown[];
  targetRows: unknown[];
  levers: unknown[];
  homeHero?: unknown;
  tasks?: unknown;
}

async function resolveWorkbookForSlice(db: DbClient): Promise<ExcelData> {
  const cached = await findCachedWorkbook(db);
  if (cached?.content) {
    return extractExcelData(Buffer.from(cached.content, 'base64'));
  }
  try {
    return extractExcelData();
  } catch {
    throw new Error(
      'Workbook not found. Upload a workbook via Config → Upload & Seed before regenerating dashboard content.',
    );
  }
}

function sliceInstructions(slice: DashboardSliceKey): string {
  const profile = getAssistantProfile();
  const metrics =
    profile.keyMetrics.length > 0
      ? profile.keyMetrics.join(', ')
      : 'revenue, costs, margin, volume';

  switch (slice) {
    case 'actionPhases':
      // TODO(you): tune phase themes / count for your industry — this shapes every
      // "Regenerate action plan" click from the CMS block drawer.
      return [
        `Return ONLY JSON: { "actionPhases": [ ... ] }.`,
        `Exactly 3 phases. Each: id ("P1"|"P2"|"P3"), title, period, impact, actions (string array of 4–8 concrete steps).`,
        `Themes: stabilise → grow → scale. Ground every number in the source data (${profile.currency}).`,
      ].join('\n');
    case 'levers':
      return [
        `Return ONLY JSON: { "levers": [ ... ] }.`,
        `Exactly 5 levers for ${profile.domain}. Each: num (1–5), title, summary, details (5–8 strings).`,
        `Quote monetary figures in ${profile.currency} when the data supports it.`,
      ].join('\n');
    case 'targetRows':
      return [
        `Return ONLY JSON: { "targetRows": [ ... ] }.`,
        `Exactly 5 rows using domain metrics: ${metrics}.`,
        `Each: metric, may, conservative, realistic, aspirational (strings), bold (optional boolean).`,
      ].join('\n');
    default: {
      const _exhaustive: never = slice;
      return _exhaustive;
    }
  }
}

function emptyDocument(): DashboardDataDocument {
  return { actionPhases: [], targetRows: [], levers: [] };
}

async function loadDashboardDocument(db: DbClient): Promise<DashboardDataDocument> {
  const appId = getCurrentAppId();
  try {
    const snippet = await db.knowledgeSnippet.findUnique({
      where: { key_appId: { key: 'dashboard_data', appId } },
    });
    if (!snippet?.content) return emptyDocument();
    const parsed = JSON.parse(snippet.content) as Partial<DashboardDataDocument>;
    return {
      actionPhases: Array.isArray(parsed.actionPhases) ? parsed.actionPhases : [],
      targetRows: Array.isArray(parsed.targetRows) ? parsed.targetRows : [],
      levers: Array.isArray(parsed.levers) ? parsed.levers : [],
      homeHero: parsed.homeHero,
      tasks: parsed.tasks,
    };
  } catch {
    return emptyDocument();
  }
}

async function saveDashboardDocument(db: DbClient, doc: DashboardDataDocument): Promise<void> {
  const appId = getCurrentAppId();
  await db.knowledgeSnippet.upsert({
    where: { key_appId: { key: 'dashboard_data', appId } },
    create: {
      key: 'dashboard_data',
      category: 'document',
      content: JSON.stringify(doc),
      appId,
    },
    update: {
      content: JSON.stringify(doc),
      category: 'document',
    },
  });
}

export interface GenerateDashboardSliceInput {
  slice: DashboardSliceKey;
  blockType: string;
  pageSlug: string;
  pageTitle: string;
  /** Existing slice value — used as structure hint when regenerating. */
  currentValue?: unknown;
  additionalContext?: string;
  ai: ActiveAiConfig;
  tenantSlug: string;
  db: DbClient;
  viewerEmail?: string | null;
  viewerUserId?: string | null;
}

export interface GenerateDashboardSliceResult {
  slice: DashboardSliceKey;
  value: unknown;
  document: DashboardDataDocument;
  /** Null only when metering failed; charged usage always returned when possible. */
  usage: AiUsageSummary | null;
}

/**
 * Generate one dashboard slice with AI, merge into dashboard_data, and persist.
 */
export async function generateAndSaveDashboardSlice(
  input: GenerateDashboardSliceInput,
): Promise<GenerateDashboardSliceResult> {
  const data = await resolveWorkbookForSlice(input.db);
  const tenant = getTenantConfig();
  const businessName = data.company || tenant.displayName;

  const basePrompt = buildDashboardPrompt(data, input.additionalContext);
  const userPrompt = [
    basePrompt,
    ``,
    `## Slice-only regeneration`,
    `You are regenerating ONLY the "${input.slice}" key for the ${input.blockType} block`,
    `on page "${input.pageTitle}" (/${input.pageSlug}) for ${businessName}.`,
    `Do NOT return other dashboard keys.`,
    ``,
    sliceInstructions(input.slice),
    ``,
    input.currentValue !== undefined && input.currentValue !== null
      ? `## Current ${input.slice} (improve or replace — keep useful structure)\n${JSON.stringify(input.currentValue, null, 2).slice(0, 6000)}`
      : `## Current ${input.slice}\n(empty — write fresh content)`,
  ].join('\n');

  const response = await fetch(resolveChatCompletionsUrl(input.ai.provider), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.ai.apiKey}`,
    },
    body: JSON.stringify({
      model: input.ai.model,
      messages: [
        {
          role: 'system',
          content: `You are a precise financial analyst for ${businessName}. Return only valid JSON with the single key "${input.slice}".`,
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.35,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`${input.ai.provider.label} API error (${response.status}): ${errBody}`);
  }

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content ?? '';
  const providerUsage = result.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
  const tokens = {
    promptTokens: providerUsage?.prompt_tokens ?? 0,
    completionTokens: providerUsage?.completion_tokens ?? 0,
  };

  let usage: AiUsageSummary | null = null;
  try {
    const meter = await meterAiUsage({
      tenantSlug: input.tenantSlug,
      model: input.ai.model,
      promptTokens: tokens.promptTokens,
      completionTokens: tokens.completionTokens,
      keySource: input.ai.keySource,
      refType: 'content_generation',
      refId: `dashboard_slice:${input.slice}:${input.pageSlug}`,
      viewerEmail: input.viewerEmail,
      viewerUserId: input.viewerUserId,
      provider: input.ai.provider.id,
    });
    usage = toAiUsageSummary(meter, tokens, { model: input.ai.model });
  } catch {
    usage = toAiUsageSummary(null, tokens, { model: input.ai.model });
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(reply) as Record<string, unknown>;
  } catch {
    const jsonMatch = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!jsonMatch) throw new Error('AI response was not valid JSON');
    parsed = JSON.parse(jsonMatch[1]!) as Record<string, unknown>;
  }

  const value = parsed[input.slice];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`AI response missing non-empty "${input.slice}" array`);
  }

  const document = await loadDashboardDocument(input.db);
  const next: DashboardDataDocument = {
    ...document,
    [input.slice]: value,
  };
  await saveDashboardDocument(input.db, next);

  return { slice: input.slice, value, document: next, usage };
}
