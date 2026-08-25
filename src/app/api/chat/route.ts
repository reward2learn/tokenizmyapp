/**
 * Chat API — legacy reference: website/api/chat.js
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createBillingRawClient } from '@/lib/db';
import { resolveOpenAiKey } from '@/lib/openai';
import { resolveActiveAiConfig } from '@/lib/ai-providers';
import { KnowledgeService } from '@/domain/knowledge/knowledge-service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { legacyError } from '@/lib/api/response';
import { sanitizeConversationMessages } from '@/lib/chat/conversation-messages';
import { getCurrentAppId, isPlatformApp } from '@shared/lib/config/tenant';
import {
  attachmentDataUrl,
  describeAttachmentForPrompt,
  type ChatAttachment,
} from '@/lib/chat/attachments';
import { resolveTtsVoice } from '@/lib/chat/tts-voices';
import {
  CHAT_SESSION_TOOL_INSTRUCTIONS,
  type SessionToolContext,
} from '@/lib/chat/session-tools';
import {
  completeChatWithSessionTools,
  CHAT_WEB_SEARCH_INSTRUCTIONS,
  type OpenAiChatMessage,
} from '@/lib/chat/chat-with-session-tools';
import { resolveEffectiveChatModel } from '@/lib/chat/chat-model';
import { getAppSettings } from '@/domain/config/app-settings-service';
import { isExplicitSessionRequest } from '@/lib/chat/session-tools';
import { ensureConversationsColumns } from '@/lib/db-migrate';
import { requireCreditsForTenant, resolvePayingOrgId, LOW_CREDIT_THRESHOLD, meterAiUsage } from '@/domain/billing/credit-service';
import {
  emptyAiUsageSummary,
  foldMeterIntoUsage,
  type AiUsageSummary,
} from '@/lib/billing/ai-usage-summary';
import { canPurchaseCreditPacks } from '@/lib/billing/plans';
import { getSubscription } from '@/domain/billing/entitlement-service';
import { isAgenticCatalogLive, resolveTenantAgenticCommerce } from '@/domain/billing/agentic-catalog-service';
import { resolveTenantSelfServeBilling } from '@/domain/billing/self-serve-billing-service';
import { resolveViewerUserId } from '@/lib/auth/resolve-viewer-user';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

let conversationsEnsured: Promise<boolean> | null = null;
function ensureConversationsOnce(): Promise<boolean> {
  if (!conversationsEnsured) {
    conversationsEnsured = ensureConversationsColumns(createClient()).catch((err) => {
      conversationsEnsured = null;
      throw err;
    });
  }
  return conversationsEnsured;
}

const attachmentSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  kind: z.enum(['image', 'spreadsheet', 'document']),
  dataBase64: z.string().optional(),
  extractedText: z.string().optional(),
  truncated: z.boolean().optional(),
});

const chatBodySchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).optional(),
  attachments: z.array(attachmentSchema).optional(),
  stream: z.boolean().optional(),
  /**
   * Tool explicitly selected in the chat composer.
   *
   * Session tools are normally attached only when the message text clearly asks
   * for one (isExplicitSessionRequest), which keeps them away from ordinary
   * business questions. An explicit pick from the composer is a stronger signal
   * than any phrasing heuristic, so it turns them on directly.
   */
  activeTool: z.enum(['build_custom_template']).optional(),
  /** Optional per-request provider override from the chat Tools picker (must exist in loaded catalog). */
  providerId: z.string().trim().min(1).max(64).optional(),
  /** Optional per-request model override from the chat Tools picker. */
  model: z.string().trim().min(1).max(200).optional(),
  /** Client-generated conversation id — groups ledger rows for this chat session. */
  conversationId: z.string().trim().min(1).max(80).optional(),
});

const voiceBodySchema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().optional(),
  speed: z.number().optional(),
});

const conversationPostSchema = z.object({
  title: z.string().optional(),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
    attachments: z.array(attachmentSchema).optional(),
  })).min(1),
});

