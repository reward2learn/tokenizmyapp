import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const logs = await client.integrationSyncLog.findMany({ where: { integrationId: params.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  return jsonOk({ logs });
}

export const dynamic = 'force-dynamic';
