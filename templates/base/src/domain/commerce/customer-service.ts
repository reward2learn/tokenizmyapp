import type { DbClient } from '@/lib/db';
import { PrismaClient } from '@/generated/prisma';

export interface CustomerDto {
  id: string;
  sub: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  tier: string;
  roleCode: string | null;
  isActive: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
}

export interface CustomerOrderHistory {
  orderId: string;
  orderNumber: string;
  total: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: Date;
}

export interface CustomerDetail extends CustomerDto {
  orders: CustomerOrderHistory[];
  orderCount: number;
}

export interface CustomerFilter {
  search?: string;
  email?: string;
}

type CustomerRow = {
  id: string;
  sub: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  tier: string;
  roleCode: string | null;
  isActive: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
};

export class CustomerService {
  constructor(private readonly db: DbClient) {}

  async list(filter: CustomerFilter = {}): Promise<CustomerDto[]> {
    const where: Record<string, unknown> = {};

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { sub: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.email) where.email = filter.email;

    const rows = await (this.db as unknown as PrismaClient).userAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return (rows as CustomerRow[]).map((r) => this.toDto(r));
  }

  async getByEmail(email: string): Promise<CustomerDto | null> {
    const row = await (this.db as unknown as PrismaClient).userAccount.findUnique({
      where: { email },
    });
    return row ? this.toDto(row as CustomerRow) : null;
  }

  async getBySub(sub: string): Promise<CustomerDto | null> {
    const row = await (this.db as unknown as PrismaClient).userAccount.findUnique({
      where: { sub },
    });
    return row ? this.toDto(row as CustomerRow) : null;
  }

  async getOrderHistory(email: string): Promise<CustomerOrderHistory[]> {
    const rows = await (this.db as unknown as PrismaClient).order.findMany({
      where: { customerEmail: email },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        currency: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return (rows as Array<{
      id: string;
      orderNumber: string;
      total: number;
      currency: string;
      paymentStatus: string;
      fulfillmentStatus: string;
      createdAt: Date;
    }>).map((r) => ({
      orderId: r.id,
      orderNumber: r.orderNumber,
      total: r.total,
      currency: r.currency,
      paymentStatus: r.paymentStatus,
      fulfillmentStatus: r.fulfillmentStatus,
      createdAt: r.createdAt,
    }));
  }

  async getFullDetail(email: string): Promise<CustomerDetail | null> {
    const customer = await this.getByEmail(email);
    if (!customer) return null;

    const orders = await this.getOrderHistory(email);

    return {
      ...customer,
      orders,
      orderCount: orders.length,
    };
  }

  private toDto(row: CustomerRow): CustomerDto {
    return {
      id: row.id,
      sub: row.sub,
      email: row.email,
      name: row.name,
      phone: row.phone,
      tier: row.tier,
      roleCode: row.roleCode,
      isActive: row.isActive,
      lastSeenAt: row.lastSeenAt,
      createdAt: row.createdAt,
    };
  }
}