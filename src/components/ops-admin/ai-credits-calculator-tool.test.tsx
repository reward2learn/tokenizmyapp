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

describe('AiCreditsCalculatorTool', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders preview and disables Apply without org', () => {
    renderTool();
    expect(screen.getByText(/AI Credits Calculator/i)).toBeTruthy();
    expect(screen.getByText(/Preview markup/i)).toBeTruthy();
    const apply = screen.getByRole('button', { name: /Apply to organization/i });
    expect(apply).toHaveProperty('disabled', true);
    const seed = screen.getByRole('button', { name: /Seed \/ sync AI credits for all apps/i });
    expect(seed).toHaveProperty('disabled', true);
    const secUa = screen.getByRole('button', {
      name: /Push SEC_USER_AGENT to tenant Vercel/i,
    });
    expect(secUa).toHaveProperty('disabled', true);
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

    fireEvent.click(screen.getByRole('button', { name: /Remember context/i }));

    const ctx = store.getState().ui.adminCalculatorContext;
    expect(ctx?.orgId).toBe('org-1');
    expect(ctx?.tenantSlug).toBe('acme');
    expect(ctx?.rateCardInputs).toBeTruthy();
    expect(screen.getByText(/Context saved for acme/i)).toBeTruthy();
    expect(screen.getByText(/Remembered: acme/i)).toBeTruthy();
  });

  it('Use in tenant wizard writes wizardRateCardPrefill and shows snackbar', () => {
    const { store } = renderTool();

    fireEvent.click(screen.getByRole('button', { name: /Use in tenant wizard/i }));

    const prefill = store.getState().ui.wizardRateCardPrefill;
    expect(prefill).toBeTruthy();
    expect(prefill?.macStudioCostUsd).toBeGreaterThan(0);
    expect(
      screen.getByText(/Prefill saved — open Create Tenant wizard/i),
    ).toBeTruthy();
  });

  it('hydrates from adminCalculatorContext deep-link', () => {
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

    expect(screen.getByDisplayValue('https://example.com')).toBeTruthy();
    expect(screen.getByText(/Remembered: acme/i)).toBeTruthy();
  });
});
