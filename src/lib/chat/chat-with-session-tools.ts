import {
  CHAT_SESSION_OPENAI_TOOLS,
  type ChatSessionAction,
  type CustomTemplateDraft,
  executeSessionTool,
  type SessionToolContext,
} from '@/lib/chat/session-tools';
import { meterAiUsage } from '@/domain/billing/credit-service';

export const CHAT_WEB_SEARCH_INSTRUCTIONS = `Web search is enabled on this chat model. When the user asks about current events, live market data, recent news, or information that may have changed after your training data, search the web before answering. Cite sources briefly when web results are used.`;

function buildOpenAiTools(webSearchEnabled: boolean, sessionToolsEnabled: boolean) {
  if (webSearchEnabled || !sessionToolsEnabled) return undefined;
  return [...CHAT_SESSION_OPENAI_TOOLS];
}

function isSessionFunctionToolCall(toolCall: OpenAiToolCall): boolean {
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

const MAX_TOOL_ROUNDS = 4;

function openAiErrorMessage(status: number, detail?: string): string {
  if (detail?.trim()) return detail.trim();
  if (status === 401) return 'The AI provider API key appears to be invalid.';
  if (status === 402) return 'The AI provider account has no credits remaining.';
  if (status === 429) return 'The AI service is currently rate-limited.';
  return 'The AI service returned an error.';
}

async function readOpenAiError(response: Response): Promise<string> {
  try {
    const data = await response.json() as { error?: string | { message?: string } };
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (data.error && typeof data.error === 'object' && data.error.message?.trim()) {
      return data.error.message.trim();
    }
  } catch {
    // ignore parse errors
  }
  return openAiErrorMessage(response.status);
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
): Promise<Response> {
  const tools = buildOpenAiTools(webSearchEnabled, sessionToolsEnabled);
  const body = {
    model,
    messages,
    ...(tools ? { tools, tool_choice: 'auto' as const } : {}),
    max_tokens: 1200,
    ...(webSearchEnabled ? {} : { temperature: 0.7 }),
    stream,
    // Ask for a final usage chunk so streaming calls can be metered — OpenAI
    // sends a last chunk with empty choices and a `usage` field when set.
    ...(stream ? { stream_options: { include_usage: true } } : {}),
  };

  return fetch(chatCompletionsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
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
 * Meter a chat round against the org's credit balance. BYOK (`keySource ===
 * 'db'`) is never charged; platform-key usage is metered non-blocking — a
 * metering failure must never break the chat reply (the pre-flight gate in
 * the route is the enforcement point).
 */
async function meterChatUsage(
  options: {
    tenantSlug: string;
    keySource: 'db' | 'env';
    model: string;
    viewerEmail?: string | null;
  },
  usage: { promptTokens: number; completionTokens: number } | null | undefined,
): Promise<void> {
  if (options.keySource !== 'env') return;
  try {
    await meterAiUsage({
      tenantSlug: options.tenantSlug,
      model: options.model,
      promptTokens: usage?.promptTokens ?? 0,
      completionTokens: usage?.completionTokens ?? 0,
      keySource: options.keySource,
      refType: 'chat',
      // Must match the identity the pre-flight gate used. An exempt viewer who
      // passed the gate but got charged here would accrue debt that then blocks
      // everyone else on the same org.
      viewerEmail: options.viewerEmail,
    });
  } catch (err) {
    console.warn('[chat] Metering failed (non-blocking):', err instanceof Error ? err.message : err);
  }
}

async function completeChatWithoutStreaming(options: {
  chatCompletionsUrl: string;
  apiKey: string;
  model: string;
  messages: OpenAiChatMessage[];
  toolContext: SessionToolContext;
  webSearchEnabled: boolean;
  sessionToolsEnabled: boolean;
  tenantSlug: string;
  keySource: 'db' | 'env';
  /** Signed-in viewer; exempt operators are recorded but never charged. */
  viewerEmail?: string | null;
}): Promise<Response> {
  const clientActions: ChatSessionAction[] = [];
  let templateDraft: CustomTemplateDraft | undefined;
  let currentMessages = [...options.messages];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const chatResp = await requestOpenAiCompletion(
      options.chatCompletionsUrl,
      options.apiKey,
      options.model,
      currentMessages,
      false,
      options.webSearchEnabled,
      options.sessionToolsEnabled,
    );

    if (!chatResp.ok) {
      const errReply = await readOpenAiError(chatResp);
      return Response.json({ success: true, data: { reply: errReply, actions: clientActions } });
    }

    const data = await chatResp.json() as OpenAiCompletionResponse & { usage?: { prompt_tokens?: number; completion_tokens?: number } };
    const message = data.choices?.[0]?.message;
    if (!message) {
      const fallback = 'I could not generate a response. Please try again.';
      return Response.json({ success: true, data: { reply: fallback, actions: clientActions } });
    }

    // Meter this round (tool rounds included — every provider call costs credits).
    await meterChatUsage(options, data.usage
      ? { promptTokens: data.usage.prompt_tokens ?? 0, completionTokens: data.usage.completion_tokens ?? 0 }
      : null);

    if (message.tool_calls?.length) {
      const sessionToolCalls = message.tool_calls.filter(isSessionFunctionToolCall);
      if (sessionToolCalls.length) {
        currentMessages.push(message);
        for (const toolCall of sessionToolCalls) {
          const result = await executeSessionTool(
            toolCall.function.name,
            toolCall.function.arguments,
            options.toolContext,
          );
          if (result.clientAction) clientActions.push(result.clientAction);
          if (result.templateDraft) templateDraft = result.templateDraft;
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result.toolMessage,
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
        ...(templateDraft ? { templateDraft } : {}),
      },
    });
  }

  const fallback = 'I could not complete the requested session action. Please try again.';
  return Response.json({ success: true, data: { reply: fallback, actions: clientActions } });
}

async function completeChatWithStreaming(options: {
  chatCompletionsUrl: string;
  apiKey: string;
  model: string;
  messages: OpenAiChatMessage[];
  toolContext: SessionToolContext;
  webSearchEnabled: boolean;
  sessionToolsEnabled: boolean;
  tenantSlug: string;
  keySource: 'db' | 'env';
  /** Signed-in viewer; exempt operators are recorded but never charged. */
  viewerEmail?: string | null;
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
        );

        if (!chatResp.ok || !chatResp.body) {
          const errMessage = chatResp.ok
            ? 'The AI service returned an empty stream.'
            : await readOpenAiError(chatResp);
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
        await meterChatUsage(options, usage);

        if (finishReason === 'tool_calls' && toolCalls.length) {
          const sessionToolCalls = toolCalls.filter(isSessionFunctionToolCall);
          if (sessionToolCalls.length) {
            currentMessages.push({
              role: 'assistant',
              content: content || null,
              tool_calls: sessionToolCalls,
            });

            for (const toolCall of sessionToolCalls) {
              const result = await executeSessionTool(
                toolCall.function.name,
                toolCall.function.arguments,
                options.toolContext,
              );
              if (result.clientAction) {
                await writeLine({ type: 'chat_action', action: result.clientAction });
              }
              if (result.templateDraft) {
                // Sent as its own event rather than folded into the reply text:
                // the client renders it as a confirmation card with a save
                // button, and the model's prose cannot carry a payload.
                await writeLine({ type: 'template_draft', draft: result.templateDraft });
              }
              currentMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: result.toolMessage,
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
  tenantSlug: string;
  keySource: 'db' | 'env';
  /** Signed-in viewer; exempt operators are recorded but never charged. */
  viewerEmail?: string | null;
}): Promise<Response> {
  if (options.stream) {
    return completeChatWithStreaming(options);
  }
  return completeChatWithoutStreaming(options);
}
