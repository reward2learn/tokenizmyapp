import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['email', 'push', 'in-app']),
  audience: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  abTest: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const campaigns = await client.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  return jsonOk({ campaigns });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const campaign = await client.campaign.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      audience: parsed.data.audience ?? 'all',
      subject: parsed.data.subject ?? '',
      body: parsed.data.body ?? '',
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      abTest: parsed.data.abTest ?? false,
      status: 'draft',
    },
  });

  return jsonOk({ campaign }, { status: 201 });
}
