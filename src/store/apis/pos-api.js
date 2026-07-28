import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const posApi = createApi({
    reducerPath: 'posApi',
    baseQuery,
    endpoints: (builder) => ({
        scanPosReceipt: builder.mutation({
            query: (body) => ({
                url: 'pos?action=scan',
                method: 'POST',
                body,
            }),
        }),
        parsePosText: builder.mutation({
            query: (body) => ({
                url: 'pos?action=parse',
                method: 'POST',
                body,
            }),
        }),
        scanExpenseReceipt: builder.mutation({
            query: (body) => ({
                url: 'pos?action=expense-scan',
                method: 'POST',
                body,
            }),
        }),
        parseExpenseText: builder.mutation({
            query: (body) => ({
                url: 'pos?action=expense-parse',
                method: 'POST',
                body,
            }),
        }),
    }),
});
export const { useScanPosReceiptMutation, useParsePosTextMutation, useScanExpenseReceiptMutation, useParseExpenseTextMutation, } = posApi;
