import { createClient } from '@/lib/db';

export class UserProfileService {
  private client = createClient();

  async getProfile(userSub: string) {
    return this.client.userAccount.findUnique({ where: { id: userSub } });
  }

  async updateProfile(userSub: string, data: { name?: string; email?: string; phone?: string; avatarUrl?: string; bio?: string }) {
    return this.client.userAccount.update({ where: { id: userSub }, data });
  }

  async getPreferences(userSub: string) {
    const user = await this.client.userAccount.findUnique({ where: { id: userSub }, select: { metadata: true } });
    return (user?.metadata as Record<string, unknown>)?.preferences ?? {};
  }

  async updatePreferences(userSub: string, prefs: Record<string, unknown>) {
    const user = await this.client.userAccount.findUnique({ where: { id: userSub }, select: { metadata: true } });
    const metadata = (user?.metadata as Record<string, unknown>) ?? {};
    const updated = { ...metadata, preferences: prefs };
    return this.client.userAccount.update({ where: { id: userSub }, data: { metadata: updated as Record<string, unknown> } });
  }

  async deleteAccount(userSub: string) {
    await this.client.userAccount.delete({ where: { id: userSub } });
    return { deleted: true };
  }
}
