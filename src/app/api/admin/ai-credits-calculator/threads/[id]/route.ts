/**
 * GET /api/admin/ai-credits-calculator/threads/[id]
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getCalculatorThread } from '@/domain/billing/ai-credits-calculator-chat-service';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin required', 403);
  }

  const { id } = await context.params;
  const result = await getCalculatorThread(id);
  if (!result) return jsonError('Thread not found', 404);

  const userId = String(guard.session.sub ?? guard.session.email ?? 'platform-admin');
  if (result.thread.createdBy !== userId) {
    return jsonError('Thread not found', 404);
  }

  return jsonOk(result);
}
