import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { OrderService } from '@/domain/commerce/order-service';

export const dynamic = 'force-dynamic';

const statusSchema = z.object({
  fulfillmentStatus: z.string(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new OrderService(db);

  try {
    const order = await service.getById(params.id);
    if (!order) return jsonError('Order not found', 404);

    const isAdmin = guard.session.tier === 'pin' || guard.session.tier === 'google';
    if (!isAdmin && order.customerSub !== guard.session.sub) {
      return jsonError('Not authorized to view this order', 403);
    }

    return jsonOk({ order });
  } catch (err) {
    console.error('[commerce/orders/[id]] GET error:', err);
    return jsonError('Failed to get order', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Validation error', 400);
  }

  const db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const service = new OrderService(db);

  try {
    const order = await service.updateStatus(params.id, parsed.data.fulfillmentStatus);
    return jsonOk({ order });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found/i.test(msg)) return jsonError('Order not found', 404);
    console.error('[commerce/orders/[id]] PATCH error:', err);
    return jsonError('Failed to update order', 500);
  }
}