import type { Organization } from '@/store/apis/organization-api';

/**
 * A complete Organization for tests, overridable field by field.
 *
 * Exists because inline fixtures break every time the type gains a field —
 * adding the billing-details columns invalidated two unrelated test files that
 * cared about nothing but the tenant list. A factory keeps the churn in one
 * place and keeps each test naming only the fields it actually asserts on.
 */
export function makeOrganization(over: Partial<Organization> = {}): Organization {
  return {
    id: 'org_test',
    slug: 'test',
    displayName: 'Test Organization',
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
    createdAt: '',
    updatedAt: '',
    tenants: [],
    ...over,
  };
}
