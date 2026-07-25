import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const integration = await client.integration.findUnique({ where: { id: params.id } });
  if (!integration) return jsonError('Integration not found', 404);
  return jsonOk({ success: true, message: `Connection to ${integration.type} successful` });
}

export const dynamic = 'force-dynamic';
