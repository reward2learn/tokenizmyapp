/** Vercel env key for the Mac Studio Ollama tunnel base URL (no trailing slash). */
export const OLLAMA_TUNNEL_HOST_ENV_KEY = 'OLLAMA_TUNNEL_HOST';

/** Default upstream when unset — Cloudflare tunnel to Mac Studio Ollama. */
export const DEFAULT_OLLAMA_TUNNEL_HOST = 'https://ollama.tokenizin.com';

/**
 * Normalize and validate an Ollama tunnel host URL.
 * Returns origin + optional path without trailing slashes.
 */
export function normalizeOllamaTunnelHost(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('OLLAMA_TUNNEL_HOST is required');
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      'OLLAMA_TUNNEL_HOST must be a valid URL (e.g. https://ollama.tokenizin.com)',
    );
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('OLLAMA_TUNNEL_HOST must use http or https');
  }
  const path = url.pathname.replace(/\/+$/, '');
  return `${url.origin}${path}`;
}

/** Resolve tunnel host from env or default (server-side). */
export function resolveOllamaTunnelHost(
  override?: string | null,
): string {
  const raw = override?.trim()
    || process.env.OLLAMA_TUNNEL_HOST?.trim()
    || DEFAULT_OLLAMA_TUNNEL_HOST;
  return normalizeOllamaTunnelHost(raw);
}
