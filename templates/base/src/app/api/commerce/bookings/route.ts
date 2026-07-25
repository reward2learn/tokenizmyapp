import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const createBookingSchema = z.object({
  productId: z.string(),
  date: z.string(),
  startTime: z.string(),
  partySize: z.number().int().positive().max(50),
  notes: z.string().optional(),
  customerName: z.string().default(''),
  customerEmail: z.string().default(''),
  customerPhone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const bookings = await client.booking.findMany({ where: { customerSub: guard.session.sub }, include: { product: true }, orderBy: { createdAt: 'desc' } });
  return jsonOk({ bookings });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  const body = await request.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const { productId, date, startTime, partySize, notes, customerName, customerEmail, customerPhone } = parsed.data;
  const product = await client.product.findUnique({ where: { id: productId } });
  if (!product || product.type !== 'service') return jsonError('Product is not a service', 400);
  const year = new Date().getFullYear();
  const count = await client.booking.count();
  const ref = `BKG-${year}-${String(count + 1).padStart(4, '0')}`;
  const booking = await client.booking.create({
    data: {
      reference: ref,
      productId,
      date: new Date(date),
      startTime,
      partySize,
      notes: notes ?? null,
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? null,
      customerSub: guard.session.sub,
      status: 'pending',
    },
    include: { product: true },
  });
  return jsonOk({ booking }, { status: 201 });
}

export const dynamic = 'force-dynamic';
