import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const integrationApi = createApi({
  reducerPath: 'integrationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/integrations' }),
  tagTypes: ['Integration', 'SyncLog'],
  endpoints: (builder) => ({
    listIntegrations: builder.query({ query: () => '', providesTags: ['Integration'] }),
    getIntegration: builder.query({ query: (id) => `/${id}`, providesTags: (r, e, id) => [{ type: 'Integration', id }] }),
    connectIntegration: builder.mutation({ query: (body) => ({ url: '', method: 'POST', body }), invalidatesTags: ['Integration'] }),
    updateIntegration: builder.mutation({ query: ({ id, ...body }) => ({ url: `/${id}`, method: 'PUT', body }), invalidatesTags: (r, e, { id }) => [{ type: 'Integration', id }] }),
    disconnectIntegration: builder.mutation({ query: (id) => ({ url: `/${id}`, method: 'DELETE' }), invalidatesTags: ['Integration'] }),
    testIntegration: builder.mutation({ query: (id) => ({ url: `/${id}/test`, method: 'POST' }) }),
    listSyncLogs: builder.query({ query: (id) => `/${id}/sync-logs`, providesTags: ['SyncLog'] }),
  }),
});

export const {
  useListIntegrationsQuery, useGetIntegrationQuery, useConnectIntegrationMutation,
  useUpdateIntegrationMutation, useDisconnectIntegrationMutation, useTestIntegrationMutation,
  useListSyncLogsQuery,
} = integrationApi;
