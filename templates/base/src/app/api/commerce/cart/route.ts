import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

const addItemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().positive().max(99),
});

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const orders = await client.order.findMany({
    where: { customerSub: guard.session.sub, paymentStatus: 'cart' },
    orderBy: { createdAt: 'desc' },
  });

  return jsonOk({ cart: orders, itemCount: orders.length });
}

export async function POST(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const { productId, qty } = parsed.data;

  const product = await client.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return jsonError('Product not found or inactive', 404);

  // Check if there's an existing cart order with this product
  const existingOrders = await client.order.findMany({
    where: { customerSub: guard.session.sub, paymentStatus: 'cart' },
  });

  for (const order of existingOrders) {
    const items = order.items as Array<{ productId: string; qty: number; name: string; price: number }>;
    const existingItem = items.find((i) => i.productId === productId);
    if (existingItem) {
      existingItem.qty += qty;
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const updated = await client.order.update({
        where: { id: order.id },
        data: { items, subtotal, total: subtotal },
      });
      return jsonOk({ order: updated });
    }
  }

  // Create new cart order with the item
  const orderNumber = `ORD-${Date.now()}`;
  const items = [{ productId, qty, name: product.name, price: product.price }];
  const subtotal = product.price * qty;
  const created = await client.order.create({
    data: {
      orderNumber,
      customerEmail: '',
      customerName: '',
      customerSub: guard.session.sub,
      items,
      subtotal,
      total: subtotal,
      paymentStatus: 'cart',
    },
  });

  return jsonOk({ order: created }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  await client.order.deleteMany({
    where: { customerSub: guard.session.sub, paymentStatus: 'cart' },
  });

  return jsonOk({ cleared: true });
}

export const dynamic = 'force-dynamic';
