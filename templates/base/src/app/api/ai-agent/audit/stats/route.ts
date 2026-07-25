import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const logs = await client.aiActionLog.findMany({ select: { result: true, toolName: true } });
  const total = logs.length;
  const success = logs.filter((l) => l.result === 'success').length;
  const avgDuration = 0;
  return jsonOk({ total, success, successRate: total > 0 ? (success / total) * 100 : 0, avgDuration });
}

export const dynamic = 'force-dynamic';
