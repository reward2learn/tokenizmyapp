import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTaskTables } from '@/domain/seed/seed-runner';

export const maxDuration = 30;

/**
 * Assign or unassign a task to a specific user account (platform-admin only).
 * Complements role-based task_assignments: signed-in users see tasks linked
 * to their user_accounts row regardless of role.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { taskId, userId, assigned } = (body ?? {}) as {
    taskId?: string;
    userId?: string;
    assigned?: boolean;
  };
  if (!taskId || typeof taskId !== 'string') {
    return jsonError('taskId is required', 400);
  }
  if (!userId || typeof userId !== 'string') {
    return jsonError('userId is required', 400);
  }
  if (typeof assigned !== 'boolean') {
    return jsonError('assigned must be a boolean', 400);
  }

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    await ensureTaskTables(db);
  } catch {
    return jsonError('Database unavailable', 503);
  }

  try {
    const task = await db.task.findUnique({ where: { id: taskId }, select: { id: true } });
    if (!task) {
      return jsonError('Task not found', 404);
    }

    const userAccount = await db.userAccount.findFirst({
      where: { id: userId },
      select: { id: true },
    });
    if (!userAccount) {
      return jsonError('User account not found', 404);
    }

    if (assigned) {
      await db.taskUserAssignment.upsert({
        where: { taskId_userId: { taskId, userId } },
        create: { taskId, userId, assigned: true },
        update: { assigned: true },
      });
    } else {
      await db.taskUserAssignment.deleteMany({
        where: { taskId, userId },
      });
    }

    return jsonOk({ taskId, userId, assigned, updated: true });
  } catch (err) {
    console.error(
      '[tasks/user-assignment] error:',
      err instanceof Error ? err.message : String(err),
    );
    return jsonError('Failed to update task assignment', 500);
  }
}
