import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { jsonOk, jsonError } from '@/lib/api/response';

const trackSchema = z.object({
  sessionId: z.string(),
  eventType: z.string(),
  page: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient();
  const event = await client.analyticsEvent.create({
    data: {
      sessionId: parsed.data.sessionId,
      type: parsed.data.eventType,
      pageUrl: parsed.data.page ?? '',
      pagePath: parsed.data.page ?? '',
      metadata: (parsed.data.properties ?? {}) as any,
    },
  });
  return jsonOk({ event }, { status: 201 });
}

export const dynamic = 'force-dynamic';
