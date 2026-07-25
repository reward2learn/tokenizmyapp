import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const configSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  tools: z.array(z.string()).optional(),
  systemPrompt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const config = await client.aiAgentConfig.findFirst({ where: { id: guard.session.sub } });
  return jsonOk({ config });
}

export async function PUT(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const existing = await client.aiAgentConfig.findFirst({ where: { id: guard.session.sub } });
  if (existing) {
    const config = await client.aiAgentConfig.update({ where: { id: existing.id }, data: parsed.data });
    return jsonOk({ config });
  }
  const config = await client.aiAgentConfig.create({ data: { id: guard.session.sub, ...parsed.data } });
  return jsonOk({ config }, { status: 201 });
}

export const dynamic = 'force-dynamic';
