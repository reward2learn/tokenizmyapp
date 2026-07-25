import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = z.object({ action: z.enum(['approve', 'reject']) }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const data = parsed.data.action === 'approve' ? { status: 'approved', approvedAt: new Date() } : { status: 'rejected', rejectedAt: new Date() };
  const tool = await client.aiToolPending.update({ where: { id: params.id }, data });
  return jsonOk({ tool });
}

export const dynamic = 'force-dynamic';
