import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonOk, jsonError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const client = createClient({ tier: guard.session.tier, sub: guard.session.sub });
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '30d';

  const now = new Date();
  const from = new Date(now.getTime() - (range === '7d' ? 7 : range === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000);

  const [events, pageViews, trafficSources, conversions] = await Promise.all([
    client.analyticsEvent.count({ where: { createdAt: { gte: from, lte: now } } }),
    client.analyticsEvent.findMany({
      where: { type: 'page_view', createdAt: { gte: from, lte: now } },
      select: { pagePath: true, metadata: true },
    }),
    client.analyticsEvent.findMany({
      where: { type: 'traffic_source', createdAt: { gte: from, lte: now } },
      select: { metadata: true },
    }),
    client.analyticsEvent.count({ where: { type: 'conversion', createdAt: { gte: from, lte: now } } }),
  ]);

  const pageViewCounts = new Map<string, number>();
  for (const pv of pageViews) {
    const key = pv.pagePath ?? 'unknown';
    pageViewCounts.set(key, (pageViewCounts.get(key) ?? 0) + 1);
  }

  const sourceCounts = new Map<string, number>();
  for (const ts of trafficSources) {
    const source = (ts.metadata as Record<string, unknown>)?.source as string ?? 'direct';
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
  }

  return jsonOk({
    totalEvents: events,
    totalPageViews: pageViews.length,
    totalConversions: conversions,
    topPages: Array.from(pageViewCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10),
    topSources: Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
    conversionRate: events > 0 ? (conversions / events) * 100 : 0,
    dateRange: { from, to: now, range },
  });
}
