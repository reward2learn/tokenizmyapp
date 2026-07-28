import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const tenantApi = createApi({
    reducerPath: 'tenantApi',
    baseQuery,
    tagTypes: ['Tenants', 'TenantUsers'],
    endpoints: (builder) => ({
        listTenants: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params && 'status' in params && params.status)
                    searchParams.set('status', params.status);
                const qs = searchParams.toString();
                return qs ? `admin/tenants?${qs}` : 'admin/tenants';
            },
            providesTags: ['Tenants'],
        }),
        getTenant: builder.query({
            query: (slug) => `admin/tenants/${slug}`,
            providesTags: (_result, _error, slug) => [{ type: 'Tenants', id: slug }],
        }),
        createTenant: builder.mutation({
            query: (body) => ({
                url: 'admin/tenants',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Tenants'],
        }),
        updateTenant: builder.mutation({
            query: ({ slug, ...body }) => ({
                url: `admin/tenants/${slug}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { slug }) => [{ type: 'Tenants', id: slug }],
        }),
        deleteTenant: builder.mutation({
            query: (slug) => ({
                url: `admin/tenants/${slug}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Tenants'],
        }),
        // ── Tenant-scoped Users ─────────────────────────
        listTenantUsers: builder.query({
            query: (slug) => `admin/tenants/${slug}/users`,
            providesTags: (_result, _error, slug) => [{ type: 'TenantUsers', id: slug }],
        }),
        upsertTenantUser: builder.mutation({
            query: ({ slug, ...body }) => ({
                url: `admin/tenants/${slug}/users`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { slug }) => [{ type: 'TenantUsers', id: slug }],
        }),
        deleteTenantUser: builder.mutation({
            query: ({ slug, id }) => ({
                url: `admin/tenants/${slug}/users?id=${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { slug }) => [{ type: 'TenantUsers', id: slug }],
        }),
        // ── Tenant Seed & Migrate ──────────────────────────
        seedTenant: builder.mutation({
            query: (slug) => ({
                url: `admin/tenants/${slug}/seed`,
                method: 'POST',
            }),
            invalidatesTags: ['Tenants'],
        }),
        migrateTenant: builder.mutation({
            query: (slug) => ({
                url: `admin/tenants/${slug}/migrate`,
                method: 'POST',
            }),
            invalidatesTags: ['Tenants'],
        }),
        deployTenant: builder.mutation({
            query: (slug) => ({
                url: `admin/tenants/${slug}/deploy`,
                method: 'POST',
            }),
            invalidatesTags: ['Tenants'],
        }),
    }),
});
export const { useListTenantsQuery, useGetTenantQuery, useCreateTenantMutation, useUpdateTenantMutation, useDeleteTenantMutation, useListTenantUsersQuery, useUpsertTenantUserMutation, useDeleteTenantUserMutation, useSeedTenantMutation, useMigrateTenantMutation, useDeployTenantMutation, } = tenantApi;
