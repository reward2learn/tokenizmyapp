import {
  CHAT_SESSION_OPENAI_TOOLS,
  type ChatSessionAction,
  type CreditTopUpAction,
  type CustomTemplateDraft,
  executeSessionTool,
  PURCHASE_CREDITS_OPENAI_TOOL,
  type SessionToolContext,
} from '@/lib/chat/session-tools';
import {
  executePlatformTool,
  isPlatformToolName,
  PLATFORM_OPENAI_TOOLS,
} from '@/lib/chat/platform-tools';
import { meterAiUsage, type MeterResult } from '@/domain/billing/credit-service';
import {
  emptyAiUsageSummary,
  foldMeterIntoUsage,
  type AiUsageSummary,
} from '@/lib/billing/ai-usage-summary';
import { buildProviderFetchHeaders } from '@/lib/ai-providers-catalog';

export const CHAT_WEB_SEARCH_INSTRUCTIONS = `Web search is enabled on this chat model. When the user asks about current events, live market data, recent news, or information that may have changed after your training data, search the web before answering. Cite sources briefly when web results are used.`;

function buildOpenAiTools(
  webSearchEnabled: boolean,
  sessionToolsEnabled: boolean,
  billingToolsEnabled: boolean,
  platformToolsEnabled: boolean,
) {
  if (webSearchEnabled) return undefined;
  const tools = sessionToolsEnabled ? [...CHAT_SESSION_OPENAI_TOOLS] : [];
  if (billingToolsEnabled && !tools.some((tool) => tool.function.name === 'purchase_credits')) {
    tools.push(PURCHASE_CREDITS_OPENAI_TOOL);
  }
  if (platformToolsEnabled) {
    for (const tool of PLATFORM_OPENAI_TOOLS) {
      if (!tools.some((existing) => existing.function.name === tool.function.name)) {
        tools.push(tool);
      }
    }
  }
  return tools.length > 0 ? tools : undefined;
}

function isChatFunctionToolCall(toolCall: OpenAiToolCall): boolean {
  if (toolCall.function.name === 'purchase_credits') return true;
  if (isPlatformToolName(toolCall.function.name)) return true;
  return CHAT_SESSION_OPENAI_TOOLS.some((tool) => tool.function.name === toolCall.function.name);
}

interface OpenAiToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAiChatMessage {
  role: string;
  content?: string | null | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  tool_calls?: OpenAiToolCall[];
  tool_call_id?: string;
}

interface OpenAiCompletionResponse {
  choices?: {
    finish_reason?: string;
    message?: OpenAiChatMessage;
  }[];
}

interface OpenAiStreamDelta {
  error?: { message?: string };
  choices?: {
    finish_reason?: string | null;
    delta?: {
      content?: string;
      tool_calls?: {
        index?: number;
        id?: string;
        type?: string;
        function?: { name?: string; arguments?: string };
      }[];
    };
  }[];
}

interface ConsumedOpenAiStream {
  finishReason: string | null;
  content: string;
  toolCalls: OpenAiToolCall[];
  /** Token usage from the final stream chunk (only present when the request
   *  sent `stream_options: { include_usage: true }`). */
  usage: { promptTokens: number; completionTokens: number } | null;
}

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
} as const;

async function executeChatToolCall(
  toolCall: OpenAiToolCall,
  toolContext: SessionToolContext,
): Promise<{ toolMessage: string; sessionResult: Awaited<ReturnType<typeof executeSessionTool>> | null }> {
  if (isPlatformToolName(toolCall.function.name)) {
    const toolMessage = await executePlatformTool(
      toolCall.function.name,
      toolCall.function.arguments,
      { isPlatformAdmin: Boolean(toolContext.isPlatformAdmin) },
    );
    return { toolMessage, sessionResult: null };
  }

  const sessionResult = await executeSessionTool(
    toolCall.function.name,
    toolCall.function.arguments,
    toolContext,
  );
  return { toolMessage: sessionResult.toolMessage, sessionResult };
}

const MAX_TOOL_ROUNDS = 4;

const STUDIO_PROVIDER_ID = 'ollama-studio';

