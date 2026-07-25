import { createClient } from '@/lib/db';


export class LeadService {
  private client = createClient();

  async list(filter?: { status?: string; source?: string; search?: string }): Promise<Lead[]> {
    const where: Record<string, unknown> = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.source) where.source = filter.source;
    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.client.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string): Promise<Lead | null> {
    return this.client.lead.findUnique({ where: { id } });
  }

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    source: string;
    notes?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Lead> {
    return this.client.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        sourceUrl: data.source,
        notes: data.notes ?? null,
        campaignData: data.metadata ?? null,
        status: 'new',
      },
    });
  }

  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    return this.client.lead.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Lead> {
    return this.client.lead.delete({ where: { id } });
  }

  async convertToCustomer(leadId: string): Promise<Lead> {
    return this.client.lead.update({
      where: { id: leadId },
      data: { status: 'converted', convertedAt: new Date() },
    });
  }
}
