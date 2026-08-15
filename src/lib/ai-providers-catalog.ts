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
 * All three providers expose an OpenAI-compatible Chat Completions surface,
 * so the same request/response handling in content-generator.ts and the
 * chat assistant works unchanged across providers — only the base URL, API
 * key, and model string differ.
 *
 * - OpenAI: https://api.openai.com/v1
 * - Vercel AI Gateway: https://ai-gateway.vercel.sh/v1 — unified access to
 *   100+ models via "provider/model" slugs (e.g. "anthropic/claude-opus-5").
 *   See https://vercel.com/docs/ai-gateway.
 * - OpenCode Zen: https://opencode.ai/zen/v1 — curated models for coding
 *   agents. See https://opencode.ai/docs/zen/.
 */

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
    // Verified live: GET /v1/models returns the full catalog with no
    // Authorization header at all (chat/completions still requires a key).
    modelsRequireAuth: false,
    docsUrl: 'https://opencode.ai/docs/zen/',
  },
];

export function getAiProvider(id: string | null | undefined): AiProviderDef | null {
  return AI_PROVIDERS.find((p) => p.id === id) ?? null;
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
 * model catalogs change frequently (see the provider docs). Only ever
 * called from server code (route handlers) — never call this directly from
 * a client component, since it would ship the API key to the provider's
 * API from the browser instead of routing it through our own server.
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
