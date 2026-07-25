import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/billing' }),
  tagTypes: ['Balance', 'Transaction', 'CreditPack'],
  endpoints: (builder) => ({
    getBalance: builder.query({ query: () => '/balance', providesTags: ['Balance'] }),
    addCredits: builder.mutation({ query: (body) => ({ url: '/credits', method: 'POST', body }), invalidatesTags: ['Balance', 'Transaction'] }),
    listTransactions: builder.query({ query: () => '/transactions', providesTags: ['Transaction'] }),
    getTransaction: builder.query({ query: (id) => `/transactions/${id}`, providesTags: (r, e, id) => [{ type: 'Transaction', id }] }),
    listPacks: builder.query({ query: () => '/packs', providesTags: ['CreditPack'] }),
    createPack: builder.mutation({ query: (body) => ({ url: '/packs', method: 'POST', body }), invalidatesTags: ['CreditPack'] }),
    updatePack: builder.mutation({ query: ({ id, ...body }) => ({ url: `/packs/${id}`, method: 'PUT', body }), invalidatesTags: ['CreditPack'] }),
    deletePack: builder.mutation({ query: (id) => ({ url: `/packs/${id}`, method: 'DELETE' }), invalidatesTags: ['CreditPack'] }),
  }),
});

export const {
  useGetBalanceQuery, useAddCreditsMutation,
  useListTransactionsQuery, useGetTransactionQuery,
  useListPacksQuery, useCreatePackMutation, useUpdatePackMutation, useDeletePackMutation,
} = billingApi;
