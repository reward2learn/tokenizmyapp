import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { SettingsGate } from '@/components/settings/settings-gate';
import { SettingsLogoutButton } from '@/components/settings/settings-panel';

// Settings reads live organization state; never prerender it at build time.
export const dynamic = 'force-dynamic';

/**
 * /settings — organization and personal settings.
 *
 * Gated at `google` rather than `pin`: everything above the divider reaches
 * billing, and the PIN tier is a shared per-tenant credential rather than a
 * person.
 */
export default function SettingsPage() {
  return (
    <AuthGate requiredTier="google" fallback={<SignInPanelGate requiredTier="google" />}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Stack spacing={2}>
          <SettingsGate />
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <SettingsLogoutButton />
          </Box>
        </Stack>
      </Box>
    </AuthGate>
  );
}
