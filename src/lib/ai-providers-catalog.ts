/**
 * AI Provider Catalog — static provider metadata + the live model-list
 * fetcher. Deliberately has NO server-only imports (no Prisma/db/secrets)
 * so it's safe to import from client components (e.g. the Create App
 * Wizard's provider dropdown, before any key has been saved anywhere) as
 * well as from server code. `ai-providers.ts` re-exports everything here
 * alongside the DB-backed functions (getActiveProviderId, resolveProviderKey,
 * etc.) — import from there for server code; import directly from this file
 * only when a client component needs the catalog without pulling in the
 * DB-dependent half.
 *
 * All providers expose an OpenAI-compatible Chat Completions surface, so the
 * same request/response handling in content-generator.ts and the chat
 * assistant works unchanged across providers — only the base URL, API key,
 * and model string differ.
 *
 * Builtin `AI_PROVIDERS` is the seed template. Runtime catalogs may live in
 * the DB secret `AI_PROVIDERS_CATALOG` and can include custom OpenAI-compatible
 * backends (ids are free-form strings validated against the loaded catalog).
 *
 * - OpenAI: https://api.openai.com/v1
 * - Vercel AI Gateway: https://ai-gateway.vercel.sh/v1 — unified access to
 *   100+ models via "provider/model" slugs (e.g. "anthropic/claude-opus-5").
 *   See https://vercel.com/docs/ai-gateway.
 * - OpenCode Zen: https://opencode.ai/zen/v1 — curated models for coding
 *   agents. See https://opencode.ai/docs/zen/.
 * - Nous Research: https://inference-api.nousresearch.com/v1 — Hermes and
 *   other OpenAI-compatible models. See https://portal.nousresearch.com.
 * - TokenizMyApp-Studio-AI: factory `/api/ollama` catch-all → Mac Studio
 *   (OLLAMA_TUNNEL_HOST, default https://ollama.tokenizin.com).
 * - StarWorld DeepSeek: Mac Studio MLX DeepSeek OpenAI-compat surface
 *   (DEEPSEEK_TUNNEL_HOST, default https://deepseek.tokenizin.com).
 */

import { resolveDeepseekTunnelHost } from '@/lib/deepseek-tunnel-host';

/** Factory OpenAI-compatible surface for Mac Studio Ollama (no proxy auth). */
export const FACTORY_OLLAMA_V1_BASE = 'https://tokenizmyapp.vercel.app/api/ollama/v1';

/**
 * Placeholder Bearer token for OpenAI-compat clients when the upstream proxy
 * needs no auth (ollama-studio / modelsRequireAuth: false). Ollama ignores it.
 */
export const KEYLESS_PROVIDER_BEARER = 'ollama';

/** True for the placeholder token used when a provider needs no real API key. */
export function isKeylessProviderBearer(apiKey: string | null | undefined): boolean {
  return apiKey === KEYLESS_PROVIDER_BEARER;
}

/**
 * Authorization headers for upstream provider fetches. Keyless providers
 * (ollama-studio) omit Bearer entirely — the Mac Studio tunnel and warm-model
 * checks use no auth; sending `Bearer ollama` can make gateways return 502.
 */
