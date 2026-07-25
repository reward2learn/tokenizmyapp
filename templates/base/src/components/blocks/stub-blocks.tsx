import dynamic from 'next/dynamic';
import { parseBlockConfig } from '@/lib/schemas/block-config';

const ChatPanel = dynamic(
  () => import('@/components/chat/chat-panel').then((m) => ({ default: m.ChatPanel })),
  { ssr: false },
);

export function CalendarImportBlock({ config }: { config: Record<string, unknown> }) {
  parseBlockConfig('calendar_import', config);
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Calendar import — configure in admin settings.</p>
    </div>
  );
}

export function ChatPanelBlock({ config }: { config: Record<string, unknown> }) {
  parseBlockConfig('chat_panel', config);
  return <ChatPanel />;
}
