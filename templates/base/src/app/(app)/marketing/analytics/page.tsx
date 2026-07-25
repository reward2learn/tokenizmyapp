import { AnalyticsDashboard } from '@/components/marketing/analytics-dashboard';
import { AnalyticsEventTracker } from '@/components/marketing/analytics-event-tracker';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Analytics</h1>
      <AnalyticsDashboard />
      <AnalyticsEventTracker />
    </main>
  );
}
