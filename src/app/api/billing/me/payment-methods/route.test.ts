import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/auth/guards', () => ({
  requireWriteAuth: vi.fn(),
}));

vi.mock('@/lib/auth/resolve-viewer-user', () => ({
  resolveViewerUserId: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  createRawClient: vi.fn(() => ({})),
}));

vi.mock('@/domain/billing/organization-service', () => ({
  resolveTenantStripeConfig: vi.fn(async () => ({
    secretKey: 'sk_test',
    publishableKey: 'pk_test',
    webhookSecret: 'whsec',
  })),
}));

vi.mock('@/lib/billing/stripe-client', () => ({
  requireStripeFor: vi.fn(() => ({})),
}));

vi.mock('@/domain/billing/stripe-service', () => ({
  listUserPaymentMethods: vi.fn(async () => [
    { id: 'pm_1', brand: 'visa', last4: '4242', expMonth: 1, expYear: 2030, isDefault: true },
  ]),
  createUserSetupIntent: vi.fn(async () => ({ clientSecret: 'seti_secret', customerId: 'cus_u' })),
  setUserDefaultPaymentMethod: vi.fn(async () => {}),
  removeUserPaymentMethod: vi.fn(async () => {}),
  stripeReadiness: vi.fn(() => ({ hasSecretKey: true, hasWebhookSecret: true, ready: true })),
}));

import { requireWriteAuth } from '@/lib/auth/guards';
import { resolveViewerUserId } from '@/lib/auth/resolve-viewer-user';
import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/billing/me/payment-methods', () => {
  it('lists personal methods for a session user with a user_accounts row', async () => {
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'sub_1', tier: 'google', email: 'a@b.com' },
    } as never);
    vi.mocked(resolveViewerUserId).mockResolvedValue('user_1');

    const res = await GET(new Request('http://localhost/api/billing/me/payment-methods?orgId=org_1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.methods).toHaveLength(1);
    expect(body.data.methods[0].id).toBe('pm_1');
  });

  it('rejects when the session has no user_accounts row', async () => {
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'sub_missing', tier: 'google' },
    } as never);
    vi.mocked(resolveViewerUserId).mockResolvedValue(null);

    const res = await GET(new Request('http://localhost/api/billing/me/payment-methods?orgId=org_1'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/No user account/i);
  });

  it('rejects unauthenticated requests', async () => {
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as never);

    const res = await GET(new Request('http://localhost/api/billing/me/payment-methods?orgId=org_1'));
    expect(res.status).toBe(401);
  });
});
