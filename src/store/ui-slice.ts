import { createSlice } from '@reduxjs/toolkit';
import type { ForecastScenarioKey } from '@/domain/financial/financial-projection-service';

export type ChartKpi = 'ebitda' | 'revenue' | 'net_income' | 'guests' | 'staff_cost';

/** Tabs in Settings → Billing. */
export type BillingTab =
  | 'plan'
  | 'ai-credits'
  | 'cloud-credits'
  | 'billing-details'
  | 'payment-methods'
  | 'invoices';

/**
 * Sections in the Settings page nav.
 *
 * Only sections with something real behind them are listed. A nav entry for a
 * capability the platform does not have reads as a broken feature rather than
 * an absent one — see the auto-reload panel that shipped as a permanent
 * "Disabled" line and had to be removed.
 */
export type SettingsSection =
  | 'general'
  | 'billing'
  | 'teammates'
  | 'branding'
  | 'profile'
  | 'security';

export type AdminTenantSubtab =
  | 'info'
  | 'navigation'
  | 'pages'
  | 'brand'
  | 'security'
  | 'accounts'
  | 'roles'
  | 'ai-chat'
  | 'app-pack'
  | 'billing';

export interface UiState {
  drawerOpen: boolean;
  /** Right-side AI chat drawer (persistent — pushes content, never overlays). */
  chatDrawerOpen: boolean;
  pdfExportMode: boolean;
  activeTab: string;
  chartKpi: ChartKpi;
  chartScenario: ForecastScenarioKey;
  selectedMonthLabel: string | null;
  selectedMonthPeriod: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  /** Platform-admin "Tenants" panel: slug of the tenant selected in the dropdown. */
  /**
   * Platform-admin "Tenants" panel: organization filter.
   *
   * In the store rather than the OrganizationBar's local state because the
   * tenant list below it filters on this — a tenant belongs to exactly one
   * organization, so picking an organization scopes what the panel is about.
   * Null means "all organizations".
   */
  adminSelectedOrgId: string | null;
  adminSelectedTenantSlug: string | null;
  /** Platform-admin "Tenants" panel: appId selected from the tenant's Apps list. */
  adminSelectedAppId: string | null;
  /** Platform-admin "Tenants" panel: which subtab is active for the selected tenant. */
  adminActiveSubtab: AdminTenantSubtab;
  /** Active tab in the Billing panel. */
  billingTab: BillingTab;
  settingsSection: SettingsSection;
  /**
   * Settings rendered as a modal over whatever page is open.
   *
   * In the store rather than component state because three different surfaces
   * open it — the drawer's cog, the header credit chip and the header top-up
   * button — and two of them also choose which section and billing tab it
   * lands on. Local state in the shell would leave those callers reaching
   * across the tree for a setter.
   */
  settingsDialogOpen: boolean;
}

const initialState: UiState = {
  drawerOpen: false,
  chatDrawerOpen: false,
  pdfExportMode: false,
  activeTab: 'z-report',
  chartKpi: 'ebitda',
  chartScenario: 'conservative',
  selectedMonthLabel: null,
  selectedMonthPeriod: null,
  primaryColor: '#eb3d28',
  secondaryColor: '#0af9fe',
  adminSelectedOrgId: null,
  adminSelectedTenantSlug: null,
  adminSelectedAppId: null,
  adminActiveSubtab: 'info',
  billingTab: 'plan',
  settingsSection: 'general',
  settingsDialogOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDrawerOpen(state, action: { payload: boolean }) {
      state.drawerOpen = action.payload;
    },
    setChatDrawerOpen(state, action: { payload: boolean }) {
      state.chatDrawerOpen = action.payload;
    },
    toggleChatDrawer(state) {
      state.chatDrawerOpen = !state.chatDrawerOpen;
    },
    setPdfExportMode(state, action: { payload: boolean }) {
      state.pdfExportMode = action.payload;
    },
    setActiveTab(state, action: { payload: string }) {
      state.activeTab = action.payload;
    },
    setChartKpi(state, action: { payload: ChartKpi }) {
      state.chartKpi = action.payload;
    },
    setChartScenario(state, action: { payload: ForecastScenarioKey }) {
      state.chartScenario = action.payload;
    },
    setSelectedMonth(
      state,
      action: { payload: { label: string | null; period: string | null } },
    ) {
      state.selectedMonthLabel = action.payload.label;
      state.selectedMonthPeriod = action.payload.period;
    },
    setThemeColors(
      state,
      action: { payload: { primary: string; secondary: string } }
    ) {
      state.primaryColor = action.payload.primary;
      state.secondaryColor = action.payload.secondary;
    },
    setAdminSelectedOrg(state, action: { payload: string | null }) {
      if (state.adminSelectedOrgId === action.payload) return;
      state.adminSelectedOrgId = action.payload;
      // The tenant selection is scoped by the filter, so it cannot survive a
      // change of organization — leaving it would show a tenant that is no
      // longer in the list beneath it. The panel re-selects when the tenant
      // does belong to the newly chosen organization.
      state.adminSelectedTenantSlug = null;
      state.adminSelectedAppId = null;
      state.adminActiveSubtab = 'info';
    },
    setAdminSelectedTenant(state, action: { payload: string | null }) {
      state.adminSelectedTenantSlug = action.payload;
      // Switching tenants resets the app selection and subtab so we don't
      // land on e.g. "roles" for an app that hasn't been chosen yet.
      state.adminSelectedAppId = null;
      state.adminActiveSubtab = 'info';
    },
    setAdminSelectedApp(state, action: { payload: string | null }) {
      state.adminSelectedAppId = action.payload;
      state.adminActiveSubtab = 'info';
    },
    setBillingTab(state, action: { payload: BillingTab }) {
      state.billingTab = action.payload;
    },
    setSettingsSection(state, action: { payload: SettingsSection }) {
      state.settingsSection = action.payload;
    },
    setSettingsDialogOpen(state, action: { payload: boolean }) {
      state.settingsDialogOpen = action.payload;
    },
    /**
     * Open Settings at a specific place.
     *
     * One action rather than three dispatches from every call site: the header
     * top-up button has to land on Billing → AI Credits, and doing that as
     * separate `setSettingsSection` / `setBillingTab` / `setSettingsDialogOpen`
     * dispatches renders the dialog once per step on whatever tab was left
     * over from last time.
     */
    openSettingsDialog(
      state,
      action: { payload: { section?: SettingsSection; billingTab?: BillingTab } },
    ) {
      const { section, billingTab } = action.payload;
      if (section) state.settingsSection = section;
      if (billingTab) state.billingTab = billingTab;
      state.settingsDialogOpen = true;
      // The drawer is what the cog lives in; leaving it open puts a scrim and
      // a 280px panel over the dialog that just opened on top of it.
      state.drawerOpen = false;
    },
    setAdminActiveSubtab(state, action: { payload: AdminTenantSubtab }) {
      state.adminActiveSubtab = action.payload;
    },
  },
});

export const {
  setDrawerOpen,
  setChatDrawerOpen,
  toggleChatDrawer,
  setPdfExportMode,
  setActiveTab,
  setChartKpi,
  setChartScenario,
  setSelectedMonth,
  setThemeColors,
  setAdminSelectedOrg,
  setAdminSelectedTenant,
  setAdminSelectedApp,
  setAdminActiveSubtab,
  setBillingTab,
  setSettingsSection,
  setSettingsDialogOpen,
  openSettingsDialog,
} = uiSlice.actions;
