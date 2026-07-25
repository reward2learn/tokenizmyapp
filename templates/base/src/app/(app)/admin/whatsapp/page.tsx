import { WhatsAppSessionList } from '@/components/whatsapp/whatsapp-session-list';
import { WhatsAppSendForm } from '@/components/whatsapp/whatsapp-send-form';
export const dynamic = 'force-dynamic';
export default function WhatsAppPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>WhatsApp</h1>
      <WhatsAppSessionList sessions={[]} />
      <WhatsAppSendForm />
    </main>
  );
}
