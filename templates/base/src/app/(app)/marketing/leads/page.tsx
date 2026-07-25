import { LeadList } from '@/components/marketing/lead-list';
import { LeadCaptureForm } from '@/components/marketing/lead-capture-form';

export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Leads</h1>
      <LeadList leads={[]} />
      <LeadCaptureForm />
    </main>
  );
}
