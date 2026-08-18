import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';
import { useOrgScopedTenants } from '@/lib/admin/use-org-scoped-tenants';
import { makeOrganization } from '@/test/org-fixture';
import { organizationApi } from '@/store/apis/organization-api';
import { uiSlice, setAdminSelectedOrg } from '@/store/ui-slice';

const ORGS = [
  makeOrganization({ id: 'org_alpha', slug: 'alpha', displayName: 'Alpha Group', tenants: [{ slug: 'acme', displayName: 'Acme' }] }),
  makeOrganization({ id: 'org_empty', slug: 'empty', displayName: 'Empty Holdings', tenants: [] }),
];

const TENANTS = [{ slug: 'acme' }, { slug: 'globex' }, { slug: 'initech' }];

/**
 * Seeds the organization query's cache directly rather than mocking fetch —
 * the hook's job is the filtering rule, not the transport.
 */
async function makeWrapper(selectedOrgId: string | null) {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      [organizationApi.reducerPath]: organizationApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(organizationApi.middleware),
  });

  // Awaited: upsertQueryData returns a thunk that settles asynchronously, and
  // rendering before it lands reads an empty cache — which looks exactly like
  // the "organization list has not resolved" branch and hides real failures.
  await store.dispatch(
    organizationApi.util.upsertQueryData('listOrganizations', undefined, {
      success: true,
      data: { organizations: ORGS, assigned: 0 },
    }),
  );
  if (selectedOrgId) store.dispatch(setAdminSelectedOrg(selectedOrgId));

  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useOrgScopedTenants', () => {
  it('returns every tenant when no organization is selected', async () => {
    const { result } = renderHook(() => useOrgScopedTenants(TENANTS), {
      wrapper: await makeWrapper(null),
    });
    expect(result.current.scoped).toHaveLength(3);
    expect(result.current.selectedOrgId).toBeNull();
    expect(result.current.isEmptyForOrg).toBe(false);
  });

  it("returns only the selected organization's tenants", async () => {
    const { result } = renderHook(() => useOrgScopedTenants(TENANTS), {
      wrapper: await makeWrapper('org_alpha'),
    });
    expect(result.current.scoped.map((t) => t.slug)).toEqual(['acme']);
    expect(result.current.selectedOrgName).toBe('Alpha Group');
  });

  it('flags an organization that owns nothing', async () => {
    // The distinction the empty states depend on: "this organization has no
    // apps" versus "the platform has no apps". Conflating them sends the
    // operator looking for a data problem that is not there.
    const { result } = renderHook(() => useOrgScopedTenants(TENANTS), {
      wrapper: await makeWrapper('org_empty'),
    });
    expect(result.current.scoped).toEqual([]);
    expect(result.current.isEmptyForOrg).toBe(true);
    expect(result.current.selectedOrgName).toBe('Empty Holdings');
  });

  it('does not flag an empty platform as an empty organization', async () => {
    const { result } = renderHook(() => useOrgScopedTenants([]), {
      wrapper: await makeWrapper(null),
    });
    expect(result.current.isEmptyForOrg).toBe(false);
  });

  it('gives both consumers the same answer for the same inputs', async () => {
    // The reason this is a shared hook. The Tenants selector and the Tenant
    // Applications list render the same set; two copies of the rule would
    // drift and the page would contradict itself.
    const wrapper = await makeWrapper('org_alpha');
    const a = renderHook(() => useOrgScopedTenants(TENANTS), { wrapper });
    const b = renderHook(() => useOrgScopedTenants(TENANTS), { wrapper });
    expect(a.result.current.scoped).toEqual(b.result.current.scoped);
  });
});
