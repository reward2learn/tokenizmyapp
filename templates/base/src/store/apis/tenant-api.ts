import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';

export interface TenantEntry {
  id: string;
  slug: string;
  displayName: string;
  template: string;
  status: 'draft' | 'deploying' | 'live' | 'error';
  vercelProjectId: string | null;
  appUrl: string | null;
  dbUrl: string | null;
  apiKey: string | null;
  primaryColor: string;
  secondaryColor: string;
  faviconData: string | null;
  faviconMimeType: string | null;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantUserView {
  id: string;
  sub: string;
  email: string | null;
  name: string | null;
  tier: string;
  roleCode: string | null;
  isActive: boolean;
  groups: string[];
  permissions: string[];
  lastSeenAt: string | null;
  createdAt: string;
  tenantSlug: string;
}

export interface DeployStatusResponse {
  state: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'NOT_FOUND' | 'NO_DEPLOYMENTS';
  slug?: string;
  projectId?: string;
  appUrl?: string;
  note?: string;
  createdAt?: number;
  readyAt?: number;
}

export interface GoogleOAuthProvisionResult {
  clientId: string;
  clientSecret?: string;
  projectId?: string;
  clientSecretJson?: string;
  strategy?: string;
  success?: boolean;
}

export interface NeonProvisionResult {
  success: boolean;
  slug?: string;
  branchId?: string;
  databaseName?: string;
  databaseUrl?: string;
  pooledUrl?: string;
  directUrl?: string;
  formatted?: string;
  envVars?: Record<string, string>;
  connectionStrings?: Record<string, string>;
  message?: string;
}

export interface RenameTenantResult {
  success: boolean;
  tenant: { slug: string };
  previousSlug?: string;
  newSlug?: string;
}

export interface AiFindingsResult {
  findings: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    details?: Record<string, unknown>;
  }>;
}

export interface ScrapeTenantResult {
  scraped: {
    businessName?: string;
    description?: string;
    logoBase64?: string | null;
    brandColors?: { primary: string | null; secondary: string | null; allColors: string[] };
    images?: Array<{ url: string; alt: string }>;
    socialLinks?: Record<string, string>;
    address?: string | null;
    emails?: string[];
    phoneNumbers?: string[];
    textContent?: string;
  };
  recommendedTemplate?: string;
  generatedPrompt?: string;
}

