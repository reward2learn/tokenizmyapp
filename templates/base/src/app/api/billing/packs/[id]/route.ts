import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  creditAmount: z.number().int().positive().optional(),
  priceCents: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const pack = await client.creditPack.update({ where: { id: params.id }, data: parsed.data });
  return jsonOk({ pack });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  await client.creditPack.delete({ where: { id: params.id } });
  return jsonOk({ deleted: true });
}

export const dynamic = 'force-dynamic';
