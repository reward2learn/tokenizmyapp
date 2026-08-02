import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth, requireSession, requireRead, requireWrite } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTaskTables, seedTaskTracking } from '@/domain/seed/seed-runner';
import { legacyTaskCodeForSub } from '@/domain/security/persons'; // LEGACY only; prefer roleCode from session/user_accounts
import type { SessionClaims } from '@/lib/auth/jwt';

export const maxDuration = 30;

/**
 * Memoized bootstrap so the heavy DDL + seed only runs once per server instance,
 * not on every request. Running 20+ raw DDL statements on every GET was causing
 * 504 timeouts on cold Neon connections.
 */
let tablesReady: Promise<void> | null = null;
let seedReady: Promise<void> | null = null;

async function ensureBootstrapped(db: Awaited<ReturnType<typeof createClient>>): Promise<void> {
  // Table creation must complete before we query — but only once per instance.
  if (!tablesReady) {
    tablesReady = ensureTaskTables(db).catch((err) => {
      tablesReady = null;
      throw err;
    });
  }
  await tablesReady;

  // Seed roles + tasks (and backfill any missing descriptions) exactly once per
  // instance. Awaited so the first GET returns fully-populated tasks instead of
  // leaving descriptions null when the previous fire-and-forget job failed.
  if (!seedReady) {
    seedReady = seedTaskTracking(db).catch((err) => {
      seedReady = null;
      console.error('[tasks] seed failed:', err);
      throw err;
    });
  }
  await seedReady;
}

export interface TaskAssignmentView {
  roleCode: string;
  roleName: string;
  assigned: boolean;
}

export interface TaskUserAssignmentView {
  userId: string;
  sub: string;
  name: string | null;
  email: string | null;
  assigned: boolean;
}

export interface TaskRoleView {
  code: string;
  name: string;
  isPlatformAdmin: boolean;
}

export interface TaskView {
  id: string;
  title: string;
  description: string | null;
  priority: 'P0' | 'P1' | 'P2';
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  dueDate: string | null;
  sortOrder: number;
  assignments: TaskAssignmentView[];
  userAssignments: TaskUserAssignmentView[];
}

export interface TasksResponse {
  tasks: TaskView[];
  /** The role code the current viewer is scoped to (null = platform-admin sees all). */
  viewerRole: string | null;
  isPlatformAdmin: boolean;
  /** DB-driven role catalog for admin filters (replaces the old hardcoded list). */
  roles: TaskRoleView[];
}

function toTaskView(task: {
  id: string;
  title: string;
  description: string | null;
  priority: 'P0' | 'P1' | 'P2';
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  dueDate: Date | null;
  sortOrder: number;
  assignments: {
    assigned: boolean;
    role: { code: string; name: string };
  }[];
}): TaskView {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    sortOrder: task.sortOrder,
    assignments: task.assignments.map((a) => ({
      roleCode: a.role.code,
      roleName: a.role.name,
      assigned: a.assigned,
    })),
    userAssignments: (task as { userAssignments?: TaskUserAssignmentView[] }).userAssignments ?? [],
  };
}

/**
 * Resolve the viewer's task role from the session — now role-based (post-persons refactor).
 * Uses session.roleCode (from JWT/user_accounts) or legacyTaskCodeForSub(sub) as candidates,
 * then queries the `roles` table. PERSONS lookup removed in favor of direct roleCode.
 * See persons.ts (@LEGACY), security-service.ts for full user_accounts integration,
 * and functional-roles.ts for catalog. Minimal breaking change.
 */
async function resolveViewerRole(
  db: Awaited<ReturnType<typeof createClient>>,
  session: SessionClaims,
) {
  const candidates: string[] = [];
  if (session.roleCode) candidates.push(session.roleCode);
  // PIN/Google sessions carry a functional role code (e.g. 'finance') or a
  // person sub — map both to the role code used by the roles table.
  const legacyCode = legacyTaskCodeForSub(session.sub ?? '');
  if (legacyCode) candidates.push(legacyCode);
  // NOTE: Removed PERSONS.find() — roleCode from session/user_accounts is now authoritative.
  for (const code of candidates) {
    const byCode = await db.role.findFirst({ where: { code } });
    if (byCode) return byCode;
  }
  return null;
}

/**
 * Look up the viewer's user_accounts row by session sub so user-scoped task
 * assignments apply. Returns null when the account does not exist yet.
 */
