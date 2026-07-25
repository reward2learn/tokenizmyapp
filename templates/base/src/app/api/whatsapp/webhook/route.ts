import { NextRequest } from 'next/server';
import { createClient } from '@/lib/db';
import { jsonOk } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const client = createClient();
  if (body.message && body.from) {
    await client.whatsAppMessage.create({
      data: {
        sessionId: body.sessionId ?? 'default',
        direction: 'inbound',
        chatId: body.from,
        senderPhone: body.from,
        type: 'text',
        body: body.message,
        status: 'delivered',
      },
    });
  }
  return jsonOk({ received: true });
}

export const dynamic = 'force-dynamic';
