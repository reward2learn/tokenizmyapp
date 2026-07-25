import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const user = await client.userAccount.findUnique({ where: { id: guard.session.sub } });
  return jsonOk({ preferences: (user?.metadata as Record<string, unknown>)?.preferences ?? {} });
}

export async function PUT(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const user = await client.userAccount.findUnique({ where: { id: guard.session.sub } });
  const metadata = (user?.metadata as Record<string, unknown>) ?? {};
  const updated = { ...metadata, preferences: body };
  await client.userAccount.update({ where: { id: guard.session.sub }, data: { metadata: updated as Record<string, unknown> } });
  return jsonOk({ preferences: body });
}

export const dynamic = 'force-dynamic';
