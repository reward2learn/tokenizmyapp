import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const parsed = z.object({ status: z.enum(['active', 'unsubscribed']), tags: z.array(z.string()).optional() }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const subscriber = await client.subscriber.update({
    where: { id: params.id },
    data: { status: parsed.data.status, tags: parsed.data.tags ?? undefined },
  });
  return jsonOk({ subscriber });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  await client.subscriber.delete({ where: { id: params.id } });
  return jsonOk({ deleted: true });
}
