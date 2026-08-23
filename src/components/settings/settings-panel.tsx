'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import PaletteIcon from '@mui/icons-material/Palette';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettingsSection, type SettingsSection } from '@/store/ui-slice';
import { OrganizationGeneralPanel } from '@/components/settings/organization-general-panel';
import { BrandingPanel } from '@/components/settings/branding-panel';
import { TeammatesPanel } from '@/components/settings/teammates-panel';
import { ProfilePanel } from '@/components/settings/profile-panel';
import { SecurityPanel } from '@/components/settings/security-panel';
import { BillingPanel } from '@/components/billing/billing-panel';
import { RADIUS } from '@/theme/design-tokens';
import { isPlatformApp } from '@shared/lib/config/tenant';

/**
 * Settings — organization-scoped on top, personal below.
 *
 * The split is the ownership boundary the platform already has, not a visual
 * grouping: everything above the divider belongs to the Organization (the
 * billing owner of one or more tenants) and everything below belongs to the
 * signed-in account. Billing sits in the first group for the same reason it is
 * keyed on `orgId` everywhere else — a customer running three tenant apps has
 * one plan and one balance, not three.
 *
 * Sections are listed only where something real backs them. SSO, data
 * residency, commerce and chat integrations are deliberately absent rather
 * than present-and-empty: a nav entry that opens onto nothing reads as a broken
 * feature, and this codebase has already had to delete one panel that shipped
 * as a permanent "Disabled" line.
 */

interface SectionDef {
  id: SettingsSection;
  label: string;
  icon: typeof HomeIcon;
}

const PLATFORM_ORGANIZATION_SECTIONS: SectionDef[] = [
  { id: 'general', label: 'General', icon: HomeIcon },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  { id: 'teammates', label: 'Teammates', icon: GroupIcon },
  { id: 'branding', label: 'Branding', icon: PaletteIcon },
];

/** Tenant apps: org identity, usage and team are read-only — only Profile is editable. */
const TENANT_ORGANIZATION_SECTIONS: SectionDef[] = [
  { id: 'general', label: 'General', icon: HomeIcon },
  { id: 'billing', label: 'Usage', icon: InsightsIcon },
  { id: 'teammates', label: 'Team', icon: GroupIcon },
];

const PERSONAL_SECTIONS: SectionDef[] = [
  { id: 'profile', label: 'Profile', icon: PersonIcon },
  { id: 'security', label: 'Security', icon: LockIcon },
];

/** Server-side logout — session cookie is httpOnly so the client cannot clear it. */
export function SettingsLogoutButton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <Button
      fullWidth={fullWidth}
      size="small"
      color="inherit"
      startIcon={<LogoutIcon />}
      href="/api/auth?action=logout"
    >
      Log out
    </Button>
  );
}

export function SettingsPanel({
  orgId,
  selfServeBilling = false,
  variant = 'page',
}: {
  orgId: string | null;
  selfServeBilling?: boolean;
  variant?: 'dialog' | 'page';
}) {
  const dispatch = useAppDispatch();
  const section = useAppSelector((s) => s.ui.settingsSection);
  const onPlatform = isPlatformApp();
  const organizationSections = onPlatform ? PLATFORM_ORGANIZATION_SECTIONS : TENANT_ORGANIZATION_SECTIONS;
  const organizationTitle = onPlatform ? 'Organization' : 'Your organization';
  const embedded = variant === 'dialog';

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        ...(embedded ? { flex: 1, minHeight: 0 } : { minHeight: 560 }),
        width: '100%',
        borderRadius: `${RADIUS.card}px`,
        overflow: 'hidden',
      }}
    >
      <Box
        component="nav"
        aria-label="Settings sections"
        sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <SectionGroup
          title={organizationTitle}
          sections={organizationSections}
          active={section}
          onSelect={(id) => dispatch(setSettingsSection(id))}
        />
        <SectionGroup
          title="Personal"
          sections={PERSONAL_SECTIONS}
          active={section}
          onSelect={(id) => dispatch(setSettingsSection(id))}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'auto',
          p: 3,
        }}
      >
        {section === 'general' && <OrganizationGeneralPanel orgId={orgId} />}
        {section === 'branding' &&
          (orgId ? (
            <BrandingPanel orgId={orgId} />
          ) : (
            <Typography color="text.secondary">Select an organization to manage branding.</Typography>
          ))}
        {section === 'billing' &&
          (orgId ? (
            <BillingPanel orgId={orgId} readOnly={!onPlatform} selfServeBilling={selfServeBilling} />
          ) : (
            <NoOrganization what={onPlatform ? 'Billing' : 'Usage'} />
          ))}
        {section === 'teammates' && <TeammatesPanel orgId={orgId} readOnly={!onPlatform} />}
        {section === 'profile' && <ProfilePanel />}
        {section === 'security' && <SecurityPanel />}
      </Box>
    </Paper>
  );
}

function SectionGroup({
  title,
  sections,
  active,
  onSelect,
}: {
  title: string;
  sections: SectionDef[];
  active: SettingsSection;
  onSelect: (id: SettingsSection) => void;
}) {
  return (
    <Box sx={{ pt: 2 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, display: 'block', lineHeight: 2 }}
      >
        {title}
      </Typography>
      <List dense disablePadding>
        {sections.map(({ id, label, icon: Icon }) => (
          <ListItemButton
            key={id}
            selected={active === id}
            onClick={() => onSelect(id)}
            aria-current={active === id ? 'page' : undefined}
            sx={{ mx: 1, borderRadius: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={label} slotProps={{ primary: { variant: 'body2' } }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

/**
 * Every organization-scoped section needs an org id, and a tenant that has not
 * been assigned a billing owner has none. Naming the section and the fix beats
 * a blank pane, which reads as a load that failed.
 */
export function NoOrganization({ what }: { what: string }) {
  const onPlatform = isPlatformApp();
  return (
    <Stack spacing={1}>
      <Typography variant="h6">{what}</Typography>
      <Typography variant="body2" color="text.secondary">
        {onPlatform ? (
          <>
            No organization is selected. {what} belongs to the organization that pays for a
            tenant, so pick one in the organization bar on the Admin page first.
          </>
        ) : (
          <>
            Unable to load the organization for this tenant. {what} belongs to the
            organization that pays for this app — contact your administrator if this
            persists.
          </>
        )}
      </Typography>
    </Stack>
  );
}
