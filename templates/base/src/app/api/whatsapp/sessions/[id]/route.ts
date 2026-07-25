import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const waSession = await client.whatsAppSession.findUnique({ where: { id: params.id } });
  if (!waSession) return jsonError('Session not found', 404);
  return jsonOk({ session: waSession });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = z.object({ status: z.enum(['active', 'closed', 'archived']) }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const waSession = await client.whatsAppSession.update({ where: { id: params.id }, data: parsed.data });
  return jsonOk({ session: waSession });
}

export const dynamic = 'force-dynamic';
