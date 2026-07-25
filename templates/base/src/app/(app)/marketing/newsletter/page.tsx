import { NewsletterSignup } from '@/components/marketing/newsletter-signup';

export const dynamic = 'force-dynamic';

export default function NewsletterPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }}>
      <h1>Newsletter</h1>
      <NewsletterSignup />
    </main>
  );
}
