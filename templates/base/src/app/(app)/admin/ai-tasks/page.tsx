import { AiTaskManager } from '@/components/user/ai-task-manager';
export const dynamic = 'force-dynamic';
export default function AiTasksPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>AI Tasks</h1>
      <AiTaskManager tasks={[]} />
    </main>
  );
}
