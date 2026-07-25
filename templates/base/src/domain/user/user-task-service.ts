import { createClient } from '@/lib/db';

export class UserTaskService {
  private client = createClient();

  async list(userSub: string, filter?: { status?: string; priority?: string }) {
    const where: Record<string, unknown> = { userSub };
    if (filter?.status) where.status = filter.status;
    if (filter?.priority) where.priority = filter.priority;
    return this.client.userTask.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { userSub: string; title: string; description?: string; priority?: string; dueDate?: Date }) {
    return this.client.userTask.create({
      data: {
        userSub: data.userSub,
        name: data.title,
        instruction: data.description ?? '',
        priority: data.priority ?? 'medium',
        dueDate: data.dueDate ?? null,
        status: 'pending',
      },
    });
  }

  async update(id: string, data: { title?: string; description?: string; priority?: string; status?: string; dueDate?: Date }) {
    const updateData: Record<string, unknown> = {};
    if (data.title) updateData.name = data.title;
    if (data.description) updateData.instruction = data.description;
    if (data.priority) updateData.priority = data.priority;
    if (data.status) updateData.status = data.status;
    if (data.dueDate) updateData.dueDate = data.dueDate;
    return this.client.userTask.update({ where: { id }, data: updateData });
  }

  async complete(id: string) {
    return this.client.userTask.update({ where: { id }, data: { status: 'completed', completedAt: new Date() } });
  }

  async delete(id: string) {
    return this.client.userTask.delete({ where: { id } });
  }

  async getStats(userSub: string) {
    const tasks = await this.client.userTask.findMany({ where: { userSub }, select: { status: true } });
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }
}
