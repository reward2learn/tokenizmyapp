/** Vercel env key for the Mac Studio DeepSeek tunnel base URL (no trailing slash). */
export const DEEPSEEK_TUNNEL_HOST_ENV_KEY = 'DEEPSEEK_TUNNEL_HOST';

/** Default upstream when unset — Cloudflare tunnel to Mac Studio MLX DeepSeek. */
export const DEFAULT_DEEPSEEK_TUNNEL_HOST = 'https://deepseek.tokenizin.com';

/**
 * Normalize and validate a DeepSeek tunnel host URL.
 * Returns origin + optional path without trailing slashes.
 */
export function normalizeDeepseekTunnelHost(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('DEEPSEEK_TUNNEL_HOST is required');
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      'DEEPSEEK_TUNNEL_HOST must be a valid URL (e.g. https://deepseek.tokenizin.com)',
    );
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('DEEPSEEK_TUNNEL_HOST must use http or https');
  }
  const path = url.pathname.replace(/\/+$/, '');
  return `${url.origin}${path}`;
}

/** Resolve tunnel host from env or default (server-side). */
export function resolveDeepseekTunnelHost(
  override?: string | null,
): string {
  const raw = override?.trim()
    || process.env.DEEPSEEK_TUNNEL_HOST?.trim()
    || DEFAULT_DEEPSEEK_TUNNEL_HOST;
  return normalizeDeepseekTunnelHost(raw);
}