/** User-facing message for a failed upstream chat completion. Exported for tests. */
export function openAiErrorMessage(status: number, detail?: string, providerId?: string | null): string {
  if (detail?.trim()) return detail.trim();
  if (status === 401) return 'The AI provider API key appears to be invalid.';
  if (status === 402) return 'The AI provider account has no credits remaining.';
  if (status === 429) return 'The AI service is currently rate-limited.';
  if (status === 502 || status === 503) {
    if (providerId === STUDIO_PROVIDER_ID) {
      return 'The Mac Studio AI tunnel returned an error. Confirm OLLAMA_TUNNEL_HOST is reachable from Vercel and the model is loaded, then try again.';
    }
    return 'The AI service is temporarily unavailable. Please try again in a moment.';
  }
  if (status === 504 || status === 524) {
    return 'The local model took too long to respond. Try a smaller model (e.g. llama3.1:8b) or send a shorter message.';
  }
  return 'The AI service returned an error.';
}

async function readOpenAiError(response: Response, providerId?: string | null): Promise<string> {
  const raw = await response.text().catch(() => '');
  if (raw.trim()) {
    try {
      const data = JSON.parse(raw) as { error?: string | { message?: string } };
      if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
      if (data.error && typeof data.error === 'object' && data.error.message?.trim()) {
        return data.error.message.trim();
      }
    } catch {
      return raw.trim().slice(0, 300);
    }
  }
  return openAiErrorMessage(response.status, undefined, providerId);
}

function encodeSseLine(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

async function requestOpenAiCompletion(
  chatCompletionsUrl: string,
  apiKey: string,
  model: string,
  messages: OpenAiChatMessage[],
  stream: boolean,
  webSearchEnabled: boolean,
  sessionToolsEnabled: boolean,
  billingToolsEnabled: boolean,
  platformToolsEnabled: boolean,
  providerId?: string | null,
): Promise<Response> {
  const studioLocal = providerId === STUDIO_PROVIDER_ID;
  const tools = studioLocal
    ? undefined
    : buildOpenAiTools(webSearchEnabled, sessionToolsEnabled, billingToolsEnabled, platformToolsEnabled);
  const body = {
    model,
    messages,
    ...(tools ? { tools, tool_choice: 'auto' as const } : {}),
    max_tokens: 1200,
    ...(webSearchEnabled ? {} : { temperature: 0.7 }),
    stream,
    // OpenAI and Ollama (OpenAI-compat) emit a final usage chunk when
    // include_usage is set — required for metering streamed chat turns.
    ...(stream ? { stream_options: { include_usage: true } } : {}),
  };

  return fetch(chatCompletionsUrl, {
    method: 'POST',
    headers: buildProviderFetchHeaders(apiKey),
    body: JSON.stringify(body),
  });
}

export async function consumeOpenAiStream(
  body: ReadableStream<Uint8Array>,
  onContent?: (chunk: string) => void | Promise<void>,
): Promise<ConsumedOpenAiStream> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const toolCallsByIndex = new Map<number, OpenAiToolCall>();
  let finishReason: string | null = null;
  let content = '';
  let usage: { promptTokens: number; completionTokens: number } | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const raw = trimmed.slice('data:'.length).trim();
      if (!raw || raw === '[DONE]') continue;

      const parsed = JSON.parse(raw) as OpenAiStreamDelta & { error?: string | { message?: string }; usage?: { prompt_tokens?: number; completion_tokens?: number } };
      if (typeof parsed.error === 'string' && parsed.error.trim()) {
        throw new Error(parsed.error.trim());
      }
      if (parsed.error && typeof parsed.error === 'object' && parsed.error.message) {
        throw new Error(parsed.error.message);
      }

      // The final chunk (with include_usage) carries usage and empty choices —
      // capture it before the choice guard below skips it.
      if (parsed.usage) {
        usage = {
          promptTokens: parsed.usage.prompt_tokens ?? 0,
          completionTokens: parsed.usage.completion_tokens ?? 0,
        };
      }

      const choice = parsed.choices?.[0];
      if (!choice) continue;

      if (choice.finish_reason) {
        finishReason = choice.finish_reason;
      }

      const delta = choice.delta;
      if (delta?.content) {
        content += delta.content;
        await onContent?.(delta.content);
      }

      if (delta?.tool_calls) {
        for (const toolDelta of delta.tool_calls) {
          const index = toolDelta.index ?? 0;
          let existing = toolCallsByIndex.get(index);
          if (!existing) {
            existing = {
              id: toolDelta.id ?? '',
              type: 'function',
              function: {
                name: toolDelta.function?.name ?? '',
                arguments: toolDelta.function?.arguments ?? '',
              },
            };
            toolCallsByIndex.set(index, existing);
          }
          if (toolDelta.id) existing.id = toolDelta.id;
          if (toolDelta.function?.name) existing.function.name = toolDelta.function.name;
          if (toolDelta.function?.arguments) {
            existing.function.arguments += toolDelta.function.arguments;
          }
        }
      }
    }
  }

  if (buffer.trim()) {
    const trimmed = buffer.trim();
    if (trimmed.startsWith('data:')) {
      const raw = trimmed.slice('data:'.length).trim();
      if (raw && raw !== '[DONE]') {
        const parsed = JSON.parse(raw) as OpenAiStreamDelta & { error?: string | { message?: string }; usage?: { prompt_tokens?: number; completion_tokens?: number } };
        if (parsed.usage) {
          usage = {
            promptTokens: parsed.usage.prompt_tokens ?? 0,
            completionTokens: parsed.usage.completion_tokens ?? 0,
          };
        }
        const choice = parsed.choices?.[0];
        if (choice?.delta?.content) {
          content += choice.delta.content;
          await onContent?.(choice.delta.content);
        }
        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }
      }
    }
  }

  const toolCalls = Array.from(toolCallsByIndex.entries())
    .sort(([left], [right]) => left - right)
    .map(([, call]) => call)
    .filter((call) => call.id && call.function.name);

  return { finishReason, content, toolCalls, usage };
}

