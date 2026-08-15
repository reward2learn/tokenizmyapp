/**
 * Chat Completions models that support SSE text streaming.
 * gpt-realtime-* models use the Realtime WebSocket API and do not stream text
 * through /v1/chat/completions.
 */
export function resolveChatCompletionModel(webSearchEnabled = false): string {
  if (webSearchEnabled) {
    const searchModel = process.env.OPENAI_WEB_SEARCH_MODEL || 'gpt-4o-mini-search-preview';
    if (!/realtime/i.test(searchModel)) return searchModel;
    return 'gpt-4o-mini-search-preview';
  }

  const configured = process.env.OPENAI_CHAT_MODEL
    || process.env.OPENAI_MODEL
    || 'gpt-4o-mini';

  if (/realtime/i.test(configured)) {
    return process.env.OPENAI_CHAT_STREAM_MODEL || 'gpt-4o-mini';
  }

  return configured;
}

/**
 * Like resolveChatCompletionModel(), but prefers the model explicitly
 * selected via Config > AI Chat > AI Provider (the same "AI provider
 * switch" used for AI Content Generation) over the OPENAI_CHAT_MODEL/
 * OPENAI_MODEL env var chain — so picking a model in that UI actually takes
 * effect for OpenAI, not just for the other providers. Web search still
 * always overrides to the dedicated search-preview model; a realtime model
 * (unsupported over /v1/chat/completions streaming) still falls back to the
 * env var chain's safety net.
 */
export function resolveEffectiveChatModel(activeModel: string | null | undefined, webSearchEnabled: boolean): string {
  if (webSearchEnabled) return resolveChatCompletionModel(true);
  if (activeModel && !/realtime/i.test(activeModel)) return activeModel;
  return resolveChatCompletionModel(false);
}
