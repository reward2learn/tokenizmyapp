import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const integrations = await client.integration.findMany({ orderBy: { createdAt: 'desc' } });
  return jsonOk({ integrations });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = z.object({ provider: z.string(), config: z.record(z.unknown()) }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const integration = await client.integration.create({ data: { provider: parsed.data.provider, config: parsed.data.config, status: 'connected' } });
  return jsonOk({ integration }, { status: 201 });
}

export const dynamic = 'force-dynamic';
