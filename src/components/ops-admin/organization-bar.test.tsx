import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { OrganizationBar } from '@/components/ops-admin/organization-bar';
import { makeOrganization } from '@/test/org-fixture';
import { organizationApi } from '@/store/apis/organization-api';
import { uiSlice } from '@/store/ui-slice';

// The top-up dialog pulls in Stripe Elements, which is irrelevant here and
// expensive to load in jsdom. It only renders when opened.
vi.mock('@/components/ops-admin/stripe-topup-dialog', () => ({
  StripeTopUpDialog: () => null,
}));

const ORGS = [
  makeOrganization({ id: 'org_alpha', slug: 'alpha', displayName: 'Alpha Group', tenants: [{ slug: 'acme', displayName: 'Acme' }] }),
];

async function renderBar() {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      [organizationApi.reducerPath]: organizationApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(organizationApi.middleware),
  });

  await store.dispatch(
    organizationApi.util.upsertQueryData('listOrganizations', undefined, {
      success: true,
      data: { organizations: ORGS, assigned: 0 },
    }),
  );

  return render(
    <Provider store={store}>
      <OrganizationBar />
    </Provider>,
  );
}

describe('OrganizationBar organization field', () => {
  it('floats the label on load, with nothing selected', async () => {
    // Regression: the field defaults to no filter and `displayEmpty` renders
    // the "All organizations" row at rest, but an outlined Select floats its
    // label only for a non-empty value — so the label sat on top of the field
    // content on first load. MUI marks a floated label with data-shrink.
    const { container } = await renderBar();

    const label = container.querySelector('#org-selector-label');
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute('data-shrink', 'true');
  });

  // NOT tested here: that the outline notch is actually cut.
  //
  // The component also passes `notched`, which is required — `shrink` alone
  // lifts the label onto an unbroken border. But MUI opens the notch through a
  // CSS rule, and jsdom renders byte-identical legend markup with and without
  // it, so any assertion would pass whether the prop is present or not. A test
  // that cannot fail is worse than none: it claims coverage it does not have.
  // Verify the notch visually, or in a real browser.

  it('shows the empty filter as a real choice, not a blank field', async () => {
    // Appears more than once — the Select renders the chosen row's content in
    // the field, and the same node exists in the (closed) menu.
    await renderBar();
    expect(screen.getAllByText('All organizations').length).toBeGreaterThan(0);
  });
});
