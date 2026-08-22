'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
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

const ORGANIZATION_SECTIONS: SectionDef[] = [
  { id: 'general', label: 'General', icon: HomeIcon },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  { id: 'teammates', label: 'Teammates', icon: GroupIcon },
  { id: 'branding', label: 'Branding', icon: PaletteIcon },
];

const PERSONAL_SECTIONS: SectionDef[] = [
  { id: 'profile', label: 'Profile', icon: PersonIcon },
  { id: 'security', label: 'Security', icon: LockIcon },
];

export function SettingsPanel({ orgId }: { orgId: string | null }) {
  const dispatch = useAppDispatch();
  const section = useAppSelector((s) => s.ui.settingsSection);

  return (
    <Paper
      variant="outlined"
      sx={{ display: 'flex', minHeight: 560, borderRadius: `${RADIUS.card}px`, overflow: 'hidden' }}
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
        }}
      >
        <SectionGroup
          title="Organization"
          sections={ORGANIZATION_SECTIONS}
          active={section}
          onSelect={(id) => dispatch(setSettingsSection(id))}
        />
        <SectionGroup
          title="Personal"
          sections={PERSONAL_SECTIONS}
          active={section}
          onSelect={(id) => dispatch(setSettingsSection(id))}
        />

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Box sx={{ p: 1 }}>
          {/*
            A full navigation, not a fetch: signing out clears an httpOnly
            cookie the client cannot see, so the server has to be the one to
            do it and the app has to reload without it.
          */}
          <Button
            fullWidth
            size="small"
            color="inherit"
            startIcon={<LogoutIcon />}
            sx={{ justifyContent: 'flex-start' }}
            href="/api/auth?action=logout"
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        {section === 'general' && <OrganizationGeneralPanel orgId={orgId} />}
        {section === 'branding' &&
          (orgId ? (
            <BrandingPanel orgId={orgId} />
          ) : (
            <Typography color="text.secondary">Select an organization to manage branding.</Typography>
          ))}
        {section === 'billing' &&
          (orgId ? (
            <BillingPanel orgId={orgId} />
          ) : (
            <NoOrganization what="Billing" />
          ))}
        {section === 'teammates' && <TeammatesPanel orgId={orgId} />}
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
