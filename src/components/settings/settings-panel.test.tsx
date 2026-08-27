import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SettingsLogoutButton, SettingsPanel } from '@/components/settings/settings-panel';
import { organizationApi } from '@/store/apis/organization-api';
import { authSlice } from '@/store/auth-slice';
import { uiSlice } from '@/store/ui-slice';

vi.mock('@shared/lib/config/tenant', () => ({
  isPlatformApp: vi.fn(() => true),
}));

vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false),
}));

import { isPlatformApp } from '@shared/lib/config/tenant';

// Billing pulls in Stripe Elements, which is irrelevant to the nav and
// expensive to load in jsdom.
vi.mock('@/components/billing/billing-panel', () => ({
  BillingPanel: ({ orgId, readOnly }: { orgId: string; readOnly?: boolean }) => (
    <div>
      billing for {orgId}
      {readOnly ? ' (read-only)' : ''}
    </div>
  ),
  AiCreditsPanel: ({ orgId }: { orgId: string }) => <div>topup for {orgId}</div>,
}));

const theme = createTheme();

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
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <SettingsPanel orgId={orgId} />
      </Provider>
    </ThemeProvider>,
  );
}

// Explicit, because vitest runs without `globals` here — Testing Library only
// registers its own afterEach cleanup when the global hooks exist, so without
// this each render stacks on the last and every getByRole finds duplicates.
afterEach(() => {
  cleanup();
  vi.mocked(useMediaQuery).mockReturnValue(false);
  vi.mocked(isPlatformApp).mockReturnValue(true);
});

describe('SettingsPanel', () => {
  it('lists only sections that have something behind them', () => {
    vi.mocked(isPlatformApp).mockReturnValue(true);
    // The rule this encodes: a nav entry that opens onto nothing reads as a
    // broken feature rather than an absent one. SSO, data residency, commerce
    // and chat integrations have no implementation, so they must not appear
    // and quietly promise one.
    renderPanel('org_1');

    for (const present of ['General', 'Billing', 'People', 'Topup', 'Profile', 'Security']) {
      expect(screen.getByRole('button', { name: present })).toBeInTheDocument();
    }
    for (const absent of ['SSO', 'Data residency', 'Commerce', 'Skills', 'Chat Integrations']) {
      expect(screen.queryByRole('button', { name: absent })).toBeNull();
    }
  });

  it('shows tenant-app usage, topup, people and branding sections without billing controls', () => {
    vi.mocked(isPlatformApp).mockReturnValue(false);
    renderPanel('org_1');

    expect(screen.getByRole('button', { name: 'Usage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Topup' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Branding' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Billing' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Usage' }));
    expect(screen.getByText(/billing for org_1 \(read-only\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Topup' }));
    expect(screen.getByText(/topup for org_1/i)).toBeInTheDocument();
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

  it('swaps the side rail for expandable accordion rows on compact viewports', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(isPlatformApp).mockReturnValue(false);
    renderPanel('org_1');

    expect(screen.getByRole('button', { name: /Usage/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByText(/Your organization/i)).toBeInTheDocument();
    expect(screen.getByText(/^Personal$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Usage/i }));
    expect(screen.getByText(/billing for org_1 \(read-only\)/i)).toBeInTheDocument();
  });
});

describe('SettingsLogoutButton', () => {
  it('signs out through the server, not a client-side clear', () => {
    render(<SettingsLogoutButton />);
    expect(screen.getByRole('link', { name: /Log out/i })).toHaveAttribute(
      'href',
      '/api/auth?action=logout',
    );
    cleanup();
  });
});