export const tenantApi = createApi({
  reducerPath: 'tenantApi',
  baseQuery,
  tagTypes: ['Tenants', 'TenantUsers', 'AiFindings'],
  endpoints: (builder) => ({
    listTenants: builder.query<ApiEnvelope<{ tenants: TenantEntry[] }>, { status?: string } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && 'status' in params && params.status) searchParams.set('status', params.status);
        const qs = searchParams.toString();
        return qs ? `admin/tenants?${qs}` : 'admin/tenants';
      },
      providesTags: ['Tenants'],
    }),

    getTenant: builder.query<ApiEnvelope<{ tenant: TenantEntry }>, string>({
      query: (slug) => `admin/tenants/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Tenants', id: slug }],
    }),

    createTenant: builder.mutation<ApiEnvelope<{ tenant: TenantEntry }>, {
      slug: string;
      displayName: string;
      template?: string;
      primaryColor?: string;
      secondaryColor?: string;
      metadata?: Record<string, unknown>;
      prompt?: string;
    }>({
      query: (body) => ({
        url: 'admin/tenants',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tenants'],
    }),

    updateTenant: builder.mutation<ApiEnvelope<{ tenant: TenantEntry }>, {
      slug: string;
      displayName?: string;
      template?: string;
      status?: 'draft' | 'deploying' | 'live' | 'error';
      primaryColor?: string;
      secondaryColor?: string;
      appUrl?: string | null;
      vercelProjectId?: string | null;
      dbUrl?: string | null;
      apiKey?: string | null;
      metadata?: Record<string, unknown>;
    }>({
      query: ({ slug, ...body }) => ({
        url: `admin/tenants/${slug}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [{ type: 'Tenants', id: slug }],
    }),

    deleteTenant: builder.mutation<ApiEnvelope<{ deleted: boolean }>, string>({
      query: (slug) => ({
        url: `admin/tenants/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenants'],
    }),

    // ── Tenant-scoped Users ─────────────────────────

    listTenantUsers: builder.query<ApiEnvelope<{ users: TenantUserView[] }>, string>({
      query: (slug) => `admin/tenants/${slug}/users`,
      providesTags: (_result, _error, slug) => [{ type: 'TenantUsers', id: slug }],
    }),

    upsertTenantUser: builder.mutation<
      ApiEnvelope<{ id: string; created: boolean }>,
      {
        slug: string;
        sub: string;
        email?: string | null;
        name?: string | null;
        tier?: string;
        roleCode?: string | null;
        groupCodes?: string[];
        pin?: string;
        isActive?: boolean;
      }
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/tenants/${slug}/users`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [{ type: 'TenantUsers', id: slug }],
    }),

    deleteTenantUser: builder.mutation<ApiEnvelope<{ id: string; deleted: boolean }>, { slug: string; id: string }>({
      query: ({ slug, id }) => ({
        url: `admin/tenants/${slug}/users?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { slug }) => [{ type: 'TenantUsers', id: slug }],
    }),

    // ── Tenant Seed & Migrate ──────────────────────────

    seedTenant: builder.mutation<ApiEnvelope<{ seeded: boolean; pages?: number; navItems?: number; groups?: number; settings?: boolean }>, string>({
      query: (slug) => ({
        url: `admin/tenants/${slug}/seed`,
        method: 'POST',
      }),
      invalidatesTags: ['Tenants'],
    }),

    migrateTenant: builder.mutation<ApiEnvelope<{ migrated: boolean; results?: Record<string, string> }>, string>({
      query: (slug) => ({
        url: `admin/tenants/${slug}/migrate`,
        method: 'POST',
      }),
      invalidatesTags: ['Tenants'],
    }),

    deployTenant: builder.mutation<
      ApiEnvelope<{ deployed: boolean; projectId: string; appUrl: string; envCount: number }>,
      { slug: string; payload?: Record<string, unknown> }
    >({
      query: ({ slug, payload }) => ({
        url: `admin/tenants/${slug}/deploy`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Tenants'],
    }),

    /** GET /api/admin/tenants/[slug]/deploy/status — returns latest Vercel
     *  production deployment state. Supports pollingInterval when in-flight. */
    getDeployStatus: builder.query<ApiEnvelope<DeployStatusResponse>, string>({
      query: (slug) => `admin/tenants/${slug}/deploy/status`,
      providesTags: (_result, _error, slug) => [{ type: 'Tenants', id: slug }],
    }),

    // ── Custom Domain ─────────────────────────────────

    getTenantDomains: builder.query<
      ApiEnvelope<{
        domains: { name: string; verified: boolean; createdAt: string }[];
        projectId: string | null;
        projectInfo?: { name: string; id: string; updatedAt: string } | null;
        autoVercelUrl?: string | null;
        appUrl: string | null;
        note?: string | null;
        warnings?: string[];
      }>,
      string
    >({
      query: (slug) => `admin/tenants/${slug}/domain`,
      providesTags: (_result, _error, slug) => [{ type: 'Tenants', id: `domain-${slug}` }],
    }),

    // ── Favicon (base64) ─────────────────────────────

    uploadTenantFavicon: builder.mutation<ApiEnvelope<{ message: string }>, { slug: string; data: string; mimeType: string }>({
      query: ({ slug, ...body }) => ({
        url: `admin/tenants/${slug}/favicon`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [
        { type: 'Tenants', id: slug },
        { type: 'Tenants' },
      ],
    }),

    removeTenantFavicon: builder.mutation<ApiEnvelope<{ message: string }>, string>({
      query: (slug) => ({
        url: `admin/tenants/${slug}/favicon`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, slug) => [
        { type: 'Tenants', id: slug },
        { type: 'Tenants' },
      ],
    }),

    setTenantDomain: builder.mutation<
      ApiEnvelope<{
        domain: string;
        verified: boolean;
        projectId: string;
        domains: { name: string; verified: boolean; createdAt: string }[];
        appUrl: string | null;
        renamed?: boolean;
        projectName?: string;
        autoVercelUrl?: string | null;
        note?: string;
        projectInfo?: { name: string; id: string; updatedAt: string } | null;
      }>,
      { slug: string; domain: string; updateAppUrl?: boolean }
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/tenants/${slug}/domain`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [
        { type: 'Tenants', id: slug },
        { type: 'Tenants', id: `domain-${slug}` },
      ],
    }),

    /** POST /api/admin/tenants/scrape — AI scrape of a business URL for the
     *  create-tenant wizard. Read-like POST: no cache invalidation. */
    scrapeTenant: builder.mutation<ApiEnvelope<ScrapeTenantResult>, { url: string }>({
      query: (body) => ({
        url: 'admin/tenants/scrape',
        method: 'POST',
        body,
      }),
    }),

    /** POST to an arbitrary deploy hook URL (Vercel webhook, etc).
     *  Uses queryFn so absolute URLs are supported and the enforce-redux
     *  gate can reach zero violations. Returns any because external webhooks
     *  have arbitrary response shapes. */
    triggerDeployHook: builder.mutation<any, string>({
      queryFn: async (hookUrl, _api, _extraOptions, baseQuery) => {
        if (hookUrl.startsWith('http')) {
          // External webhook — use native fetch with absolute URL
          try {
            const res = await fetch(hookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
              return { error: { status: res.status, data: await res.text() } };
            }
            const data = await res.json();
            return { data };
          } catch (err) {
            return { error: { status: 500, data: String(err) } };
          }
        }
        // Internal path fallback
        const result = await baseQuery({
          url: hookUrl,
          method: 'POST',
        });
        return result;
      },
    }),

    // ── Provisioning & Admin Operations ───────────────────────

    provisionGoogleOAuth: builder.mutation<ApiEnvelope<GoogleOAuthProvisionResult>, { slug: string; email?: string; redirectUris?: string[] }>({
      query: ({ slug, ...body }) => ({
        url: `admin/tenants/${slug}/provision/google-oauth`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [{ type: 'Tenants', id: slug }],
    }),

    provisionNeon: builder.mutation<ApiEnvelope<NeonProvisionResult>, { slug: string }>({
      query: ({ slug }) => ({
        url: `admin/tenants/${slug}/provision/neon`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { slug }) => [{ type: 'Tenants', id: slug }],
    }),

    testNeonConnection: builder.mutation<ApiEnvelope<{ success: boolean; message?: string }>, { slug: string; dbUrl?: string }>({
      query: ({ slug, dbUrl }) => ({
        url: `admin/tenants/${slug}/provision/neon/test`,
        method: 'POST',
        body: dbUrl ? { dbUrl } : undefined,
      }),
    }),

    checkRedirects: builder.mutation<
      ApiEnvelope<{
        success: boolean;
        message?: string;
        issues?: string[];
        results?: { uri: string; status: number | string }[];
      }>,
      { slug: string }
    >({
      query: ({ slug }) => ({
        url: `admin/tenants/${slug}/provision/check-redirects`,
        method: 'POST',
      }),
    }),

    renameTenant: builder.mutation<ApiEnvelope<RenameTenantResult>, { currentSlug: string; newSlug: string }>({
      query: (body) => ({
        url: `admin/tenants/${body.currentSlug}/rename`,
        method: 'POST',
        body: { newSlug: body.newSlug },
      }),
      invalidatesTags: (_result, _error, { currentSlug }) => [
        { type: 'Tenants', id: currentSlug },
        'Tenants',
      ],
    }),

    /** POST /api/webhooks/vercel — reachability test for the Vercel webhook
     *  endpoint. The route ACKs with a plain-text 200 body, so the response is
     *  read as text instead of JSON. */
    testVercelWebhook: builder.mutation<string, void>({
      query: () => ({
        url: 'webhooks/vercel',
        method: 'POST',
        body: '{}',
        responseHandler: (response: Response) => response.text(),
      }),
    }),

    getAiFindings: builder.query<ApiEnvelope<AiFindingsResult>, void>({
      query: () => 'chat/ai-findings?limit=1',
      providesTags: ['AiFindings'],
    }),
  }),
});

export const {
  useListTenantsQuery,
  useGetTenantQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useListTenantUsersQuery,
  useUpsertTenantUserMutation,
  useDeleteTenantUserMutation,
  useSeedTenantMutation,
  useMigrateTenantMutation,
  useDeployTenantMutation,
  useGetDeployStatusQuery,
  useLazyGetDeployStatusQuery,
  useLazyGetTenantDomainsQuery,
  useGetTenantDomainsQuery,
  useSetTenantDomainMutation,
  useUploadTenantFaviconMutation,
  useRemoveTenantFaviconMutation,
  useScrapeTenantMutation,
  useTriggerDeployHookMutation,
  useTestVercelWebhookMutation,
  useProvisionGoogleOAuthMutation,
  useProvisionNeonMutation,
  useTestNeonConnectionMutation,
  useCheckRedirectsMutation,
  useRenameTenantMutation,
  useGetAiFindingsQuery,
  useLazyGetTenantQuery,
  useLazyGetAiFindingsQuery,
} = tenantApi;
