import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';
import type { BillingInterval, Feature, PlanDef, PlanId } from '@/lib/billing/plans';
import { consumeSseStream } from '@/lib/chat/sse-parser';

export interface ResourceUsage {
  resource: string;
  label: string;
  unit: string;
  included: number | null;
  used: number;
  additional: number;
  additionalCostCents: number;
  state: 'metered' | 'not_collected';
}

export interface CloudUsageReport {
  resources: ResourceUsage[];
  periodStart: string;
  periodEnd: string;
  awaitingCollector: boolean;
  balanceCents: number;
  includedCostCents: number;
  usedCostCents: number;
  additionalCostCents: number;
  autoTopUpThreshold: number | null;
  autoTopUpAmount: number | null;
}

export interface StoredPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface Organization {
  id: string;
  slug: string;
  displayName: string;
  logoUrl: string | null;
  ownerUserId: string | null;
  referredBy: string | null;
  billingEmail: string | null;
  billingName: string | null;
  billingCountry: string | null;
  billingLine1: string | null;
  billingLine2: string | null;
  billingCity: string | null;
  billingPostal: string | null;
  /** Printed on invoices. Not a tax-calculation input — Stripe Tax is off. */
  taxId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Tenants this organization pays for. Returned by the list endpoint. */
  tenants?: { slug: string; displayName: string }[];
}

export type OrgMemberRole = 'owner' | 'admin' | 'member' | 'billing';

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgMemberRole;
  createdAt: string;
}

/** Tenant app user eligible to be added as an org teammate. */
export interface OrgMemberCandidate {
  sub: string;
  email: string | null;
  name: string | null;
  tenantSlug: string;
  tier: string;
  alreadyMember: boolean;
}

