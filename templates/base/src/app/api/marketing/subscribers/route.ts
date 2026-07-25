import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const subscribers = await client.subscriber.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  return jsonOk({ subscribers });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const client = createClient();
  const existing = await client.subscriber.findUnique({ where: { email: parsed.data.email } });

  if (existing) {
    const updated = await client.subscriber.update({
      where: { email: parsed.data.email },
      data: { status: 'active', unsubscribedAt: null, tags: parsed.data.tags ?? existing.tags },
    });
    return jsonOk({ subscriber: updated });
  }

  const subscriber = await client.subscriber.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      tags: parsed.data.tags ?? [],
      source: parsed.data.source ?? 'manual',
      status: 'active',
      unsubscribeToken: crypto.randomUUID(),
    },
  });

  return jsonOk({ subscriber }, { status: 201 });
}
