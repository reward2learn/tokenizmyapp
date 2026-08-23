import { createSlice } from '@reduxjs/toolkit';
import type { ForecastScenarioKey } from '@/domain/financial/financial-projection-service';

export type ChartKpi = 'ebitda' | 'revenue' | 'net_income' | 'guests' | 'staff_cost';

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
  /** Inline page CMS — edit blocks on the current route. */
  pageEditMode: boolean;
  pageEditSlug: string | null;
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
  pageEditMode: false,
  pageEditSlug: null,
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
    setPageEditMode(
      state,
      action: { payload: { enabled: boolean; slug: string | null } },
    ) {
      state.pageEditMode = action.payload.enabled;
      state.pageEditSlug = action.payload.enabled ? action.payload.slug : null;
    },
    togglePageEditMode(state, action: { payload: { slug: string | null } }) {
      const next = !(state.pageEditMode && state.pageEditSlug === action.payload.slug);
      state.pageEditMode = next;
      state.pageEditSlug = next ? action.payload.slug : null;
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
  setPageEditMode,
  togglePageEditMode,
} = uiSlice.actions;
