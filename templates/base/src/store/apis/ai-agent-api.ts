import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const aiAgentApi = createApi({
  reducerPath: 'aiAgentApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/ai-agent' }),
  tagTypes: ['AgentConfig', 'Tool', 'AuditLog'],
  endpoints: (builder) => ({
    getAgentConfig: builder.query({ query: () => '/config', providesTags: ['AgentConfig'] }),
    updateAgentConfig: builder.mutation({ query: (body) => ({ url: '/config', method: 'PUT', body }), invalidatesTags: ['AgentConfig'] }),
    runAgent: builder.mutation({ query: (body) => ({ url: '/run', method: 'POST', body }) }),
    listPendingTools: builder.query({ query: () => '/tools', providesTags: ['Tool'] }),
    approveTool: builder.mutation({ query: (id) => ({ url: `/tools/${id}`, method: 'PATCH', body: { action: 'approve' } }), invalidatesTags: ['Tool'] }),
    rejectTool: builder.mutation({ query: (id) => ({ url: `/tools/${id}`, method: 'PATCH', body: { action: 'reject' } }), invalidatesTags: ['Tool'] }),
    listAuditLogs: builder.query({ query: () => '/audit', providesTags: ['AuditLog'] }),
    getAuditStats: builder.query({ query: () => '/audit/stats', providesTags: ['AuditLog'] }),
  }),
});

export const {
  useGetAgentConfigQuery, useUpdateAgentConfigMutation, useRunAgentMutation,
  useListPendingToolsQuery, useApproveToolMutation, useRejectToolMutation,
  useListAuditLogsQuery, useGetAuditStatsQuery,
} = aiAgentApi;
