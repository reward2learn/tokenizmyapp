import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const createSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  creditAmount: z.number().int().positive(),
  priceCents: z.number().int().positive(),
  currency: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const packs = await client.creditPack.findMany({ where: { isActive: true }, orderBy: { priceCents: 'asc' } });
  return jsonOk({ packs });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const pack = await client.creditPack.create({ data: { ...parsed.data, currency: parsed.data.currency ?? 'USD', isActive: true } });
  return jsonOk({ pack }, { status: 201 });
}

export const dynamic = 'force-dynamic';
