import { ProfileForm } from '@/components/user/profile-form';
import { PreferencesPanel } from '@/components/user/preferences-panel';
export const dynamic = 'force-dynamic';
export default function ProfilePage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Profile</h1>
      <ProfileForm />
      <PreferencesPanel />
    </main>
  );
}
