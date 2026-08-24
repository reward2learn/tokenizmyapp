/**
 * Multi-turn AI Credits Calculator assistant — calculator-scoped tools only.
 *
 * Streaming: `streamCalculatorChatMessage` emits SSE (`text/event-stream`) using the
 * same token shape as `/api/chat` (`choices[0].delta.content`), plus `tool_result`
 * events when tools finish. Non-stream JSON remains available via
 * `sendCalculatorChatMessage` for callers that Prefer: application/json.
 */
import { z } from 'zod';
import { generateText, stepCountIs, streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createRawClient } from '@/lib/db';
import { analyzeAiCreditsCalculator } from '@/domain/billing/ai-credits-calculator-service';
import {
  getBillingCatalog,
  upsertCatalogPrices,
  syncStripeCatalogPrices,
} from '@/domain/billing/catalog-price-service';
import { upsertOrgRateCard } from '@/domain/billing/org-rate-card-service';
import {
  buildAiCreditsCalculatorReport,
} from '@/lib/billing/ai-credits-calculator';
import { yearlyMonthlyPrice } from '@/lib/billing/plans';
import {
  defaultRateCardInputs,
  type TenantRateCardInputs,
} from '@/lib/billing/tenant-rate-card';
import { meterAiUsage } from '@/domain/billing/credit-service';

type RawDb = ReturnType<typeof createRawClient>;

/** One statement per call — Prisma prepared statements reject multi-command SQL (42601). */
const THREADS_DDL = `
CREATE TABLE IF NOT EXISTS ai_credits_calculator_threads (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  tenant_slug TEXT,
  created_by TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Calculator chat',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const MESSAGES_DDL = `
CREATE TABLE IF NOT EXISTS ai_credits_calculator_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES ai_credits_calculator_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const MESSAGES_THREAD_IDX = `
CREATE INDEX IF NOT EXISTS idx_ai_calc_messages_thread
  ON ai_credits_calculator_messages (thread_id, created_at)`;

let ensured = false;

export async function ensureCalculatorChatTables(db?: RawDb): Promise<RawDb> {
  db ??= createRawClient();
  if (!ensured) {
    await db.$executeRawUnsafe(THREADS_DDL);
    await db.$executeRawUnsafe(MESSAGES_DDL);
    await db.$executeRawUnsafe(MESSAGES_THREAD_IDX);
    ensured = true;
  }
  return db;
}

export interface CalculatorThread {
  id: string;
  orgId: string | null;
  tenantSlug: string | null;
  createdBy: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatorMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls: unknown | null;
  createdAt: string;
}

