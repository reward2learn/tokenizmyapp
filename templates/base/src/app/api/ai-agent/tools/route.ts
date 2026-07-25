import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const tools = await client.aiToolPending.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' } });
  return jsonOk({ tools });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = z.object({ agentId: z.string(), tool: z.string(), params: z.record(z.unknown()) }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const tool = await client.aiToolPending.create({ data: { userSub: guard.session.sub, toolName: parsed.data.tool, parameters: parsed.data.params as any as Record<string, unknown>, explanation: '', status: 'pending' } });
  return jsonOk({ tool }, { status: 201 });
}

export const dynamic = 'force-dynamic';
