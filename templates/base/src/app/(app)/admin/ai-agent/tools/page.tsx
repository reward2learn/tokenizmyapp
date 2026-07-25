import { ToolApprovalQueue } from '@/components/ai-agent/tool-approval-queue';
export const dynamic = 'force-dynamic';
export default function AiToolsPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Tool Approvals</h1>
      <ToolApprovalQueue tools={[]} />
    </main>
  );
}
