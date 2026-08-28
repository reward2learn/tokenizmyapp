import { describe, expect, it } from 'vitest';
import type { Organization } from '@/store/apis/organization-api';
import { findOrganizationIdForTenant } from './find-organization-for-tenant';

const organizations: Organization[] = [
  {
    id: 'org_alpha',
    slug: 'alpha',
    displayName: 'Alpha Group',
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tenants: [{ slug: 'acme', displayName: 'Acme' }],
  },
  {
    id: 'org_beta',
    slug: 'beta',
    displayName: 'Beta Holdings',
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tenants: [{ slug: 'globex', displayName: 'Globex' }],
  },
];

describe('findOrganizationIdForTenant', () => {
  it('returns the owning organization id', () => {
    expect(findOrganizationIdForTenant('acme', organizations)).toBe('org_alpha');
    expect(findOrganizationIdForTenant('globex', organizations)).toBe('org_beta');
  });

  it('returns null when the tenant is not assigned', () => {
    expect(findOrganizationIdForTenant('missing', organizations)).toBeNull();
  });
});
