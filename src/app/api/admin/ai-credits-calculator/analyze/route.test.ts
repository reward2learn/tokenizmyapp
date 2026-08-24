import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/auth/guards', () => ({
  requireWriteAuth: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  sessionIsPlatformAdmin: vi.fn(),
}));

vi.mock('@/domain/billing/ai-credits-calculator-service', () => ({
  analyzeAiCreditsCalculator: vi.fn().mockResolvedValue({
    report: { computed: { markupPercent: 0.3 }, unitEconomics: { creditsPerUsd: 123 } },
    analysis: null,
    filings: { sec: null, companiesHouse: null, merged: { confidence: 0 }, errors: [] },
    scrape: { url: null, businessName: null, description: null, textExcerpt: null, error: null },
    liveOrg: {
      orgId: null,
      appCount: null,
      userCount: null,
      monthlyThirdPartyUsd: null,
      existingRateCard: false,
    },
    recommendedInputs: {
      appCount: 1,
      userCount: 1,
      annualRevenueUsd: 0,
      macStudioCostUsd: 12999,
      monthlyThirdPartyUsd: 0,
    },
    warnings: [],
  }),
}));

import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { POST } from '@/app/api/admin/ai-credits-calculator/analyze/route';

describe('POST /api/admin/ai-credits-calculator/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when not platform admin', async () => {
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'u1', tier: 'google' },
    } as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(false);

    const res = await POST(
      new Request('http://localhost/api/admin/ai-credits-calculator/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid body', async () => {
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'u1', tier: 'google', platformAdmin: true },
    } as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(true);

    const res = await POST(
      new Request('http://localhost/api/admin/ai-credits-calculator/analyze', {
        method: 'POST',
        body: JSON.stringify({ websiteUrl: 'not-a-url' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns report for platform admin', async () => {
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: true,
      session: { sub: 'u1', tier: 'google', platformAdmin: true },
    } as never);
    vi.mocked(sessionIsPlatformAdmin).mockReturnValue(true);

    const res = await POST(
      new Request('http://localhost/api/admin/ai-credits-calculator/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.report.computed.markupPercent).toBe(0.3);
  });

  it('propagates auth failure', async () => {
    vi.mocked(requireWriteAuth).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    } as never);

    const res = await POST(
      new Request('http://localhost/api/admin/ai-credits-calculator/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(401);
  });
});
