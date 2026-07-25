import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const updateSchema = z.object({ status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']) });

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const booking = await client.booking.findFirst({ where: { id: params.id, customerSub: guard.session.sub }, include: { product: true } });
  if (!booking) return jsonError('Booking not found', 404);
  return jsonOk({ booking });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const booking = await client.booking.findFirst({ where: { id: params.id, customerSub: guard.session.sub } });
  if (!booking) return jsonError('Booking not found', 404);
  const updated = await client.booking.update({ where: { id: params.id }, data: { status: parsed.data.status } });
  return jsonOk({ booking: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const booking = await client.booking.findFirst({ where: { id: params.id, customerSub: guard.session.sub } });
  if (!booking) return jsonError('Booking not found', 404);
  await client.booking.delete({ where: { id: params.id } });
  return jsonOk({ deleted: true });
}

export const dynamic = 'force-dynamic';
