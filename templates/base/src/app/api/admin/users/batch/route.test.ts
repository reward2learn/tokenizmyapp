import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from './route';
import type { BatchUsersResponse } from './route';

const TEST_KEY = 'a'.repeat(64);

type RawCall = { kind: 'query' | 'execute'; sql: string; args: unknown[] };

function makeDb(overrides: Record<string, unknown> = {}) {
  const calls: RawCall[] = [];
  const existing: { sub: string; id: string }[] = [];
  return {
    $queryRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      calls.push({ kind: 'query', sql, args });
      if (sql.includes('SELECT 1')) return [{ ok: 1 }];
      if (sql.includes('FROM user_accounts WHERE sub')) {
        const sub = args[0];
        return existing.filter((e) => e.sub === sub);
      }
      return [];
    }),
    $executeRawUnsafe: vi.fn(async (sql: string, ...args: unknown[]) => {
      calls.push({ kind: 'execute', sql, args });
      if (sql.trimStart().startsWith('INSERT')) {
        existing.push({ sub: args[0] as string, id: `id-${existing.length + 1}` });
      }
      return [{ count: 1 }];
    }),
    __calls: calls,
    __existing: existing,
    ...overrides,
  };
}

vi.mock('@/lib/db', () => ({
  createRawClient: vi.fn(),
}));

vi.mock('@/lib/auth/guards', () => ({
  requireWriteAuth: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  sessionIsPlatformAdmin: vi.fn(),
}));

vi.mock('@/lib/secrets', () => ({
  setSecret: vi.fn(async () => undefined),
}));

import { createRawClient } from '@/lib/db';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { setSecret } from '@/lib/secrets';

let db: ReturnType<typeof makeDb>;

function adminSession() {
  return { sub: 'admin', tier: 'pin', roleCode: 'admin', platformAdmin: true };
}

function request(body: unknown): Request {
  return new Request('http://localhost/api/admin/users/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function bodyJson(res: Response): Promise<{ success: boolean; data?: BatchUsersResponse; error?: string }> {
  return res.json() as Promise<{ success: boolean; data?: BatchUsersResponse; error?: string }>;
}

describe('/api/admin/users/batch', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    vi.clearAllMocks();
    db = makeDb();
    vi.mocked(createRawClient).mockReturnValue(db as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(true);
  });

  it('returns 403 for non-platform-admins', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'ama', tier: 'google', roleCode: 'ama', platformAdmin: false },
    } as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(false);
    const res = await POST(request({ users: [{ email: 'a@b.com' }] }));
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
    const res = await POST(request({ users: [{ email: 'a@b.com' }] }));
    expect(res.status).toBe(401);
  });

  it('rejects invalid body shapes', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    expect((await POST(request({}))).status).toBe(400);
    expect((await POST(request({ users: [] }))).status).toBe(400);
    expect((await POST(request({ users: 'nope' }))).status).toBe(400);
  });

  it('rejects batches larger than 200', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const users = Array.from({ length: 201 }, (_, i) => ({ email: `user${i}@example.com` }));
    const res = await POST(request({ users }));
    expect(res.status).toBe(400);
  });

  it('creates new users with email-derived sub and tier pin', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({
      users: [
        { name: 'John Doe', email: 'John@Example.com ', roleCode: 'operations' },
        { name: 'Jane Smith', email: 'jane@example.com', roleCode: 'finance', isActive: true },
      ],
    }));
    expect(res.status).toBe(200);
    const json = await bodyJson(res);
    expect(json.data?.created).toBe(2);
    expect(json.data?.updated).toBe(0);
    expect(json.data?.skipped).toBe(0);

    const inserts = db.__calls.filter((c) => c.kind === 'execute' && c.sql.includes('INSERT INTO user_accounts'));
    expect(inserts).toHaveLength(2);
    // First user: sub lowercased + trimmed email
    expect(inserts[0].args).toEqual(['john@example.com', 'john@example.com', 'John Doe', 'operations', true]);
    expect(db.__existing).toHaveLength(2);
  });

  it('updates an existing user matched by sub', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    db.__existing.push({ sub: 'john@example.com', id: 'id-existing' });
    const res = await POST(request({ users: [{ name: 'John Doe 2', email: 'john@example.com', roleCode: 'ceo' }] }));
    expect(res.status).toBe(200);
    const json = await bodyJson(res);
    expect(json.data?.created).toBe(0);
    expect(json.data?.updated).toBe(1);
    const updates = db.__calls.filter(
      (c) => c.kind === 'execute' && c.sql.includes('UPDATE user_accounts'),
    );
    expect(updates).toHaveLength(1);
    expect(updates[0].args).toEqual(['john@example.com', 'John Doe 2', 'ceo', true, 'id-existing']);
  });

  it('skips invalid emails and unknown role codes with reasons', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({
      users: [
        { email: 'not-an-email' },
        { email: 'bad@role.com', roleCode: 'pirate' },
        { email: 'ok@example.com', roleCode: 'operations' },
      ],
    }));
    expect(res.status).toBe(200);
    const json = await bodyJson(res);
    expect(json.data?.created).toBe(1);
    expect(json.data?.skipped).toBe(2);
    expect(json.data?.results[0].error).toContain('Invalid');
    expect(json.data?.results[1].error).toContain('Unknown role code');
  });

  it('stores a PIN secret when a pin is provided', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({ users: [{ email: 'Pin@Example.com', pin: '1234' }] }));
    expect(res.status).toBe(200);
    expect(setSecret).toHaveBeenCalledWith('USER_PIN_pin@example.com', '1234');
  });

  it('skips rows with short PINs', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    const res = await POST(request({ users: [{ email: 'short@example.com', pin: '12' }] }));
    expect(res.status).toBe(200);
    const json = await bodyJson(res);
    expect(json.data?.skipped).toBe(1);
    expect(json.data?.results[0].error).toContain('PIN');
  });

  it('continues past a row-level database error and reports it', async () => {
    const { requireWriteAuth } = await import('@/lib/auth/guards');
    vi.mocked(requireWriteAuth).mockResolvedValue({ ok: true, session: adminSession() } as never);
    db.$executeRawUnsafe.mockRejectedValueOnce(new Error('boom'));
    const res = await POST(request({
      users: [
        { email: 'fail@example.com' },
        { email: 'ok2@example.com' },
      ],
    }));
    expect(res.status).toBe(200);
    const json = await bodyJson(res);
    expect(json.data?.created).toBe(1);
    expect(json.data?.skipped).toBe(1);
    expect(json.data?.results[0].error).toContain('boom');
  });
});
