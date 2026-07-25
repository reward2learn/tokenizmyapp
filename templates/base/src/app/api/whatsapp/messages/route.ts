import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const messages = await client.whatsAppMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return jsonOk({ messages });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = z.object({ to: z.string(), body: z.string() }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const message = await client.whatsAppMessage.create({ data: { sessionId: null, from: 'bot', to: parsed.data.to, body: parsed.data.body, direction: 'outbound', status: 'sent' } });
  return jsonOk({ message }, { status: 201 });
}

export const dynamic = 'force-dynamic';
