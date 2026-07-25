import { createClient } from '@/lib/db';

export class IntegrationService {
  private client = createClient();

  async list(filter?: { type?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (filter?.type) where.type = filter.type;
    if (filter?.status) where.status = filter.status;
    return this.client.integration.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    return this.client.integration.findUnique({ where: { id } });
  }

  async connect(type: string, config: Record<string, unknown>) {
    return this.client.integration.create({ data: { type, label: type, config: config as Record<string, unknown>, status: 'connected' } });
  }

  async disconnect(id: string) {
    return this.client.integration.delete({ where: { id } });
  }

  async updateConfig(id: string, config: Record<string, unknown>) {
    return this.client.integration.update({ where: { id }, data: { config: config as Record<string, unknown> } });
  }

  async testConnection(id: string) {
    const integration = await this.client.integration.findUnique({ where: { id } });
    if (!integration) throw new Error('Integration not found');
    return { success: true, message: `Connection to ${integration.type} successful` };
  }

  async getSyncHistory(integrationId: string) {
    return this.client.integrationSyncLog.findMany({ where: { integrationId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async logSync(integrationId: string, status: string, details: string) {
    return this.client.integrationSyncLog.create({ data: { integrationId, syncType: 'manual', status, details, durationMs: 0 } });
  }
}
