import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    drawerOpen: false,
    pdfExportMode: false,
    activeTab: 'z-report',
    chartKpi: 'ebitda',
    chartScenario: 'conservative',
    selectedMonthLabel: null,
    selectedMonthPeriod: null,
    primaryColor: '#eb3d28',
    secondaryColor: '#0af9fe',
};
export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setDrawerOpen(state, action) {
            state.drawerOpen = action.payload;
        },
        setPdfExportMode(state, action) {
            state.pdfExportMode = action.payload;
        },
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
        setChartKpi(state, action) {
            state.chartKpi = action.payload;
        },
        setChartScenario(state, action) {
            state.chartScenario = action.payload;
        },
        setSelectedMonth(state, action) {
            state.selectedMonthLabel = action.payload.label;
            state.selectedMonthPeriod = action.payload.period;
        },
        setThemeColors(state, action) {
            state.primaryColor = action.payload.primary;
            state.secondaryColor = action.payload.secondary;
        },
    },
});
export const { setDrawerOpen, setPdfExportMode, setActiveTab, setChartKpi, setChartScenario, setSelectedMonth, setThemeColors, } = uiSlice.actions;