/**
 * Meter a chat round against the org's credit balance. Always meters —
 * tenant-stored keys are not an exemption. Non-blocking: a metering failure
 * must never break the chat reply (the pre-flight gate in the route is the
 * enforcement point).
 *
 * Returns the MeterResult so callers can aggregate and emit a usage event to
 * the client. Failure returns null for the meter but still reports token
 * counts when available.
 */
async function meterChatUsage(
  options: {
    tenantSlug: string;
    keySource: 'db' | 'env';
    model: string;
    viewerEmail?: string | null;
    viewerUserId?: string | null;
    provider?: string | null;
    conversationId?: string | null;
    refType?: string;
  },
  usage: { promptTokens: number; completionTokens: number } | null | undefined,
): Promise<{ meter: MeterResult | null; promptTokens: number; completionTokens: number }> {
  const promptTokens = usage?.promptTokens ?? 0;
  const completionTokens = usage?.completionTokens ?? 0;

  try {
    const meter = await meterAiUsage({
      tenantSlug: options.tenantSlug,
      model: options.model,
      promptTokens,
      completionTokens,
      keySource: options.keySource,
      refType: options.refType ?? 'chat',
      refId: options.conversationId ?? null,
      viewerEmail: options.viewerEmail,
      viewerUserId: options.viewerUserId,
      provider: options.provider,
    });
    return { meter, promptTokens, completionTokens };
  } catch (err) {
    console.warn('[chat] Metering failed (non-blocking):', err instanceof Error ? err.message : err);
    return { meter: null, promptTokens, completionTokens };
  }
}

function applyMeterRound(
  turnUsage: AiUsageSummary,
  metered: { meter: MeterResult | null; promptTokens: number; completionTokens: number },
  options: { model: string },
): AiUsageSummary {
  return foldMeterIntoUsage(
    turnUsage,
    metered.meter,
    { promptTokens: metered.promptTokens, completionTokens: metered.completionTokens },
    { model: options.model },
  );
}

