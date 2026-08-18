'use client';

import { useAppSelector } from '@/store/hooks';
import { SettingsPanel } from '@/components/settings/settings-panel';

/**
 * Supplies Settings with the organization currently selected in the admin
 * console.
 *
 * Read from the store rather than a route parameter so the choice made in the
 * organization bar survives navigating here — the two surfaces would otherwise
 * disagree about which organization is being administered, which is the exact
 * confusion the shared `useOrgScopedTenants` hook exists to prevent elsewhere.
 */
export function SettingsGate() {
  const orgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  return <SettingsPanel orgId={orgId} />;
}