function mapThread(row: Record<string, unknown>): CalculatorThread {
  return {
    id: String(row.id),
    orgId: row.org_id == null ? null : String(row.org_id),
    tenantSlug: row.tenant_slug == null ? null : String(row.tenant_slug),
    createdBy: String(row.created_by),
    title: String(row.title ?? 'Calculator chat'),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapMessage(row: Record<string, unknown>): CalculatorMessage {
  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    role: String(row.role) as CalculatorMessage['role'],
    content: String(row.content ?? ''),
    toolCalls: row.tool_calls ?? null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listCalculatorThreads(
  createdBy?: string,
  db?: RawDb,
): Promise<CalculatorThread[]> {
  db = await ensureCalculatorChatTables(db);
  const rows = createdBy
    ? ((await db.$queryRawUnsafe(
        `SELECT * FROM ai_credits_calculator_threads WHERE created_by = $1 ORDER BY updated_at DESC LIMIT 50;`,
        createdBy,
      )) as Record<string, unknown>[])
    : ((await db.$queryRawUnsafe(
        `SELECT * FROM ai_credits_calculator_threads ORDER BY updated_at DESC LIMIT 50;`,
      )) as Record<string, unknown>[]);
  return rows.map(mapThread);
}

export async function createCalculatorThread(
  input: {
    createdBy: string;
    title?: string;
    orgId?: string | null;
    tenantSlug?: string | null;
  },
  db?: RawDb,
): Promise<CalculatorThread> {
  db = await ensureCalculatorChatTables(db);
  const id = newId('acct');
  await db.$executeRawUnsafe(
    `INSERT INTO ai_credits_calculator_threads (id, org_id, tenant_slug, created_by, title)
     VALUES ($1, $2, $3, $4, $5);`,
    id,
    input.orgId ?? null,
    input.tenantSlug ?? null,
    input.createdBy,
    input.title ?? 'Calculator chat',
  );
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM ai_credits_calculator_threads WHERE id = $1 LIMIT 1;`,
    id,
  )) as Record<string, unknown>[];
  return mapThread(rows[0]);
}

export async function getCalculatorThread(
  threadId: string,
  db?: RawDb,
): Promise<{ thread: CalculatorThread; messages: CalculatorMessage[] } | null> {
  db = await ensureCalculatorChatTables(db);
  const rows = (await db.$queryRawUnsafe(
    `SELECT * FROM ai_credits_calculator_threads WHERE id = $1 LIMIT 1;`,
    threadId,
  )) as Record<string, unknown>[];
  if (rows.length === 0) return null;
  const messages = (await db.$queryRawUnsafe(
    `SELECT * FROM ai_credits_calculator_messages WHERE thread_id = $1 ORDER BY created_at ASC;`,
    threadId,
  )) as Record<string, unknown>[];
  return { thread: mapThread(rows[0]), messages: messages.map(mapMessage) };
}

async function appendMessage(
  db: RawDb,
  threadId: string,
  role: CalculatorMessage['role'],
  content: string,
  toolCalls?: unknown,
): Promise<CalculatorMessage> {
  const id = newId('accm');
  await db.$executeRawUnsafe(
    `INSERT INTO ai_credits_calculator_messages (id, thread_id, role, content, tool_calls)
     VALUES ($1, $2, $3, $4, $5::jsonb);`,
    id,
    threadId,
    role,
    content,
    toolCalls == null ? null : JSON.stringify(toolCalls),
  );
  await db.$executeRawUnsafe(
    `UPDATE ai_credits_calculator_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;`,
    threadId,
  );
  return {
    id,
    threadId,
    role,
    content,
    toolCalls: toolCalls ?? null,
    createdAt: new Date().toISOString(),
  };
}

const SYSTEM_PROMPT = `You are the TokenizMyApp AI Credits Calculator assistant.
You ONLY help with: rate-card inputs, markup/credits economics, competitive plan/pack positioning,
catalog USD faces, and Stripe list-price sync preview.
You do NOT perform arbitrary tenant admin, delete data, or change billing outside confirmed catalog/rate-card tools.
When applying catalog prices, Stripe sync, or org rate cards, require an explicit confirm flag from the admin.
Explain unit economics clearly (credits/$1, floor 30% markup on gpt-4o list COGS).`;

export interface SendCalculatorMessageInput {
  threadId: string;
  userId: string;
  message: string;
  /** Draft rate-card inputs from the UI form. */
  draftInputs?: Partial<TenantRateCardInputs>;
  websiteUrl?: string | null;
  secCikOrTicker?: string | null;
  companiesHouseNumber?: string | null;
  meterTenantSlug?: string;
}

export interface SendCalculatorMessageResult {
  userMessage: CalculatorMessage;
  assistantMessage: CalculatorMessage;
  toolResults: unknown[];
}

const CALCULATOR_SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
} as const;

function encodeSseLine(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function buildCalculatorTools(opts: {
  input: SendCalculatorMessageInput;
  db: RawDb;
  orgId: string | null;
  tenantSlug: string | null;
  draft: TenantRateCardInputs;
  toolResults: unknown[];
}) {
  const { input, db, orgId, tenantSlug, draft, toolResults } = opts;

  return {
    run_analysis: tool({
      description: 'Re-run website + filings + live org analysis and return a calculator report.',
      inputSchema: z.object({
        websiteUrl: z.string().optional(),
        secCikOrTicker: z.string().optional(),
        companiesHouseNumber: z.string().optional(),
      }),
      execute: async (args) => {
        const result = await analyzeAiCreditsCalculator({
          websiteUrl: args.websiteUrl ?? input.websiteUrl,
          secCikOrTicker: args.secCikOrTicker ?? input.secCikOrTicker,
          companiesHouseNumber: args.companiesHouseNumber ?? input.companiesHouseNumber,
          orgId,
          tenantSlug,
          inputsOverride: draft,
          meterTenantSlug: input.meterTenantSlug ?? 'tokenizmyapp',
        }, db);
        toolResults.push({ tool: 'run_analysis', result });
        return {
          recommendedInputs: result.recommendedInputs,
          markupPercent: result.report.computed.markupPercent,
          creditsPerUsd: result.report.unitEconomics.creditsPerUsd,
          warnings: result.warnings,
          businessSummary: result.analysis?.businessSummary ?? null,
        };
      },
    }),
    set_rate_card_inputs: tool({
      description: 'Preview rate-card inputs (does not persist until apply_org_rate_card).',
      inputSchema: z.object({
        appCount: z.number().int().min(1).optional(),
        userCount: z.number().int().min(1).optional(),
        annualRevenueUsd: z.number().min(0).optional(),
        macStudioCostUsd: z.number().min(0).optional(),
        monthlyThirdPartyUsd: z.number().min(0).optional(),
      }),
      execute: async (args) => {
        const catalog = await getBillingCatalog(db);
        const inputs = defaultRateCardInputs({ ...draft, ...args });
        const report = buildAiCreditsCalculatorReport({
          inputs,
          catalog: catalog.catalog,
        });
        const payload = {
          inputs,
          markupPercent: report.computed.markupPercent,
          creditsPerUsd: report.unitEconomics.creditsPerUsd,
          planCredits: report.computed.planCredits,
        };
        toolResults.push({ tool: 'set_rate_card_inputs', result: payload });
        return payload;
      },
    }),
    explain_unit_economics: tool({
      description: 'Explain credits per $1 and illustrative gpt-4o COGS vs charged value.',
      inputSchema: z.object({}),
      execute: async () => {
        const catalog = await getBillingCatalog(db);
        const report = buildAiCreditsCalculatorReport({
          inputs: draft,
          catalog: catalog.catalog,
        });
        const payload = report.unitEconomics;
        toolResults.push({ tool: 'explain_unit_economics', result: payload });
        return payload;
      },
    }),
    compare_plans_and_packs: tool({
      description: 'Compare plan/pack credit tables vs catalog.',
      inputSchema: z.object({}),
      execute: async () => {
        const catalog = await getBillingCatalog(db);
        const report = buildAiCreditsCalculatorReport({
          inputs: draft,
          catalog: catalog.catalog,
        });
        const payload = {
          planTable: report.planTable,
          packTable: report.packTable,
          flags: report.competitiveFlags,
          catalogRecommendation: report.catalogRecommendation,
        };
        toolResults.push({ tool: 'compare_plans_and_packs', result: payload });
        return payload;
      },
    }),
    preview_catalog_prices: tool({
      description: 'Preview current vs recommended catalog USD faces.',
      inputSchema: z.object({}),
      execute: async () => {
        const catalog = await getBillingCatalog(db);
        const report = buildAiCreditsCalculatorReport({
          inputs: draft,
          catalog: catalog.catalog,
        });
        const payload = {
          current: catalog.catalog,
          recommended: report.catalogRecommendation,
          stripePriceIds: catalog.stripePriceIds,
        };
        toolResults.push({ tool: 'preview_catalog_prices', result: payload });
        return payload;
      },
    }),
    apply_catalog_prices: tool({
      description: 'Apply catalog USD overrides. Requires confirm=true.',
      inputSchema: z.object({
        confirm: z.literal(true),
        proMonthlyCents: z.number().int().min(0).optional(),
        businessMonthlyCents: z.number().int().min(0).optional(),
        pack25Cents: z.number().int().min(0).optional(),
        pack50Cents: z.number().int().min(0).optional(),
        pack100Cents: z.number().int().min(0).optional(),
        notes: z.string().optional(),
      }),
      execute: async (args) => {
        const record = await upsertCatalogPrices({
          confirm: true,
          updatedBy: input.userId,
          notes: args.notes ?? null,
          plans: {
            ...(args.proMonthlyCents != null
              ? {
                  pro: {
                    monthlyCents: args.proMonthlyCents,
                    yearlyCents: yearlyMonthlyPrice(args.proMonthlyCents),
                  },
                }
              : {}),
            ...(args.businessMonthlyCents != null
              ? {
                  business: {
                    monthlyCents: args.businessMonthlyCents,
                    yearlyCents: yearlyMonthlyPrice(args.businessMonthlyCents),
                  },
                }
              : {}),
          },
          packs: {
            ...(args.pack25Cents != null ? { 'pack-25': args.pack25Cents } : {}),
            ...(args.pack50Cents != null ? { 'pack-50': args.pack50Cents } : {}),
            ...(args.pack100Cents != null ? { 'pack-100': args.pack100Cents } : {}),
          },
        }, db);
        toolResults.push({ tool: 'apply_catalog_prices', result: record });
        return { ok: true, catalog: record.catalog };
      },
    }),
    sync_stripe_prices: tool({
      description: 'Sync Stripe list prices to catalog faces. Requires confirm=true.',
      inputSchema: z.object({
        confirm: z.literal(true),
        dryRun: z.boolean().optional(),
      }),
      execute: async (args) => {
        const result = await syncStripeCatalogPrices({
          confirm: true,
          updatedBy: input.userId,
          dryRun: args.dryRun === true,
          db,
        });
        toolResults.push({ tool: 'sync_stripe_prices', result });
        return result;
      },
    }),
    apply_org_rate_card: tool({
      description: 'Persist rate-card inputs to an organization. Requires confirm=true and orgId.',
      inputSchema: z.object({
        confirm: z.literal(true),
        orgId: z.string().min(1),
        appCount: z.number().int().min(1).optional(),
        userCount: z.number().int().min(1).optional(),
        annualRevenueUsd: z.number().min(0).optional(),
        macStudioCostUsd: z.number().min(0).optional(),
        monthlyThirdPartyUsd: z.number().min(0).optional(),
      }),
      execute: async (args) => {
        const card = await upsertOrgRateCard(
          args.orgId,
          {
            inputs: {
              appCount: args.appCount ?? draft.appCount,
              userCount: args.userCount ?? draft.userCount,
              annualRevenueUsd: args.annualRevenueUsd ?? draft.annualRevenueUsd,
              macStudioCostUsd: args.macStudioCostUsd ?? draft.macStudioCostUsd,
              monthlyThirdPartyUsd: args.monthlyThirdPartyUsd ?? draft.monthlyThirdPartyUsd,
            },
            preserveManual: true,
          },
          db,
        );
        toolResults.push({ tool: 'apply_org_rate_card', result: card });
        return {
          ok: true,
          markupPercent: card.markupPercent,
          creditsPerUsd: card.creditsPerUsd,
        };
      },
    }),
  };
}

async function meterCalculatorChat(
  input: SendCalculatorMessageInput,
  usage: { inputTokens?: number | null; outputTokens?: number | null },
): Promise<void> {
  try {
    await meterAiUsage({
      tenantSlug: input.meterTenantSlug ?? 'tokenizmyapp',
      model: 'gpt-4o',
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      keySource: 'env',
      refType: 'ai_credits_calculator_chat',
    });
  } catch (err) {
    console.warn(
      '[ai-credits-calculator-chat] Metering failed (non-blocking):',
      err instanceof Error ? err.message : err,
    );
  }
}

export async function sendCalculatorChatMessage(
  input: SendCalculatorMessageInput,
  db?: RawDb,
): Promise<SendCalculatorMessageResult> {
  db = await ensureCalculatorChatTables(db);
  const existing = await getCalculatorThread(input.threadId, db);
  if (!existing) throw new Error('Thread not found');

  const userMessage = await appendMessage(db, input.threadId, 'user', input.message);
  const history = existing.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const toolResults: unknown[] = [];
  const draft = defaultRateCardInputs(input.draftInputs);
  const tools = buildCalculatorTools({
    input,
    db,
    orgId: existing.thread.orgId,
    tenantSlug: existing.thread.tenantSlug,
    draft,
    toolResults,
  });

  const { text, usage, steps } = await generateText({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    messages: [...history, { role: 'user', content: input.message }],
    tools,
    stopWhen: stepCountIs(6),
  });

  await meterCalculatorChat(input, usage);

  const assistantMessage = await appendMessage(
    db,
    input.threadId,
    'assistant',
    text || '(no response)',
    steps?.length ? { steps: steps.length, toolResults } : toolResults.length ? toolResults : null,
  );

  return { userMessage, assistantMessage, toolResults };
}

/**
 * SSE stream matching `/api/chat` token framing:
 * - `data: {"choices":[{"delta":{"content":"…"}}]}` text tokens
 * - `data: {"type":"tool_result","tool":"…","result":…}` after each tool
 * - `data: {"type":"final",…}` persisted message ids + toolResults
 * - `data: [DONE]`
 */
export async function streamCalculatorChatMessage(
  input: SendCalculatorMessageInput,
  db?: RawDb,
): Promise<Response> {
  db = await ensureCalculatorChatTables(db);
  const existing = await getCalculatorThread(input.threadId, db);
  if (!existing) throw new Error('Thread not found');

  const userMessage = await appendMessage(db, input.threadId, 'user', input.message);
  const history = existing.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const toolResults: unknown[] = [];
  const draft = defaultRateCardInputs(input.draftInputs);
  const tools = buildCalculatorTools({
    input,
    db,
    orgId: existing.thread.orgId,
    tenantSlug: existing.thread.tenantSlug,
    draft,
    toolResults,
  });

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();

  const writeLine = async (payload: unknown) => {
    await writer.write(encoder.encode(encodeSseLine(payload)));
  };

  void (async () => {
    try {
      await writeLine({ type: 'user_message', message: userMessage });

      const result = streamText({
        model: openai('gpt-4o'),
        system: SYSTEM_PROMPT,
        messages: [...history, { role: 'user', content: input.message }],
        tools,
        stopWhen: stepCountIs(6),
      });

      for await (const part of result.stream) {
        if (part.type === 'text-delta' && part.text) {
          await writeLine({ choices: [{ delta: { content: part.text } }] });
          continue;
        }
        if (part.type === 'tool-result') {
          await writeLine({
            type: 'tool_result',
            tool: part.toolName,
            result: part.output,
          });
          continue;
        }
        if (part.type === 'error') {
          const msg =
            part.error instanceof Error
              ? part.error.message
              : typeof part.error === 'string'
                ? part.error
                : 'Calculator stream error';
          await writeLine({ error: msg });
        }
      }

      const text = await result.text;
      const usage = await result.usage;
      const steps = await result.steps;

      await meterCalculatorChat(input, usage);

      const assistantMessage = await appendMessage(
        db!,
        input.threadId,
        'assistant',
        text || '(no response)',
        steps?.length
          ? { steps: steps.length, toolResults }
          : toolResults.length
            ? toolResults
            : null,
      );

      await writeLine({
        type: 'final',
        userMessage,
        assistantMessage,
        toolResults,
      });
      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      try {
        await writeLine({ error: msg });
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch {
        // writer may already be closed
      }
    } finally {
      try {
        await writer.close();
      } catch {
        // ignore
      }
    }
  })();

  return new Response(readable, { headers: CALCULATOR_SSE_HEADERS });
}
