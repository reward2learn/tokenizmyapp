import { SubscriberList } from '@/components/marketing/subscriber-list';
import { NewsletterSignup } from '@/components/marketing/newsletter-signup';

export const dynamic = 'force-dynamic';

export default function SubscribersPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Subscribers</h1>
      <SubscriberList subscribers={[]} />
      <NewsletterSignup />
    </main>
  );
}