async function completeChatWithoutStreaming(options: {
  chatCompletionsUrl: string;
  apiKey: string;
  model: string;
  messages: OpenAiChatMessage[];
  toolContext: SessionToolContext;
  webSearchEnabled: boolean;
  sessionToolsEnabled: boolean;
  billingToolsEnabled: boolean;
  platformToolsEnabled: boolean;
  tenantSlug: string;
  keySource: 'db' | 'env';
  /** Signed-in viewer; exempt operators are recorded but never charged. */
  viewerEmail?: string | null;
  viewerUserId?: string | null;
  provider?: string | null;
  conversationId?: string | null;
  /** Usage already metered before the main chat loop (e.g. map-reduce). */
  priorUsage?: AiUsageSummary | null;
}): Promise<Response> {
  const clientActions: ChatSessionAction[] = [];
  let templateDraft: CustomTemplateDraft | undefined;
  let creditTopUp: CreditTopUpAction | undefined;
  let currentMessages = [...options.messages];
  let turnUsage = options.priorUsage
    ? { ...options.priorUsage }
    : emptyAiUsageSummary({ model: options.model });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const chatResp = await requestOpenAiCompletion(
      options.chatCompletionsUrl,
      options.apiKey,
      options.model,
      currentMessages,
      false,
      options.webSearchEnabled,
      options.sessionToolsEnabled,
      options.billingToolsEnabled,
      options.platformToolsEnabled,
      options.provider,
    );

    if (!chatResp.ok) {
      const errReply = await readOpenAiError(chatResp, options.provider);
      return Response.json({
        success: true,
        data: { reply: errReply, actions: clientActions, usage: turnUsage },
      });
    }

    const data = await chatResp.json() as OpenAiCompletionResponse & { usage?: { prompt_tokens?: number; completion_tokens?: number } };
    const message = data.choices?.[0]?.message;
    if (!message) {
      const fallback = 'I could not generate a response. Please try again.';
      return Response.json({
        success: true,
        data: { reply: fallback, actions: clientActions, usage: turnUsage },
      });
    }

    // Meter this round (tool rounds included — every provider call costs credits).
    const metered = await meterChatUsage(options, data.usage
      ? { promptTokens: data.usage.prompt_tokens ?? 0, completionTokens: data.usage.completion_tokens ?? 0 }
      : null);
    turnUsage = applyMeterRound(turnUsage, metered, options);

    if (message.tool_calls?.length) {
      const chatToolCalls = message.tool_calls.filter(isChatFunctionToolCall);
      if (chatToolCalls.length) {
        currentMessages.push(message);
        for (const toolCall of chatToolCalls) {
          const { toolMessage, sessionResult } = await executeChatToolCall(toolCall, options.toolContext);
          if (sessionResult?.clientAction) clientActions.push(sessionResult.clientAction);
          if (sessionResult?.templateDraft) templateDraft = sessionResult.templateDraft;
          if (sessionResult?.creditTopUp) creditTopUp = sessionResult.creditTopUp;
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolMessage,
          });
        }
        continue;
      }
    }

    const replyContent = typeof message.content === 'string' ? message.content : '';
    const reply = replyContent.trim()
      || 'I could not generate a response. Please try rephrasing your question.';

    return Response.json({
      success: true,
      data: {
        reply,
        actions: clientActions,
        usage: turnUsage,
        ...(templateDraft ? { templateDraft } : {}),
        ...(creditTopUp ? { creditTopUp } : {}),
      },
    });
  }

  const fallback = 'I could not complete the requested session action. Please try again.';
  return Response.json({
    success: true,
    data: { reply: fallback, actions: clientActions, usage: turnUsage },
  });
}

