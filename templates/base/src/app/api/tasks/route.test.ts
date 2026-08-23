import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH } from './route';

const TEST_KEY = 'a'.repeat(64);

// In-memory fake DB shaped to the subset of the Prisma client the route uses.
function makeDb(overrides: Record<string, unknown> = {}) {
  const roles = [
    { id: 'r-finance', code: 'finance', name: 'Finance', isPlatformAdmin: false },
    { id: 'r-admin', code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
  ];
  const tasks = [
    {
      id: 't-1',
      title: 'Reconcile cash position',
      description: 'Establish the minimum acceptable cash reserve.',
      priority: 'P0',
      status: 'pending',
      dueDate: null,
      sortOrder: 0,
      assignments: [{ assigned: true, role: { code: 'finance', name: 'Finance' } }],
    },
  ];
  return {
    role: {
      findFirst: vi.fn(async ({ where }: { where: { code: string } }) =>
        roles.find((r) => r.code === where.code) ?? null,
      ),
      findMany: vi.fn(async () => roles),
    },
    task: {
      findMany: vi.fn(async () => tasks),
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        tasks.find((t) => t.id === where.id) ?? null,
      ),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        ...data,
        id: 't-new',
        assignments: [],
      })),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        ...tasks[0],
        ...data,
      })),
    },
    userAccount: {
      findFirst: vi.fn(async () => null),
      findMany: vi.fn(async () => []),
    },
    taskUserAssignment: {
      findMany: vi.fn(async () => []),
      upsert: vi.fn(async () => ({ id: 'tua-new', taskId: 't-new', userId: 'u-1', assigned: true })),
    },
    ...overrides,
  };
}

vi.mock('@/lib/db', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/auth/guards', () => ({
  requireSession: vi.fn(),
  requireWriteAuth: vi.fn(),
  requireGoogle: vi.fn(),
  requireRole: vi.fn(),
  requireRead: vi.fn(),
  requireWrite: vi.fn(),
}));

vi.mock('@/domain/seed/seed-runner', () => ({
  ensureTaskTables: vi.fn(async () => undefined),
  seedTaskTracking: vi.fn(async () => undefined),
}));

import { createClient } from '@/lib/db';

function session(overrides: Record<string, unknown> = {}) {
  return {
    sub: 'u-1',
    tier: 'google',
    email: 'finance@example.com',
    name: 'Finance User',
    roleCode: 'finance',
    platformAdmin: false,
    ...overrides,
  };
}

function authedRequest(url: string, init: RequestInit = {}) {
  // The route reads the session via guards; we mock guards to return our session.
  return new Request(url, init);
}

