import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const sendSchema = z.object({
  to: z.string().email(),
  template: z.string(),
  data: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const resendKey = process.env.RESEND_API_KEY;

  let messageId: string | null = null;
  let status = 'logged';

  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@tokenizmyapp.com',
          to: parsed.data.to,
          subject: parsed.data.template,
          html: `<div>${(parsed.data.data as any)?.body ?? ''}</div>`,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        messageId = result.id;
        status = 'sent';
      } else {
        status = 'failed';
      }
    } catch {
      status = 'error';
    }
  }

  await client.emailLog.create({
    data: {
      to: parsed.data.to,
      template: parsed.data.template,
      data: (parsed.data.data ?? {}) as any,
      status,
      messageId,
    },
  });

  return jsonOk({ status, messageId });
}
