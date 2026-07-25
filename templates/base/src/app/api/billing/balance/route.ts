import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const balance = await client.creditBalance.findUnique({ where: { id: guard.session.sub } });
  return jsonOk({ balance: balance?.balance ?? 0 });
}

export const dynamic = 'force-dynamic';
