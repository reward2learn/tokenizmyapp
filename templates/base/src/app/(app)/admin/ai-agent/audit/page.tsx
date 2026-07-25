import { AuditStatsDashboard } from '@/components/ai-agent/audit-stats-dashboard';
import { AuditLogTable } from '@/components/ai-agent/audit-log-table';
export const dynamic = 'force-dynamic';
export default function AiAuditPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>AI Audit</h1>
      <AuditStatsDashboard />
      <AuditLogTable logs={[]} />
    </main>
  );
}
