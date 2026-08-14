import { createSlice } from '@reduxjs/toolkit';
import type { ForecastScenarioKey } from '@/domain/financial/financial-projection-service';

export type ChartKpi = 'ebitda' | 'revenue' | 'net_income' | 'guests' | 'staff_cost';

export type AdminTenantSubtab =
  | 'info'
  | 'navigation'
  | 'brand'
  | 'security'
  | 'accounts'
  | 'roles'
  | 'ai-chat'
  | 'app-pack';

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
  /** Platform-admin "Tenants" panel: which subtab is active for the selected tenant. */
  adminActiveSubtab: AdminTenantSubtab;
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
  adminActiveSubtab: 'info',
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
      // Switching tenants resets the subtab so we don't land on e.g. "roles"
      // for a tenant whose roles haven't loaded yet.
      state.adminActiveSubtab = 'info';
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
  setAdminActiveSubtab,
} = uiSlice.actions;
