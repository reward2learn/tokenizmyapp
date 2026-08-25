'use client';

/**
 * TenantAdminPanel — Enhanced tenant administration with tenant selector and subtabs.
 *
 * Features:
 * - Tenant selector dropdown at the top
 * - When a tenant is selected, shows subtabs: Tenant Info, Navigation, Brand Config,
 *   Security Groups, Accounts, Roles, AI Chat
 * - Integrates AI App Pack generation per tenant
 * - Shows suite hierarchy (tenant group → child apps)
 */

import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAdminSelectedTenant, setAdminSelectedApp, setAdminActiveSubtab, type AdminTenantSubtab } from '@/store/ui-slice';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';

import { useListTenantsQuery, type TenantEntry, type AppPackConfig } from '@/store/apis/tenant-api';
import { useOrgScopedTenants } from '@/lib/admin/use-org-scoped-tenants';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { OrganizationBar } from './organization-bar';
import { TenantDashboard } from './tenant-dashboard';
import { TenantInfoTab } from './tenant-info-tab';
import { NavigationManager } from './navigation-manager';
import { PageSectionsManager } from './page-sections-manager';
import { BrandConfigTab } from './brand-config-tab';
import { AppPackTab } from './app-pack-tab';
import { TenantBillingTab } from '@/components/billing/tenant-billing-tab';
import { EditTenantModal } from './edit-tenant-modal';
import { TenantSecurityGroups } from './tenant-security-groups';
import { TenantRoles } from './tenant-roles';
import { TenantAIChat } from './tenant-ai-chat';
import { TenantInlineUserManager } from './tenant-inline-user-manager';
import { AppRow } from './app-row';
import { AddAppButton } from './add-app-dialog';
import { TenantAppRowMenu } from './tenant-app-row-menu';
import {
  ResponsiveTabPanels,
  type ResponsiveTabItem,
} from '@/components/shared/responsive-tab-panels';

// ── Helpers ─────────────────────────────────────────────────

