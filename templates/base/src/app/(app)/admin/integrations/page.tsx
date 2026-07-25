import { IntegrationList } from '@/components/integrations/integration-list';
import { SyncLogTable } from '@/components/integrations/sync-log-table';
export const dynamic = 'force-dynamic';
export default function IntegrationsPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Integrations</h1>
      <IntegrationList integrations={[]} />
      <h2>Sync Logs</h2>
      <SyncLogTable logs={[]} />
    </main>
  );
}
