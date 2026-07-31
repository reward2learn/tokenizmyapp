import { NextResponse } from 'next/server';
import { getRun } from 'workflow/api';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError } from '@/lib/api/response';

export const maxDuration = 30;

/**
 * GET /api/config/reseed/status?runId=wrun_...
 *
 * Returns the workflow run's current status and, if completed, the full
 * result payload (mapped to the AiPipelineResult shape the UI expects).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  if (!runId) {
    return jsonError('Missing required query parameter: runId', 400);
  }

  const run = getRun<Record<string, unknown>>(runId);

  try {
    const exists = await run.exists;
    if (!exists) {
      return NextResponse.json({ status: 'not_found', runId }, { status: 404 });
    }

    const status = await run.status;

    if (status === 'completed') {
      const result = await run.returnValue;
      return NextResponse.json({
        status: 'completed',
        runId,
        result,
        completedAt: await run.completedAt,
      });
    }

    if (status === 'failed') {
      try {
        await run.returnValue;
      } catch (err) {
        const cause = err instanceof Error ? err.message : String(err);
        return NextResponse.json({
          status: 'failed',
          runId,
          error: cause,
        });
      }
    }

    return NextResponse.json({
      status,
      runId,
      startedAt: await run.startedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    return jsonError(message, 500);
  }
}