function getAppPack(tenant: TenantEntry | null): AppPackConfig | null {
  if (!tenant) return null;
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

function isSuiteTenant(tenant: TenantEntry): boolean {
  const cfg = (tenant.metadata?.config ?? {}) as Record<string, unknown>;
  const appPack = cfg.appPack as { apps?: unknown[] } | undefined;
  return !!appPack && Array.isArray(appPack.apps) && appPack.apps.length > 0;
}

// ── Component ───────────────────────────────────────────────

export function TenantAdminPanel() {
  const dispatch = useAppDispatch();

  // Tenant selection state — lives in Redux (ui-slice) so every subtab reads
  // the same selection instead of each holding its own local copy.
  const selectedTenantSlug = useAppSelector((s) => s.ui.adminSelectedTenantSlug);
  const selectedAppId = useAppSelector((s) => s.ui.adminSelectedAppId);
  const activeSubtab = useAppSelector((s) => s.ui.adminActiveSubtab);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // Unified App Bundle is a tenant-level tool (Path A — one shared deployment),
  // distinct from the per-app subtabs below — it must not require an app to be
  // selected, and doesn't apply to any single app within a suite.
  const [showAppBundle, setShowAppBundle] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Fetch tenants
  const { data, isLoading, refetch } = useListTenantsQuery();
  // Memoised so the `?? []` fallback does not mint a new array each render and
  // invalidate every downstream useMemo.
  const allTenants = useMemo(() => data?.data?.tenants ?? [], [data]);

  // Scoped by the organization picker in the bar above — shared with the
  // Tenant Applications list so the two sections cannot disagree.
  const { scoped: tenants, selectedOrgId } = useOrgScopedTenants(allTenants);

  // Get selected tenant
  const selectedTenant = useMemo(() => {
    if (!selectedTenantSlug) return null;
    // Resolved against every tenant, not the filtered list: the selection is
    // cleared when the filter changes, so anything still selected here is
    // legitimately in scope, and matching on the filtered list would blank the
    // panel for a render while the organization list refetches.
    return allTenants.find((t) => t.slug === selectedTenantSlug) ?? null;
  }, [allTenants, selectedTenantSlug]);

  // Check if selected tenant is a suite
  const selectedAppPack = selectedTenant ? getAppPack(selectedTenant) : null;
  const isSuite = selectedTenant ? isSuiteTenant(selectedTenant) : false;

  // Apps under the selected tenant — suite tenants list every app in the pack;
  // a single-template tenant has exactly one "app" (itself).
  const tenantApps = useMemo(() => {
    if (!selectedTenant) return [];
    if (isSuite && selectedAppPack) return selectedAppPack.apps;
    return [{
      appId: selectedTenant.slug,
      name: selectedTenant.displayName,
      department: '—',
      templateId: selectedTenant.template,
      status: selectedTenant.status,
      appUrl: selectedTenant.appUrl,
    }];
  }, [selectedTenant, isSuite, selectedAppPack]);

  // Single-template tenants have exactly one possible app — auto-select it so
  // the subtabs don't sit behind an extra, pointless click. Suite tenants
  // require an explicit pick since there's a real choice to make.
  useEffect(() => {
    if (!isSuite && tenantApps.length === 1 && selectedAppId !== tenantApps[0].appId) {
      dispatch(setAdminSelectedApp(tenantApps[0].appId));
    }
  }, [isSuite, tenantApps, selectedAppId, dispatch]);

  // The API only understands appId for real suite apps — a single-template
  // tenant's synthetic "app" (its own slug) exists purely for the UI gating
  // above and must never be sent as a filter (no row is actually stamped with it).
  const effectiveAppId = isSuite ? (selectedAppId ?? undefined) : undefined;

  // Handle tenant selection
  const handleTenantChange = (slug: string) => {
    dispatch(setAdminSelectedTenant(slug || null)); // also resets app + subtab
  };

  const handleClearSelection = () => {
    dispatch(setAdminSelectedTenant(null));
  };

  const handleAppSelect = (appId: string) => {
    dispatch(setAdminSelectedApp(appId));
  };

  // Subtab definitions + panel content (accordion on mobile via ResponsiveTabPanels)
  const subtabItems: ResponsiveTabItem[] = useMemo(() => {
    if (!selectedTenant) return [];
    return [
      {
        id: 'info',
        label: 'Tenant Info',
        content: <TenantInfoTab tenantSlug={selectedTenant.slug} appId={effectiveAppId} />,
      },
      {
        id: 'navigation',
        label: 'Navigation',
        content: <NavigationManager tenantSlug={selectedTenant.slug} appId={effectiveAppId} />,
      },
      {
        id: 'pages',
        label: 'Page Content',
        content: (
          <PageSectionsManager
            tenantSlug={selectedTenant.slug}
            appId={effectiveAppId}
            isSuite={isSuite}
          />
        ),
      },
      {
        id: 'brand',
        label: 'Brand Config',
        content: <BrandConfigTab tenantSlug={selectedTenant.slug} appId={effectiveAppId} />,
      },
      {
        id: 'security',
        label: 'Security Groups',
        content: (
          <TenantSecurityGroups
            tenantSlug={selectedTenant.slug}
            tenantName={selectedTenant.displayName}
            appId={effectiveAppId}
          />
        ),
      },
      {
        id: 'accounts',
        label: 'Accounts',
        content: (
          <TenantInlineUserManager
            tenantSlug={selectedTenant.slug}
            tenantName={selectedTenant.displayName}
            appId={effectiveAppId}
          />
        ),
      },
      {
        id: 'roles',
        label: 'Roles',
        content: (
          <TenantRoles
            tenantSlug={selectedTenant.slug}
            tenantName={selectedTenant.displayName}
            appId={effectiveAppId}
          />
        ),
      },
      {
        id: 'ai-chat',
        label: 'AI Chat',
        content: (
          <TenantAIChat
            tenantSlug={selectedTenant.slug}
            tenantName={selectedTenant.displayName}
            appId={effectiveAppId}
          />
        ),
      },
      {
        id: 'billing',
        label: 'Billing',
        content: <TenantBillingTab tenantSlug={selectedTenant.slug} />,
      },
    ];
  }, [selectedTenant, effectiveAppId, isSuite]);
  
  return (
    <Box sx={{ pb: 4 }}>
      {/* Billing owner sits above the tenant selector: Organization → Tenant →
          Apps. Passing the selected slug pins the bar to that tenant's paying
          org and lets it be moved; with no tenant selected it manages orgs. */}
      <OrganizationBar tenantSlug={selectedTenantSlug} />

      {/* Tenant Selector */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
          {/*
            Keep a real min-width on sm+ — `minWidth: 0` + sibling `width: 100%`
            in a row flex lets this FormControl collapse to a thin outlined
            pill while the InputLabel / selected value overflow beside it.
          */}
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: 0, sm: 280 },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: '100%',
              flex: { xs: 'none', sm: '1 1 280px' },
            }}
          >
            <InputLabel id="tenant-selector-label">Select Tenant</InputLabel>
            <Select
              labelId="tenant-selector-label"
              label="Select Tenant"
              value={selectedTenantSlug ?? ''}
              onChange={(e) => handleTenantChange(e.target.value)}
              disabled={isLoading}
            >
              <MenuItem value="">
                <em>All Tenants (Dashboard)</em>
              </MenuItem>
              {/* An organization that owns nothing must not read as "no tenants
                  exist" — the operator would go looking for a data problem. */}
              {selectedOrgId && tenants.length === 0 ? (
                <MenuItem value="" disabled>
                  <Typography variant="body2" color="text.secondary">
                    No tenants in this organization
                  </Typography>
                </MenuItem>
              ) : null}
              {tenants.map((t) => {
                const suite = isSuiteTenant(t);
                const appPack = getAppPack(t);
                return (
                  <MenuItem key={t.slug} value={t.slug}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t.displayName}
                      </Typography>
                      {suite && appPack && (
                        <Chip 
                          label={`${appPack.apps.length} apps`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          icon={<ApartmentIcon />}
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                      <Chip 
                        label={t.status} 
                        size="small" 
                        color={t.status === 'live' ? 'success' : t.status === 'error' ? 'error' : 'default'}
                        sx={{ height: 20, fontSize: '0.65rem', ml: 'auto' }}
                      />
                    </Stack>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {selectedTenant && (
            <Stack
              direction="row"
              spacing={0.5}
              useFlexGap
              sx={{
                alignItems: 'center',
                // Full width only in the column (xs) layout — claiming 100%
                // beside the Select on sm+ starves the FormControl of flex space.
                width: { xs: '100%', sm: 'auto' },
                minWidth: 0,
                maxWidth: '100%',
                flexWrap: 'wrap',
                rowGap: 0.5,
                flex: { sm: '0 1 auto' },
                flexShrink: { sm: 0 },
              }}
            >
              <Chip
                label={getTemplate(selectedTenant.template).label}
                size="small"
                variant="outlined"
              />
              {isSuite && selectedAppPack && (
                <Chip
                  label={`Suite: ${selectedAppPack.name}`}
                  size="small"
                  color="primary"
                  icon={<ApartmentIcon />}
                />
              )}
              <Chip
                label={selectedTenant.status}
                size="small"
                color={selectedTenant.status === 'live' ? 'success' : selectedTenant.status === 'error' ? 'error' : 'default'}
              />
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                <Tooltip title="Edit tenant configuration">
                  <IconButton size="small" onClick={() => setEditModalOpen(true)} aria-label="Edit tenant">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Unified App Bundle — tenant-level, not per-app">
                  <IconButton
                    size="small"
                    onClick={() => setShowAppBundle((v) => !v)}
                    aria-label="Toggle Unified App Bundle"
                    color={showAppBundle ? 'primary' : 'default'}
                  >
                    <AutoFixHighIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear selection — back to all tenants">
                  <IconButton size="small" onClick={handleClearSelection} aria-label="Clear tenant selection">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
      
      {/* Content Area */}
      {!selectedTenantSlug ? (
        // No tenant selected — show dashboard with all tenants
        <TenantDashboard />
      ) : (
        // Tenant selected — show its apps, then subtabs
        <Box>
          {/* Unified App Bundle — tenant-level tool, independent of app selection */}
          {selectedTenant && showAppBundle && (
            <Box sx={{ mb: 3 }}>
              <AppPackTab
                tenantSlug={selectedTenant.slug}
                tenantName={selectedTenant.displayName}
                onGenerated={() => refetch()}
              />
            </Box>
          )}

          {/* Apps under this tenant */}
          {selectedTenant && (
            <Paper elevation={0} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                useFlexGap
                sx={{
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: 'space-between',
                  mb: 2,
                  width: '100%',
                  minWidth: 0,
                  flexWrap: 'wrap',
                  rowGap: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 0,
                    wordBreak: 'break-word',
                  }}
                >
                  <ApartmentIcon fontSize="small" sx={{ flexShrink: 0 }} />
                  {isSuite && selectedAppPack
                    ? `Suite Hierarchy — ${selectedAppPack.name} (${tenantApps.length} apps)`
                    : 'Apps'}
                </Typography>
                {isSuite && <AddAppButton tenantSlug={selectedTenant.slug} onSnackbar={setSnackbar} />}
              </Stack>
              <Stack spacing={1}>
                {isSuite && selectedAppPack ? (
                  selectedAppPack.apps.map((app) => (
                    <AppRow
                      key={app.appId}
                      tenantSlug={selectedTenant.slug}
                      tenantName={selectedTenant.displayName}
                      app={app}
                      selected={app.appId === selectedAppId}
                      onSelect={handleAppSelect}
                      onSnackbar={setSnackbar}
                    />
                  ))
                ) : (
                  tenantApps.map((app) => {
                    const tpl = getTemplate(app.templateId);
                    const isSelected = app.appId === selectedAppId;
                    return (
                      <Paper
                        key={app.appId}
                        variant="outlined"
                        onClick={() => handleAppSelect(app.appId)}
                        sx={{
                          p: 1.5,
                          bgcolor: isSelected ? 'action.selected' : 'action.hover',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          borderWidth: isSelected ? 2 : 1,
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                              {app.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.appId}{app.department !== '—' ? ` • ${app.department}` : ''} • {tpl.label}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            {isSelected && (
                              <Chip label="Selected" size="small" color="primary" variant="filled" />
                            )}
                            <Chip
                              label={app.status}
                              size="small"
                              color={app.status === 'live' ? 'success' : app.status === 'error' ? 'error' : 'default'}
                            />
                            {app.appUrl && (
                              <Chip
                                label="Open"
                                size="small"
                                variant="outlined"
                                component="a"
                                href={app.appUrl}
                                target="_blank"
                                clickable
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <TenantAppRowMenu tenantSlug={selectedTenant.slug} onSnackbar={setSnackbar} />
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })
                )}
              </Stack>
            </Paper>
          )}

          {!selectedAppId ? (
            <Paper elevation={0} sx={{ p: 4, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Select an app above to manage its Navigation, Page Content, Brand Config, Security Groups, Accounts, Roles, and AI Chat.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <ResponsiveTabPanels
                ariaLabel="Tenant admin sections"
                breakpoint="md"
                value={activeSubtab}
                onChange={(id) => dispatch(setAdminActiveSubtab(id as AdminTenantSubtab))}
                items={subtabItems}
              />
            </Paper>
          )}
        </Box>
      )}
      
      {/* Edit Tenant Modal */}
      {selectedTenant && (
        <EditTenantModal
          open={editModalOpen}
          tenant={selectedTenant}
          onClose={() => setEditModalOpen(false)}
          onSnackbar={setSnackbar}
        />
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={5000} onClose={() => setSnackbar(null)}>
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} sx={{ maxWidth: 480 }}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default TenantAdminPanel;
