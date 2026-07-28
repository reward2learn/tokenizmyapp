import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const configApi = createApi({
    reducerPath: 'configApi',
    baseQuery,
    tagTypes: ['OpenAiKey', 'ChatSettings', 'SeedDetails'],
    endpoints: (builder) => ({
        reseedFromSources: builder.mutation({
            query: (body) => ({
                url: 'config/reseed',
                method: 'POST',
                body,
            }),
        }),
        reprocessFromCache: builder.mutation({
            query: () => ({
                url: 'config/reprocess',
                method: 'POST',
            }),
        }),
        getOpenAiKeyStatus: builder.query({
            query: () => 'config/openai-key',
            providesTags: ['OpenAiKey'],
        }),
        saveOpenAiKey: builder.mutation({
            query: (body) => ({
                url: 'config/openai-key',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['OpenAiKey'],
        }),
        clearOpenAiKey: builder.mutation({
            query: () => ({
                url: 'config/openai-key',
                method: 'DELETE',
            }),
            invalidatesTags: ['OpenAiKey'],
        }),
        getChatSettings: builder.query({
            query: () => 'config/settings',
            providesTags: ['ChatSettings'],
        }),
        updateChatSettings: builder.mutation({
            query: (body) => ({
                url: 'config/settings',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['ChatSettings'],
        }),
        /** GET /api/config/seed-details — returns full seed inventory */
        getSeedDetails: builder.query({
            query: () => 'config/seed-details',
            providesTags: ['SeedDetails'],
        }),
        /** POST /api/config/import-data — bulk JSON import into seed tables */
        importData: builder.mutation({
            query: (body) => ({
                url: 'config/import-data',
                method: 'POST',
                body,
            }),
        }),
    }),
});
export const { useReseedFromSourcesMutation, useReprocessFromCacheMutation, useGetOpenAiKeyStatusQuery, useSaveOpenAiKeyMutation, useClearOpenAiKeyMutation, useGetChatSettingsQuery, useUpdateChatSettingsMutation, useGetSeedDetailsQuery, useImportDataMutation, } = configApi;
