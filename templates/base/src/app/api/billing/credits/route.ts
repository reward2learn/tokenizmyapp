import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const addSchema = z.object({ userId: z.string(), amount: z.number().positive(), description: z.string() });

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const existing = await client.creditBalance.findUnique({ where: { id: parsed.data.userId } });
  if (existing) {
    await client.creditBalance.update({ where: { id: parsed.data.userId }, data: { balance: existing.balance + parsed.data.amount } });
  } else {
    await client.creditBalance.create({ data: { id: parsed.data.userId, balance: parsed.data.amount } });
  }
  const tx = await client.creditTransaction.create({ data: { userSub: parsed.data.userId, amount: parsed.data.amount, description: parsed.data.description, type: 'credit', balanceAfter: 0 } });
  return jsonOk({ transaction: tx }, { status: 201 });
}

export const dynamic = 'force-dynamic';
