import { createClient } from '@/lib/db';

export class AiToolService {
  private client = createClient();

  async listTools(userSub?: string) {
    const where = userSub ? { userSub } : {};
    return this.client.aiToolPending.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async addPending(userSub: string, toolName: string, params: Record<string, unknown>) {
    return this.client.aiToolPending.create({
      data: { userSub, toolName, parameters: params as Record<string, unknown>, explanation: '', status: 'pending' },
    });
  }

  async approve(toolId: string) {
    return this.client.aiToolPending.update({ where: { id: toolId }, data: { status: 'approved', reviewedAt: new Date() } });
  }

  async reject(toolId: string) {
    return this.client.aiToolPending.update({ where: { id: toolId }, data: { status: 'rejected', reviewedAt: new Date() } });
  }

  async getPending(userSub: string) {
    return this.client.aiToolPending.findMany({ where: { userSub, status: 'pending' }, orderBy: { createdAt: 'desc' } });
  }
}
