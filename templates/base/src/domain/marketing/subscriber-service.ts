import { createClient } from '@/lib/db';


export class SubscriberService {
  private client = createClient();

  async list(filter?: { status?: string; search?: string }): Promise<Subscriber[]> {
    const where: Record<string, unknown> = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.search) {
      where.email = { contains: filter.search, mode: 'insensitive' };
    }
    return this.client.subscriber.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async getByEmail(email: string): Promise<Subscriber | null> {
    return this.client.subscriber.findUnique({ where: { email } });
  }

  async subscribe(data: {
    email: string;
    name?: string;
    tags?: string[];
    source?: string;
  }): Promise<Subscriber> {
    const existing = await this.client.subscriber.findUnique({ where: { email: data.email } });
    if (existing) {
      return this.client.subscriber.update({
        where: { email: data.email },
        data: { status: 'active', unsubscribedAt: null, tags: data.tags ?? existing.tags },
      });
    }
    return this.client.subscriber.create({
      data: {
        email: data.email,
        name: data.name ?? null,
        tags: data.tags ?? [],
        source: data.source ?? 'manual',
        status: 'active',
        unsubscribeToken: crypto.randomUUID(),
      },
    });
  }

  async unsubscribe(token: string): Promise<Subscriber | null> {
    const sub = await this.client.subscriber.findUnique({ where: { unsubscribeToken: token } });
    if (!sub) return null;
    return this.client.subscriber.update({
      where: { id: sub.id },
      data: { status: 'unsubscribed', unsubscribedAt: new Date() },
    });
  }

  async updatePreferences(id: string, prefs: { tags?: string[]; frequency?: string }): Promise<Subscriber> {
    return this.client.subscriber.update({
      where: { id },
      data: { tags: prefs.tags ?? undefined, frequency: prefs.frequency ?? undefined },
    });
  }
}
