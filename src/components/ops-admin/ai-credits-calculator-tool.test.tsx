import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/store/apis/organization-api', () => ({
  useListOrganizationsQuery: () => ({ data: { data: { organizations: [] } } }),
  useAnalyzeAiCreditsCalculatorMutation: () => [vi.fn(), { isLoading: false }],
  useUpsertOrgRateCardMutation: () => [vi.fn(), { isLoading: false }],
  useListCalculatorThreadsQuery: () => ({ data: { data: { threads: [] } }, refetch: vi.fn() }),
  useCreateCalculatorThreadMutation: () => [vi.fn()],
  useGetCalculatorThreadQuery: () => ({ data: undefined }),
  useSendCalculatorChatMessageMutation: () => [vi.fn(), { isLoading: false }],
  useGetBillingCatalogQuery: () => ({ data: undefined }),
  useUpdateCatalogPricesMutation: () => [vi.fn(), { isLoading: false }],
  useSyncStripeCatalogPricesMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/store/apis/tenant-api', () => ({
  useListTenantsQuery: () => ({ data: { data: { tenants: [] } } }),
}));

import { AiCreditsCalculatorTool } from '@/components/ops-admin/ai-credits-calculator-tool';
import { uiSlice } from '@/store/ui-slice';

function renderTool() {
  const store = configureStore({
    reducer: { ui: uiSlice.reducer },
  });
  return render(
    <Provider store={store}>
      <AiCreditsCalculatorTool />
    </Provider>,
  );
}

describe('AiCreditsCalculatorTool', () => {
  it('renders preview and disables Apply without org', () => {
    renderTool();
    expect(screen.getByText(/AI Credits Calculator/i)).toBeTruthy();
    expect(screen.getByText(/Preview markup/i)).toBeTruthy();
    const apply = screen.getByRole('button', { name: /Apply to organization/i });
    expect(apply).toHaveProperty('disabled', true);
    expect(screen.getByPlaceholderText(/Message the calculator assistant/i)).toBeTruthy();
  });
});
