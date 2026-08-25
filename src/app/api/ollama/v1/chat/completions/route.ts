/**
 * POST /api/ollama/v1/chat/completions — proxy to Mac Studio Ollama.
 *
 * Streams SSE through when the client requests `stream: true`. Rewrites
 * `model` via normalizeOllamaUpstreamModelId before forwarding.
 */
import { NextResponse } from 'next/server';
import {
  assertOllamaProxyAuthorized,
  forwardToOllama,
  normalizeOllamaUpstreamModelId,
} from '@/lib/ollama-proxy';

export const dynamic = 'force-dynamic';
/** Large local models (esp. 36B) need a long wall clock on Fluid Compute. */
export const maxDuration = 300;

type ChatCompletionsBody = {
  model?: unknown;
  stream?: unknown;
  [key: string]: unknown;
};

export async function POST(request: Request) {
  if (!assertOllamaProxyAuthorized(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ChatCompletionsBody;
  try {
    body = (await request.json()) as ChatCompletionsBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.model !== 'string' || !body.model.trim()) {
    return NextResponse.json({ error: 'model is required' }, { status: 400 });
  }

  const upstreamBody = {
    ...body,
    model: normalizeOllamaUpstreamModelId(body.model),
  };

  let upstream: Response;
  try {
    upstream = await forwardToOllama('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upstreamBody),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream Ollama unreachable';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/json';

  // Stream passthrough for SSE / chunked responses.
  if (body.stream === true && upstream.body) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType.includes('event-stream')
          ? 'text/event-stream; charset=utf-8'
          : contentType,
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': contentType },
  });
}