export function buildProviderFetchHeaders(
  apiKey: string | null | undefined,
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (apiKey && !isKeylessProviderBearer(apiKey)) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

/** Whether an API key must be stored before activate, chat, or model listing. */
export function providerRequiresApiKey(provider: AiProviderDef): boolean {
  return provider.modelsRequireAuth;
}

/** Ready to use: key on file, or the provider does not require one. */
export function isProviderConfigured(
  provider: AiProviderDef,
  source: 'db' | 'env' | null,
): boolean {
  return !providerRequiresApiKey(provider) || source !== null;
}

/**
 * Mac Studio tunnel providers — OpenAI-compatible chat, but no reliable
 * function-calling on the chat assistant path (tools are stripped server-side).
 */
export const LOCAL_STUDIO_PROVIDER_IDS = ['ollama-studio', 'deepseek-studio'] as const;

export function providerSupportsChatTools(providerId: string | null | undefined): boolean {
  if (!providerId) return true;
  return !(LOCAL_STUDIO_PROVIDER_IDS as readonly string[]).includes(providerId);
}

/** Workbook read tools kept on Mac Studio providers (session/platform tools stripped). */
export const STUDIO_WORKBOOK_TOOL_NAMES = ['list_workbook_sheets', 'query_sheet_data'] as const;

export function filterChatToolsForProvider<T extends { function: { name: string } }>(
  tools: T[],
  providerId: string | null | undefined,
): T[] {
  if (providerSupportsChatTools(providerId)) return tools;
  const allowed = new Set<string>(STUDIO_WORKBOOK_TOOL_NAMES);
  return tools.filter((tool) => allowed.has(tool.function.name));
}

/** Canonical builtin provider id list — seed template + defaults. */
export const AI_PROVIDER_IDS = [
  'openai',
  'vercel-ai-gateway',
  'opencode-zen',
  'nous-research',
  'ollama-studio',
  'deepseek-studio',
] as const;

/** Builtin provider ids only. Runtime / DB catalog ids are plain `string`. */
export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export interface AiProviderDef {
  /** Builtin or custom id (slug). Custom ids are allowed in DB catalogs. */
  id: string;
  label: string;
  /** secrets.ts keyName the API key is stored under (encrypted in the DB). */
  keySecretName: string;
  /** Env var checked when no DB-stored key exists, mirroring resolveOpenAiKey(). */
  keyEnvVar: string;
  keyPlaceholder: string;
  chatCompletionsUrl: string;
  modelsUrl: string;
  /**
   * Whether our listProviderModels() requires an API key before calling
   * GET {modelsUrl}. Does not control chat auth (chat always sends Bearer).
   * Builtins set this true so admin/chat option UIs cannot enumerate upstream
   * catalogs without BYOK.
   */
  modelsRequireAuth: boolean;
  docsUrl: string;
  /** Only OpenAI has a stable, well-known default — the others require an
   *  explicit pick from the live model list fetched via listProviderModels(). */
  defaultModel?: string;
}

export const AI_PROVIDERS: AiProviderDef[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    keySecretName: 'OPENAI_API_KEY',
    keyEnvVar: 'OPENAI_API_KEY',
    keyPlaceholder: 'sk-...',
    chatCompletionsUrl: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    modelsRequireAuth: true,
    docsUrl: 'https://platform.openai.com/settings/organization/billing',
    defaultModel: 'gpt-4o',
  },
  {
    id: 'vercel-ai-gateway',
    label: 'Vercel AI Gateway',
    keySecretName: 'VERCEL_AI_GATEWAY_API_KEY',
    keyEnvVar: 'AI_GATEWAY_API_KEY',
    keyPlaceholder: 'AI Gateway API key',
    chatCompletionsUrl: 'https://ai-gateway.vercel.sh/v1/chat/completions',
    modelsUrl: 'https://ai-gateway.vercel.sh/v1/models',
    modelsRequireAuth: true,
    docsUrl: 'https://vercel.com/docs/ai-gateway',
  },
  {
    id: 'opencode-zen',
    label: 'OpenCode Zen',
    keySecretName: 'OPENCODE_ZEN_API_KEY',
    keyEnvVar: 'OPENCODE_ZEN_API_KEY',
    keyPlaceholder: 'OpenCode Zen API key',
    chatCompletionsUrl: 'https://opencode.ai/zen/v1/chat/completions',
    modelsUrl: 'https://opencode.ai/zen/v1/models',
    modelsRequireAuth: true,
    docsUrl: 'https://opencode.ai/docs/zen/',
  },
  {
    id: 'nous-research',
    label: 'Nous Research',
    keySecretName: 'NOUSRE_SEARCH_API_KEY',
    keyEnvVar: 'NOUSRE_SEARCH_API_KEY',
    keyPlaceholder: 'sk-nous-...',
    chatCompletionsUrl: 'https://inference-api.nousresearch.com/v1/chat/completions',
    modelsUrl: 'https://inference-api.nousresearch.com/v1/models',
    modelsRequireAuth: true,
    docsUrl: 'https://portal.nousresearch.com',
    // Free-tier default; paid Hermes models remain available via /models.
    defaultModel: 'tencent/hy3:free',
  },
  {
    id: 'ollama-studio',
    label: 'TokenizMyApp-Studio-AI',
    keySecretName: 'TOKENIZMYAPP_API_KEY',
    keyEnvVar: 'TOKENIZMYAPP_API_KEY',
    keyPlaceholder: 'optional — factory proxy has no auth',
    chatCompletionsUrl: `${FACTORY_OLLAMA_V1_BASE}/chat/completions`,
    modelsUrl: `${FACTORY_OLLAMA_V1_BASE}/models`,
    // Proxy does not require a key; listing hits the factory catch-all.
    modelsRequireAuth: false,
    docsUrl: FACTORY_OLLAMA_V1_BASE,
    defaultModel: 'qwen2.5:14b',
  } 
];

