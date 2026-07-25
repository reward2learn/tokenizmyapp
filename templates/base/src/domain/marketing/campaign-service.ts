import { createClient } from '@/lib/db';


export class CampaignService {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient();
  }

  async list(filter?: { status?: string; type?: string; search?: string }): Promise<Campaign[]> {
    const where: Record<string, unknown> = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.type) where.type = filter.type;
    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { subject: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.client.campaign.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string): Promise<Campaign | null> {
    return this.client.campaign.findUnique({ where: { id }, include: {} });
  }

  async create(data: {
    name: string;
    type: 'email' | 'push' | 'in-app';
    audience?: string;
    subject?: string;
    body?: string;
    scheduledAt?: Date;
    abTest?: boolean;
  }): Promise<Campaign> {
    return this.client.campaign.create({
      data: {
        name: data.name,
        type: data.type,
        audience: data.audience ?? 'all',
        subject: data.subject ?? '',
        body: data.body ?? '',
        scheduledAt: data.scheduledAt ?? null,
        abTest: data.abTest ?? false,
        status: 'draft',
      },
    });
  }

  async update(id: string, data: Partial<Campaign>): Promise<Campaign> {
    return this.client.campaign.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Campaign> {
    return this.client.campaign.delete({ where: { id } });
  }

  async start(id: string): Promise<Campaign> {
    return this.client.campaign.update({
      where: { id },
      data: { status: 'active', startedAt: new Date() },
    });
  }

  async pause(id: string): Promise<Campaign> {
    return this.client.campaign.update({
      where: { id },
      data: { status: 'paused' },
    });
  }

  async getStats(id: string): Promise<{
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }> {
    const stats = await this.client.campaignAnalytics.findMany({ where: { campaignId: id } });
    const sent = stats.reduce((s, st) => s + (st.sent === true ? 1 : 0), 0);
    const opened = stats.reduce((s, st) => s + (st.opened === true ? 1 : 0), 0);
    const clicked = stats.reduce((s, st) => s + (st.clicked === true ? 1 : 0), 0);
    const converted = stats.reduce((s, st) => s + (st.converted === true ? 1 : 0), 0);
    return {
      sent,
      opened,
      clicked,
      converted,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
      conversionRate: opened > 0 ? (converted / opened) * 100 : 0,
    };
  }
}
