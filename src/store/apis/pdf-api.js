import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const pdfApi = createApi({
    reducerPath: 'pdfApi',
    baseQuery,
    tagTypes: ['PdfJob'],
    endpoints: (builder) => ({
        queuePdf: builder.mutation({
            query: (page = '/') => ({
                url: 'auth',
                params: { action: 'pdf', page },
            }),
            invalidatesTags: ['PdfJob'],
        }),
        getPdfJobStatus: builder.query({
            query: (jobId) => `vjobs/status/${jobId}`,
            providesTags: (_result, _error, jobId) => [{ type: 'PdfJob', id: jobId }],
        }),
        /** Imperative poll for PDF worker completion (legacy ops pages). */
        pollPdfJob: builder.mutation({
            query: (jobId) => `vjobs/status/${jobId}`,
        }),
    }),
});
export const { useQueuePdfMutation, useGetPdfJobStatusQuery, useLazyGetPdfJobStatusQuery, usePollPdfJobMutation, } = pdfApi;
