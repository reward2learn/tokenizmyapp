import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const runSchema = z.object({ agentId: z.string(), input: z.string() });

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = runSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const config = await client.aiAgentConfig.findUnique({ where: { id: parsed.data.agentId } });
  if (!config) return jsonError('Agent not found', 404);
  const start = Date.now();
  const result = { output: 'Simulated agent output', success: true };
  await client.aiActionLog.create({
    data: {
      toolName: config.model ?? 'default',
      prompt: parsed.data.input,
      
      result: 'success', resultData: { output: result.output },
      
      
    },
  });
  return jsonOk(result);
}

export const dynamic = 'force-dynamic';
