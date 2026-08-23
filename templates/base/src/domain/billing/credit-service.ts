import { createClient } from '@/lib/db';

export class CreditService {
  private client = createClient();

  async getBalance(userId: string) {
    return this.client.creditBalance.findUnique({ where: { id: userId } });
  }

  async addCredits(userId: string, amount: number, description: string) {
    const existing = await this.client.creditBalance.findUnique({ where: { id: userId } });
    if (existing) {
      await this.client.creditBalance.update({ where: { id: userId }, data: { balance: existing.balance + amount } });
    } else {
      await this.client.creditBalance.create({ data: { id: userId, balance: amount } });
    }
    return this.client.creditTransaction.create({ data: { userSub: userId, amount, description, type: 'credit', balanceAfter: 0 } });
  }

  async deductCredits(userId: string, amount: number, description: string) {
    const balance = await this.client.creditBalance.findUnique({ where: { id: userId } });
    if (!balance || balance.balance < amount) throw new Error('Insufficient credits');
    await this.client.creditBalance.update({ where: { id: userId }, data: { balance: balance.balance - amount } });
    return this.client.creditTransaction.create({ data: { userSub: userId, amount: -amount, description, type: 'debit', balanceAfter: 0 } });
  }

  async listTransactions(userId: string, filter?: { type?: string; from?: Date; to?: Date }) {
    const where: Record<string, unknown> = { userId };
    if (filter?.type) where.type = filter.type;
    if (filter?.from || filter?.to) {
      where.createdAt = {};
      if (filter?.from) (where.createdAt as Record<string, unknown>).gte = filter.from;
      if (filter?.to) (where.createdAt as Record<string, unknown>).lte = filter.to;
    }
    return this.client.creditTransaction.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async getTransaction(id: string) {
    return this.client.creditTransaction.findUnique({ where: { id } });
  }

  async listPacks() {
    return this.client.creditPack.findMany({ where: { isActive: true }, orderBy: { priceCents: 'asc' } });
  }

  async createPack(data: { name: string; description?: string; creditAmount: number; priceCents: number; currency?: string }) {
    return this.client.creditPack.create({ data: { name: data.name, description: data.description ?? null, credits: data.creditAmount, priceCents: data.priceCents, currency: data.currency ?? 'USD', isActive: true } });
  }

  async updatePack(id: string, data: { name?: string; description?: string; creditAmount?: number; priceCents?: number; active?: boolean }) {
    return this.client.creditPack.update({ where: { id }, data });
  }

  async deletePack(id: string) {
    return this.client.creditPack.delete({ where: { id } });
  }
}

/** Template billing stubs — full metering lives in the root app credit-service. */
export const CREDIT_FLOORS = {
  chat: 1,
  contentGeneration: 1,
  templateGeneration: 1,
} as const;

export async function meterAiUsage(_input: unknown): Promise<void> {
  // Template apps use BYOK / no platform metering gate.
}

export async function requireCreditsForTenant(
  _tenantSlug: string,
  _orgId?: string,
  _db?: unknown,
  _floor?: number,
): Promise<{ ok: true } | { ok: false; reason?: string }> {
  return { ok: true };
}
