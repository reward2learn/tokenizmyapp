import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const financialApi = createApi({
    reducerPath: 'financialApi',
    baseQuery,
    tagTypes: ['FinancialOverview', 'PnlDetail', 'Reports'],
    endpoints: (builder) => ({
        getChartOverview: builder.query({
            query: (scenario = 'conservative') => ({
                url: 'financial-overview',
                params: { scenario },
            }),
            providesTags: ['FinancialOverview'],
        }),
        getPnlDetail: builder.query({
            query: (period) => ({
                url: 'financial-overview',
                params: { period },
            }),
            providesTags: (_result, _error, period) => [{ type: 'PnlDetail', id: period }],
        }),
        getReports: builder.query({
            query: ({ period = 'monthly' } = {}) => ({
                url: 'financial-overview',
                params: { resource: 'reports', period },
            }),
            providesTags: ['Reports'],
        }),
        getTargets: builder.query({
            query: () => ({
                url: 'financial-overview',
                params: { resource: 'reports', period: 'monthly' },
            }),
            providesTags: ['Reports'],
        }),
    }),
});
export const { useGetChartOverviewQuery, useGetPnlDetailQuery, useGetReportsQuery, useGetTargetsQuery, } = financialApi;
