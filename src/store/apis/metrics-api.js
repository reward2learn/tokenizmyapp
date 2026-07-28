import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const metricsApi = createApi({
    reducerPath: 'metricsApi',
    baseQuery,
    tagTypes: ['Metrics', 'ZReportSchema', 'ZReportCalendar', 'ZReportDetail'],
    endpoints: (builder) => ({
        getSchema: builder.query({
            query: (department = 'all_pos') => ({
                url: 'metrics',
                params: { schema: '1', department },
            }),
            providesTags: ['ZReportSchema'],
        }),
        getCalendar: builder.query({
            query: (period) => ({
                url: 'metrics',
                params: { calendar: period },
            }),
            providesTags: (_result, _error, period) => [{ type: 'ZReportCalendar', id: period }],
        }),
        getDetail: builder.query({
            query: ({ date, department = 'all_pos' }) => ({
                url: 'metrics',
                params: { detail: date, department },
            }),
            providesTags: (_result, _error, { date }) => [{ type: 'ZReportDetail', id: date }],
        }),
        listMetrics: builder.query({
            query: (params) => {
                const p = params ?? {};
                return {
                    url: 'metrics',
                    params: {
                        ...p,
                        ...(p.export ? { export: '1' } : {}),
                    },
                };
            },
            providesTags: ['Metrics'],
        }),
        saveZReport: builder.mutation({
            query: (body) => ({
                url: 'metrics',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Metrics', 'ZReportDetail', 'ZReportCalendar'],
        }),
        importMetrics: builder.mutation({
            query: (body) => ({
                url: 'metrics',
                method: 'POST',
                body: { action: 'import', ...body },
            }),
            invalidatesTags: ['Metrics', 'ZReportCalendar'],
        }),
        deleteZReport: builder.mutation({
            query: (params) => ({
                url: 'metrics',
                method: 'DELETE',
                params,
            }),
            invalidatesTags: ['Metrics', 'ZReportDetail', 'ZReportCalendar'],
        }),
    }),
});
export const { useGetSchemaQuery, useGetCalendarQuery, useGetDetailQuery, useListMetricsQuery, useSaveZReportMutation, useImportMetricsMutation, useDeleteZReportMutation, } = metricsApi;
