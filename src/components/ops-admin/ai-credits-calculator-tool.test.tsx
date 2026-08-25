import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/store/apis/organization-api', () => ({
  useListOrganizationsQuery: () => ({
    data: {
      data: {
        organizations: [{ id: 'org-1', slug: 'acme', displayName: 'Acme Corp' }],
      },
    },
  }),
  useAnalyzeAiCreditsCalculatorMutation: () => [vi.fn(), { isLoading: false }],
  useUpsertOrgRateCardMutation: () => [vi.fn(), { isLoading: false }],
  useListCalculatorThreadsQuery: () => ({ data: { data: { threads: [] } }, refetch: vi.fn() }),
  useCreateCalculatorThreadMutation: () => [vi.fn()],
  useGetCalculatorThreadQuery: () => ({ data: undefined, refetch: vi.fn() }),
  useSendCalculatorChatMessageMutation: () => [vi.fn(), { isLoading: false }],
  useGetBillingCatalogQuery: () => ({ data: undefined }),
  useUpdateCatalogPricesMutation: () => [vi.fn(), { isLoading: false }],
  useSyncStripeCatalogPricesMutation: () => [vi.fn(), { isLoading: false }],
  useSeedTenantAiCreditsMutation: () => [vi.fn(), { isLoading: false }],
  usePushTenantSecUserAgentMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/store/apis/tenant-api', () => ({
  useListTenantsQuery: () => ({
    data: {
      data: {
        tenants: [{ slug: 'acme', displayName: 'Acme', appPack: null }],
      },
    },
  }),
}));

import { AiCreditsCalculatorTool } from '@/components/ops-admin/ai-credits-calculator-tool';
import { uiSlice } from '@/store/ui-slice';

function renderTool(preloaded?: Partial<ReturnType<typeof uiSlice.getInitialState>>) {
  const store = configureStore({
    reducer: { ui: uiSlice.reducer },
    preloadedState: preloaded
      ? { ui: { ...uiSlice.getInitialState(), ...preloaded } }
      : undefined,
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <AiCreditsCalculatorTool />
      </Provider>,
    ),
  };
}

/** Pick goal A and land on Scope (step 1). */
function pickPriceOrgGoal() {
  fireEvent.click(screen.getByText(/A · Price organization/i));
}

/** Pick goal B and land on Scope (step 1). */
function pickPrefillGoal() {
  fireEvent.click(screen.getByText(/B · Prefill Create Tenant/i));
}

/** Advance org path Scope → Enrich → Inputs → Review → Commit. */
function advanceOrgPathToCommit() {
  // Scope → Enrich
  fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
  // Enrich → Inputs (Skip / Next)
  fireEvent.click(screen.getByRole('button', { name: /Skip \/ Next/i }));
  // Inputs → Review
  fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
  // Review → Commit
  fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
}

describe('AiCreditsCalculatorTool', () => {
  afterEach(() => {
    cleanup();
  });

  it('starts on goal picker and hides commit CTAs until Commit step', () => {
    renderTool();
    expect(screen.getByText(/AI Credits Calculator/i)).toBeTruthy();
    expect(screen.getByText(/What do you want to do\?/i)).toBeTruthy();
    expect(screen.getByText(/A · Price organization/i)).toBeTruthy();
    expect(screen.getByText(/C · Catalog & Stripe/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Apply to organization/i })).toBeNull();
    expect(screen.queryByText(/Preview markup/i)).toBeNull();
  });

  it('price-org path: Scope requires org; Commit shows Apply/Seed disabled without tenant/org', () => {
    renderTool();
    pickPriceOrgGoal();
    expect(screen.getByText(/Tenant \/ org context/i)).toBeTruthy();

    const next = screen.getByRole('button', { name: /^Next$/i });
    expect(next).toHaveProperty('disabled', true);

    // Select org via remembered context path — use org menu
    fireEvent.mouseDown(screen.getByLabelText(/Organization/i));
    fireEvent.click(screen.getByRole('option', { name: /Acme Corp/i }));
    expect(next).toHaveProperty('disabled', false);

    advanceOrgPathToCommit();

    // Commit step — Apply enabled (org selected), Seed needs tenant
    const apply = screen.getByRole('button', { name: /Apply to organization/i });
    expect(apply).toHaveProperty('disabled', false);
    const seed = screen.getByRole('button', { name: /Seed \/ sync AI credits for all apps/i });
    expect(seed).toHaveProperty('disabled', true);
    expect(screen.getByPlaceholderText(/Message the calculator assistant/i)).toBeTruthy();
  });

  it('Remember context persists org/tenant into ui-slice and shows snackbar', () => {
    const { store } = renderTool({
      adminCalculatorContext: {
        orgId: 'org-1',
        tenantSlug: 'acme',
        appId: null,
      },
    });

    pickPriceOrgGoal();
    fireEvent.click(screen.getByRole('button', { name: /Remember context/i }));

    const ctx = store.getState().ui.adminCalculatorContext;
    expect(ctx?.orgId).toBe('org-1');
    expect(ctx?.tenantSlug).toBe('acme');
    expect(ctx?.rateCardInputs).toBeTruthy();
    expect(screen.getByText(/Context saved for acme/i)).toBeTruthy();
    expect(screen.getByText(/Remembered: acme/i)).toBeTruthy();
  });

  it('prefill path: Use in tenant wizard writes wizardRateCardPrefill', () => {
    const { store } = renderTool();

    pickPrefillGoal();
    // Scope does not require org for prefill
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Skip \/ Next/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));

    fireEvent.click(screen.getByRole('button', { name: /Use in tenant wizard/i }));

    const prefill = store.getState().ui.wizardRateCardPrefill;
    expect(prefill).toBeTruthy();
    expect(prefill?.macStudioCostUsd).toBeGreaterThan(0);
    expect(
      screen.getByText(/Prefill saved — open Create Tenant wizard/i),
    ).toBeTruthy();
  });

  it('hydrates from adminCalculatorContext deep-link on Enrich step', () => {
    renderTool({
      adminCalculatorContext: {
        orgId: 'org-1',
        tenantSlug: 'acme',
        appId: null,
        websiteUrl: 'https://example.com',
        rateCardInputs: {
          appCount: 3,
          userCount: 10,
          annualRevenueUsd: 500_000,
        },
      },
    });

    pickPriceOrgGoal();
    expect(screen.getByText(/Remembered: acme/i)).toBeTruthy();
    // Next to Enrich
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    expect(screen.getByDisplayValue('https://example.com')).toBeTruthy();
  });

  it('catalog path never shows org Apply; Confirm step has catalog/Stripe actions', () => {
    renderTool();
    fireEvent.click(screen.getByText(/C · Catalog & Stripe/i));
    expect(screen.getByText(/Current catalog faces/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Apply to organization/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    expect(screen.getByLabelText(/Pro monthly \(cents\)/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    expect(screen.getByRole('button', { name: /Apply catalog prices/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Sync Stripe list prices/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Apply to organization/i })).toBeNull();
  });
});
