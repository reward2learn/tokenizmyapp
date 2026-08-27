'use client';

import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import PaletteIcon from '@mui/icons-material/Palette';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import BoltIcon from '@mui/icons-material/Bolt';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettingsSection, type SettingsSection } from '@/store/ui-slice';
import { OrganizationGeneralPanel } from '@/components/settings/organization-general-panel';
import { BrandingPanel } from '@/components/settings/branding-panel';
import { TeammatesPanel } from '@/components/settings/teammates-panel';
import { ProfilePanel } from '@/components/settings/profile-panel';
import { SecurityPanel } from '@/components/settings/security-panel';
import { AiCreditsPanel, BillingPanel } from '@/components/billing/billing-panel';
import { PersonalUsagePanel } from '@/components/billing/personal-usage-panel';
import { RADIUS } from '@/theme/design-tokens';
import { isPlatformApp } from '@shared/lib/config/tenant';

/**
 * Settings — organization-scoped on top, personal below.
 *
 * The split is the ownership boundary the platform already has, not a visual
 * grouping: everything above the divider belongs to the Organization (the
 * billing owner of one or more tenants) and everything below belongs to the
 * signed-in account. Billing stays in the first group because plans, invoices,
 * and shared plan credits are keyed on `orgId`. Topup sits under Personal
 * because self-serve pack purchases credit the current user's personal pool
 * (spent before shared plan credits). Usage under Personal holds spend
 * breakdowns (users / provider / model). Org ledger (Usage history + Grants)
 * stays under Billing → History for the tenant/org context.
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
  { id: 'teammates', label: 'People', icon: GroupIcon },
];

/** Tenant apps without self-serve: billing/plan is read-only (ledger still visible). */
const TENANT_ORGANIZATION_SECTIONS: SectionDef[] = [
  { id: 'general', label: 'General', icon: HomeIcon },
  { id: 'billing', label: 'Billing', icon: InsightsIcon },
  { id: 'teammates', label: 'People', icon: GroupIcon },
  { id: 'branding', label: 'Branding', icon: PaletteIcon },
];

/** Tenant apps with self-serve billing: full Billing (pay to unlock). */
const TENANT_SELF_SERVE_SECTIONS: SectionDef[] = [
  { id: 'general', label: 'General', icon: HomeIcon },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  { id: 'teammates', label: 'People', icon: GroupIcon },
  { id: 'branding', label: 'Branding', icon: PaletteIcon },
];

const PERSONAL_SECTIONS: SectionDef[] = [
  { id: 'profile', label: 'Profile', icon: PersonIcon },
  { id: 'topup', label: 'Topup', icon: BoltIcon },
  { id: 'usage', label: 'Usage', icon: QueryStatsIcon },
  { id: 'security', label: 'Security', icon: LockIcon },
];

const SUPPORT_HREF =
  process.env.NEXT_PUBLIC_SUPPORT_URL || 'mailto:support@tokenizmyapp.com';

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

export function SettingsContactSupportButton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <Button
      fullWidth={fullWidth}
      size="small"
      variant="outlined"
      startIcon={<SupportAgentIcon />}
      href={SUPPORT_HREF}
      target="_blank"
      rel="noopener noreferrer"
    >
      Contact support
    </Button>
  );
}

