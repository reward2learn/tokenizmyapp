import { createSlice } from '@reduxjs/toolkit';
import type { ForecastScenarioKey } from '@/domain/financial/financial-projection-service';

export type ChartKpi = 'ebitda' | 'revenue' | 'net_income' | 'guests' | 'staff_cost';

/** Tabs in Settings → Billing / Usage (plan, credit history & invoices — not pack purchase). */
export type BillingTab =
  | 'plan'
  | 'credit-history'
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
 *
 * `payment-method`, `topup` and `usage` are first-class Personal sections
 * (not Billing tabs): Payment Method = personal cards; Topup = balance + pack
 * purchase; Usage = users / provider / model breakdowns. Org ledger (Usage
 * history + Grants) stays under Billing → History.
 */
export type SettingsSection =
  | 'general'
  | 'billing'
  | 'payment-method'
  | 'topup'
  | 'usage'
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

export interface WizardRateCardPrefill {
  appCount?: number;
  userCount?: number;
  annualRevenueUsd?: number;
  macStudioCostUsd?: number;
  monthlyThirdPartyUsd?: number;
}

export interface AdminCalculatorContext {
  orgId?: string | null;
  tenantSlug?: string | null;
  /** Optional suite app slug for UI scope; seed still applies to all apps. */
  appId?: string | null;
  /** Optional website URL remembered with org/tenant context. */
  websiteUrl?: string | null;
  /** Optional rate-card draft inputs remembered with context. */
  rateCardInputs?: WizardRateCardPrefill | null;
}

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
  /** Inline page CMS — edit blocks on the current route. */
  pageEditMode: boolean;
  pageEditSlug: string | null;
  /** Client-side publish cache — applied immediately after CMS save (before router.refresh). */
  publishedPageSections: Record<
    string,
    Array<{
      id: string;
      sortOrder: number;
      blockType: string;
      config: Record<string, unknown>;
    }>
  >;
  /** Bumped on publish so live blocks remount with fresh config. */
  pageSectionsRevision: Record<string, number>;
  /** Prefill for create-tenant wizard rate-card step (from AI Credits Calculator). */
  wizardRateCardPrefill: WizardRateCardPrefill | null;
  /** Deep-link context when opening the calculator from Billing. */
  adminCalculatorContext: AdminCalculatorContext | null;
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
  pageEditMode: false,
  pageEditSlug: null,
  publishedPageSections: {},
  pageSectionsRevision: {},
  wizardRateCardPrefill: null,
  adminCalculatorContext: null,
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
    /**
     * Atomically scope org + tenant (+ optional app).
     *
     * Used when picking a tenant or app from the dashboard: dispatching
     * setAdminSelectedOrg first would clear the tenant we are about to set.
     */
    setAdminTenantSelection(
      state,
      action: {
        payload: {
          orgId: string | null;
          tenantSlug: string;
          appId?: string | null;
        };
      },
    ) {
      state.adminSelectedOrgId = action.payload.orgId;
      state.adminSelectedTenantSlug = action.payload.tenantSlug;
      state.adminSelectedAppId = action.payload.appId ?? null;
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
     * top-up button has to land on Topup, and doing that as separate
     * `setSettingsSection` / `setBillingTab` / `setSettingsDialogOpen`
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
    publishPageSections(
      state,
      action: {
        payload: {
          slug: string;
          /** Defaults to slug when omitted (legacy). Prefer cmsPageCacheKey(). */
          cacheKey?: string;
          sections: Array<{
            id: string;
            sortOrder: number;
            blockType: string;
            config: Record<string, unknown>;
          }>;
        };
      },
    ) {
      const { slug, sections, cacheKey } = action.payload;
      const key = cacheKey ?? slug;
      state.publishedPageSections[key] = sections;
      state.pageSectionsRevision[key] = (state.pageSectionsRevision[key] ?? 0) + 1;
    },
    setWizardRateCardPrefill(
      state,
      action: { payload: WizardRateCardPrefill | null },
    ) {
      state.wizardRateCardPrefill = action.payload;
    },
    setAdminCalculatorContext(
      state,
      action: { payload: AdminCalculatorContext | null },
    ) {
      state.adminCalculatorContext = action.payload;
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
  setAdminTenantSelection,
  setAdminSelectedApp,
  setAdminActiveSubtab,
  setBillingTab,
  setSettingsSection,
  setSettingsDialogOpen,
  openSettingsDialog,
  setPageEditMode,
  togglePageEditMode,
  publishPageSections,
  setWizardRateCardPrefill,
  setAdminCalculatorContext,
} = uiSlice.actions;
