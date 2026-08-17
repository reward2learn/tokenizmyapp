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
  /** Spendable credits. Never negative. */
  available: number;
  /** The subset of `available` expiring within 7 days. */
  expiringSoon: number;
  /**
   * Credits consumed beyond the balance and not yet settled.
   *
   * A generation that runs past its balance completes and records the overage
   * as debt rather than being cut off mid-run; the NEXT generation is blocked
   * until it is cleared. Any new grant settles it automatically.
   */
  debt: number;
  /** `available - debt`. Negative means the org is in arrears. */
  net: number;
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
  tagTypes: ['Organization', 'TenantOrg', 'Credits', 'Subscription'],
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

    /**
     * Add credits to an organization.
     *
     * Redeeming a pack (`packId`) is not the same call as a manual grant
     * (`source` + `amount`): the server splits a pack into a purchased `addon`
     * grant and a separate `promo` grant for the bonus, so promotional
     * generosity stays measurable and separately reversible. Sending the
     * combined total as one `addon` would silently destroy that split.
     */
    grantOrganizationCredits: builder.mutation<
      ApiEnvelope<{
        grant: CreditGrant;
        bonusGrant?: CreditGrant | null;
        balance: CreditBalance;
      }>,
      { orgId: string } & (
        | { packId: string; paymentRef?: string }
        | {
            source: 'addon' | 'promo' | 'onetime';
            amount: number;
            metadata?: Record<string, unknown>;
          }
      )
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/credits`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Credits'],
    }),

    /** Stripe readiness plus the plan × interval combinations this deploy can sell. */
    getBillingCheckout: builder.query<
      ApiEnvelope<{
        readiness: {
          ready: boolean;
          hasSecretKey: boolean;
          hasWebhookSecret: boolean;
          hasPublishableKey: boolean;
          configuredPrices: number;
          liveMode: boolean;
          configError: string | null;
        };
        purchasable: Array<{ planId: string; interval: 'monthly' | 'yearly' }>;
        linkage: {
          customerId: string | null;
          subscriptionId: string | null;
          priceId: string | null;
          gracePeriodEndsAt: string | null;
          pendingPlanId: string | null;
        };
      }>,
      string
    >({
      query: (orgId) => ({ url: `admin/organizations/${orgId}/checkout` }),
      providesTags: ['Subscription'],
    }),

    /**
     * Start a paid plan change.
     *
     * Returns either a hosted Checkout URL (no subscription yet) or the result
     * of an in-place change. The caller must handle both — an existing
     * subscription MUST be modified rather than re-checked-out, or the customer
     * ends up with two subscriptions and two charges.
     */
    startCheckout: builder.mutation<
      ApiEnvelope<
        | { mode: 'checkout'; url: string; sessionId: string }
        | { mode: 'plan_change'; applied: 'immediate' | 'scheduled'; planId: string; interval: string }
      >,
      { orgId: string; planId: string; interval: 'monthly' | 'yearly' }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/checkout`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),

    /** Invoice history, read live from Stripe. */
    getOrganizationInvoices: builder.query<
      ApiEnvelope<{
        stripeConfigured: boolean;
        invoices: Array<{
          id: string;
          number: string | null;
          status: string | null;
          amountDue: number;
          amountPaid: number;
          currency: string;
          created: string;
          periodStart: string;
          periodEnd: string;
          hostedInvoiceUrl: string | null;
          invoicePdf: string | null;
        }>;
      }>,
      string
    >({
      query: (orgId) => ({ url: `admin/organizations/${orgId}/invoices` }),
      providesTags: ['Subscription'],
    }),

    /** Create a PaymentIntent for a paid top-up. Credits arrive via webhook. */
    createTopUpIntent: builder.mutation<
      ApiEnvelope<{
        clientSecret: string;
        paymentIntentId: string;
        amountCents: number;
        publishableKey: string | null;
        pack: { id: string; label: string; baseCredits: number; bonusCredits: number };
      }>,
      { orgId: string; packId: string }
    >({
      query: ({ orgId, packId }) => ({
        url: `admin/organizations/${orgId}/topup`,
        method: 'POST',
        body: { packId },
      }),
      // Credits land asynchronously when payment_intent.succeeded arrives, so
      // this does NOT invalidate Credits — the balance is refetched after the
      // client confirms payment instead.
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
  useGetBillingCheckoutQuery,
  useGetOrganizationInvoicesQuery,
  useStartCheckoutMutation,
  useCreateTopUpIntentMutation,
} = organizationApi;