async function completeChatWithStreaming(options: {
  chatCompletionsUrl: string;
  apiKey: string;
  model: string;
  messages: OpenAiChatMessage[];
  toolContext: SessionToolContext;
  webSearchEnabled: boolean;
  sessionToolsEnabled: boolean;
  billingToolsEnabled: boolean;
  platformToolsEnabled: boolean;
  tenantSlug: string;
  keySource: 'db' | 'env';
  /** Signed-in viewer; exempt operators are recorded but never charged. */
  viewerEmail?: string | null;
  viewerUserId?: string | null;
  provider?: string | null;
  conversationId?: string | null;
  /** Usage already metered before the main chat loop (e.g. map-reduce). */
  priorUsage?: AiUsageSummary | null;
}): Promise<Response> {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();

  const writeLine = async (payload: unknown) => {
    await writer.write(encoder.encode(encodeSseLine(payload)));
  };

  void (async () => {
    let currentMessages = [...options.messages];
    let streamedChars = 0;
    let emittedError = false;
    let turnUsage = options.priorUsage
      ? { ...options.priorUsage }
      : emptyAiUsageSummary({ model: options.model });

    try {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const chatResp = await requestOpenAiCompletion(
          options.chatCompletionsUrl,
          options.apiKey,
          options.model,
          currentMessages,
          true,
          options.webSearchEnabled,
          options.sessionToolsEnabled,
          options.billingToolsEnabled,
          options.platformToolsEnabled,
          options.provider,
        );

        if (!chatResp.ok || !chatResp.body) {
          const errMessage = chatResp.ok
            ? 'The AI service returned an empty stream.'
            : await readOpenAiError(chatResp, options.provider);
          await writeLine({ error: errMessage });
          emittedError = true;
          break;
        }

        const { finishReason, content, toolCalls, usage } = await consumeOpenAiStream(
          chatResp.body,
          async (chunk) => {
            streamedChars += chunk.length;
            await writeLine({ choices: [{ delta: { content: chunk } }] });
          },
        );

        // Meter this round from the final usage chunk (include_usage).
        const metered = await meterChatUsage(options, usage);
        turnUsage = applyMeterRound(turnUsage, metered, options);

        if (finishReason === 'tool_calls' && toolCalls.length) {
          const chatToolCalls = toolCalls.filter(isChatFunctionToolCall);
          if (chatToolCalls.length) {
            currentMessages.push({
              role: 'assistant',
              content: content || null,
              tool_calls: chatToolCalls,
            });

            for (const toolCall of chatToolCalls) {
              const { toolMessage, sessionResult } = await executeChatToolCall(toolCall, options.toolContext);
              if (sessionResult?.clientAction) {
                await writeLine({ type: 'chat_action', action: sessionResult.clientAction });
              }
              if (sessionResult?.templateDraft) {
                await writeLine({ type: 'template_draft', draft: sessionResult.templateDraft });
              }
              if (sessionResult?.creditTopUp) {
                await writeLine({ type: 'credit_topup', creditTopUp: sessionResult.creditTopUp });
              }
              if (sessionResult?.clientAction === 'open_credit_topup' && sessionResult.creditTopUp) {
                await writeLine({ type: 'chat_action', action: sessionResult.clientAction });
              }
              currentMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: toolMessage,
              });
            }
            continue;
          }
        }

        break;
      }

      if (streamedChars === 0 && !emittedError) {
        await writeLine({
          error: 'The assistant returned an empty response. Please try again.',
        });
      }

      // Emit aggregated turn usage before [DONE] so the client can refresh
      // the header balance and session totals.
      if (
        turnUsage.promptTokens > 0
        || turnUsage.completionTokens > 0
        || turnUsage.credits > 0
        || turnUsage.consumed > 0
        || options.priorUsage
      ) {
        await writeLine({
          type: 'usage',
          usage: turnUsage,
        });
      }

      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chat stream failed';
      await writeLine({ error: message });
      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, { headers: SSE_HEADERS });
}

export async function completeChatWithSessionTools(options: {
  chatCompletionsUrl: string;
  apiKey: string;
  model: string;
  messages: OpenAiChatMessage[];
  toolContext: SessionToolContext;
  stream: boolean;
  webSearchEnabled: boolean;
  sessionToolsEnabled: boolean;
  billingToolsEnabled: boolean;
  platformToolsEnabled: boolean;
  tenantSlug: string;
  keySource: 'db' | 'env';
  /** Signed-in viewer; exempt operators are recorded but never charged. */
  viewerEmail?: string | null;
  viewerUserId?: string | null;
  provider?: string | null;
  conversationId?: string | null;
  /** Usage already metered before the main chat loop (e.g. map-reduce). */
  priorUsage?: AiUsageSummary | null;
}): Promise<Response> {
  if (options.stream) {
    return completeChatWithStreaming(options);
  }
  return completeChatWithoutStreaming(options);
}
