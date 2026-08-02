import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from './route';

const TEST_KEY = 'a'.repeat(64);

function makeDb(overrides: Record<string, unknown> = {}) {
  const tasks = [{ id: 't-1' }];
  const users = [{ id: 'u-ama' }];
  const executed: { sql: string; params: unknown[] }[] = [];
  return {
    task: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        tasks.find((t) => t.id === where.id) ?? null,
      ),
    },
    $queryRawUnsafe: vi.fn(async (sql: string, ...params: unknown[]) => {
      if (sql.includes('FROM user_accounts')) {
        return params[0] === 'u-ama' ? users : [];
      }
      return [];
    }),
    $executeRawUnsafe: vi.fn(async (sql: string, ...params: unknown[]) => {
      executed.push({ sql, params });
    }),
    __executed: executed,
    ...overrides,
  };
}

vi.mock('@/lib/db', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/auth/guards', () => ({
  requireWriteAuth: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  sessionIsPlatformAdmin: vi.fn(),
}));

vi.mock('@/domain/seed/seed-runner', () => ({
  ensureTaskTables: vi.fn(async () => undefined),
}));

import { createClient } from '@/lib/db';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';

function adminSession() {
  return { sub: 'admin', tier: 'pin', roleCode: 'admin', platformAdmin: true };
}

function request(body: unknown): Request {
  return new Request('http://localhost/api/tasks/user-assignment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/tasks/user-assignment', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    vi.clearAllMocks();
    const db = makeDb();
    vi.mocked(createClient).mockReturnValue(db as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(true);
  });

  it('returns 403 for non-platform-admins', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'ama', tier: 'google', roleCode: 'ama', platformAdmin: false },
    } as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(false);
    const res = await POST(request({ taskId: 't-1', userId: 'u-ama', assigned: true }));
    expect(res.status).toBe(403);
  });

  it('returns 401 when no session', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ success: false, error: 'Sign in required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    } as never);
    const res = await POST(request({ taskId: 't-1', userId: 'u-ama', assigned: true }));
    expect(res.status).toBe(401);
  });

  it('rejects missing/empty fields', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    expect((await POST(request({ userId: 'u-ama', assigned: true }))).status).toBe(400);
    expect((await POST(request({ taskId: 't-1', assigned: true }))).status).toBe(400);
    expect((await POST(request({ taskId: 't-1', userId: 'u-ama' }))).status).toBe(400);
  });

  it('returns 404 for unknown task', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({ taskId: 't-missing', userId: 'u-ama', assigned: true }));
    expect(res.status).toBe(404);
  });

  it('returns 404 for unknown user account', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({ taskId: 't-1', userId: 'u-ghost', assigned: true }));
    expect(res.status).toBe(404);
  });

  it('assigns a task to a user (upsert) and reports success', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({ taskId: 't-1', userId: 'u-ama', assigned: true }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { taskId: string; userId: string; assigned: boolean; updated: boolean } };
    expect(json.data).toEqual({ taskId: 't-1', userId: 'u-ama', assigned: true, updated: true });
    const db = vi.mocked(createClient).mock.results[0].value as { __executed: { sql: string }[] };
    const insert = db.__executed.find((e) => e.sql.includes('INSERT INTO task_user_assignments'));
    expect(insert).toBeDefined();
    expect(insert!.sql).toContain('ON CONFLICT (task_id, user_account_id) DO UPDATE SET assigned = true');
  });

  it('unassigns by deleting the row', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({ taskId: 't-1', userId: 'u-ama', assigned: false }));
    expect(res.status).toBe(200);
    const db = vi.mocked(createClient).mock.results[0].value as { __executed: { sql: string }[] };
    const del = db.__executed.find((e) => e.sql.includes('DELETE FROM task_user_assignments'));
    expect(del).toBeDefined();
    expect(del!.sql).toContain('WHERE task_id = $1 AND user_account_id = $2');
  });
});
