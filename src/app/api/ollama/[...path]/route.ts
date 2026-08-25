/**
 * Catch-all OpenAI/Ollama proxy: /api/ollama/* → OLLAMA_TUNNEL_HOST/*
 *
 * Forwards path, query, method, and body verbatim. Streams the upstream
 * response (SSE chat completions) without buffering. No auth — the tunnel
 * host is already access-controlled as needed.
 *
 * Env: OLLAMA_TUNNEL_HOST (default https://ollama.tokenizin.com)
 */
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function tunnelBase(): string {
  const raw = process.env.OLLAMA_TUNNEL_HOST?.trim() || 'https://ollama.tokenizin.com';
  return raw.replace(/\/+$/, '');
}

function filterHeaders(source: Headers): Headers {
  const out = new Headers();
  source.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    // CF Access client headers are not used on this proxy.
    if (lower.startsWith('cf-access-')) return;
    out.set(key, value);
  });
  return out;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  const targetPath = path.join('/');
  const incoming = new URL(request.url);
  const targetUrl = `${tunnelBase()}/${targetPath}${incoming.search}`;

  const headers = filterHeaders(request.headers);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  // Request bodies for chat/embeddings are small JSON — buffer so we do not
  // need fetch duplex. Response streaming is preserved below.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ollama tunnel unreachable';
    return Response.json({ error: message }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: filterHeaders(upstream.headers),
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
