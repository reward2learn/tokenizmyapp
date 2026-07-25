import { TaskList } from '@/components/user/task-list';
export const dynamic = 'force-dynamic';
export default function TasksPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>My Tasks</h1>
      <TaskList tasks={[]} />
    </main>
  );
}