/**
 * Ensure every builtin seed provider is present. Saved / DB entries win on
 * id collision; extras (custom backends) are kept after the builtins.
 */
export function withBuiltinAiProviders(catalog: AiProviderDef[]): AiProviderDef[] {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const merged: AiProviderDef[] = [];
  for (const builtin of AI_PROVIDERS) {
    merged.push(byId.get(builtin.id) ?? { ...builtin });
    byId.delete(builtin.id);
  }
  for (const p of catalog) {
    if (byId.has(p.id)) {
      merged.push(p);
      byId.delete(p.id);
    }
  }
  return merged;
}

/** Lookup in the static builtin seed catalog only. Prefer findProviderInCatalog
 *  / loadAiProvidersCatalog at runtime for DB-backed catalogs. */
export function getAiProvider(id: string | null | undefined): AiProviderDef | null {
  return AI_PROVIDERS.find((p) => p.id === id) ?? null;
}

export function findProviderInCatalog(
  catalog: AiProviderDef[],
  id: string | null | undefined,
): AiProviderDef | null {
  if (!id) return null;
  return catalog.find((p) => p.id === id) ?? null;
}

export interface AiModelOption {
  id: string;
  label: string;
  description?: string;
}

/** Raw shapes from each provider's OpenAI-compatible /models endpoint. */
type RawModel = { id: string; owned_by?: string; name?: string; description?: string; type?: string };

