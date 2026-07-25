import { AgentConfigForm } from '@/components/ai-agent/agent-config-form';
import { AgentRunner } from '@/components/ai-agent/agent-runner';
export const dynamic = 'force-dynamic';
export default function AiAgentPage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>AI Agent</h1>
      <AgentConfigForm />
      <AgentRunner />
    </main>
  );
}
