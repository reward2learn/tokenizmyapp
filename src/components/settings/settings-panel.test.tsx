import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { organizationApi } from '@/store/apis/organization-api';
import { authSlice } from '@/store/auth-slice';
import { uiSlice } from '@/store/ui-slice';

// Billing pulls in Stripe Elements, which is irrelevant to the nav and
// expensive to load in jsdom.
vi.mock('@/components/billing/billing-panel', () => ({
  BillingPanel: ({ orgId }: { orgId: string }) => <div>billing for {orgId}</div>,
}));

function renderPanel(orgId: string | null) {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      auth: authSlice.reducer,
      [organizationApi.reducerPath]: organizationApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(organizationApi.middleware),
  });
  return render(
    <Provider store={store}>
      <SettingsPanel orgId={orgId} />
    </Provider>,
  );
}

// Explicit, because vitest runs without `globals` here — Testing Library only
// registers its own afterEach cleanup when the global hooks exist, so without
// this each render stacks on the last and every getByRole finds duplicates.
afterEach(cleanup);

describe('SettingsPanel', () => {
  it('lists only sections that have something behind them', () => {
    // The rule this encodes: a nav entry that opens onto nothing reads as a
    // broken feature rather than an absent one. SSO, data residency, commerce
    // and chat integrations have no implementation, so they must not appear
    // and quietly promise one.
    renderPanel('org_1');

    for (const present of ['General', 'Billing', 'Teammates', 'Profile', 'Security']) {
      expect(screen.getByRole('button', { name: present })).toBeInTheDocument();
    }
    for (const absent of ['SSO', 'Data residency', 'Commerce', 'Skills', 'Chat Integrations']) {
      expect(screen.queryByRole('button', { name: absent })).toBeNull();
    }
  });

  it('switches section through the store, not local state', () => {
    renderPanel('org_1');
    fireEvent.click(screen.getByRole('button', { name: 'Security' }));
    expect(screen.getByRole('heading', { name: 'Security' })).toBeInTheDocument();
  });

  it('names the section when no organization is selected', () => {
    // Every organization-scoped section needs an orgId, and a tenant with no
    // billing owner has none. A blank pane reads as a failed load.
    renderPanel(null);
    expect(screen.getByText(/No organization is selected/i)).toBeInTheDocument();
  });

  it('signs out through the server, not a client-side clear', () => {
    // The session cookie is httpOnly, so only the server can drop it.
    renderPanel('org_1');
    expect(screen.getByRole('link', { name: /Logout/i })).toHaveAttribute(
      'href',
      '/api/auth?action=logout',
    );
  });
});
