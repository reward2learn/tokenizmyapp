/**
 * AI Provider Catalog — lets an operator choose which AI backend powers
 * content generation (Config > AI Provider) instead of being hardcoded to
 * OpenAI. All three providers expose an OpenAI-compatible Chat Completions
 * surface, so the same request/response handling in content-generator.ts
 * works unchanged across providers — only the base URL, API key, and model
 * string differ.
 *
 * - OpenAI: https://api.openai.com/v1
 * - Vercel AI Gateway: https://ai-gateway.vercel.sh/v1 — unified access to
 *   100+ models via "provider/model" slugs (e.g. "anthropic/claude-opus-5").
 *   See https://vercel.com/docs/ai-gateway.
 * - OpenCode Zen: https://opencode.ai/zen/v1 — curated models for coding
 *   agents. See https://opencode.ai/docs/zen/.
 */
import { getSecretPlaintext } from '@/lib/secrets';

export type AiProviderId = 'openai' | 'vercel-ai-gateway' | 'opencode-zen';

export interface AiProviderDef {
  id: AiProviderId;
  label: string;
  /** secrets.ts keyName the API key is stored under (encrypted in the DB). */
  keySecretName: string;
  /** Env var checked when no DB-stored key exists, mirroring resolveOpenAiKey(). */
  keyEnvVar: string;
  keyPlaceholder: string;
  chatCompletionsUrl: string;
  modelsUrl: string;
  /** Whether GET {modelsUrl} requires the provider's API key. */
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
    modelsRequireAuth: false,
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
];

export function getAiProvider(id: string | null | undefined): AiProviderDef | null {
  return AI_PROVIDERS.find((p) => p.id === id) ?? null;
}

/** Secret keyName the active provider selection is stored under — not a
 *  real secret, just reusing the existing encrypted key-value store so this
 *  needs no new table/migration. */
const ACTIVE_PROVIDER_KEY = 'AI_ACTIVE_PROVIDER';
const ACTIVE_MODEL_KEY = 'AI_ACTIVE_MODEL';

export async function getActiveProviderId(): Promise<AiProviderId> {
  const stored = await getSecretPlaintext(ACTIVE_PROVIDER_KEY);
  const provider = getAiProvider(stored);
  return provider?.id ?? 'openai'; // default preserves pre-multi-provider behavior
}

export async function getActiveModel(providerId: AiProviderId): Promise<string | null> {
  const stored = await getSecretPlaintext(ACTIVE_MODEL_KEY);
  if (stored) return stored;
  return getAiProvider(providerId)?.defaultModel ?? null;
}

export async function setActiveProvider(providerId: AiProviderId, model?: string | null): Promise<void> {
  const { setSecret, deleteSecret } = await import('@/lib/secrets');
  await setSecret(ACTIVE_PROVIDER_KEY, providerId);
  if (model) {
    await setSecret(ACTIVE_MODEL_KEY, model);
  } else {
    await deleteSecret(ACTIVE_MODEL_KEY);
  }
}

/** Resolve an API key for a provider: DB secret first, then its env var. */
export async function resolveProviderKey(provider: AiProviderDef): Promise<string | null> {
  try {
    const key = await getSecretPlaintext(provider.keySecretName);
    if (key) return key;
  } catch (err) {
    console.warn(`[ai-providers] DB key fetch failed for ${provider.id}, falling back to env:`, err instanceof Error ? err.message : err);
  }
  return process.env[provider.keyEnvVar] ?? null;
}

export interface ActiveAiConfig {
  provider: AiProviderDef;
  apiKey: string;
  model: string;
}

/**
 * Resolve the fully-configured active AI backend: which provider, its API
 * key, and which model to call. Returns null when the active provider has
 * no key configured (DB or env) — callers should surface a "configure a
 * provider" error rather than attempting a request with no credentials.
 */
export async function resolveActiveAiConfig(modelOverride?: string | null): Promise<ActiveAiConfig | null> {
  const providerId = await getActiveProviderId();
  const provider = getAiProvider(providerId);
  if (!provider) return null;

  const apiKey = await resolveProviderKey(provider);
  if (!apiKey) return null;

  const model = modelOverride || (await getActiveModel(providerId));
  if (!model) return null;

  return { provider, apiKey, model };
}

export interface AiModelOption {
  id: string;
  label: string;
  description?: string;
}

/** Raw shapes from each provider's OpenAI-compatible /models endpoint. */
type RawModel = { id: string; owned_by?: string; name?: string; description?: string; type?: string };

/**
 * Fetch the live list of models currently available for a provider, using
 * its own API key. This is what backs the "select Model from a list of
 * available models" step in the Config UI — never a hardcoded list, since
 * model catalogs change frequently (see the provider docs).
 */
export async function listProviderModels(provider: AiProviderDef, apiKey: string | null): Promise<AiModelOption[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (provider.modelsRequireAuth) {
    if (!apiKey) throw new Error(`${provider.label} requires an API key to list models`);
    headers.Authorization = `Bearer ${apiKey}`;
  } else if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(provider.modelsUrl, { headers });
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
    default:
      return raw.map((m) => ({ id: m.id, label: m.id }));
  }
}
