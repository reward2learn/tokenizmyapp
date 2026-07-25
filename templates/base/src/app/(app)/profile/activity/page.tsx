import { ActivityTimeline } from '@/components/user/activity-timeline';
export const dynamic = 'force-dynamic';
export default function ActivityPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Activity History</h1>
      <ActivityTimeline activities={[]} />
    </main>
  );
}
