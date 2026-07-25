import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const tx = await client.creditTransaction.findUnique({ where: { id: params.id } });
  if (!tx) return jsonError('Transaction not found', 404);
  return jsonOk({ transaction: tx });
}

export const dynamic = 'force-dynamic';
