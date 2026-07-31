import { NextResponse } from 'next/server';
import { getRun } from 'workflow/api';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError } from '@/lib/api/response';

export const maxDuration = 300; // 5 min — streaming endpoint may stay open until workflow completes

/**
 * GET /api/config/reseed/stream?runId=wrun_...
 *
 * SSE stream of workflow progress chunks. Each chunk written by the workflow
 * steps via getWritable() is forwarded as a server-sent event:
 *
 *   data: {"step":"extracting","message":"...","pct":45}
 *
 * The stream ends when the workflow closes its writable stream (or the
 * connection times out).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  if (!runId) {
    return jsonError('Missing required query parameter: runId', 400);
  }

  const run = getRun(runId);

  try {
    const exists = await run.exists;
    if (!exists) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  const stream = run.readable;

  const encoder = new TextEncoder();

  const webStream = new ReadableStream({
    async start(controller) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
            break;
          }
          // value may be a JSON string or an object — normalize to string
          const data = typeof value === 'string' ? value : JSON.stringify(value);
          // SSE format: "data: <json>\n\n"
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n\n`),
        );
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
