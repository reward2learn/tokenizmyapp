/**
 * Chat Completions models that support SSE text streaming.
 * gpt-realtime-* models use the Realtime WebSocket API and do not stream text
 * through /v1/chat/completions.
 *
 * OpenAI's `*-search-preview` Chat Completions models are deprecated (shutdown
 * 2026-07-23). Web search no longer forces those ids — use the selected/active
 * chat model instead. Live web search belongs on the Responses API `web_search`
 * tool (migration TBD); until then we avoid calling a dead model id.
 */
const DEPRECATED_SEARCH_PREVIEW = /search-preview/i;

export function resolveChatCompletionModel(webSearchEnabled = false): string {
  if (webSearchEnabled) {
    const searchModel = process.env.OPENAI_WEB_SEARCH_MODEL?.trim();
    // Only honor an explicit env override that is not a deprecated search-preview id.
    if (searchModel && !DEPRECATED_SEARCH_PREVIEW.test(searchModel) && !/realtime/i.test(searchModel)) {
      return searchModel;
    }
    // Fall through to the normal chat model — do not default to gpt-*-search-preview.
  }

  const configured = process.env.OPENAI_CHAT_MODEL
    || process.env.OPENAI_MODEL
    || 'gpt-4o-mini';

  if (/realtime/i.test(configured) || DEPRECATED_SEARCH_PREVIEW.test(configured)) {
    return process.env.OPENAI_CHAT_STREAM_MODEL || 'gpt-4o-mini';
  }

  return configured;
}

/**
 * Prefers the model selected in Config / the chat Tools picker over the
 * OPENAI_CHAT_MODEL / OPENAI_MODEL env chain. Never returns a deprecated
 * search-preview id. Realtime models fall back to the stream-safe default.
 */
export function resolveEffectiveChatModel(
  activeModel: string | null | undefined,
  webSearchEnabled: boolean,
): string {
  if (activeModel && !/realtime/i.test(activeModel) && !DEPRECATED_SEARCH_PREVIEW.test(activeModel)) {
    // Prefer the user's/config selection even when web search is on — search-preview
    // overrides are gone. Web search instructions may still be attached separately.
    return activeModel;
  }
  return resolveChatCompletionModel(webSearchEnabled);
}
