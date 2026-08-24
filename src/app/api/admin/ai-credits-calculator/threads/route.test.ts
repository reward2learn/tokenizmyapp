import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/guards', () => ({
  requireWriteAuth: vi.fn(),
}));
vi.mock('@/lib/auth/jwt', () => ({
  sessionIsPlatformAdmin: vi.fn(),
}));
vi.mock('@/domain/billing/ai-credits-calculator-chat-service', () => ({
  createCalculatorThread: vi.fn().mockResolvedValue({
    id: 'acct_1',
    orgId: null,
    tenantSlug: null,
    createdBy: 'admin',
    title: 'Calculator chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  listCalculatorThreads: vi.fn().mockResolvedValue([]),
  getCalculatorThread: vi.fn().mockResolvedValue({
    thread: {
      id: 'acct_1',
      createdBy: 'admin',
      orgId: null,
      tenantSlug: null,
      title: 'Calculator chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    messages: [],
  }),
  sendCalculatorChatMessage: vi.fn().mockResolvedValue({
    userMessage: { id: 'm1', role: 'user', content: 'hi', threadId: 'acct_1', toolCalls: null, createdAt: new Date().toISOString() },
    assistantMessage: { id: 'm2', role: 'assistant', content: 'hello', threadId: 'acct_1', toolCalls: null, createdAt: new Date().toISOString() },
    toolResults: [],
  }),
  streamCalculatorChatMessage: vi.fn().mockResolvedValue(
    new Response('data: {"choices":[{"delta":{"content":"streamed"}}]}\n\ndata: [DONE]\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    }),
  ),
}));

import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { POST as createThread } from '@/app/api/admin/ai-credits-calculator/threads/route';
import { POST as sendMessage } from '@/app/api/admin/ai-credits-calculator/threads/[id]/messages/route';

describe('calculator chat routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'admin', tier: 'google', platformAdmin: true },
    } as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(true);
  });

  it('creates a thread for platform admin', async () => {
    const res = await createThread(
      new Request('http://localhost/api/admin/ai-credits-calculator/threads', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.thread.id).toBe('acct_1');
  });

  it('appends a message on an owned thread', async () => {
    const res = await sendMessage(
      new Request('http://localhost/api/admin/ai-credits-calculator/threads/acct_1/messages', {
        method: 'POST',
        body: JSON.stringify({ message: 'Explain credits per dollar' }),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      }),
      { params: Promise.resolve({ id: 'acct_1' }) },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.assistantMessage.content).toBe('hello');
  });

  it('streams SSE when Accept is text/event-stream', async () => {
    const { streamCalculatorChatMessage } = await import(
      '@/domain/billing/ai-credits-calculator-chat-service'
    );
    const res = await sendMessage(
      new Request('http://localhost/api/admin/ai-credits-calculator/threads/acct_1/messages', {
        method: 'POST',
        body: JSON.stringify({ message: 'Explain credits per dollar' }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
      }),
      { params: Promise.resolve({ id: 'acct_1' }) },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    expect(streamCalculatorChatMessage).toHaveBeenCalled();
    const body = await res.text();
    expect(body).toContain('streamed');
  });

  it('rejects non-platform-admin for messages', async () => {
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(false);
    const res = await sendMessage(
      new Request('http://localhost/api/admin/ai-credits-calculator/threads/acct_1/messages', {
        method: 'POST',
        body: JSON.stringify({ message: 'hi' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: Promise.resolve({ id: 'acct_1' }) },
    );
    expect(res.status).toBe(403);
  });
});
