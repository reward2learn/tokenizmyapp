import { CampaignList } from '@/components/marketing/campaign-list';

export const dynamic = 'force-dynamic';

export default function CampaignsPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Campaigns</h1>
      <CampaignList campaigns={[]} />
    </main>
  );
}
