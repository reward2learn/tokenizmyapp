import { createClient } from '@/lib/db';
import type { Prisma } from '@/generated/prisma';

export class CartService {
  private client = createClient();

  async getCart(customerSub: string) {
    return this.client.order.findMany({
      where: { customerSub, paymentStatus: 'cart' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addItem(customerSub: string, productId: string, qty: number) {
    const product = await this.client.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    const existingOrders = await this.client.order.findMany({
      where: { customerSub, paymentStatus: 'cart' },
    });

    for (const order of existingOrders) {
      const items = order.items as Array<{ productId: string; name: string; price: number; qty: number }>;
      const existingItem = items.find((i) => i.productId === productId);
      if (existingItem) {
        existingItem.qty += qty;
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        return this.client.order.update({
          where: { id: order.id },
          data: { items: items as Prisma.InputJsonValue, subtotal, total: subtotal },
        });
      }
    }

    const items = [{ productId, name: product.name, price: product.price, qty }];
    const subtotal = product.price * qty;
    return this.client.order.create({
      data: {
        orderNumber: `CART-${Date.now()}`,
        customerEmail: '',
        customerName: '',
        customerSub,
        items: items as Prisma.InputJsonValue,
        subtotal,
        total: subtotal,
        paymentStatus: 'cart',
      },
    });
  }

  async removeItem(customerSub: string, orderId: string) {
    return this.client.order.delete({ where: { id: orderId } });
  }

  async clear(customerSub: string) {
    return this.client.order.deleteMany({ where: { customerSub, paymentStatus: 'cart' } });
  }
}
