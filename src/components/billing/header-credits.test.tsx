import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HeaderCredits } from '@/components/billing/header-credits';
import { organizationApi } from '@/store/apis/organization-api';
import { uiSlice } from '@/store/ui-slice';

type Balance = { available: number; expiringSoon: number; debt: number; net: number } | null;

let orgId: string | null = 'org_1';
let balance: Balance = null;

vi.mock('@/components/billing/use-billing-org', () => ({
  useBillingOrgId: () => orgId,
  useSelfServeBillingEnabled: () => false,
}));

vi.mock('@shared/lib/config/tenant', () => ({
  isPlatformApp: vi.fn(() => true),
}));

import { isPlatformApp } from '@shared/lib/config/tenant';

vi.mock('@/store/apis/organization-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/apis/organization-api')>();
  return {
    ...actual,
    useGetOrganizationCreditsQuery: () => ({ data: { data: { balance } } }),
  };
});

function renderHeader() {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      [organizationApi.reducerPath]: organizationApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(organizationApi.middleware),
  });
  const utils = render(
    <Provider store={store}>
      <HeaderCredits />
    </Provider>,
  );
  return { ...utils, store };
}

afterEach(cleanup);

describe('HeaderCredits', () => {
  it('shows the balance and a top-up control in the header', () => {
    vi.mocked(isPlatformApp).mockReturnValue(true);
    orgId = 'org_1';
    balance = { available: 42, expiringSoon: 0, debt: 0, net: 42 };
    renderHeader();

    expect(screen.getByText('42')).toBeInTheDocument();
    // Hidden on xs in jsdom (no matching sm media query); still present for desktop.
    expect(
      screen.getByRole('button', { name: 'Add AI credits', hidden: true }),
    ).toBeInTheDocument();
  });

  it('offers a request-credits entry point in tenant apps', () => {
    vi.mocked(isPlatformApp).mockReturnValue(false);
    orgId = 'org_1';
    balance = { available: 42, expiringSoon: 0, debt: 0, net: 42 };
    renderHeader();

    expect(
      screen.getByRole('button', { name: 'Request more AI credits', hidden: true }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add AI credits' })).toBeNull();
  });

  it('renders nothing rather than a zero when there is no balance to show', () => {
    // A session that cannot read control-plane credits must not be told it has
    // none — "0 credits" is a much more alarming claim than "not applicable".
    orgId = 'org_1';
    balance = null;
    const { container } = renderHeader();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when no organization resolves', () => {
    orgId = null;
    balance = { available: 42, expiringSoon: 0, debt: 0, net: 42 };
    const { container } = renderHeader();
    expect(container).toBeEmptyDOMElement();
  });

  it('reports debt instead of the available count, since debt blocks generation', () => {
    orgId = 'org_1';
    balance = { available: 0, expiringSoon: 5, debt: 12, net: -12 };
    renderHeader();

    // Debt outranks the expiry warning — the org is blocked right now.
    expect(screen.getByText('12 owed')).toBeInTheDocument();
    expect(screen.queryByText('5')).toBeNull();
  });

  it('opens Settings on Topup, in one dispatch', () => {
    vi.mocked(isPlatformApp).mockReturnValue(true);
    orgId = 'org_1';
    balance = { available: 42, expiringSoon: 0, debt: 0, net: 42 };
    const { store } = renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'Add AI credits', hidden: true }));

    const ui = store.getState().ui;
    expect(ui.settingsDialogOpen).toBe(true);
    expect(ui.settingsSection).toBe('topup');
    // The drawer is what the cog lives in; leaving it open would put a scrim
    // over the dialog that just opened.
    expect(ui.drawerOpen).toBe(false);
  });
});