async function resolveViewerUserId(
  db: Awaited<ReturnType<typeof createClient>>,
  sub: string | undefined,
): Promise<string | null> {
  if (!sub) return null;
  try {
    const rows = (await (db as unknown as {
      $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<unknown[]>;
    }).$queryRawUnsafe(`SELECT id FROM user_accounts WHERE sub = $1 LIMIT 1`, sub)) as { id: string }[];
    return rows?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch all user-scoped assignments (assigned = true) for the given task ids.
 * Returns a Map<taskId, TaskUserAssignmentView[]>; empty on any DB error so
 * legacy environments degrade to role-only behavior.
 */
async function fetchUserAssignments(
  db: Awaited<ReturnType<typeof createClient>>,
  taskIds: string[],
): Promise<Map<string, TaskUserAssignmentView[]>> {
  const map = new Map<string, TaskUserAssignmentView[]>();
  if (taskIds.length === 0) return map;
  try {
    const rows = (await (db as unknown as {
      $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<unknown[]>;
    }).$queryRawUnsafe(
      `SELECT tua.task_id, ua.id AS user_id, ua.sub, ua.name, ua.email
       FROM task_user_assignments tua
       JOIN user_accounts ua ON ua.id = tua.user_account_id
       WHERE tua.assigned = true AND tua.task_id = ANY($1::text[])`,
      taskIds,
    )) as { task_id: string; user_id: string; sub: string; name: string | null; email: string | null }[];
    for (const r of rows ?? []) {
      const entry: TaskUserAssignmentView = {
        userId: r.user_id,
        sub: r.sub,
        name: r.name,
        email: r.email,
        assigned: true,
      };
      const list = map.get(r.task_id) ?? [];
      list.push(entry);
      map.set(r.task_id, list);
    }
  } catch (err) {
    console.warn('[tasks] fetchUserAssignments failed (degrading to role-only):', err instanceof Error ? err.message : String(err));
  }
  return map;
}

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireRead('tasks', request);
  if (!groupGuard.ok) return groupGuard.response;

  const { searchParams } = new URL(request.url);
  const requestedRole = searchParams.get('role')?.trim() || null;

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    await ensureBootstrapped(db);
  } catch {
    return jsonError('Database unavailable', 503);
  }

  const viewerRole = await resolveViewerRole(db, guard.session);
  const isPlatformAdmin =
    guard.session.tier === 'pin' || viewerRole?.isPlatformAdmin === true;

  // Determine which role scope to return.
  let scopeRoleCode: string | null = null;
  if (requestedRole) {
    if (!isPlatformAdmin) {
      return jsonError('Only platform admins can view other roles', 403);
    }
    scopeRoleCode = requestedRole;
  } else if (viewerRole && !isPlatformAdmin) {
    scopeRoleCode = viewerRole.code;
  }

  const tasks = await db.task.findMany({
    orderBy: [{ sortOrder: 'asc' }],
    include: {
      assignments: {
        include: { role: { select: { code: true, name: true } } },
      },
    },
  });

  const roles = await db.role.findMany({ orderBy: [{ createdAt: 'asc' }] });
  const userAssignments = await fetchUserAssignments(db, tasks.map((t) => t.id));
  const viewerUserId = !isPlatformAdmin ? await resolveViewerUserId(db, guard.session.sub) : null;

  const filtered = isPlatformAdmin
    ? scopeRoleCode
      ? tasks.filter((t) =>
          t.assignments.some(
            (a) => a.assigned && a.role.code.toLowerCase() === scopeRoleCode!.toLowerCase(),
          ),
        )
      : tasks
    : tasks.filter((t) => {
        const byRole =
          viewerRole != null &&
          t.assignments.some((a) => a.assigned && a.role.code === viewerRole.code);
        const byUser =
          viewerUserId != null &&
          (userAssignments.get(t.id)?.some((u) => u.userId === viewerUserId) ?? false);
        return byRole || byUser;
      });

  const payload: TasksResponse = {
    tasks: filtered.map((t) => ({
      ...toTaskView(t),
      userAssignments: userAssignments.get(t.id) ?? [],
    })),
    viewerRole: viewerRole?.code ?? null,
    isPlatformAdmin,
    roles: roles.map((r) => ({
      code: r.code,
      name: r.name,
      isPlatformAdmin: r.isPlatformAdmin,
    })),
  };
  return jsonOk(payload);
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireWrite('tasks', request);
  if (!groupGuard.ok) return groupGuard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { title, description, priority, dueDate, ownerCodes, assigneeUserIds } = (body ?? {}) as {
    title?: string;
    description?: string;
    priority?: 'P0' | 'P1' | 'P2';
    dueDate?: string;
    ownerCodes?: string[];
    assigneeUserIds?: string[];
  };

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return jsonError('title is required', 400);
  }

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    await ensureTaskTables(db);
  } catch {
    return jsonError('Database unavailable', 503);
  }

  const task = await db.task.create({
    data: {
      title: title.trim(),
      description: description ?? null,
      priority: priority ?? 'P0',
      status: 'pending',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignments: {
        create:
          ownerCodes && ownerCodes.length > 0
            ? (
                await db.role.findMany({
                  where: { code: { in: ownerCodes.map((c) => c.toUpperCase()) } },
                })
              ).map((r) => ({ roleId: r.id, assigned: true }))
            : [],
      },
    },
    include: {
      assignments: { include: { role: { select: { code: true, name: true } } } },
    },
  });

  // User-scoped assignments (platform-admin only intent): link the task to
  // specific user accounts so signed-in users see it without a role match.
  const validUserIds: string[] = [];
  if (assigneeUserIds && assigneeUserIds.length > 0) {
    try {
      const userRows = (await (db as unknown as {
        $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<unknown[]>;
      }).$queryRawUnsafe(
        `SELECT id FROM user_accounts WHERE id = ANY($1::text[])`,
        assigneeUserIds,
      )) as { id: string }[];
      const existingIds = new Set((userRows ?? []).map((r) => r.id));
      for (const userId of assigneeUserIds) {
        if (!existingIds.has(userId)) continue;
        validUserIds.push(userId);
        await (db as unknown as {
          $executeRawUnsafe: (sql: string, ...params: unknown[]) => Promise<unknown>;
        }).$executeRawUnsafe(
          `INSERT INTO task_user_assignments (id, task_id, user_account_id, assigned)
           SELECT gen_random_uuid()::TEXT, $1, $2, true
           ON CONFLICT (task_id, user_account_id) DO UPDATE SET assigned = true`,
          task.id,
          userId,
        );
      }
    } catch (err) {
      console.warn('[tasks] POST user assignment failed:', err instanceof Error ? err.message : String(err));
    }
  }

  const userAssignments = await fetchUserAssignments(db, [task.id]);
  return jsonOk(
    { ...toTaskView(task), userAssignments: userAssignments.get(task.id) ?? [] },
    { status: 201 },
  );
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireWrite('tasks', request);
  if (!groupGuard.ok) return groupGuard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { id, status, dueDate } = (body ?? {}) as {
    id?: string;
    status?: string;
    dueDate?: string | null;
  };
  if (!id || typeof id !== 'string') {
    return jsonError('id is required', 400);
  }
  if (status !== undefined && !['pending', 'in_progress', 'submitted', 'completed'].includes(status)) {
    return jsonError('status must be pending | in_progress | completed', 400);
  }
  if (dueDate !== undefined && dueDate !== null && Number.isNaN(Date.parse(dueDate))) {
    return jsonError('dueDate must be a valid ISO date or null', 400);
  }

  let db;
  try {
    db = createClient({ tier: guard.session.tier, sub: guard.session.sub });
    await ensureTaskTables(db);
  } catch {
    return jsonError('Database unavailable', 503);
  }

  const existing = await db.task.findUnique({
    where: { id },
    include: { assignments: { include: { role: true } } },
  });
  if (!existing) {
    return jsonError('Task not found', 404);
  }

  // Non-admin role owners may only update tasks assigned to them (by role or by user).
  const viewerRole = await resolveViewerRole(db, guard.session);
  const isPlatformAdmin =
    guard.session.tier === 'pin' || viewerRole?.isPlatformAdmin === true;
  if (!isPlatformAdmin) {
    const userAssignments = await fetchUserAssignments(db, [existing.id]);
    const viewerUserId = await resolveViewerUserId(db, guard.session.sub);
    const ownsByRole =
      viewerRole != null &&
      existing.assignments.some((a) => a.assigned && a.role.code === viewerRole.code);
    const ownsByUser =
      viewerUserId != null &&
      (userAssignments.get(existing.id)?.some((u) => u.userId === viewerUserId) ?? false);
    if (!ownsByRole && !ownsByUser) {
      return jsonError('You can only update tasks assigned to your role or to you', 403);
    }
  }

  // Only platform admins may amend due dates; everyone else may only advance status.
  if (dueDate !== undefined && !isPlatformAdmin) {
    return jsonError('Only platform admins can change due dates', 403);
  }

  const updateData: {
    status?: 'pending' | 'in_progress' | 'submitted' | 'completed';
    dueDate?: Date | null;
  } = {};
  if (status !== undefined) {
    updateData.status = status as 'pending' | 'in_progress' | 'submitted' | 'completed';
  }
  if (dueDate !== undefined) {
    updateData.dueDate = dueDate ? new Date(dueDate) : null;
  }

  const updated = await db.task.update({
    where: { id },
    data: updateData,
    include: {
      assignments: { include: { role: { select: { code: true, name: true } } } },
    },
  });

  const userAssignments = await fetchUserAssignments(db, [updated.id]);
  return jsonOk({
    ...toTaskView(updated),
    userAssignments: userAssignments.get(updated.id) ?? [],
  });
}
