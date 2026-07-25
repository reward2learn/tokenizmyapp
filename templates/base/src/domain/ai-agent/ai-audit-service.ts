import { createClient } from '@/lib/db';

export class AiAuditService {
  private client = createClient();

  async listLogs(filter?: { userSub?: string; success?: boolean; from?: Date; to?: Date }) {
    const where: Record<string, unknown> = {};
    if (filter?.userSub) where.userSub = filter.userSub;
    if (filter?.success !== undefined) where.result = filter.success ? 'success' : 'error';
    if (filter?.from || filter?.to) {
      where.createdAt = {};
      if (filter?.from) (where.createdAt as Record<string, unknown>).gte = filter.from;
      if (filter?.to) (where.createdAt as Record<string, unknown>).lte = filter.to;
    }
    return this.client.aiActionLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async logAction(data: { userSub: string; toolName: string; prompt: string; parameters: Record<string, unknown>; result: string; resultData: Record<string, unknown> }) {
    return this.client.aiActionLog.create({ data: { ...data, parameters: data.parameters as Record<string, unknown> } });
  }

  async getStats(dateRange?: { from: Date; to: Date }) {
    const where: Record<string, unknown> = {};
    if (dateRange) where.createdAt = { gte: dateRange.from, lte: dateRange.to };
    const logs = await this.client.aiActionLog.findMany({ where, select: { result: true, toolName: true } });
    const total = logs.length;
    const success = logs.filter((l) => l.result === 'success').length;
    const byType = new Map<string, number>();
    for (const l of logs) byType.set(l.toolName, (byType.get(l.toolName) ?? 0) + 1);
    return { total, success, successRate: total > 0 ? (success / total) * 100 : 0, avgDuration: 0, byType: Object.fromEntries(byType) };
  }
}
