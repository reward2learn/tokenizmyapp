import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const activities = await client.userActivity.findMany({ where: { userSub: guard.session.sub }, orderBy: { createdAt: 'desc' }, take: 100 });
  return jsonOk({ activities });
}

export const dynamic = 'force-dynamic';
