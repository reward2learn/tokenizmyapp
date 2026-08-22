import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BillingPanel } from '@/components/billing/billing-panel';
import { organizationApi } from '@/store/apis/organization-api';
import { authSlice } from '@/store/auth-slice';
import { uiSlice } from '@/store/ui-slice';

vi.mock('@/components/ops-admin/stripe-topup-dialog', () => ({
  StripeTopUpDialog: () => null,
}));

const orgId = 'org_test';

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
        organization: {
          id: orgId,
          slug: 'acme',
          displayName: 'Acme',
          logoUrl: null,
        },
        members: [],
        subscription: { planId: 'free', interval: 'monthly', status: 'active' },
        plan: { id: 'free', name: 'Free' },
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
      data: {
        subscription: { planId: 'free', interval: 'monthly', status: 'active' },
        readiness: { ready: false },
        purchasable: [],
        linkage: null,
        reconcileNote: null,
        priceMismatches: [],
      },
    }),
  );

  return render(
    <Provider store={store}>
      <BillingPanel orgId={orgId} readOnly={readOnly} />
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
    expect(screen.getByText(/Managed by your organization/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request more AI credits' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Choose/i })).toBeNull();
  });

  it('opens a copyable credit request dialog for tenant users', () => {
    renderPanel(true);
    fireEvent.click(screen.getByRole('button', { name: 'Request more AI credits' }));
    expect(screen.getByRole('dialog', { name: 'Request more AI credits' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/request an increase to our AI credit limit/i)).toBeInTheDocument();
  });
});
