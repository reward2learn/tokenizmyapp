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

export const tenantApi = createApi({
  reducerPath: 'tenantApi',
  baseQuery,
  tagTypes: ['Tenants', 'TenantUsers'],
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

    deployTenant: builder.mutation<ApiEnvelope<{ deployed: boolean; projectId: string; appUrl: string; envCount: number }>, string>({
      query: (slug) => ({
        url: `admin/tenants/${slug}/deploy`,
        method: 'POST',
      }),
      invalidatesTags: ['Tenants'],
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
} = tenantApi;
