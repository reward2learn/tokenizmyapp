import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const updateData: Record<string, unknown> = {};
  if (parsed.data.title) updateData.name = parsed.data.title;
  if (parsed.data.description) updateData.instruction = parsed.data.description;
  if (parsed.data.priority) updateData.priority = parsed.data.priority;
  if (parsed.data.status) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === 'completed') updateData.completedAt = new Date();
  }
  const task = await client.userTask.update({ where: { id: params.id }, data: updateData });
  return jsonOk({ task });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  await client.userTask.delete({ where: { id: params.id } });
  return jsonOk({ deleted: true });
}

export const dynamic = 'force-dynamic';
