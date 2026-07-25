import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const tasks = await client.userTask.findMany({ where: { userSub: guard.session.sub }, orderBy: { createdAt: 'desc' } });
  return jsonOk({ tasks });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const task = await client.userTask.create({
    data: {
      userSub: guard.session.sub,
      name: parsed.data.title,
      instruction: parsed.data.description ?? '',
      priority: parsed.data.priority ?? 'medium',
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: 'pending',
    },
  });
  return jsonOk({ task }, { status: 201 });
}

export const dynamic = 'force-dynamic';
