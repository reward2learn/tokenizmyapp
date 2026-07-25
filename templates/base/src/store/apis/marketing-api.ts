import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const marketingApi = createApi({
  reducerPath: 'marketingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/marketing' }),
  tagTypes: ['Campaign', 'Lead', 'Subscriber', 'Analytics'],
  endpoints: (builder) => ({
    // Campaigns
    listCampaigns: builder.query({
      query: (filters?: { status?: string; type?: string }) => ({
        url: '/campaigns',
        params: filters,
      }),
      providesTags: ['Campaign'],
    }),
    getCampaign: builder.query({
      query: (id: string) => `/campaigns/${id}`,
      providesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),
    createCampaign: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/campaigns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Campaign'],
    }),
    updateCampaign: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/campaigns/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Campaign', id }],
    }),
    deleteCampaign: builder.mutation({
      query: (id: string) => ({
        url: `/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaign'],
    }),
    startCampaign: builder.mutation({
      query: (id: string) => ({
        url: `/campaigns/${id}`,
        method: 'PATCH',
        body: { action: 'start' },
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),
    pauseCampaign: builder.mutation({
      query: (id: string) => ({
        url: `/campaigns/${id}`,
        method: 'PATCH',
        body: { action: 'pause' },
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),
    // Leads
    listLeads: builder.query({
      query: (filters?: { status?: string; search?: string }) => ({
        url: '/leads',
        params: filters,
      }),
      providesTags: ['Lead'],
    }),
    getLead: builder.query({
      query: (id: string) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
    }),
    createLead: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Lead'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }],
    }),
    deleteLead: builder.mutation({
      query: (id: string) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lead'],
    }),
    // Subscribers
    listSubscribers: builder.query({
      query: (filters?: { status?: string }) => ({
        url: '/subscribers',
        params: filters,
      }),
      providesTags: ['Subscriber'],
    }),
    subscribe: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/subscribers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscriber'],
    }),
    unsubscribe: builder.mutation({
      query: (id: string) => ({
        url: `/subscribers/${id}`,
        method: 'PATCH',
        body: { status: 'unsubscribed' },
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Subscriber', id }],
    }),
    // Analytics
    trackEvent: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/analytics/events',
        method: 'POST',
        body,
      }),
    }),
    getDashboardStats: builder.query({
      query: (range?: string) => ({
        url: '/analytics/dashboard',
        params: range ? { range } : undefined,
      }),
      providesTags: ['Analytics'],
    }),
    // Email
    sendEmail: builder.mutation({
      query: (body: { to: string; template: string; data?: Record<string, unknown> }) => ({
        url: '/email/send',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useListCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useStartCampaignMutation,
  usePauseCampaignMutation,
  useListLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useListSubscribersQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
  useTrackEventMutation,
  useGetDashboardStatsQuery,
  useSendEmailMutation,
} = marketingApi;
