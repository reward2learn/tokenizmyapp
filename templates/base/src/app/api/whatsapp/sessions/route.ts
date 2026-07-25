import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const sessions = await client.whatsAppSession.findMany({ orderBy: { createdAt: 'desc' } });
  return jsonOk({ sessions });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = z.object({ phoneNumber: z.string(), label: z.string().optional(), serverUrl: z.string().optional() }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const session = await client.whatsAppSession.create({
    data: {
      phoneNumber: parsed.data.phoneNumber,
      label: parsed.data.label ?? parsed.data.phoneNumber,
      serverUrl: parsed.data.serverUrl ?? '',
      sessionId: parsed.data.phoneNumber,
      webhookSecret: crypto.randomUUID(),
      status: 'active',
      lastMessageAt: new Date(),
    },
  });
  return jsonOk({ session }, { status: 201 });
}

export const dynamic = 'force-dynamic';