export interface OrgTenantRef {
  slug: string;
  displayName: string;
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
  /** Org-shared pool (plan). Present for self-serve scoped reads. */
  shared?: number;
  /** Viewer-owned pool (self-serve top-ups). Present for self-serve scoped reads. */
  personal?: number;
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
  ownerUserId?: string | null;
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

export interface CreditAdminAnalytics {
  users: Array<{
    userId: string | null;
    sharedPool: boolean;
    email: string | null;
    name: string | null;
    purchasedRemaining: number;
    bonusRemaining: number;
    purchasedGranted: number;
    bonusGranted: number;
    spent: number;
  }>;
  byModel: Array<{
    model: string;
    provider: string;
    credits: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    runs: number;
  }>;
  byProvider: Array<{
    provider: string;
    credits: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    runs: number;
  }>;
}

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery,
  tagTypes: [
    'Organization',
    'TenantOrg',
    'Credits',
    'Subscription',
    'PaymentMethods',
    'CloudUsage',
    'OrgRateCard',
    'AiCreditsCalculator',
    'BillingCatalog',
  ],
  endpoints: (builder) => ({
    listOrganizations: builder.query<
      // `assigned` reports how many tenants the read's backfill just repaired.
      ApiEnvelope<{ organizations: Organization[]; assigned: number }>,
      void
    >({
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
        billingEmail?: string | null;
        billingName?: string | null;
        billingCountry?: string | null;
        billingLine1?: string | null;
        billingLine2?: string | null;
        billingCity?: string | null;
        billingPostal?: string | null;
        taxId?: string | null;
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

    /** Delete an organization and reassign its tenants to the default org. */
    deleteOrganization: builder.mutation<
      ApiEnvelope<{ success: boolean; tenantsReassigned: number }>,
      { orgId: string }
    >({
      query: ({ orgId }) => ({
        url: `admin/organizations/${orgId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization'],
    }),

    /**
     * Add or re-role a teammate. Reads come from `getOrganization`, which
     * already returns members — hence the Organization invalidation here
     * rather than a tag of its own.
     */
    addOrgMember: builder.mutation<
      ApiEnvelope<{ members: OrgMember[] }>,
      { orgId: string; userId: string; role?: OrgMemberRole }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),

    /**
     * Tenant users already set up for this org's apps — powers the Teammates
     * picker so admins never need to paste opaque Account ids.
     */
    listOrgMemberCandidates: builder.query<
      ApiEnvelope<{ tenants: OrgTenantRef[]; candidates: OrgMemberCandidate[] }>,
      string
    >({
      query: (orgId) => `admin/organizations/${orgId}/member-candidates`,
      providesTags: ['Organization'],
    }),

    /**
     * Invite by email: provision PIN-tier viewer on a tenant and email the PIN.
     * Does not grant an organization billing seat.
     */
    inviteOrgTeammate: builder.mutation<
      ApiEnvelope<{
        sub: string;
        tenantSlug: string;
        emailSent: boolean;
        createdUser: boolean;
        warning?: string;
      }>,
      {
        orgId: string;
        email: string;
        tenantSlug: string;
        name?: string | null;
        appBaseUrl?: string | null;
      }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/invites`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),

    /** Cards on file. `readiness` rides along so the UI can explain an empty list. */
    listPaymentMethods: builder.query<
      ApiEnvelope<{ methods: StoredPaymentMethod[]; readiness: { hasSecretKey: boolean } }>,
      string
    >({
      query: (orgId) => `admin/organizations/${orgId}/payment-methods`,
      providesTags: ['PaymentMethods'],
    }),

    /** Start attaching a card. Returns a SetupIntent secret — no charge. */
    createSetupIntent: builder.mutation<
      ApiEnvelope<{ clientSecret: string; publishableKey: string | null }>,
      string
    >({
      query: (orgId) => ({
        url: `admin/organizations/${orgId}/payment-methods`,
        method: 'POST',
      }),
    }),

    setDefaultPaymentMethod: builder.mutation<
      ApiEnvelope<{ methods: StoredPaymentMethod[] }>,
      { orgId: string; paymentMethodId: string }
    >({
      query: ({ orgId, paymentMethodId }) => ({
        url: `admin/organizations/${orgId}/payment-methods`,
        method: 'PATCH',
        body: { paymentMethodId },
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    removePaymentMethod: builder.mutation<
      ApiEnvelope<{ methods: StoredPaymentMethod[] }>,
      { orgId: string; paymentMethodId: string }
    >({
      query: ({ orgId, paymentMethodId }) => ({
        url: `admin/organizations/${orgId}/payment-methods?paymentMethodId=${encodeURIComponent(paymentMethodId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    /** Run-time consumption per resource. `state` says which are actually metered. */
    getCloudUsage: builder.query<ApiEnvelope<CloudUsageReport>, string>({
      query: (orgId) => `admin/organizations/${orgId}/cloud-usage`,
      providesTags: ['CloudUsage'],
    }),

    updateCloudAutoTopUp: builder.mutation<
      ApiEnvelope<{
        orgId: string;
        balanceCents: number;
        autoTopUpThreshold: number | null;
        autoTopUpAmount: number | null;
      }>,
      {
        orgId: string;
        autoTopUpThreshold: number | null;
        autoTopUpAmount: number | null;
      }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/cloud-usage`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CloudUsage'],
    }),

    createCloudTopUpIntent: builder.mutation<
      ApiEnvelope<{
        clientSecret: string;
        checkoutSessionId: string;
        amountCents: number;
        publishableKey: string | null;
      }>,
      { orgId: string; amountCents: number }
    >({
      query: ({ orgId, amountCents }) => ({
        url: `admin/organizations/${orgId}/cloud-topup`,
        method: 'POST',
        body: { amountCents },
      }),
    }),

    confirmCloudTopUpPayment: builder.mutation<
      ApiEnvelope<{
        orgId: string;
        checkoutSessionId: string;
        paymentIntentId: string | null;
        amountCents: number;
        alreadyCredited: boolean;
        balanceCents: number;
      }>,
      { orgId: string; checkoutSessionId: string }
    >({
      query: ({ orgId, checkoutSessionId }) => ({
        url: `admin/organizations/${orgId}/cloud-topup/confirm`,
        method: 'POST',
        body: { checkoutSessionId },
      }),
      invalidatesTags: ['CloudUsage'],
    }),

    /** Owning org + resolved entitlements for a tenant. Drives paywall UI. */
    getTenantOrganization: builder.query<
      ApiEnvelope<{
        organization: Organization;
        subscription: Subscription;
        plan: PlanDef;
        features: Feature[];
        selfServeBilling?: { enabled: boolean };
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
        paymentsReady?: boolean;
        analytics?: CreditAdminAnalytics;
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
        /**
         * The subscription as of the server's reconcile against Stripe, which
         * runs on this GET. Newer than the copy the organization query returns,
         * so the Plan tab reads this one — see the route's GET doc comment.
         */
        subscription: Subscription;
        /** Why a reconcile declined to change anything, when that is worth showing. */
        reconcileNote: string | null;
        /**
         * Plans whose advertised price disagrees with the Stripe price that
         * would be charged. Each is also absent from `purchasable`, so the
         * panel greys the plan out as well as explaining why.
         */
        priceMismatches: string[];
        /** Tenant publishable key for Stripe.js embedded Checkout. */
        publishableKey: string | null;
      }>,
      string
    >({
      query: (orgId) => ({ url: `admin/organizations/${orgId}/checkout` }),
      providesTags: ['Subscription'],
    }),

    getBillingLockStatus: builder.query<
      ApiEnvelope<{
        locked: boolean;
        countdown: string | null;
        attemptCount: number;
        noticeCount: number;
        canUnlock: boolean;
        unlockUserId: string | null;
        defaultPmDisabled: boolean;
      }>,
      string
    >({
      query: (orgId) => ({ url: `billing/lock-status?orgId=${encodeURIComponent(orgId)}` }),
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
        | {
            mode: 'embedded_checkout';
            clientSecret: string;
            sessionId: string;
            publishableKey: string;
          }
        | { mode: 'plan_change'; applied: 'immediate' | 'scheduled'; planId: string; interval: string }
      >,
      { orgId: string; planId: string; interval: 'monthly' | 'yearly'; embedded?: boolean }
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

    /** Create a Checkout Session for a paid top-up. Credits arrive via webhook + confirm. */
    createTopUpIntent: builder.mutation<
      ApiEnvelope<{
        clientSecret: string;
        checkoutSessionId: string;
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
    }),

    /** Apply credits after Checkout Elements confirm succeeds (idempotent). */
    confirmTopUpPayment: builder.mutation<
      ApiEnvelope<{
        orgId: string;
        packId: string;
        checkoutSessionId: string;
        paymentIntentId: string | null;
        alreadyGranted: boolean;
        balance: { available: number; expiringSoon: number; debt: number; net: number };
        baseCredits: number;
        bonusCredits: number;
      }>,
      { orgId: string; checkoutSessionId: string }
    >({
      query: ({ orgId, checkoutSessionId }) => ({
        url: `admin/organizations/${orgId}/topup/confirm`,
        method: 'POST',
        body: { checkoutSessionId },
      }),
      invalidatesTags: ['Credits'],
    }),

    createAgenticTopUp: builder.mutation<
      ApiEnvelope<{
        checkoutUrl: string;
        sessionId: string;
        sku: string;
        pack: { id: string; label: string; baseCredits: number; bonusCredits: number };
      }>,
      { orgId: string; packId: string; successUrl?: string; cancelUrl?: string }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/agentic-topup`,
        method: 'POST',
        body,
      }),
    }),

    getOrgRateCard: builder.query<
      ApiEnvelope<{
        inputs: {
          appCount: number;
          userCount: number;
          annualRevenueUsd: number;
          macStudioCostUsd: number;
          monthlyThirdPartyUsd: number;
        };
        markupPercent: number;
        creditsPerUsd: number;
        planCredits: Record<string, number>;
        packCredits: Record<string, number>;
        manualMarkupPercent: number | null;
        persisted?: boolean;
      }>,
      string
    >({
      query: (orgId) => ({ url: `admin/organizations/${orgId}/rate-card` }),
      providesTags: (_r, _e, orgId) => [{ type: 'OrgRateCard', id: orgId }],
    }),

    upsertOrgRateCard: builder.mutation<
      ApiEnvelope<Record<string, unknown>>,
      {
        orgId: string;
        inputs?: Partial<{
          appCount: number;
          userCount: number;
          annualRevenueUsd: number;
          macStudioCostUsd: number;
          monthlyThirdPartyUsd: number;
        }>;
        manualMarkupPercent?: number | null;
        recalculate?: boolean;
      }
    >({
      query: ({ orgId, ...body }) => ({
        url: `admin/organizations/${orgId}/rate-card`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { orgId }) => [
        { type: 'OrgRateCard', id: orgId },
        'Credits',
      ],
    }),

    analyzeAiCreditsCalculator: builder.mutation<
      ApiEnvelope<Record<string, unknown>>,
      {
        websiteUrl?: string | null;
        secCikOrTicker?: string | null;
        companiesHouseNumber?: string | null;
        orgId?: string | null;
        tenantSlug?: string | null;
        adminAnnualRevenueUsd?: number | null;
        inputsOverride?: Record<string, number>;
      }
    >({
      query: (body) => ({
        url: 'admin/ai-credits-calculator/analyze',
        method: 'POST',
        body,
      }),
    }),

    listCalculatorThreads: builder.query<
      ApiEnvelope<{ threads: Array<{ id: string; title: string; updatedAt: string }> }>,
      void
    >({
      query: () => ({ url: 'admin/ai-credits-calculator/threads' }),
      providesTags: ['AiCreditsCalculator'],
    }),

    createCalculatorThread: builder.mutation<
      ApiEnvelope<{ thread: { id: string; title: string } }>,
      { title?: string; orgId?: string | null; tenantSlug?: string | null }
    >({
      query: (body) => ({
        url: 'admin/ai-credits-calculator/threads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AiCreditsCalculator'],
    }),

    getCalculatorThread: builder.query<
      ApiEnvelope<{
        thread: { id: string; title: string };
        messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
      }>,
      string
    >({
      query: (id) => ({ url: `admin/ai-credits-calculator/threads/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'AiCreditsCalculator', id }],
    }),

    sendCalculatorChatMessage: builder.mutation<
      ApiEnvelope<{
        assistantMessage: { id: string; content: string };
        toolResults: unknown[];
      }>,
      {
        threadId: string;
        message: string;
        draftInputs?: Record<string, number>;
        websiteUrl?: string | null;
        secCikOrTicker?: string | null;
        companiesHouseNumber?: string | null;
        /** Called for each SSE token while streaming (kept out of the wire body). */
        onToken?: (token: string) => void;
        /** Called for each SSE tool_result event (kept out of the wire body). */
        onToolResult?: (tool: string) => void;
      }
    >({
      /**
       * Prefer SSE (`Accept: text/event-stream`); fall back to JSON.
       * Uses queryFn so streaming callbacks stay in the store layer (enforce-redux).
       */
      queryFn: async (arg) => {
        const { threadId, onToken, onToolResult, ...body } = arg;
        try {
          const response = await fetch(
            `/api/admin/ai-credits-calculator/threads/${threadId}/messages`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
              },
              body: JSON.stringify(body),
            },
          );

          if (!response.ok) {
            const errJson = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            return {
              error: {
                status: response.status,
                data: { error: errJson?.error ?? `Chat failed (${response.status})` },
              },
            };
          }

          const contentType = response.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            const payload = (await response.json()) as ApiEnvelope<{
              assistantMessage: { id: string; content: string };
              toolResults: unknown[];
            }>;
            if (payload.error || !payload.success) {
              return {
                error: {
                  status: response.status,
                  data: { error: payload.error ?? 'Chat failed' },
                },
              };
            }
            const content = payload.data?.assistantMessage?.content ?? '';
            if (content) onToken?.(content);
            return { data: payload };
          }

          if (!response.body) {
            return {
              error: { status: 500, data: { error: 'Streaming response body was empty' } },
            };
          }

          let streamed = '';
          let streamError: string | null = null;
          const toolResults: unknown[] = [];

          await consumeSseStream(response.body, (event) => {
            if (event.type === 'token') {
              streamed += event.token;
              onToken?.(event.token);
              return;
            }
            if (event.type === 'tool_result') {
              toolResults.push(event.tool);
              onToolResult?.(event.tool);
              return;
            }
            if (event.type === 'error') {
              streamError = event.error;
            }
          });

          if (streamError) {
            return {
              error: { status: 500, data: { error: streamError } },
            };
          }

          return {
            data: {
              success: true,
              data: {
                assistantMessage: { id: `stream-${Date.now()}`, content: streamed },
                toolResults,
              },
            },
          };
        } catch (err) {
          return {
            error: {
              status: 500,
              data: { error: err instanceof Error ? err.message : 'Chat failed' },
            },
          };
        }
      },
      invalidatesTags: (_r, _e, { threadId }) => [{ type: 'AiCreditsCalculator', id: threadId }],
    }),

    getBillingCatalog: builder.query<
      ApiEnvelope<{
        catalog: {
          plans: Record<string, { monthlyCents: number; yearlyCents: number }>;
          packs: Record<string, number>;
        };
        stripePriceIds: Record<string, string>;
        stripeDrift: string[];
        hasOverrides: boolean;
      }>,
      void
    >({
      query: () => ({ url: 'admin/billing/catalog-prices' }),
      providesTags: ['BillingCatalog'],
    }),

    updateCatalogPrices: builder.mutation<
      ApiEnvelope<Record<string, unknown>>,
      {
        confirm: true;
        plans?: Record<string, { monthlyCents: number; yearlyCents: number }>;
        packs?: Record<string, number>;
        notes?: string | null;
      }
    >({
      query: (body) => ({
        url: 'admin/billing/catalog-prices',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['BillingCatalog'],
    }),

    syncStripeCatalogPrices: builder.mutation<
      ApiEnvelope<{
        message: string;
        created: string[];
        dryRun: boolean;
        vercelEnv?: { ok: boolean; pushed: string[]; skippedReason?: string };
      }>,
      { confirm: true; dryRun?: boolean }
    >({
      query: (body) => ({
        url: 'admin/billing/catalog-prices/sync-stripe',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BillingCatalog'],
    }),

    seedTenantAiCredits: builder.mutation<
      ApiEnvelope<{
        message: string;
        tenantSlug: string;
        orgId: string;
        scopedAppId: string | null;
        apps: Array<{ appId: string; name: string; vercelProjectId: string | null }>;
        planCredits: Record<string, number>;
        packCredits: Record<string, number>;
        planAllowance: {
          action: string;
          targetCredits: number;
          delta: number;
          planId: string;
          grantId: string | null;
        };
        billingIdentity: {
          orgId: string | null;
          appsTouched: number;
          envVarsPushed: number;
          skippedNoProject: string[];
          errors: string[];
        };
      }>,
      { slug: string; confirm: true; appId?: string | null }
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/tenants/${slug}/seed-ai-credits`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OrgRateCard', 'Credits', 'TenantOrg', 'Subscription'],
    }),

    pushTenantSecUserAgent: builder.mutation<
      ApiEnvelope<{
        message: string;
        tenantSlug: string;
        secUserAgent: string;
        organizationName: string;
        updated: Array<{
          projectId: string;
          appId: string | null;
          ok: boolean;
          error?: string;
        }>;
        skippedNoProject: string[];
        errors: string[];
      }>,
      { slug: string; confirm: true; organizationName?: string | null }
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/tenants/${slug}/sec-user-agent`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useListOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useAddOrgMemberMutation,
  useListOrgMemberCandidatesQuery,
  useInviteOrgTeammateMutation,
  useGetCloudUsageQuery,
  useUpdateCloudAutoTopUpMutation,
  useCreateCloudTopUpIntentMutation,
  useConfirmCloudTopUpPaymentMutation,
  useListPaymentMethodsQuery,
  useCreateSetupIntentMutation,
  useSetDefaultPaymentMethodMutation,
  useRemovePaymentMethodMutation,
  useGetTenantOrganizationQuery,
  useAssignTenantOrganizationMutation,
  useGetOrganizationCreditsQuery,
  useGrantOrganizationCreditsMutation,
  useGetBillingCheckoutQuery,
  useGetBillingLockStatusQuery,
  useGetOrganizationInvoicesQuery,
  useStartCheckoutMutation,
  useCreateTopUpIntentMutation,
  useConfirmTopUpPaymentMutation,
  useCreateAgenticTopUpMutation,
  useGetOrgRateCardQuery,
  useUpsertOrgRateCardMutation,
  useAnalyzeAiCreditsCalculatorMutation,
  useListCalculatorThreadsQuery,
  useCreateCalculatorThreadMutation,
  useGetCalculatorThreadQuery,
  useSendCalculatorChatMessageMutation,
  useGetBillingCatalogQuery,
  useUpdateCatalogPricesMutation,
  useSyncStripeCatalogPricesMutation,
  useSeedTenantAiCreditsMutation,
  usePushTenantSecUserAgentMutation,
} = organizationApi;
