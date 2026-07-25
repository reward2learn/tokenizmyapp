import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const updateSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['email', 'push', 'in-app']).optional(),
  audience: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  abTest: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const campaign = await client.campaign.findUnique({ where: { id: params.id } });
  if (!campaign) return jsonError('Campaign not found', 404);
  return jsonOk({ campaign });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const campaign = await client.campaign.update({ where: { id: params.id }, data: parsed.data });
  return jsonOk({ campaign });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  await client.campaign.delete({ where: { id: params.id } });
  return jsonOk({ deleted: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const parsed = z.object({ action: z.enum(['start', 'pause']) }).safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const campaign = await client.campaign.findUnique({ where: { id: params.id } });
  if (!campaign) return jsonError('Campaign not found', 404);

  if (parsed.data.action === 'start') {
    await client.campaign.update({ where: { id: params.id }, data: { status: 'active', startedAt: new Date() } });
  } else {
    await client.campaign.update({ where: { id: params.id }, data: { status: 'paused' } });
  }

  return jsonOk({ campaign: await client.campaign.findUnique({ where: { id: params.id } }) });
}
