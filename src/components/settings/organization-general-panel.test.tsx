import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { OrganizationGeneralPanel } from '@/components/settings/organization-general-panel';
import { organizationApi } from '@/store/apis/organization-api';

vi.mock('@shared/lib/config/tenant', () => ({
  isPlatformApp: vi.fn(() => true),
}));

import { isPlatformApp } from '@shared/lib/config/tenant';

const mockOrganization = {
  id: 'org_2d4b456z6u020c2p305v6d63',
  slug: 'default',
  displayName: 'Default Organization',
  logoUrl: 'https://example.com/logo.png',
  ownerUserId: null,
  referredBy: null,
  billingEmail: null,
  billingName: null,
  billingCountry: null,
  billingLine1: null,
  billingLine2: null,
  billingCity: null,
  billingPostal: null,
  taxId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockSubscription = {
  id: 'sub_test',
  orgId: mockOrganization.id,
  planId: 'free' as const,
  interval: 'monthly' as const,
  status: 'active' as const,
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  anchorDate: '2024-01-01T00:00:00Z',
};

const mockPlan = {
  id: 'free' as const,
  label: 'Free',
  tagline: 'Build and preview one app.',
  priceMonthly: 0,
  priceYearly: 0,
  aiCreditsPerMonth: 0,
  cloudMultiplier: 1,
  maxTenants: 1,
  maxAppsPerTenant: 1,
  features: [],
};

function renderPanel(orgId: string | null = mockOrganization.id) {
  const store = configureStore({
    reducer: {
      [organizationApi.reducerPath]: organizationApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(organizationApi.middleware),
  });

  store.dispatch(
    organizationApi.util.upsertQueryData('getOrganization', orgId ?? '', {
      success: true,
      data: {
        organization: mockOrganization,
        members: [],
        subscription: mockSubscription,
        plan: mockPlan,
      },
    }),
  );

  return render(
    <Provider store={store}>
      <OrganizationGeneralPanel orgId={orgId} />
    </Provider>,
  );
}

afterEach(cleanup);

describe('OrganizationGeneralPanel', () => {
  it('allows editing organization identity on the platform console', () => {
    vi.mocked(isPlatformApp).mockReturnValue(true);

    renderPanel();

    expect(screen.getByRole('heading', { name: 'General Settings' })).toBeInTheDocument();
    expect(screen.queryByText(/cannot be changed from this app/i)).toBeNull();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Organization Name'), {
      target: { value: 'Renamed Organization' },
    });

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
  });

  it('shows organization identity as read-only in tenant apps', () => {
    vi.mocked(isPlatformApp).mockReturnValue(false);

    renderPanel();

    expect(screen.getByRole('heading', { name: 'General Settings' })).toBeInTheDocument();
    expect(screen.getByText(/cannot be changed from this app/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Changes' })).toBeNull();

    expect(screen.getByLabelText('Organization Name')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Organization slug')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Organization ID')).toHaveAttribute('readonly');
  });
});
