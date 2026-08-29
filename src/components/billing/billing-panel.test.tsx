import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BillingPanel, AiCreditsPanel } from '@/components/billing/billing-panel';
import { organizationApi } from '@/store/apis/organization-api';
import { authSlice } from '@/store/auth-slice';
import { uiSlice } from '@/store/ui-slice';

vi.mock('@/components/billing/credit-topup-dialog', () => ({
  CreditTopUpDialog: () => null,
}));

vi.mock('@/components/billing/payment-methods-tab', () => ({
  PaymentMethodsTab: () => <div>org payment methods</div>,
}));

vi.mock('@/components/billing/cloud-credits-tab', () => ({
  CloudCreditsTab: () => <div>cloud credits</div>,
}));

const orgId = 'org_test';

const mockOrganization = {
  id: orgId,
  slug: 'acme',
  displayName: 'Acme',
  logoUrl: null,
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
  orgId,
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

const mockReadiness = {
  ready: false,
  hasSecretKey: false,
  hasWebhookSecret: false,
  hasPublishableKey: false,
  configuredPrices: 0,
  liveMode: false,
  configError: null,
};

const mockLinkage = {
  customerId: null,
  subscriptionId: null,
  priceId: null,
  gracePeriodEndsAt: null,
  pendingPlanId: null,
};

const mockBillingCheckout = {
  subscription: mockSubscription,
  readiness: mockReadiness,
  purchasable: [],
  linkage: mockLinkage,
  reconcileNote: null,
  priceMismatches: [],
  publishableKey: null,
  cryptoReadiness: { enabled: false, hasTreasury: false, chainId: 11155111, usdcContract: undefined, hasRpcUrl: false },
  cryptoPrepaidMonths: [],
};

function renderPanel(readOnly: boolean) {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      auth: authSlice.reducer,
      [organizationApi.reducerPath]: organizationApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(organizationApi.middleware),
  });

  store.dispatch(
    organizationApi.util.upsertQueryData('getOrganization', orgId, {
      success: true,
      data: {
        organization: mockOrganization,
        members: [],
        subscription: mockSubscription,
        plan: mockPlan,
      },
    }),
  );
  store.dispatch(
    organizationApi.util.upsertQueryData('getOrganizationCredits', orgId, {
      success: true,
      data: {
        balance: { available: 42, expiringSoon: 0, debt: 0, net: 42 },
        grants: [],
        ledger: [],
      },
    }),
  );
  store.dispatch(
    organizationApi.util.upsertQueryData('getBillingCheckout', orgId, {
      success: true,
      data: mockBillingCheckout,
    }),
  );

  return { store, ...render(
    <Provider store={store}>
      <BillingPanel orgId={orgId} readOnly={readOnly} />
    </Provider>,
  ) };
}

function renderTopup(readOnly: boolean) {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      auth: authSlice.reducer,
      [organizationApi.reducerPath]: organizationApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(organizationApi.middleware),
  });

  store.dispatch(
    organizationApi.util.upsertQueryData('getOrganization', orgId, {
      success: true,
      data: {
        organization: mockOrganization,
        members: [],
        subscription: mockSubscription,
        plan: mockPlan,
      },
    }),
  );
  store.dispatch(
    organizationApi.util.upsertQueryData('getOrganizationCredits', orgId, {
      success: true,
      data: {
        balance: { available: 42, expiringSoon: 0, debt: 0, net: 42 },
        grants: [],
        ledger: [],
      },
    }),
  );
  store.dispatch(
    organizationApi.util.upsertQueryData('getBillingCheckout', orgId, {
      success: true,
      data: mockBillingCheckout,
    }),
  );

  return render(
    <Provider store={store}>
      <AiCreditsPanel orgId={orgId} readOnly={readOnly} />
    </Provider>,
  );
}

afterEach(cleanup);

describe('BillingPanel', () => {
  it('shows the payments-not-configured message on the platform console', () => {
    renderPanel(false);
    expect(
      screen.getByText(/Payments are not configured on this deployment/i),
    ).toBeInTheDocument();
  });

  it('shows managed-by-organization messaging in tenant read-only mode', () => {
    renderPanel(true);
    expect(screen.queryByText(/Payments are not configured on this deployment/i)).toBeNull();
    expect(screen.getByText('Managed by your organization')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Choose/i })).toBeNull();
  });

  it('hides Org Payment Methods for self-serve users', () => {
    const store = configureStore({
      reducer: {
        ui: uiSlice.reducer,
        auth: authSlice.reducer,
        [organizationApi.reducerPath]: organizationApi.reducer,
      },
      middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat(organizationApi.middleware),
    });

    store.dispatch(
      organizationApi.util.upsertQueryData('getOrganization', orgId, {
        success: true,
        data: {
          organization: mockOrganization,
          members: [],
          subscription: mockSubscription,
          plan: mockPlan,
        },
      }),
    );
    store.dispatch(
      organizationApi.util.upsertQueryData('getOrganizationCredits', orgId, {
        success: true,
        data: {
          balance: { available: 42, expiringSoon: 0, debt: 0, net: 42 },
          grants: [],
          ledger: [],
        },
      }),
    );
    store.dispatch(
      organizationApi.util.upsertQueryData('getBillingCheckout', orgId, {
        success: true,
        data: mockBillingCheckout,
      }),
    );

    render(
      <Provider store={store}>
        <BillingPanel orgId={orgId} readOnly={false} selfServeBilling />
      </Provider>,
    );

    expect(screen.queryByRole('tab', { name: 'Payment Methods' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Plan' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Invoices' })).toBeInTheDocument();
  });

  it('keeps Org Payment Methods for platform/admin billing', () => {
    renderPanel(false);
    expect(screen.getByRole('tab', { name: 'Payment Methods' })).toBeInTheDocument();
  });
});

describe('AiCreditsPanel', () => {
  it('shows a request-credits entry point for tenant users', () => {
    renderTopup(true);
    expect(screen.getByRole('button', { name: 'Request more AI credits' })).toBeInTheDocument();
  });

  it('stays purchase-focused — no usage history or grants on Topup', () => {
    renderTopup(true);
    expect(screen.queryByRole('tab', { name: 'Usage history' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Grants' })).toBeNull();
  });

  it('opens a copyable credit request dialog for tenant users', () => {
    renderTopup(true);
    fireEvent.click(screen.getByRole('button', { name: 'Request more AI credits' }));
    expect(screen.getByRole('dialog', { name: 'Request more AI credits' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/request an increase to our AI credit limit/i)).toBeInTheDocument();
  });
});

describe('BillingPanel credit history', () => {
  it('keeps usage history under Billing → History, not Topup or Personal Usage analytics', () => {
    const { store } = renderPanel(true);
    store.dispatch(uiSlice.actions.setBillingTab('credit-history'));
    // Re-render with the store already on History.
    cleanup();
    render(
      <Provider store={store}>
        <BillingPanel orgId={orgId} readOnly />
      </Provider>,
    );
    expect(screen.getByRole('tab', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Usage history' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Grants' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Users & top-ups' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Usage by provider' })).toBeNull();
    expect(screen.queryByText(/Your spendable AI credits/i)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Request more AI credits' })).toBeNull();
  });
});
