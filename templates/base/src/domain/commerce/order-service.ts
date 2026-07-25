import { createClient } from '@/lib/db';

export class OrderService {
  private client = createClient();

  async list(filter?: { status?: string; customerSub?: string }) {
    const where: Record<string, unknown> = {};
    if (filter?.status) where.paymentStatus = filter.status;
    if (filter?.customerSub) where.customerSub = filter.customerSub;
    return this.client.order.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    return this.client.order.findUnique({ where: { id } });
  }

  async create(data: {
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    customerSub?: string;
    items: Array<{ productId: string; name: string; price: number; qty: number }>;
    total: number;
    currency?: string;
    paymentMethod?: string;
    shippingAddress?: Record<string, unknown>;
  }) {
    const orderNumber = `ORD-${Date.now()}`;
    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    return this.client.order.create({
      data: {
        orderNumber,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone ?? null,
        customerSub: data.customerSub ?? null,
        items: data.items as unknown as Record<string, unknown>,
        subtotal,
        total: data.total,
        currency: data.currency ?? 'USD',
        paymentMethod: data.paymentMethod ?? null,
        shippingAddress: data.shippingAddress ?? null,
        paymentStatus: 'pending',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.client.order.update({ where: { id }, data: { paymentStatus: status } });
  }
}
