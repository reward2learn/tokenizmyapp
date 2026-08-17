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
  setAdminSelectedTenant,
  setAdminSelectedApp,
  setAdminActiveSubtab,
  setBillingTab,
} = uiSlice.actions;
