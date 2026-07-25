import { createClient } from '@/lib/db';

export class NotificationService {
  private client = createClient();

  async list(userSub: string, filter?: { type?: string; isRead?: boolean }) {
    const where: Record<string, unknown> = { userSub };
    if (filter?.type) where.type = filter.type;
    if (filter?.isRead !== undefined) where.isRead = filter.isRead;
    return this.client.notification.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { userSub: string; type: string; title: string; body: string; linkUrl?: string; metadata?: Record<string, unknown> }) {
    return this.client.notification.create({
      data: {
        userSub: data.userSub,
        type: data.type,
        title: data.title,
        body: data.body,
        linkUrl: data.linkUrl ?? null,
        metadata: (data.metadata ?? {}) as Record<string, unknown>,
      },
    });
  }

  async markRead(id: string, userSub: string) {
    return this.client.notification.update({ where: { id, userSub }, data: { isRead: true } });
  }

  async markAllRead(userSub: string) {
    return this.client.notification.updateMany({ where: { userSub, isRead: false }, data: { isRead: true } });
  }

  async dismiss(id: string, userSub: string) {
    return this.client.notification.update({ where: { id, userSub }, data: { isDismissed: true } });
  }

  async delete(id: string, userSub: string) {
    return this.client.notification.delete({ where: { id, userSub } });
  }

  async getUnreadCount(userSub: string) {
    return this.client.notification.count({ where: { userSub, isRead: false, isDismissed: false } });
  }
}
