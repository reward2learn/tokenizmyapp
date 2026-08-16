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

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery,
  tagTypes: ['Organization', 'TenantOrg'],
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
  }),
});

export const {
  useListOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useGetTenantOrganizationQuery,
  useAssignTenantOrganizationMutation,
} = organizationApi;
