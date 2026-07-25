import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { OrderService } from '@/domain/commerce/order-service';

export const dynamic = 'force-dynamic';

const listSchema = z.object({
  customerSub: z.string().optional(),
  paymentStatus: z.string().optional(),
  fulfillmentStatus: z.string().optional(),
  customerEmail: z.string().optional(),
});

const createSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerSub: z.string().optional(),
  items: z.array(z.unknown()),
  subtotal: z.number().int().nonnegative(),
  tax: z.number().int().nonnegative().optional(),
  shipping: z.number().int().nonnegative().optional(),
  discount: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative(),
  currency: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentTxId: z.string().optional(),
  fulfillmentStatus: z.string().optional(),
  shippingAddress: z.record(z.unknown()).optional(),
  bookingDetails: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  campaignData: z.record(z.unknown()).optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new OrderService(db);

  const { searchParams } = new URL(request.url);
  const filter = listSchema.parse(Object.fromEntries(searchParams));

  try {
    const isAdmin = guard.session.tier === 'pin' || guard.session.tier === 'google';
    const isOwn = guard.session.sub && filter.customerSub === guard.session.sub;

    if (!isAdmin && !isOwn && filter.customerSub && filter.customerSub !== guard.session.sub) {
      return jsonError('Not authorized to view these orders', 403);
    }

    const orders = await service.list(filter);
    return jsonOk({ orders });
  } catch (err) {
    console.error('[commerce/orders] GET error:', err);
    return jsonError('Failed to list orders', 500);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      'Validation error: ' + JSON.stringify(parsed.error.flatten()),
      400,
    );
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new OrderService(db);

  try {
    const order = await service.create(parsed.data);
    return jsonOk({ order }, { status: 201 });
  } catch (err) {
    console.error('[commerce/orders] POST error:', err);
    return jsonError('Failed to create order', 500);
  }
}