function mapGenericChatModels(raw: RawModel[]): AiModelOption[] {
  return raw
    .filter((m) => !/embed/i.test(m.id) && (!m.type || m.type === 'language' || m.type === 'chat'))
    .map((m) => ({ id: m.id, label: m.name || m.id, description: m.description }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Fetch the live list of models currently available for a provider, using
 * its own API key. This is what backs the "select Model from a list of
 * available models" step in the Config UI — never a hardcoded list, since
 * model catalogs change frequently (see the provider docs). Only ever
 * called from server code (route handlers) — never call this directly from
 * a client component, since it would ship the API key to the provider's
 * API from the browser instead of routing it through our own server.
 *
 * Builtin providers keep specialized filters; unknown/custom ids use a
 * generic chat-model filter (exclude embed) so DB-defined providers work.
 */
/** Mac Studio tunnel base (OpenAI-compatible /v1). */
function ollamaTunnelV1Base(): string {
  const tunnel = process.env.OLLAMA_TUNNEL_HOST?.trim() || 'https://ollama.tokenizin.com';
  return `${tunnel.replace(/\/+$/, '')}/v1`;
}

/** Mac Studio DeepSeek tunnel base (OpenAI-compatible /v1). */
function deepseekTunnelV1Base(): string {
  return `${resolveDeepseekTunnelHost().replace(/\/+$/, '')}/v1`;
}

/** Friendly label for MLX model paths (e.g. …/DeepSeek-V4-Flash:no-think). */
function deepSeekModelLabel(id: string): string {
  const segment = id.includes('/') ? id.split('/').pop() ?? id : id;
  return segment;
}

function mapDeepSeekStudioModels(raw: RawModel[]): AiModelOption[] {
  return raw
    .filter((m) => !/embed/i.test(m.id))
    .map((m) => ({
      id: m.id,
      label: m.name || deepSeekModelLabel(m.id),
      description: m.description,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Server-side chat URL for a provider. ollama-studio hits the tunnel directly
 * (one hop, no self-fetch via /api/ollama). Catalog chatCompletionsUrl stays
 * the factory proxy for external OpenAI-compat clients and documentation.
 */
export function resolveChatCompletionsUrl(provider: AiProviderDef): string {
  if (provider.id === 'ollama-studio') {
    return `${ollamaTunnelV1Base()}/chat/completions`;
  }
  if (provider.id === 'deepseek-studio') {
    return `${deepseekTunnelV1Base()}/chat/completions`;
  }
  return provider.chatCompletionsUrl;
}

function resolveModelsFetchUrl(provider: AiProviderDef): string {
  if (provider.id === 'ollama-studio') {
    return `${ollamaTunnelV1Base()}/models`;
  }
  if (provider.id === 'deepseek-studio') {
    return `${deepseekTunnelV1Base()}/models`;
  }
  return provider.modelsUrl;
}

export async function listProviderModels(provider: AiProviderDef, apiKey: string | null): Promise<AiModelOption[]> {
  if (provider.modelsRequireAuth && !apiKey) {
    throw new Error(`${provider.label} requires an API key to list models`);
  }

  const response = await fetch(resolveModelsFetchUrl(provider), {
    headers: buildProviderFetchHeaders(apiKey),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to list ${provider.label} models (${response.status}): ${body.slice(0, 300)}`);
  }

  const json = await response.json() as { data?: RawModel[] };
  const raw = json.data ?? [];

  switch (provider.id) {
    case 'openai':
      // /v1/models returns every model type (embeddings, whisper, tts,
      // dall-e, moderation, fine-tunes...) — keep only chat-capable ones.
      return raw
        .filter((m) => /^(gpt-|o1|o3|o4|chatgpt)/.test(m.id) && !/-instruct$/.test(m.id))
        .map((m) => ({ id: m.id, label: m.id }))
        .sort((a, b) => a.id.localeCompare(b.id));
    case 'vercel-ai-gateway':
      // type === 'language' excludes embedding/reranking/image/video models.
      return raw
        .filter((m) => !m.type || m.type === 'language')
        .map((m) => ({ id: m.id, label: m.name || m.id, description: m.description }))
        .sort((a, b) => a.label.localeCompare(b.label));
    case 'opencode-zen':
      return raw
        .filter((m) => !/embed/i.test(m.id))
        .map((m) => ({ id: m.id, label: m.name || m.id, description: m.description }))
        .sort((a, b) => a.label.localeCompare(b.label));
    case 'nous-research':
      // Catalog mixes Hermes + third-party slugs (e.g. tencent/hy3:free).
      // Prefer display name when present; drop obvious embedding-only ids.
      return raw
        .filter((m) => !/embed/i.test(m.id))
        .map((m) => ({ id: m.id, label: m.name || m.id, description: m.description }))
        .sort((a, b) => a.label.localeCompare(b.label));
    case 'ollama-studio':
      // Live tags from Mac Studio via factory /api/ollama → OLLAMA_TUNNEL_HOST.
      return mapGenericChatModels(raw);
    case 'deepseek-studio':
      // MLX DeepSeek on Mac Studio — ids may be full paths or short slugs.
      return mapDeepSeekStudioModels(raw);
    default:
      return mapGenericChatModels(raw);
  }
}