/** Sticky footer for the `/settings` route — support + logout stay reachable while scrolling. */
export function SettingsPageFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        mt: 2,
        mx: { xs: -2, md: -3 },
        mb: { xs: -2, md: -3 },
        px: { xs: 2, md: 3 },
        py: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
      }}
    >
      <SettingsContactSupportButton />
      <SettingsLogoutButton />
    </Box>
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
  const theme = useTheme();
  // defaultMatches: false keeps Vitest / SSR on the desktop rail so existing
  // getByRole('button') queries stay stable.
  const isCompact = useMediaQuery(theme.breakpoints.down('md'), { defaultMatches: false });
  const onPlatform = isPlatformApp();
  const organizationSections = onPlatform
    ? PLATFORM_ORGANIZATION_SECTIONS
    : selfServeBilling
      ? TENANT_SELF_SERVE_SECTIONS
      : TENANT_ORGANIZATION_SECTIONS;
  const organizationTitle = onPlatform ? 'Organization' : 'Your organization';
  const embedded = variant === 'dialog';
  const selectSection = (id: SettingsSection) => dispatch(setSettingsSection(id));

  // Self-serve tenant admins need write access to pay invoices / unlock.
  const billingReadOnly = onPlatform ? false : !selfServeBilling;

  const renderSectionContent = (activeSection: SettingsSection) => {
    switch (activeSection) {
      case 'general':
        return <OrganizationGeneralPanel orgId={orgId} />;
      case 'branding':
        return orgId ? (
          <BrandingPanel orgId={orgId} />
        ) : (
          <Typography color="text.secondary">Select an organization to manage branding.</Typography>
        );
      case 'billing':
        return orgId ? (
          <BillingPanel orgId={orgId} readOnly={billingReadOnly} selfServeBilling={selfServeBilling} />
        ) : (
          <NoOrganization what="Billing" />
        );
      case 'topup':
        return orgId ? (
          <AiCreditsPanel orgId={orgId} readOnly={billingReadOnly} selfServeBilling={selfServeBilling} />
        ) : (
          <NoOrganization what="Topup" />
        );
      case 'usage':
        return orgId ? (
          <PersonalUsagePanel orgId={orgId} />
        ) : (
          <NoOrganization what="Usage" />
        );
      case 'teammates':
        return <TeammatesPanel orgId={orgId} readOnly={!onPlatform} />;
      case 'profile':
        return <ProfilePanel />;
      case 'security':
        return <SecurityPanel />;
      default: {
        const _exhaustive: never = activeSection;
        return _exhaustive;
      }
    }
  };

  if (isCompact) {
    return (
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: `${RADIUS.card}px`,
          // Dialog mobile: body scrolls in DialogContent — don't clip or nest scroll here.
          ...(embedded
            ? { overflow: 'visible' }
            : {
                display: 'flex',
                flexDirection: 'column',
                minHeight: 560,
                overflow: 'hidden',
              }),
        }}
      >
        <Box
          sx={{
            ...(embedded
              ? { px: { xs: 1, sm: 1.5 }, py: 1 }
              : {
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  px: { xs: 1, sm: 1.5 },
                  py: 1,
                }),
          }}
        >
          <MobileSectionAccordion
            organizationTitle={organizationTitle}
            organizationSections={organizationSections}
            personalSections={PERSONAL_SECTIONS}
            active={section}
            onSelect={selectSection}
            renderSection={renderSectionContent}
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'row',
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
          onSelect={selectSection}
        />
        <SectionGroup
          title="Personal"
          sections={PERSONAL_SECTIONS}
          active={section}
          onSelect={selectSection}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          ...(embedded ? { height: 'calc(90vh - 169px)' } : null),
          overflow: 'auto',
          p: { xs: 2, md: 3 },
        }}
      >
        {renderSectionContent(section)}
      </Box>
    </Paper>
  );
}

/**
 * Narrow-viewport nav: vertical accordion rows — each section expands inline so
 * content is never hidden behind a horizontal tab strip.
 */
function MobileSectionAccordion({
  organizationTitle,
  organizationSections,
  personalSections,
  active,
  onSelect,
  renderSection,
}: {
  organizationTitle: string;
  organizationSections: SectionDef[];
  personalSections: SectionDef[];
  active: SettingsSection;
  onSelect: (id: SettingsSection) => void;
  renderSection: (id: SettingsSection) => ReactNode;
}) {
  const [expanded, setExpanded] = useState<SettingsSection | false>(active);

  useEffect(() => {
    setExpanded(active);
  }, [active]);

  const handleChange =
    (id: SettingsSection) => (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? id : false);
      if (isExpanded) onSelect(id);
    };

  const renderGroup = (title: string, sections: SectionDef[]) => (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 0.5, display: 'block', lineHeight: 2.25 }}
      >
        {title}
      </Typography>
      <Stack spacing={0.5}>
        {sections.map(({ id, label, icon: Icon }) => (
          <Accordion
            key={id}
            expanded={expanded === id}
            onChange={handleChange(id)}
            disableGutters
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${RADIUS.card}px !important`,
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`settings-section-${id}`}
              id={`settings-section-${id}-header`}
              sx={{
                minHeight: 48,
                '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1, my: 0.75 },
              }}
            >
              <Icon fontSize="small" aria-hidden />
              <Typography variant="body2" sx={{ fontWeight: expanded === id ? 600 : 400 }}>
                {label}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              id={`settings-section-${id}`}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                minWidth: 0,
                overflowX: 'hidden',
              }}
            >
              {expanded === id ? renderSection(id) : null}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Box component="nav" aria-label="Settings sections">
      {renderGroup(organizationTitle, organizationSections)}
      {renderGroup('Personal', personalSections)}
    </Box>
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
