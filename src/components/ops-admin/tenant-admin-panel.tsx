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

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { useListTenantsQuery, type TenantEntry, type AppPackConfig } from '@/store/apis/tenant-api';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { TenantDashboard } from './tenant-dashboard';
import { TenantInfoTab } from './tenant-info-tab';
import { NavigationManager } from './navigation-manager';
import { BrandConfigTab } from './brand-config-tab';
import { TenantUserManager } from './tenant-user-manager';
import { AppPackTab } from './app-pack-tab';
import { EditTenantModal } from './edit-tenant-modal';
import { TenantAdminProvider } from './tenant-admin-context';
import { TenantSecurityGroups } from './tenant-security-groups';
import { TenantRoles } from './tenant-roles';
import { TenantAIChat } from './tenant-ai-chat';
import { TenantInlineUserManager } from './tenant-inline-user-manager';

// ── Types ───────────────────────────────────────────────────

type TenantSubtab = 'info' | 'navigation' | 'brand' | 'security' | 'accounts' | 'roles' | 'ai-chat' | 'app-pack';

interface TenantAdminPanelProps {
  /** Initial tab to show */
  initialSubtab?: TenantSubtab;
}

// ── Helpers ─────────────────────────────────────────────────

function getAppPack(tenant: TenantEntry | null): AppPackConfig | null {
  if (!tenant) return null;
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

function isSuiteTenant(tenant: TenantEntry): boolean {
  const cfg = (tenant.metadata?.config ?? {}) as Record<string, unknown>;
  return cfg.templateMode === 'suite' && !!cfg.appPack;
}

// ── Component ───────────────────────────────────────────────

export function TenantAdminPanel({ initialSubtab = 'info' }: TenantAdminPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Tenant selection state
  const [selectedTenantSlug, setSelectedTenantSlug] = useState<string | null>(null);
  const [activeSubtab, setActiveSubtab] = useState<TenantSubtab>(initialSubtab);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Fetch tenants
  const { data, isLoading, refetch } = useListTenantsQuery();
  const tenants = data?.data?.tenants ?? [];
  
  // Get selected tenant
  const selectedTenant = useMemo(() => {
    if (!selectedTenantSlug) return null;
    return tenants.find((t) => t.slug === selectedTenantSlug) ?? null;
  }, [tenants, selectedTenantSlug]);
  
  // Check if selected tenant is a suite
  const selectedAppPack = selectedTenant ? getAppPack(selectedTenant) : null;
  const isSuite = selectedTenant ? isSuiteTenant(selectedTenant) : false;
  
  // Handle tenant selection
  const handleTenantChange = (slug: string) => {
    setSelectedTenantSlug(slug || null);
    setActiveSubtab('info'); // Reset to info tab when switching tenants
  };
  
  // Subtab definitions
  const subtabs: Array<{ key: TenantSubtab; label: string; icon?: React.ReactNode }> = [
    { key: 'info', label: 'Tenant Info' },
    { key: 'navigation', label: 'Navigation' },
    { key: 'brand', label: 'Brand Config' },
    { key: 'security', label: 'Security Groups' },
    { key: 'accounts', label: 'Accounts' },
    { key: 'roles', label: 'Roles' },
    { key: 'ai-chat', label: 'AI Chat' },
    { key: 'app-pack', label: 'AI App Pack', icon: <AutoFixHighIcon fontSize="small" /> },
  ];
  
  return (
    <Box sx={{ pb: 4 }}>
      {/* Tenant Selector */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
          <FormControl size="small" sx={{ minWidth: 280, flex: 1 }}>
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
            </Stack>
          )}
        </Stack>
      </Paper>
      
      {/* Content Area */}
      {!selectedTenantSlug ? (
        // No tenant selected — show dashboard with all tenants
        <TenantDashboard />
      ) : (
        // Tenant selected — show subtabs wrapped in provider
        <TenantAdminProvider selectedTenant={selectedTenant}>
        <Box>
          {/* Subtab Navigation */}
          <Paper elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={activeSubtab}
              onChange={(_, v) => setActiveSubtab(v as TenantSubtab)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {subtabs.map((subtab) => (
                <Tab 
                  key={subtab.key} 
                  value={subtab.key} 
                  label={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      {subtab.icon}
                      <span>{subtab.label}</span>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Paper>
          
          {/* Subtab Content */}
          <Box>
            {activeSubtab === 'info' && (
              <TenantInfoTab />
            )}
            {activeSubtab === 'navigation' && (
              <NavigationManager />
            )}
            {activeSubtab === 'brand' && (
              <BrandConfigTab />
            )}
            {activeSubtab === 'security' && selectedTenant && (
              <TenantSecurityGroups tenantSlug={selectedTenant.slug} tenantName={selectedTenant.displayName} />
            )}
            {activeSubtab === 'accounts' && selectedTenant && (
              <TenantInlineUserManager tenantSlug={selectedTenant.slug} tenantName={selectedTenant.displayName} />
            )}
            {activeSubtab === 'roles' && selectedTenant && (
              <TenantRoles tenantSlug={selectedTenant.slug} tenantName={selectedTenant.displayName} />
            )}
            {activeSubtab === 'ai-chat' && selectedTenant && (
              <TenantAIChat tenantSlug={selectedTenant.slug} tenantName={selectedTenant.displayName} />
            )}
            {activeSubtab === 'app-pack' && selectedTenant && (
              <AppPackTab 
                tenantSlug={selectedTenant.slug} 
                tenantName={selectedTenant.displayName}
                onGenerated={() => refetch()}
              />
            )}
          </Box>
          
          {/* Suite Hierarchy Display */}
          {isSuite && selectedAppPack && (
            <Paper elevation={0} sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApartmentIcon fontSize="small" />
                Suite Hierarchy — {selectedAppPack.name}
              </Typography>
              <Stack spacing={1}>
                {selectedAppPack.apps.map((app) => {
                  const tpl = getTemplate(app.templateId);
                  return (
                    <Paper key={app.appId} variant="outlined" sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {app.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {app.appId} • {app.department} • {tpl.label}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
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
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          )}
        </Box>
        </TenantAdminProvider>
      )}
      
      {/* Edit Tenant Modal */}
      {selectedTenant && (
        <EditTenantModal
          open={editModalOpen}
          tenant={selectedTenant}
          onClose={() => setEditModalOpen(false)}
          onSnackbar={(msg) => {
            // Handle snackbar notifications
            console.log(msg.message, msg.severity);
          }}
        />
      )}
    </Box>
  );
}

export default TenantAdminPanel;
