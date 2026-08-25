/**
 * Mac Studio Ollama proxy helpers — used by /api/ollama/v1/*.
 *
 * Vercel cannot reach the Studio’s localhost; set OLLAMA_BASE_URL to a public
 * HTTPS tunnel (Cloudflare Tunnel, ngrok, Tailscale Funnel, etc.) that
 * forwards to Ollama’s OpenAI-compatible surface (typically :11434).
 *
 * Auth: callers send Authorization: Bearer <key>. Accepted keys are
 * OLLAMA_PROXY_API_KEY or TOKENIZMYAPP_API_KEY (matches the AI Providers
 * "Key secret name" / env wiring for TokenizMyApp-Studio-AI).
 */

import { timingSafeEqual } from 'node:crypto';

export interface StudioOllamaModel {
  /** Id shown in the AI Providers picker / sent as `model` on chat. */
  id: string;
  label: string;
  description?: string;
  /** When false, hidden from GET /models (e.g. embedding-only). */
  chatCapable: boolean;
}

/**
 * Curated Mac Studio inventory. Ids use the `ollama/<tag>` form so they stay
 * distinct from cloud providers in the composer picker.
 */
export const STUDIO_OLLAMA_MODELS: StudioOllamaModel[] = [
  {
    id: 'ollama/qwen2.5:14b',
    label: 'Qwen2.5 14B (Studio)',
    description: 'Ollama (Mac Studio) • ollama/qwen2.5:14b',
    chatCapable: true,
  },
  {
    id: 'ollama/qwen2.5:7b',
    label: 'Qwen2.5 7B (Studio)',
    description: 'Ollama (Mac Studio) • ollama/qwen2.5:7b',
    chatCapable: true,
  },
  {
    id: 'ollama/qwen3:8b',
    label: 'Qwen3 8B (Studio)',
    description: 'Ollama (Mac Studio) • ollama/qwen3:8b',
    chatCapable: true,
  },
  {
    id: 'ollama/qwen3-embedding:0.6b',
    label: 'Qwen3 Embedding 0.6B (Studio)',
    description: 'Ollama (Mac Studio) • ollama/qwen3-embedding:0.6b',
    chatCapable: false,
  },
  {
    id: 'ollama/qwen3.6:latest',
    label: 'Qwen3.6 36B (Studio)',
    description: 'Ollama (Mac Studio) • ollama/qwen3.6:latest',
    chatCapable: true,
  },
];

export function getOllamaBaseUrl(): string | null {
  const raw = process.env.OLLAMA_BASE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

function readConfiguredProxyKeys(): string[] {
  return [process.env.OLLAMA_PROXY_API_KEY, process.env.TOKENIZMYAPP_API_KEY]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));
}

function safeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/** Extract Bearer token from an Authorization header value. */
export function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}

/**
 * Returns true when the request is allowed.
 * - If no proxy keys are configured, allow (local/dev convenience).
 * - Otherwise require a matching Bearer token.
 */
export function assertOllamaProxyAuthorized(authorization: string | null): boolean {
  const configured = readConfiguredProxyKeys();
  if (configured.length === 0) return true;
  const token = extractBearerToken(authorization);
  if (!token) return false;
  return configured.some((key) => safeEqualString(key, token));
}

/**
 * Map picker / catalog model ids to the tag Ollama expects upstream.
 *
 * Example: `ollama/qwen2.5:14b` → `qwen2.5:14b`
 *
 * TODO (your turn): adjust aliases if your Studio tags differ (e.g. `:latest`
 * vs a pinned digest, or ids without the `ollama/` prefix).
 */
export function normalizeOllamaUpstreamModelId(modelId: string): string {
  const trimmed = modelId.trim();
  if (trimmed.toLowerCase().startsWith('ollama/')) {
    return trimmed.slice('ollama/'.length);
  }
  return trimmed;
}

/** OpenAI-compatible GET /models payload from the curated Studio list. */
export function curatedModelsOpenAiPayload(includeEmbeddings = false): {
  object: 'list';
  data: Array<{ id: string; object: 'model'; owned_by: string; name?: string; description?: string }>;
} {
  const models = STUDIO_OLLAMA_MODELS.filter((m) => includeEmbeddings || m.chatCapable);
  return {
    object: 'list',
    data: models.map((m) => ({
      id: m.id,
      object: 'model' as const,
      owned_by: 'mac-studio-ollama',
      name: m.label,
      description: m.description,
    })),
  };
}

export function buildUpstreamUrl(path: string): string | null {
  const base = getOllamaBaseUrl();
  if (!base) return null;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function forwardToOllama(
  path: string,
  init: RequestInit,
): Promise<Response> {
  const url = buildUpstreamUrl(path);
  if (!url) {
    throw new Error(
      'OLLAMA_BASE_URL is not set. Point it at your Mac Studio tunnel (e.g. https://….trycloudflare.com).',
    );
  }

  const headers = new Headers(init.headers);
  // Ollama’s local OpenAI surface typically ignores auth; do not forward the
  // factory proxy key to the Studio.
  headers.delete('authorization');
  headers.delete('host');
  headers.delete('content-length');

  return fetch(url, {
    ...init,
    headers,
    // Studio inference can be slow (14B–36B).
    signal: init.signal,
  });
}