describe('/api/tasks', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    vi.clearAllMocks();
    const db = makeDb();
    vi.mocked(createClient).mockReturnValue(db as never);
  });

  it('UC-TASK-01: GET requires a session', async () => {
    const { requireSession } = await import('@/lib/auth/guards');
    vi.mocked(requireSession).mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ success: false, error: 'Sign in required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    } as never);
    const res = await GET(authedRequest('http://localhost/api/tasks'));
    expect(res.status).toBe(401);
  });

  it('UC-TASK-01: GET returns role-scoped tasks for a non-admin viewer', async () => {
    const { requireSession, requireRead } = await import('@/lib/auth/guards');
    vi.mocked(requireSession).mockResolvedValue({ ok: true, session: session() } as never);
    vi.mocked(requireRead).mockResolvedValue({ ok: true, session: session() } as never);
    const res = await GET(authedRequest('http://localhost/api/tasks'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { tasks: Record<string, unknown>[]; viewerRole: string; isPlatformAdmin: boolean; roles: { code: string; name: string }[] } };
    expect(json.data.viewerRole).toBe('finance');
    expect(json.data.isPlatformAdmin).toBe(false);
    expect(json.data.tasks).toHaveLength(1);
    expect(json.data.tasks[0].title).toContain('cash');
    expect(json.data.roles).toHaveLength(2);
    expect(json.data.roles.map((r) => r.code)).toEqual(['finance', 'platform-admin']);
    expect((json.data.tasks[0] as { userAssignments?: unknown[] }).userAssignments ?? []).toEqual([]);
  });

  it('UC-TASK-02: GET ?role= is forbidden for non-admins', async () => {
    const { requireSession, requireRead } = await import('@/lib/auth/guards');
    vi.mocked(requireSession).mockResolvedValue({ ok: true, session: session() } as never);
    vi.mocked(requireRead).mockResolvedValue({ ok: true, session: session() } as never);
    const res = await GET(authedRequest('http://localhost/api/tasks?role=compliance'));
    expect(res.status).toBe(403);
  });

  it('UC-TASK-02: GET ?role= returns all tasks for a platform admin', async () => {
    const { requireSession, requireRead } = await import('@/lib/auth/guards');
    vi.mocked(requireSession).mockResolvedValue({
      ok: true,
      session: session({ roleCode: 'platform-admin', platformAdmin: true }),
    } as never);
    vi.mocked(requireRead).mockResolvedValue({
      ok: true,
      session: session({ roleCode: 'platform-admin', platformAdmin: true }),
    } as never);
    const res = await GET(authedRequest('http://localhost/api/tasks?role=finance'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { tasks: Record<string, unknown>[]; isPlatformAdmin: boolean } };
    expect(json.data.isPlatformAdmin).toBe(true);
    expect(json.data.tasks).toHaveLength(1);
  });

  it('UC-TASK-03: POST creates a task (write auth required)', async () => {
    const { requireWriteAuth, requireWrite } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: session() } as never);
    vi.mocked(requireWrite).mockResolvedValue({ ok: true, session: session() } as never);
    const res = await POST(
      authedRequest('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New task', priority: 'P1', ownerCodes: ['finance'] }),
      }),
    );
    expect(res.status).toBe(201);
    const json = (await res.json()) as { data: Record<string, unknown> };
    expect(json.data.title).toBe('New task');
    expect(json.data.priority).toBe('P1');
  });

  it('UC-TASK-03: POST rejects missing title', async () => {
    const { requireWriteAuth, requireWrite } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: session() } as never);
    vi.mocked(requireWrite).mockResolvedValue({ ok: true, session: session() } as never);
    const res = await POST(
      authedRequest('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: 'P1' }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('UC-TASK-04: PATCH updates status for an owned task', async () => {
    const { requireWriteAuth, requireWrite } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: session() } as never);
    vi.mocked(requireWrite).mockResolvedValue({ ok: true, session: session() } as never);
    const res = await PATCH(
      authedRequest('http://localhost/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 't-1', status: 'completed' }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: Record<string, unknown> };
    expect(json.data.status).toBe('completed');
  });

  it('UC-TASK-04: PATCH rejects invalid status', async () => {
    const { requireWriteAuth, requireWrite } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: session() } as never);
    vi.mocked(requireWrite).mockResolvedValue({ ok: true, session: session() } as never);
    const res = await PATCH(
      authedRequest('http://localhost/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 't-1', status: 'bogus' }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('UC-TASK-05: bootstrap is triggered on first GET', async () => {
    // Fresh module instance so the memoized bootstrap flags start unset.
    vi.resetModules();
    const { GET: freshGet } = await import('./route');
    const seedMod = await import('@/domain/seed/seed-runner');
    const { requireSession, requireRead } = await import('@/lib/auth/guards');
    vi.mocked(requireSession).mockResolvedValue({ ok: true, session: session() } as never);
    vi.mocked(requireRead).mockResolvedValue({ ok: true, session: session() } as never);
    await freshGet(authedRequest('http://localhost/api/tasks'));
    expect(seedMod.ensureTaskTables).toHaveBeenCalled();
    expect(seedMod.seedTaskTracking).toHaveBeenCalled();
  });
});