const DB_KEYWORDS = [
  'actual', 'current', 'tracking', 'kpi', 'performance',
  'how are we', 'how did we', 'what was', 'what were',
  'revenue', 'ebitda', 'guests', 'covers', 'staff cost',
  'trend', 'compare', 'vs target', 'vs projection',
  'month to date', 'mtd', 'ytd', 'last month', 'this month',
  'progress', 'on track', 'behind', 'ahead',
  'show me', 'numbers', 'data', 'report', 'daily metrics',
  'weekly', 'monthly', 'average spend', 'avg spend',
  'spend per guest', ' performance',
];

function detectDatabaseQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return DB_KEYWORDS.some((k) => lower.includes(k));
}

async function fetchDatabaseContext(db: ReturnType<typeof createClient>): Promise<string> {
  const parts: string[] = [];

  try {
    const recent = await db.dailyZReport.findMany({
      where: { appId: getCurrentAppId() },
      orderBy: { reportDate: 'desc' },
      take: 7,
      select: {
        reportDate: true,
        nettSales: true,
        totalCovers: true,
        avgCovers: true,
        totalBills: true,
        gofoodAmount: true,
        dineInAmount: true,
        totCollectionAmount: true,
        totalSales: true,
        tax10Amount: true,
        service7Amount: true,
      },
    });
    if (recent.length) {
      parts.push('=== RECENT DAILY DATA (last 7 entries) ===');
      parts.push('date | nett_sales | covers | avg_covers | bills | gofood | dine_in | collection');
      for (const r of recent) {
        const date = r.reportDate.toISOString().slice(0, 10);
        parts.push(
          `${date} | ${Number(r.nettSales).toLocaleString()} | ${r.totalCovers} | ${r.avgCovers ? Number(r.avgCovers).toLocaleString() : '-'} | ${r.totalBills || '-'} | ${r.gofoodAmount ? Number(r.gofoodAmount).toLocaleString() : '-'} | ${r.dineInAmount ? Number(r.dineInAmount).toLocaleString() : '-'} | ${r.totCollectionAmount ? Number(r.totCollectionAmount).toLocaleString() : '-'}`,
        );
      }
    }
  } catch {
    // optional context
  }

  try {
    const currentMonth = await db.$queryRaw<
      {
        month: string;
        total_revenue: number;
        days_count: number;
        avg_guests: number;
        avg_spend: number;
        total_gofood: number;
        total_dine_in: number;
      }[]
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', report_date), 'YYYY-MM') AS month,
        SUM(nett_sales)::float AS total_revenue,
        COUNT(*)::int AS days_count,
        ROUND(AVG(total_covers))::int AS avg_guests,
        ROUND(AVG(avg_covers))::float AS avg_spend,
        SUM(gofood_amount)::float AS total_gofood,
        SUM(dine_in_amount)::float AS total_dine_in
      FROM daily_z_reports
      WHERE DATE_TRUNC('month', report_date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY DATE_TRUNC('month', report_date)`;

    if (currentMonth[0]) {
      const cm = currentMonth[0];
      parts.push('\n=== CURRENT MONTH (POS Z-reports) ===');
      parts.push(`Month: ${cm.month}, Days: ${cm.days_count}`);
      parts.push(`Nett Sales: ${Number(cm.total_revenue).toLocaleString()}`);
      parts.push(`Avg Covers/Day: ${cm.avg_guests}`);
      parts.push(`Avg Spend: ${Number(cm.avg_spend).toLocaleString()}`);
      parts.push(`GoFood: ${Number(cm.total_gofood).toLocaleString()}, Dine-in: ${Number(cm.total_dine_in).toLocaleString()}`);

      // Targets come from THIS app's own monthly_targets rows. They used to be
      // read from a hardcoded constant holding one particular tenant's goals,
      // so every app's live revenue was reported "VS TARGET" against a Bali
      // nightclub's numbers. An app with no targets of its own now gets no
      // comparison, which is the honest answer.
      const target = await db.monthlyTarget.findFirst({
        where: { month: String(cm.month), appId: getCurrentAppId() },
      });
      if (target) {
        const projRev = (Number(cm.total_revenue) / cm.days_count) * 30;
        // targetGuests is a monthly figure; the actual beside it is per day.
        const targetGuestsPerDay = Math.round(Number(target.targetGuests) / 30);
        parts.push('--- VS TARGET ---');
        parts.push(`Target Revenue: ${Number(target.targetRevenue).toLocaleString()}, Projected: ${Math.round(projRev).toLocaleString()}`);
        parts.push(`Target Guests/Day: ${targetGuestsPerDay}, Actual: ${cm.avg_guests}`);
        parts.push(`Target Avg Spend: ${Number(target.targetAvgSpend).toLocaleString()}, Actual: ${Number(cm.avg_spend).toLocaleString()}`);
      }
    }
  } catch {
    // optional
  }

  if (!parts.length) {
    parts.push('(No data in database yet — no daily metrics have been entered. Start by entering data on the Ops Admin page.)');
  }

  return parts.join('\n');
}

type OpenAiContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

interface OpenAiMessage {
  role: string;
  content: string | OpenAiContentPart[];
}

/**
 * Build the OpenAI user message. Text and any spreadsheet / document context is
 * merged into the text part; embedded images become vision `image_url` parts so
 * the model can actually see them.
 */
function buildUserMessage(message: string, attachments: ChatAttachment[]): OpenAiMessage {
  if (!attachments.length) {
    return { role: 'user', content: message };
  }

  const textSections: string[] = [message];
  const imageParts: OpenAiContentPart[] = [];

  for (const attachment of attachments) {
    if (attachment.kind === 'image') {
      const url = attachmentDataUrl(attachment);
      if (url) {
        imageParts.push({ type: 'image_url', image_url: { url } });
        continue;
      }
    }
    textSections.push(`\n\n[Attachment] ${describeAttachmentForPrompt(attachment)}`);
  }

  if (!imageParts.length) {
    return { role: 'user', content: textSections.join('') };
  }

  return {
    role: 'user',
    content: [
      { type: 'text', text: textSections.join('') },
      ...imageParts,
    ],
  };
}

/**
 * MapReduce for oversized chat context.
 *
 * When the system prompt (knowledge snippets + instructions) exceeds the
 * model's rate limit, this function splits it into chunks, calls OpenAI
 * once per chunk to extract facts relevant to the user's question, then
 * combines everything into a compact context prompt for the final answer.
 *
 * This mirrors the two-phase pattern used in AI Content Generation.
 * Map-phase completions are metered (`refType: 'chat_mapreduce'`) so large
 * prompts cannot bypass the credit ledger.
 */
async function mapReduceContext(
  fullContext: string,
  userMessage: string,
  chatCompletionsUrl: string,
  apiKey: string,
  model: string,
  meterOptions: {
    tenantSlug: string;
    keySource: 'db' | 'env';
    viewerEmail?: string | null;
    viewerUserId?: string | null;
    provider?: string | null;
    conversationId?: string | null;
  },
): Promise<{ reduced: string; usage: AiUsageSummary }> {
  // Split the context into chunks by ## section headers
  const sections = fullContext.split(/(?=## )/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const section of sections) {
    if (currentChunk.length + section.length > 3000 && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = section;
    } else {
      currentChunk += section;
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);

  // Map phase: extract relevant info from each chunk
  const extractedParts: string[] = [];
  let usage = emptyAiUsageSummary({ model });

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const response = await fetch(chatCompletionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You extract relevant business context for a given user question. Return ONLY facts and data points relevant to the question, in 2-3 concise bullet points. If nothing is relevant, return "NONE". Do not include any other text.',
            },
            {
              role: 'user',
              content: `Context section ${i + 1}/${chunks.length}:\n${chunk}\n\nUser question: ${userMessage}\n\nExtract ONLY facts/data points relevant to answering this question. Return "NONE" if nothing is relevant.`,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const result = await response.json() as {
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const reply = result.choices?.[0]?.message?.content ?? '';
        if (reply.trim() !== 'NONE') {
          extractedParts.push(reply.trim());
        }

        const tokens = {
          promptTokens: result.usage?.prompt_tokens ?? 0,
          completionTokens: result.usage?.completion_tokens ?? 0,
        };

        if (tokens.promptTokens > 0 || tokens.completionTokens > 0) {
          try {
            const meter = await meterAiUsage({
              tenantSlug: meterOptions.tenantSlug,
              model,
              promptTokens: tokens.promptTokens,
              completionTokens: tokens.completionTokens,
              keySource: meterOptions.keySource,
              refType: 'chat_mapreduce',
              refId: meterOptions.conversationId ?? null,
              viewerEmail: meterOptions.viewerEmail,
              viewerUserId: meterOptions.viewerUserId,
              provider: meterOptions.provider,
            });
            usage = foldMeterIntoUsage(usage, meter, tokens, { model });
          } catch (err) {
            console.warn(
              '[chat] MapReduce metering failed (non-blocking):',
              err instanceof Error ? err.message : err,
            );
            usage = foldMeterIntoUsage(usage, null, tokens, { model });
          }
        }
      }
    } catch {
      // skip failed chunk
    }
  }

  // Reduce: build a compact context from extracted parts
  if (extractedParts.length === 0) {
    return { reduced: fullContext.slice(0, 15000), usage };
  }

  const reduced = [
    '## Business Context (Relevant excerpts)',
    '',
    ...extractedParts,
    '',
    '## Monthly Projection Targets',
    fullContext.includes('Monthly Projection Targets')
      ? fullContext.split('## Monthly Projection Targets')[1]?.split('## How You Answer')[0]?.trim() ?? ''
      : '',
    '',
    '## How You Answer',
    '1. Use IDR formatting (e.g., "IDR 2.2B", "IDR 166M").',
    '2. Reference specific Business Review parts when relevant.',
    '3. Use live database data for performance tracking questions.',
    '4. Be concise and data-driven.',
    '5. Highlight BEP coverage and margin metrics.',
  ].join('\n');

  return { reduced, usage };
}

/**
 * Friendly chat reply for degraded states (no provider configured, no credits
 * left) — chat must degrade gracefully, never hard-fail. Mirrors the SSE
 * shape of a normal streamed reply so the client renders it identically.
 */
function friendlyChatReply(reply: string, stream: boolean): Response {
  if (stream) {
    const encoder = new TextEncoder();
    const sseBody = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: reply } }] })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    return new Response(sseBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }
  return NextResponse.json({
    success: true,
    data: { reply },
  });
}

async function handleChatPost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return legacyError('Invalid JSON body', 400);
  }

  const parsed = chatBodySchema.safeParse(body);
  if (!parsed.success) {
    return legacyError('Message is required', 400);
  }

  const { message, history = [], stream, attachments = [], activeTool, providerId, model, conversationId } = parsed.data;
  const session = await getSessionFromRequest(request);
  const userName = session?.name || session?.email || 'Anonymous';
  const db = createClient({
    tier: session?.tier ?? 'public',
    ...(session?.sub !== undefined ? { sub: session.sub } : {}),
  });
  const knowledge = new KnowledgeService(db);

  try {
    const needsDb = detectDatabaseQuery(message);
    let dbContext = '';
    if (needsDb) {
      try {
        dbContext = await fetchDatabaseContext(db);
      } catch {
        // non-fatal
      }
    }

    const systemPrompt = await knowledge.buildSystemPrompt();

    // Resolve the active AI provider early — needed for MapReduce phase below.
    // Chat Tools picker may override provider/model for this request only.
    const ai = await resolveActiveAiConfig(model ?? null, undefined, providerId ?? null);
    if (!ai) {
      return friendlyChatReply(
        'I\'m not fully configured yet. The owner needs to set up an AI provider in Config > AI Chat.',
        stream === true,
      );
    }

    // ── Pre-flight credit gate ──
    // Every assistant call draws from the org balance (platform pays providers;
    // tenants top up). Empty balance degrades to a friendly reply instead of a
    // hard error — chat must keep working. Operator exemption is opt-in
    // (`CREDIT_EXEMPT_ENABLED=true` on tenant apps only); default is charge all.
    let creditBalance: number | null = null;
    let billingOrgId: string | null = null;
    let planId: import('@/lib/billing/plans').PlanId = 'free';
    let agenticCatalogLive = false;
    let selfServeBillingEnabled = false;

    {
      const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'tokenizmyapp';
      const viewerUserId =
        !isPlatformApp() && session?.sub ? await resolveViewerUserId(session.sub) : undefined;
      const gate = await requireCreditsForTenant(
        tenantSlug,
        undefined,
        session?.email,
        undefined,
        viewerUserId,
      );
      if (!gate.ok) {
        return friendlyChatReply(
          'This workspace has no AI credits remaining. The owner can upgrade the plan or add credits to continue chatting.',
          stream === true,
        );
      }
      creditBalance = gate.balance === Infinity ? null : gate.balance;
      // Credits / orgs live on the platform control-plane DB (PLATFORM_POSTGRES_URL
      // on tenant deploys). Never use the tenant data-plane client here — that
      // resolves the wrong org or creates orphan credit tables on the tenant DB.
      const billingDb = createBillingRawClient();
      billingOrgId = await resolvePayingOrgId(tenantSlug, billingDb);
      const sub = await getSubscription(billingOrgId, billingDb);
      planId = sub.planId;
      const agentic = await resolveTenantAgenticCommerce(billingOrgId, billingDb);
      agenticCatalogLive = isAgenticCatalogLive(agentic.config);
      if (billingOrgId) {
        const selfServe = await resolveTenantSelfServeBilling(billingOrgId, billingDb);
        selfServeBillingEnabled = selfServe.enabled;
      }
    }

    const tenantSlugForTools = process.env.NEXT_PUBLIC_TENANT_SLUG ?? 'tokenizmyapp';
    const lowBalance = creditBalance != null && creditBalance < LOW_CREDIT_THRESHOLD;
    const canPurchaseCredits =
      canPurchaseCreditPacks(planId) && (isPlatformApp() || selfServeBillingEnabled);
    const billingToolsEnabled = Boolean(
      billingOrgId && canPurchaseCredits,
    );
    const sessionToolsEnabled = Boolean(activeTool) || isExplicitSessionRequest(message) || lowBalance;

    await getAppSettings(db); // still loads settings; webSearchEnabled reserved for Responses API migration
    // OpenAI's Chat Completions `*-search-preview` models are deprecated
    // (shutdown 2026-07-23). Do not enable the legacy search-preview path —
    // it forced a dead model id and stripped session tools. Responses API
    // `web_search` migration is TBD; until then use the selected chat model.
    const webSearchEnabled = false;

    const systemSections = [
      systemPrompt,
      ...(sessionToolsEnabled || billingToolsEnabled ? [CHAT_SESSION_TOOL_INSTRUCTIONS] : []),
      ...(lowBalance && billingToolsEnabled
        ? [`The organization's AI credit balance is low (${creditBalance} remaining). Proactively offer a credit top-up via purchase_credits when appropriate.`]
        : []),
      // Only honoured for a platform admin. A non-admin who sets activeTool
      // gets no instruction here, and executeSessionTool refuses the call
      // anyway — belt and braces, since this arms a privileged tool.
      ...(activeTool === 'build_custom_template' && sessionIsPlatformAdmin(session)
        ? ['The administrator selected the Custom Template Build tool. Gather the four details listed in your instructions (what the business does, who uses the app, what they need to track, and the source) before calling build_custom_template. The tool designs the template but does not save it — tell them to press "Save & Create Template" to add it.']
        : []),
      ...(webSearchEnabled ? [CHAT_WEB_SEARCH_INSTRUCTIONS] : []),
    ];

    const messages: OpenAiChatMessage[] = [{
      role: 'system',
      content: systemSections.join('\n\n'),
    }];

    const viewerUserId =
      !isPlatformApp() && session?.sub ? await resolveViewerUserId(session.sub) : undefined;

    // ── MapReduce: if system prompt is too large, extract relevant context in chunks ──
    const systemMsg = messages[0];
    let mapReduceUsage: AiUsageSummary | null = null;
    if (systemMsg && typeof systemMsg.content === 'string' && systemMsg.content.length > 18000) {
      try {
        const mapModel = ai.provider.id === 'openai' ? 'gpt-4o-mini' : ai.model;
        const { reduced, usage } = await mapReduceContext(
          systemMsg.content,
          message,
          ai.provider.chatCompletionsUrl,
          ai.apiKey,
          // gpt-4o-mini is a known-cheap OpenAI model for this map phase;
          // other providers just reuse the selected chat model.
          mapModel,
          {
            tenantSlug: tenantSlugForTools,
            keySource: ai.keySource,
            viewerEmail: session?.email,
            viewerUserId,
            provider: ai.provider.id,
            conversationId: conversationId ?? null,
          },
        );
        systemMsg.content = reduced;
        mapReduceUsage = usage;
      } catch {
        // If MapReduce fails, fall back to simple truncation
        if (typeof systemMsg.content === 'string') {
          systemMsg.content = systemMsg.content.slice(0, 20000)
            + '\n\n[Context truncated to fit model limits — see Business Review parts for full details]';
        }
      }
    }

    for (const msg of history.slice(-6)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    if (dbContext) {
      messages.push({
        role: 'system',
        content: `[DATABASE QUERY RESULT — Current actuals from the database]\n${dbContext}\n\nUse this data to answer the user's question.`,
      });
    }

    messages.push(buildUserMessage(message, attachments));

    const sessionMessages = [
      ...history
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message },
    ];

    const toolContext: SessionToolContext = {
      db,
      userName,
      messages: sessionMessages,
      viewerEmail: session?.email,
      viewerUserId,
      // From the verified session, never from the request body — this is the
      // boundary that keeps `build_custom_template` (which writes platform
      // configuration) out of reach of non-admins, whatever the client sends.
      isPlatformAdmin: sessionIsPlatformAdmin(session),
      ...(billingOrgId
        ? {
            billing: {
              orgId: billingOrgId,
              tenantSlug: tenantSlugForTools,
              availableCredits: creditBalance ?? 0,
              planId,
              lowBalance,
              canPurchaseCredits,
              agenticCatalogLive,
            },
          }
        : {}),
    };

    return completeChatWithSessionTools({
      chatCompletionsUrl: ai.provider.chatCompletionsUrl,
      apiKey: ai.apiKey,
      // The search-preview override (inside resolveEffectiveChatModel) is
      // OpenAI-only — webSearchEnabled is already forced false above for
      // any other provider, so this just uses the selected model for them.
      model: resolveEffectiveChatModel(ai.model, webSearchEnabled),
      messages,
      toolContext,
      stream: stream === true,
      webSearchEnabled,
      sessionToolsEnabled,
      billingToolsEnabled,
      tenantSlug: tenantSlugForTools,
      keySource: ai.keySource,
      viewerEmail: session?.email,
      viewerUserId,
      provider: ai.provider.id,
      conversationId: conversationId ?? null,
      priorUsage: mapReduceUsage,
    });
  } catch (err) {
    console.error('CHAT ERROR:', err);
    return NextResponse.json({
      success: true,
      data: { reply: 'I encountered an error processing your request. Please try again in a moment.' },
    });
  }
}

