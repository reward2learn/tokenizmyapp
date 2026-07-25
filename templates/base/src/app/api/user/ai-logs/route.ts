import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

  try {
    const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    const where: Record<string, unknown> = {};
    if (status) where.result = status;

    const logs = await db.aiActionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return jsonOk({
      logs: logs.map((l) => ({
        id: l.id,
        userSub: l.userSub,
        conversationId: l.conversationId,
        prompt: l.prompt,
        toolName: l.toolName,
        parameters: l.parameters as Record<string, unknown>,
        result: l.result,
        resultData: l.resultData as Record<string, unknown>,
        error: l.error,
        policyCheck: l.policyCheck,
        confirmedBy: l.confirmedBy,
        confirmedAt: l.confirmedAt,
        createdAt: l.createdAt,
      })),
    });
  } catch {
    return jsonError('Failed to fetch AI action logs', 500);
  }
}
