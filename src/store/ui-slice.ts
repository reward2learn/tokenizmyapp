import { createSlice } from '@reduxjs/toolkit';
import type { ForecastScenarioKey } from '@/domain/financial/financial-projection-service';

export type ChartKpi = 'ebitda' | 'revenue' | 'net_income' | 'guests' | 'staff_cost';

/** Tabs in Settings → Billing. */
export type BillingTab = 'plan' | 'ai-credits' | 'cloud-credits' | 'invoices';

export type AdminTenantSubtab =
  | 'info'
  | 'navigation'
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
} = uiSlice.actions;