async function handleVoicePost(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = voiceBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Text is required' }, { status: 400 });
  }

  const apiKey = await resolveOpenAiKey();
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 503 });
  }

  const voice = resolveTtsVoice(parsed.data.voice);
  const rate = Math.max(0.25, Math.min(2.0, parsed.data.speed || 1.0));

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'tts-1',
        input: parsed.data.text.trim(),
        voice,
        response_format: 'mp3',
        speed: rate,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({ success: true, data: { audioChunks: [base64], format: 'mp3' } });
  } catch (err) {
    console.error('[voice] Error:', err);
    return NextResponse.json({ success: false, error: 'Voice synthesis failed' }, { status: 500 });
  }
}

async function handleConversations(request: Request, url: URL): Promise<NextResponse> {
  const session = await getSessionFromRequest(request);
  try {
    try {
      await ensureConversationsOnce();
    } catch {
      // Best-effort column ensure; queries surface a clear error if columns are missing.
    }
  const userName = session?.name || session?.email || 'Anonymous';
  const db = createClient({
    tier: session?.tier ?? 'public',
    ...(session?.sub !== undefined ? { sub: session.sub } : {}),
  });

  if (request.method === 'POST') {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return legacyError('Invalid JSON', 400);
    }

    const parsed = conversationPostSchema.safeParse(body);
    if (!parsed.success) {
      return legacyError('messages array is required and must not be empty', 400);
    }

    try {
      const messages = sanitizeConversationMessages(parsed.data.messages);
      const saved = await db.conversation.create({
        data: {
          userName,
          ownerSub: session?.sub ?? null,
          title: (parsed.data.title || 'Chat Conversation').slice(0, 200),
          messages: messages as object[],
          messageCount: messages.length,
        },
      });
      return NextResponse.json(
        { success: true, data: { ok: true, id: saved.id, created_at: saved.createdAt } },
        { status: 201 },
      );
    } catch (err) {
      console.error('[conversations] POST error:', err);
      return legacyError('Failed to save conversation', 500);
    }
  }

  if (request.method === 'PATCH') {
    const id = url.searchParams.get('id');
    const numId = id ? parseInt(id, 10) : NaN;
    if (!id || Number.isNaN(numId)) return legacyError('Invalid id', 400);

    const existing = await db.conversation.findUnique({ where: { id: numId } });
    if (!existing) return legacyError('Conversation not found', 404);

    // Only the owner or a platform admin may archive/unarchive.
    if (!sessionIsPlatformAdmin(session) && existing.ownerSub && existing.ownerSub !== session?.sub) {
      return legacyError('Not allowed to modify this conversation', 403);
    }

    const archiveParam = url.searchParams.get('archived');
    const archived = archiveParam === 'true' ? true : archiveParam === 'false' ? false : !existing.archived;

    const updated = await db.conversation.update({
      where: { id: numId },
      data: { archived },
    });

    return NextResponse.json({
      success: true,
      data: { id: updated.id, archived: updated.archived },
    });
  }

  const id = url.searchParams.get('id');
  if (id) {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) return legacyError('Invalid id', 400);

    const row = await db.conversation.findUnique({ where: { id: numId } });
    if (!row) return legacyError('Conversation not found', 404);

    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        user_name: row.userName,
        title: row.title,
        messages: row.messages,
        message_count: row.messageCount,
        created_at: row.createdAt,
      },
    });
  }

  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 50);
  const includeArchived = url.searchParams.get('archived') === 'true';
  const ownerFilter = url.searchParams.get('owner');

  // Non-admins may only see their own conversations; admins may scope via ?owner=.
  const scopedOwner = sessionIsPlatformAdmin(session) ? ownerFilter ?? undefined : session?.sub;

  const rows = await db.conversation.findMany({
    where: {
      ...(includeArchived ? {} : { archived: false }),
      ...(scopedOwner ? { ownerSub: scopedOwner } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      userName: true,
      ownerSub: true,
      title: true,
      messageCount: true,
      archived: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: rows.map((r: {
      id: number;
      userName: string;
      ownerSub: string | null;
      title: string;
      messageCount: number;
      archived: boolean;
      createdAt: Date;
    }) => ({
      id: r.id,
      user_name: r.userName,
      owner_sub: r.ownerSub,
      title: r.title,
      message_count: r.messageCount,
      archived: r.archived,
      created_at: r.createdAt,
    })),
  });
  } catch (err) {
    console.error('[conversations] Error:', err);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');

  if (resource === 'conversations') {
    return handleConversations(request, url);
  }

  return legacyError('Method not allowed', 405);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');

  if (resource === 'voice') return handleVoicePost(request);
  if (resource === 'conversations') return handleConversations(request, url);

  return handleChatPost(request);
}

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');

  if (resource === 'conversations') return handleConversations(request, url);

  return legacyError('Method not allowed', 405);
}
