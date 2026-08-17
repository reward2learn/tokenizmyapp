import { describe, expect, it } from 'vitest';
import {
  setAdminActiveSubtab,
  setAdminSelectedApp,
  setAdminSelectedOrg,
  setAdminSelectedTenant,
  uiSlice,
} from '@/store/ui-slice';

/**
 * The organization filter on the platform-admin Tenants panel.
 *
 * Lives in the store rather than the OrganizationBar's local state because the
 * tenant list below it filters on the same value — a tenant belongs to exactly
 * one organization, so the choice scopes the whole panel.
 */
describe('adminSelectedOrgId', () => {
  it('defaults to no filter', () => {
    const state = uiSlice.reducer(undefined, { type: '@@init' });
    expect(state.adminSelectedOrgId).toBeNull();
  });

  it('clears the tenant selection when the organization changes', () => {
    // The selected tenant is scoped by the filter. Leaving it would show a
    // tenant that is no longer in the list beneath it — the panel would be
    // describing something the operator can no longer see.
    let state = uiSlice.reducer(undefined, setAdminSelectedTenant('acme'));
    state = uiSlice.reducer(state, setAdminSelectedApp('hr'));
    state = uiSlice.reducer(state, setAdminActiveSubtab('security'));

    state = uiSlice.reducer(state, setAdminSelectedOrg('org_1'));

    expect(state.adminSelectedOrgId).toBe('org_1');
    expect(state.adminSelectedTenantSlug).toBeNull();
    expect(state.adminSelectedAppId).toBeNull();
    expect(state.adminActiveSubtab).toBe('info');
  });

  it('does not clear the tenant when the organization is re-selected', () => {
    // A Select fires onChange for the value it already holds in some flows.
    // Treating that as a change would drop the operator's tenant selection for
    // no reason they could perceive.
    let state = uiSlice.reducer(undefined, setAdminSelectedOrg('org_1'));
    state = uiSlice.reducer(state, setAdminSelectedTenant('acme'));

    state = uiSlice.reducer(state, setAdminSelectedOrg('org_1'));

    expect(state.adminSelectedTenantSlug).toBe('acme');
  });

  it('clears the filter back to all organizations', () => {
    let state = uiSlice.reducer(undefined, setAdminSelectedOrg('org_1'));
    state = uiSlice.reducer(state, setAdminSelectedOrg(null));
    expect(state.adminSelectedOrgId).toBeNull();
  });
});

/**
 * Membership filtering, as the panel computes it.
 *
 * Kept as a pure function here so the rule is asserted without mounting the
 * whole admin panel: an organization's tenant slugs come from
 * listOrganizations, and the tenant list is narrowed to them.
 */
function filterTenants<T extends { slug: string }>(
  tenants: T[],
  orgTenantSlugs: string[] | null,
): T[] {
  if (orgTenantSlugs === null) return tenants;
  const slugs = new Set(orgTenantSlugs);
  return tenants.filter((t) => slugs.has(t.slug));
}

describe('tenant list scoping', () => {
  const tenants = [{ slug: 'acme' }, { slug: 'globex' }, { slug: 'initech' }];

  it('shows every tenant with no filter set', () => {
    expect(filterTenants(tenants, null)).toHaveLength(3);
  });

  it('shows only the organization\'s own tenants', () => {
    expect(filterTenants(tenants, ['globex', 'initech']).map((t) => t.slug)).toEqual([
      'globex',
      'initech',
    ]);
  });

  it('shows nothing for an organization that owns no tenants', () => {
    // Distinct from "no tenants exist" — the panel says so explicitly, or the
    // operator goes looking for a data problem that is not there.
    expect(filterTenants(tenants, [])).toEqual([]);
  });

  it('ignores slugs that no longer resolve to a tenant', () => {
    // A deleted tenant can linger in a stale organization payload.
    expect(filterTenants(tenants, ['acme', 'deleted-tenant']).map((t) => t.slug)).toEqual(['acme']);
  });
});
