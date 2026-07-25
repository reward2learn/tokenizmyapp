import { createClient } from '@/lib/db';

export class WhatsAppService {
  private client = createClient();

  async sendMessage(to: string, body: string) {
    const whapiKey = process.env.WHAPI_KEY;
    if (whapiKey) {
      const res = await fetch('https://api.whapi.dev/messages/text', {
        method: 'POST',
        headers: { Authorization: `Bearer ${whapiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, body }),
      });
      const data = await res.json();
      return this.client.whatsAppMessage.create({ data: { sessionId: null, senderPhone: 'bot', chatId: to, body, direction: 'outbound', status: 'sent', waMessageId: data.id ?? null } });
    }
    return this.client.whatsAppMessage.create({ data: { sessionId: null, senderPhone: 'bot', chatId: to, body, direction: 'outbound', status: 'logged' } });
  }

  async sendTemplate(to: string, template: string, params: Record<string, unknown>) {
    return this.sendMessage(to, `Template: ${template} — ${JSON.stringify(params)}`);
  }

  async listMessages(filter?: { sessionId?: string; from?: string; to?: string }) {
    const where: Record<string, unknown> = {};
    if (filter?.sessionId) where.sessionId = filter.sessionId;
    if (filter?.from) where.from = filter.from;
    if (filter?.to) where.to = filter.to;
    return this.client.whatsAppMessage.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async listSessions(filter?: { status?: string }) {
    const where: Record<string, unknown> = {};
    if (filter?.status) where.status = filter.status;
    return this.client.whatsAppSession.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createSession(data: { contactPhone: string; contactName?: string }) {
    return this.client.whatsAppSession.create({ data: { phoneNumber: data.contactPhone, label: data.contactName ?? data.contactPhone, serverUrl: '', sessionId: data.contactPhone, status: 'active', lastMessageAt: new Date(), webhookSecret: '' } });
  }

  async updateSession(id: string, data: { status?: string }) {
    return this.client.whatsAppSession.update({ where: { id }, data });
  }

  async markAsRead(messageId: string) {
    return this.client.whatsAppMessage.update({ where: { id: messageId }, data: { isRead: true } });
  }

  async getUnreadCount() {
    return this.client.whatsAppMessage.count({ where: { direction: 'inbound', isRead: false } });
  }
}
