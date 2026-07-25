import { CampaignDetail } from '@/components/marketing/campaign-detail';

export const dynamic = 'force-dynamic';

export default function CampaignDetailPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <CampaignDetail campaign={{ id: '', name: '', type: 'email', status: 'draft', subject: '', body: '', audience: 'all', abTest: false, createdAt: '' }} />
    </main>
  );
}
