import { createClient } from '@/lib/db';

export class UserActivityService {
  private client = createClient();

  async list(userSub: string, filter?: { type?: string; from?: Date; to?: Date }) {
    const where: Record<string, unknown> = { userSub };
    if (filter?.type) where.action = filter.type;
    if (filter?.from || filter?.to) {
      where.createdAt = {};
      if (filter?.from) (where.createdAt as Record<string, unknown>).gte = filter.from;
      if (filter?.to) (where.createdAt as Record<string, unknown>).lte = filter.to;
    }
    return this.client.userActivity.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async create(userSub: string, data: { type: string; description: string; metadata?: Record<string, unknown> }) {
    return this.client.userActivity.create({
      data: { userSub, action: data.type, description: data.description, metadata: (data.metadata ?? {}) as Record<string, unknown> },
    });
  }

  async getRecent(userSub: string, limit = 20) {
    return this.client.userActivity.findMany({ where: { userSub }, orderBy: { createdAt: 'desc' }, take: limit });
  }

  async getStats(userSub: string, dateRange?: { from: Date; to: Date }) {
    const where: Record<string, unknown> = { userSub };
    if (dateRange) where.createdAt = { gte: dateRange.from, lte: dateRange.to };
    const activities = await this.client.userActivity.findMany({ where, select: { action: true } });
    const counts = new Map<string, number>();
    for (const a of activities) counts.set(a.action, (counts.get(a.action) ?? 0) + 1);
    return { total: activities.length, byType: Object.fromEntries(counts) };
  }
}
