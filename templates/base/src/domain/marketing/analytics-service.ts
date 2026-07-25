import { createClient } from '@/lib/db';


export class AnalyticsService {
  private client = createClient();

  async track(event: {
    userId?: string;
    sessionId: string;
    eventType: string;
    page?: string;
    properties?: Record<string, unknown>;
  }): Promise<AnalyticsEvent> {
    return this.client.analyticsEvent.create({
      data: {
        userSub: event.userId ?? null,
        sessionId: event.sessionId,
        type: event.eventType,
        pagePath: event.page ?? null,
        metadata: event.properties ?? null,
      },
    });
  }

  async getPageViews(filter?: {
    from?: Date;
    to?: Date;
    page?: string;
  }): Promise<{ page: string; views: number }[]> {
    const where: Record<string, unknown> = { eventType: 'page_view' };
    if (filter?.from) where.createdAt = { gte: filter.from };
    if (filter?.to) where.createdAt = { ...(where.createdAt as Record<string, unknown>), lte: filter.to };

    const events = await this.client.analyticsEvent.findMany({
      where,
      select: { pagePath: true, metadata: true },
    });

    const counts = new Map<string, number>();
    for (const ev of events) {
      const key = ev.pagePath ?? 'unknown';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views);
  }

  async getTrafficSources(filter?: { from?: Date; to?: Date }): Promise<{ source: string; count: number }[]> {
    const where: Record<string, unknown> = { eventType: 'traffic_source' };
    if (filter?.from) where.createdAt = { gte: filter.from };
    if (filter?.to) where.createdAt = { ...(where.createdAt as Record<string, unknown>), lte: filter.to };

    const events = await this.client.analyticsEvent.findMany({
      where,
      select: { metadata: true },
    });

    const counts = new Map<string, number>();
    for (const ev of events) {
      const source = (ev.metadata as Record<string, unknown>)?.source as string ?? 'direct';
      counts.set(source, (counts.get(source) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getConversions(filter?: { from?: Date; to?: Date }): Promise<number> {
    const where: Record<string, unknown> = { eventType: 'conversion' };
    if (filter?.from) where.createdAt = { gte: filter.from };
    if (filter?.to) where.createdAt = { ...(where.createdAt as Record<string, unknown>), lte: filter.to };
    return this.client.analyticsEvent.count({ where });
  }

  async getDashboardStats(dateRange: { from: Date; to: Date }) {
    const [pageViews, trafficSources, conversions, events] = await Promise.all([
      this.getPageViews({ from: dateRange.from, to: dateRange.to }),
      this.getTrafficSources({ from: dateRange.from, to: dateRange.to }),
      this.getConversions({ from: dateRange.from, to: dateRange.to }),
      this.client.analyticsEvent.count({ where: { createdAt: { gte: dateRange.from, lte: dateRange.to } } }),
    ]);

    return {
      totalPageViews: pageViews.reduce((s, p) => s + p.views, 0),
      totalTrafficSources: trafficSources.reduce((s, t) => s + t.count, 0),
      totalConversions: conversions,
      totalEvents: events,
      topPages: pageViews.slice(0, 10),
      topSources: trafficSources.slice(0, 5),
      conversionRate: events > 0 ? (conversions / events) * 100 : 0,
    };
  }
}
