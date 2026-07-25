import { createClient } from '@/lib/db';

export class AiAgentService {
  private client = createClient();

  async getConfig(id?: string) {
    return this.client.aiAgentConfig.findUnique({ where: { id: id ?? 'default' } });
  }

  async updateConfig(id: string, config: { model?: string; customPrompt?: string; enabled?: boolean; tone?: string }) {
    const existing = await this.client.aiAgentConfig.findUnique({ where: { id } });
    if (existing) return this.client.aiAgentConfig.update({ where: { id }, data: config });
    return this.client.aiAgentConfig.create({ data: { id, ...config } });
  }

  async listAgents() {
    return this.client.aiAgentConfig.findMany({ orderBy: { id: 'asc' } });
  }

  async runAgent(agentId: string, input: string) {
    const config = await this.client.aiAgentConfig.findUnique({ where: { id: agentId } });
    if (!config) throw new Error('Agent config not found');
    const result = { output: 'Agent execution simulated', success: true };
    await this.client.aiActionLog.create({
      data: {
        userSub: '',
        prompt: input,
        toolName: config.model ?? 'default',
        parameters: {},
        result: 'success',
        resultData: { output: result.output },
      },
    });
    return result;
  }

  async getAgentLogs(toolName: string, limit = 50) {
    return this.client.aiActionLog.findMany({ where: { toolName }, orderBy: { createdAt: 'desc' }, take: limit });
  }
}
