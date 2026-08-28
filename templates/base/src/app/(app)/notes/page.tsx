import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { NotesView } from '@/components/notes/notes-view';

export default function NotesPage() {
  return (
    <AuthGate requiredTier="google" fallback={<SignInPanelGate requiredTier="google" />}>
      <NotesView />
    </AuthGate>
  );
}
