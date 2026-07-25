import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const whatsappApi = createApi({
  reducerPath: 'whatsappApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/whatsapp' }),
  tagTypes: ['WhatsAppSession', 'WhatsAppMessage'],
  endpoints: (builder) => ({
    listSessions: builder.query({ query: () => '/sessions', providesTags: ['WhatsAppSession'] }),
    createSession: builder.mutation({ query: (body) => ({ url: '/sessions', method: 'POST', body }), invalidatesTags: ['WhatsAppSession'] }),
    updateSession: builder.mutation({ query: ({ id, ...body }) => ({ url: `/sessions/${id}`, method: 'PATCH', body }), invalidatesTags: ['WhatsAppSession'] }),
    listMessages: builder.query({ query: () => '/messages', providesTags: ['WhatsAppMessage'] }),
    sendMessage: builder.mutation({ query: (body) => ({ url: '/messages', method: 'POST', body }), invalidatesTags: ['WhatsAppMessage'] }),
    markAsRead: builder.mutation({ query: (id) => ({ url: `/messages/${id}`, method: 'PATCH' }), invalidatesTags: ['WhatsAppMessage'] }),
  }),
});

export const {
  useListSessionsQuery, useCreateSessionMutation, useUpdateSessionMutation,
  useListMessagesQuery, useSendMessageMutation, useMarkAsReadMutation,
} = whatsappApi;
