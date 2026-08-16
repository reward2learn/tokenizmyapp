import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';
import type { BillingInterval, Feature, PlanDef, PlanId } from '@/lib/billing/plans';

export interface Organization {
  id: string;
  slug: string;
  displayName: string;
  logoUrl: string | null;
  ownerUserId: string | null;
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'billing';
  createdAt: string;
}

export interface Subscription {
  id: string;
  orgId: string;
  planId: PlanId;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  interval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  anchorDate: string;
}

export interface CreditBalance {
  available: number;
  expiringSoon: number;
}

export interface CreditGrant {
  id: string;
  orgId: string;
  source: 'plan' | 'addon' | 'onetime' | 'promo';
  amount: number;
  remaining: number;
  grantedAt: string;
  expiresAt: string;
  planId: string | null;
  metadata: unknown;
}

export interface CreditLedgerEntry {
  id: string;
  orgId: string;
  grantId: string | null;
  delta: number;
  reason: string;
  refType: string | null;
  refId: string | null;
  createdAt: string;
  metadata: unknown;
}

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery,
  tagTypes: ['Organization', 'TenantOrg', 'Credits'],
  endpoints: (builder) => ({
    listOrganizations: builder.query<ApiEnvelope<{ organizations: Organization[] }>, void>({
      query: () => ({ url: 'admin/organizations' }),
      providesTags: ['Organization'],
    }),

    getOrganization: builder.query<
      ApiEnvelope<{
        organization: Organization;
        members: OrgMember[];
        subscription: Subscription;
        plan: PlanDef;
      }>,
      string
    >({
      query: (orgId) => ({ url: `admin/organizations/${orgId}` }),
      providesTags: ['Organization'],
    }),

    createOrganization: builder.mutation<
      ApiEnvelope<{ organization: Organization }>,
      { displayName: string; slug?: string; referredBy?: string }
    >({
      query: (body) => ({ url: 'admin/organizations', method: 'POST', body }),
      invalidatesTags: ['Organization'],
    }),

    updateOrganization: builder.mutation<
      ApiEnvelope<{ organization: Organization; subscription: Subscription; plan: PlanDef }>,
      {
        orgId: string;
        displayName?: string;
        slug?: string;
        logoUrl?: string | null;
        planId?: PlanId;
        interval?: BillingInterval;
      }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}`,
        method: 'PATCH',
        body,
      }),
      // Plan changes alter entitlements, so tenant-scoped reads go stale too.
      invalidatesTags: ['Organization', 'TenantOrg'],
    }),

    /** Owning org + resolved entitlements for a tenant. Drives paywall UI. */
    getTenantOrganization: builder.query<
      ApiEnvelope<{
        organization: Organization;
        subscription: Subscription;
        plan: PlanDef;
        features: Feature[];
      }>,
      string
    >({
      query: (tenantSlug) => ({ url: `admin/tenants/${tenantSlug}/organization` }),
      providesTags: ['TenantOrg'],
    }),

    assignTenantOrganization: builder.mutation<
      ApiEnvelope<{ tenantSlug: string; organization: Organization }>,
      { tenantSlug: string; orgId: string }
    >({
      query: ({ tenantSlug, orgId }) => ({
        url: `admin/tenants/${tenantSlug}/organization`,
        method: 'PUT',
        body: { orgId },
      }),
      invalidatesTags: ['Organization', 'TenantOrg'],
    }),

    getOrganizationCredits: builder.query<
      ApiEnvelope<{
        balance: CreditBalance;
        grants: CreditGrant[];
        ledger: CreditLedgerEntry[];
      }>,
      string
    >({
      query: (orgId) => ({ url: `admin/organizations/${orgId}/credits` }),
      providesTags: ['Credits'],
    }),

    grantOrganizationCredits: builder.mutation<
      ApiEnvelope<{ grant: CreditGrant; balance: CreditBalance }>,
      {
        orgId: string;
        source: 'addon' | 'promo' | 'onetime';
        amount: number;
        metadata?: Record<string, unknown>;
      }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/credits`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Credits'],
    }),
  }),
});

export const {
  useListOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useGetTenantOrganizationQuery,
  useAssignTenantOrganizationMutation,
  useGetOrganizationCreditsQuery,
  useGrantOrganizationCreditsMutation,
} = organizationApi;
