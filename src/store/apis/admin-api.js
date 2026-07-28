import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery,
    tagTypes: ['RoleConfig', 'AdminConversations', 'AdminUsers', 'AdminGroups', 'SeedData', 'AiContent', 'BrandConfig', 'Navigation'],
    endpoints: (builder) => ({
        listRoleConfigs: builder.query({
            query: () => 'admin/roles',
            providesTags: ['RoleConfig'],
        }),
        setRolePin: builder.mutation({
            query: (body) => ({
                url: 'admin/roles',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['RoleConfig'],
        }),
        listAdminConversations: builder.query({
            query: (params) => ({
                url: 'admin/conversations',
                params: {
                    ...(params?.archived ? { archived: 'true' } : {}),
                    ...(params?.owner ? { owner: params.owner } : {}),
                    ...(params?.limit ? { limit: params.limit } : {}),
                },
            }),
            providesTags: ['AdminConversations'],
        }),
        archiveAdminConversation: builder.mutation({
            query: ({ id, archived }) => ({
                url: `admin/conversations?id=${id}&archived=${archived}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['AdminConversations'],
        }),
        listAdminUsers: builder.query({
            query: () => 'admin/users',
            providesTags: ['AdminUsers'],
        }),
        updateAdminUser: builder.mutation({
            query: (body) => ({
                url: 'admin/users',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AdminUsers', 'RoleConfig'],
        }),
        deleteAdminUser: builder.mutation({
            query: ({ id }) => ({
                url: `admin/users?id=${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminUsers'],
        }),
        listAdminGroups: builder.query({
            query: () => 'admin/groups',
            providesTags: ['AdminGroups'],
        }),
        createAdminGroup: builder.mutation({
            query: (body) => ({
                url: 'admin/groups',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AdminGroups'],
        }),
        updateAdminGroup: builder.mutation({
            query: (body) => ({
                url: 'admin/groups',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['AdminGroups'],
        }),
        /** POST /api/admin/clear-seed — clear all or selected seed tables */
        clearSeed: builder.mutation({
            query: (body) => ({
                url: 'admin/clear-seed',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SeedData'],
        }),
        /** GET /api/admin/ai-content — AI content generation status */
        getAiContent: builder.query({
            query: () => 'admin/ai-content',
            providesTags: ['AiContent'],
        }),
        /** POST /api/admin/ai-content — trigger AI content generation */
        generateAiContent: builder.mutation({
            query: (body) => ({
                url: 'admin/ai-content',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AiContent'],
        }),
        /** GET /api/admin/brand-config — read brand config */
        getAdminBrandConfig: builder.query({
            query: () => 'admin/brand-config',
            providesTags: ['BrandConfig'],
        }),
        /** PUT /api/admin/brand-config — update brand config */
        updateAdminBrandConfig: builder.mutation({
            query: (body) => ({
                url: 'admin/brand-config',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['BrandConfig'],
        }),
        /** GET /api/admin/navigation — list nav tree */
        getNavigation: builder.query({
            query: () => 'admin/navigation',
            providesTags: ['Navigation'],
        }),
        /** POST /api/admin/navigation — create nav item */
        createNavigationItem: builder.mutation({
            query: (body) => ({
                url: 'admin/navigation',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Navigation'],
        }),
        /** PUT /api/admin/navigation — batch update nav items */
        updateNavigationItems: builder.mutation({
            query: (body) => ({
                url: 'admin/navigation',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Navigation'],
        }),
        /** DELETE /api/admin/navigation — delete by IDs */
        deleteNavigationItems: builder.mutation({
            query: (ids) => ({
                url: `admin/navigation?ids=${ids.map(encodeURIComponent).join(',')}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Navigation'],
        }),
    }),
});
export const { useListRoleConfigsQuery, useSetRolePinMutation, useListAdminConversationsQuery, useArchiveAdminConversationMutation, useListAdminUsersQuery, useUpdateAdminUserMutation, useDeleteAdminUserMutation, useListAdminGroupsQuery, useCreateAdminGroupMutation, useUpdateAdminGroupMutation, useClearSeedMutation, useGetAiContentQuery, useGenerateAiContentMutation, useGetAdminBrandConfigQuery, useUpdateAdminBrandConfigMutation, useGetNavigationQuery, useCreateNavigationItemMutation, useUpdateNavigationItemsMutation, useDeleteNavigationItemsMutation, } = adminApi;
