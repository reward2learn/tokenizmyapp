import { createClient } from '@/lib/db';

export class BookingService {
  private client = createClient();

  async list(filter?: { status?: string; customerSub?: string }) {
    const where: Record<string, unknown> = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.customerSub) where.customerSub = filter.customerSub;
    return this.client.booking.findMany({ where, include: { product: true }, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    return this.client.booking.findUnique({ where: { id }, include: { product: true } });
  }

  async create(data: {
    productId: string;
    date: string;
    startTime: string;
    partySize: number;
    notes?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerSub?: string;
  }) {
    const count = await this.client.booking.count();
    const ref = `BKG-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    return this.client.booking.create({
      data: {
        reference: ref,
        productId: data.productId,
        date: new Date(data.date),
        startTime: data.startTime,
        partySize: data.partySize,
        notes: data.notes ?? null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone ?? null,
        customerSub: data.customerSub ?? null,
        status: 'pending',
      },
      include: { product: true },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.client.booking.update({ where: { id }, data: { status } });
  }

  async checkAvailability(productId: string, date: string, startTime: string) {
    const existing = await this.client.booking.findFirst({
      where: { productId, date: new Date(date), startTime, status: { not: 'cancelled' } },
    });
    return !existing;
  }
}
